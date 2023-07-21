import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common'
import { Public } from 'src/auth/constants'
import { PoseRequest } from 'src/requests'
import { User } from 'src/schemas/user.schema'
import { UserDetails, UserService } from 'src/users/users.service'
import { AnyInterpreter } from 'xstate'
import { TaskService } from './task.service'

export interface UserProgress {
  user: User
  state: AnyInterpreter
}
@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService, private userService: UserService) { }

  @Get('start/:taskType')
  async initializeUser(@Request() req, @Param() params) {
    const taskType = params.taskType
    const user: UserDetails = req.user
    if (!taskType) {
      throw new BadRequestException('Missing or incorrect type')
    }
    return await this.taskService.createUserTask(user)
  }

  @Get('progress')
  async getState(@Request() req) {
    const user: UserDetails = req.user
    if (!(await this.taskService.hasTask(user.id))) {
      await this.taskService.createUserTask(user)
    }
    return await this.taskService.getTask(user.id)
  }

  @Get('question')
  async getCurrentQuestion(@Request() req) {
    const user: UserDetails = req.user
    if (!(await this.taskService.hasTask(user.id))) {
      throw new NotFoundException('User has no valid task')
    }
    return await this.taskService.getQuestion(user.id)
  }

  @Public()
  @Get('exists')
  async exists(@Query('prolificId') prolificId) {
    return await this.userService.isRegistered(prolificId)
  }

  @Public()
  @Get('all')
  getAllProgress() {
    return this.taskService.getAllProgress()
  }

  @Public()
  @Get('clearComplete')
  clearComplete() {
    return this.taskService.clearComplete()
  }

  @Public()
  @Get('clearAll')
  clearAll() {
    return this.taskService.clearAll()
  }

  @Public()
  @Get('removeSession')
  removeSession(@Body() body: { prolificId: string }) {
    return this.taskService.removeSession(body.prolificId)
  }

  @Post('next')
  async getNext(@Request() req) {
    let user: UserDetails = req.user
    return await this.taskService.nextState(user)
  }

  @Post('answer')
  async answerQuestion(@Request() req, @Body() body) {
    let user: UserDetails = req.user

    return await this.taskService.answerQuestion(user, body)
  }

  @Post('pose')
  async savePose(@Request() req, @Body() body: PoseRequest) {
    let user: UserDetails = req.user

    return await this.taskService.savePose(user, body.actionType, body.landmarks)
  }

  @Post('entryQuestionnaire')
  async saveEntryQuestionnaire(@Request() req, @Body() body) {
    let user: UserDetails = req.user

    return await this.taskService.answerQuestion(user, body)
  }

  @Post('exitQuestionnaire')
  async saveExitQuestionnaire(@Request() req, @Body() body) {
    let user: UserDetails = req.user

    return await this.taskService.answerQuestion(user, body)
  }
}
