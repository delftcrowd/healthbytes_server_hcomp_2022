import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { TokenExpiredError } from 'jsonwebtoken'
import { Model } from 'mongoose'
import { getUserDetails } from 'src/dto'
import { RefreshToken, RefreshTokenDocument } from 'src/schemas/refresh-token.schema'
import { User } from 'src/schemas/user.schema'
import { UserDetails, UserService } from 'src/users/users.service'
import { InputModality, TaskTypes } from 'src/schemas/task-progress.schema'

export type ExistingUserDTO = Pick<User, 'prolificId'>
export type NewUserDTO = Pick<User, 'prolificId'>

export interface RefreshTokenPayload {
  token: {
    createdAt: string
    isRevoked: boolean
    user: string
    _id: string
  }
  iat: number
  exp: number
}
@Injectable()
export class AuthService {
  constructor(
    @InjectModel('RefreshToken') private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async register(prolificId: string, taskType: TaskTypes, inputModality: InputModality): Promise<User | any> {
    const existingUser = await this.userService.findByProlificId(prolificId)

    if (existingUser) throw new UnprocessableEntityException('ProlificId already registered')

    const newUser = await this.userService.create(prolificId, taskType, inputModality)

    return getUserDetails(newUser)
  }

  async isRegistered(prolificId: string): Promise<boolean> {
    return await this.userService.isRegistered(prolificId)
  }

  async validateUser(prolificId: string): Promise<UserDetails | null> {
    const user = await this.userService.findByProlificId(prolificId)

    if (!user) return null

    return getUserDetails(user)
  }

  async login(prolificId: string): Promise<{ user: UserDetails; accessToken: string; refreshToken: string } | null> {
    const user = await this.validateUser(prolificId)

    if (!user) throw new UnauthorizedException('The provided prolificId is not yet registered')

    const accessTokenJwt = await this.generateAccessToken(user)
    const refreshTokenJwt = await this.generateRefreshToken(user)

    return { user, accessToken: accessTokenJwt, refreshToken: refreshTokenJwt }
  }

  public async resolveRefreshToken(encoded: string): Promise<{ user: UserDetails; token: RefreshToken }> {
    const payload = await this.decodeRefreshToken(encoded)
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload)

    if (!token) {
      throw new UnprocessableEntityException('Refresh token not found')
    }

    if (token.isRevoked) {
      throw new UnprocessableEntityException('Refresh token revoked')
    }

    const user = await this.getUserFromRefreshTokenPayload(payload)

    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed')
    }

    return { user, token }
  }

  public async createAccessTokenFromRefreshToken(refresh: string): Promise<{ token: string; user: UserDetails }> {
    const { user } = await this.resolveRefreshToken(refresh)

    const token = await this.generateAccessToken(user)

    return { user, token }
  }

  private async decodeRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return this.jwtService.verifyAsync(token, { secret: process.env.REFRESH_TOKEN_SECRET })
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired')
      } else {
        throw new UnprocessableEntityException('Refresh token malformed')
      }
    }
  }

  private async getUserFromRefreshTokenPayload(payload: RefreshTokenPayload): Promise<UserDetails> {
    const subId = payload.token.user

    if (!subId) {
      throw new UnprocessableEntityException('Refresh token malformed')
    }

    return this.userService.findById(subId)
  }

  private async getStoredTokenFromRefreshTokenPayload(payload: RefreshTokenPayload): Promise<RefreshToken | null> {
    const tokenId = payload.token._id

    if (!tokenId) {
      throw new UnprocessableEntityException('Refresh token malformed')
    }

    return this.findTokenById(tokenId)
  }

  // ---------------------------------------------------------------------------
  // TOKEN GENERATION
  // ---------------------------------------------------------------------------

  async generateAccessToken(user: UserDetails): Promise<string> {
    return this.jwtService.signAsync(
      { user },
      {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
      },
    )
  }

  async generateRefreshToken(user: UserDetails): Promise<string> {
    const token = await this.createRefreshToken(user)

    return this.jwtService.signAsync(
      { token },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
      },
    )
  }

  // ---------------------------------------------------------------------------
  // REFRESH TOKEN REPOSITORY
  // ---------------------------------------------------------------------------

  async createRefreshToken(user: UserDetails): Promise<RefreshToken> {
    const token = new this.refreshTokenModel({
      user: await (await this.userService.findById(user.id)).id,
      isRevoked: false,
    })

    return token.save()
  }

  async findTokenByUser(user: User): Promise<RefreshToken | null> {
    return this.refreshTokenModel.findOne({
      user,
    })
  }

  async findTokenById(tokenId: string): Promise<RefreshToken | null> {
    const token = this.refreshTokenModel.findById(tokenId).exec()
    if (!token) return null
    return token
  }

}
