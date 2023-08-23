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
  async completeEntryQuestionnaire(@Query('pid') prolificId) {
    console.debug("request received in completeEntryQuestionnaire endpoint", prolificId)
    return this.userService.completeEntryQuestionnaire(prolificId)
  }

  @Get('isExitQuestionnaireComplete')
  isExitQuestionnaireComplete(@Request() req) {
    let user: UserDetails = req.user
    return this.userService.isExitQuestionnaireComplete(user.prolificId)
  }

  @Public()
  @Post('completeExitQuestionnaire')
  async completeExitQuestionnaire(@Query('pid') prolificId) {
    console.debug("request received in completeExitQuestionnaire endpoint", prolificId)
    return this.userService.completeExitQuestionnaire(prolificId)
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

  @Post('toggleTaskType')
  async toggleTaskType(@Request() req) {
    let user: UserDetails = req.user
    let newTaskType = ''
    if (user.taskType !== "person") {
      if (user.taskType == 'movie') {
        newTaskType = 'bird'
      } else if (user.taskType == 'bird') {
        newTaskType = 'movie'
      }
    }

    return this.userService.toggleTaskType(user.prolificId, newTaskType)
  }

  @Post('toggleInputModality')
  async toggleInputModality(@Request() req) {
    let user: UserDetails = req.user
    let newModality = ''
    if (user.inputModality == 'gesture') {
      newModality = 'normal'
    } else if (user.inputModality == 'normal') {
      newModality = 'gesture'
    }

    return this.userService.toggleInputModality(user.prolificId, newModality)
  }
}
