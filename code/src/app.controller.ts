import { Controller, Get, Request } from '@nestjs/common'
import { Public } from './auth/constants'
import { TaskService } from './task/task.service'

@Controller()
export class AppController {
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }
}
