import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common'
import { LoginRequest, RegisterRequest } from 'src/requests'
import { UserDetails } from 'src/users/users.service'
import { RefreshRequest } from '../requests'
import { AuthService } from './auth.service'
import { Public } from './constants'

export interface AuthenticationPayload {
  user: UserDetails
  payload: {
    type: string
    token: string
    refresh_token?: string
  }
}
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('login')
  async login(@Body() body: LoginRequest): Promise<{ status: string; data: AuthenticationPayload } | null> {
    const isRegistered = await this.authService.isRegistered(body.prolificId)
    if (!isRegistered) {
      await this.authService.register(body.prolificId, body.purpose, body.taskType, body.inputModality, body.condition)
    }
    const response = await this.authService.login(body.prolificId)

    const payload = this.buildResponsePayload(response.user, response.accessToken, response.refreshToken)

    return {
      status: 'success',
      data: payload,
    }
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() body: RefreshRequest): Promise<{ status: string; data: AuthenticationPayload } | null> {
    const { user, token } = await this.authService.createAccessTokenFromRefreshToken(body.refreshToken)

    const payload = this.buildResponsePayload(user, token)

    return {
      status: 'success',
      data: payload,
    }
  }

  @Public()
  @Get('is_registered')
  async isRegistered(@Query('prolificId') prolificId: string): Promise<{ isRegistered: boolean } | null> {
    return {
      isRegistered: await this.authService.isRegistered(prolificId),
    }
  }

  @Get('logout')
  async logout(@Request() req): Promise<{ status: string } | null> {
    req.logout()

    return {
      status: 'success',
    }
  }

  private buildResponsePayload(user: UserDetails, accessToken: string, refreshToken?: string): AuthenticationPayload {
    return {
      user: user,
      payload: {
        type: 'bearer',
        token: accessToken,
        ...(refreshToken ? { refresh_token: refreshToken } : {}),
      },
    }
  }

}
