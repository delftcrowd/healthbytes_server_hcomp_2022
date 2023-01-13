import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { RefreshTokenSchema } from 'src/schemas/refresh-token.schema'
import { UsersModule } from 'src/users/users.module'
import { AuthService } from './auth.service'
import { JwtStrategy } from './guards/jwt.strategy'
import { LocalStrategy } from './guards/local.strategy'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'RefreshToken', schema: RefreshTokenSchema }]),
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.REFRESH_TOKEN_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
