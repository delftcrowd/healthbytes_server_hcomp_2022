import { Controller, Get, Param, Post, Query, Request } from '@nestjs/common'
import { User } from 'src/schemas/user.schema'
import { UserService } from './users.service'
import { UserDetails } from 'src/users/users.service'
import { Public } from 'src/auth/constants'

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/me/:id')
  getUser(@Param('id') id: string): Promise<UserDetails | null> {
    return this.userService.findById(id)
  }

  @Get('isEntryQuestionnaireComplete')
  isEntryQuestionnaireComplete(@Request() req) {
    let user: UserDetails = req.user
    return this.userService.isEntryQuestionnaireComplete(user.prolificId)
  }

  @Public()
  @Post('completeEntryQuestionnaire')
  completeEntryQuestionnaire(@Query('pid') prolificId) {
    this.userService.completeEntryQuestionnaire(prolificId)
  }

  @Get('isExitQuestionnaireComplete')
  isExitQuestionnaireComplete(@Request() req) {
    let user: UserDetails = req.user
    return this.userService.isExitQuestionnaireComplete(user.prolificId)
  }

  @Public()
  @Post('completeExitQuestionnaire')
  completeExitQuestionnaire(@Query('pid') prolificId) {
    this.userService.completeExitQuestionnaire(prolificId)
  }

  @Post('revokeConsent')
  async revokeConsent(@Request() req) {
    let user: UserDetails = req.user
    return (await this.userService.revokeConsent(user.prolificId)).revoked
  }

  @Get('isConsentRevoked')
  async isConsentRevoked(@Request() req) {
    let user: UserDetails = req.user
    return this.userService.isConsentRevoked(user.prolificId)
  }
}
