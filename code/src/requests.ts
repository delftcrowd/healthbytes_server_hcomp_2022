import { isNotEmpty, IsNotEmpty, IsOptional, matches, Matches, MaxLength, MinLength } from 'class-validator'
import { InputModality, TaskTypes, Purpose } from 'src/schemas/task-progress.schema'

export class LoginRequest {
  @IsNotEmpty({ message: 'ProlificId is required' })
  readonly prolificId: string
  @IsNotEmpty({ message: 'Purpose is required' })
  readonly purpose: Purpose
  @IsNotEmpty({ message: 'TaskType is required' })
  readonly taskType: TaskTypes
  @IsNotEmpty({ message: 'InputModality is required' })
  readonly inputModality: InputModality
  @IsOptional()
  readonly condition: string
}
export class RegisterRequest {
  @IsNotEmpty({ message: 'ProlificId is required' })
  readonly prolificId: string
  @IsNotEmpty({ message: 'TaskType is required' })
  readonly taskType: TaskTypes
}
export class RefreshRequest {
  @IsNotEmpty({ message: 'Refresh token is required' })
  readonly refreshToken: string
}
export class PoseRequest {
  @IsNotEmpty({ message: 'actionType is required' })
  actionType: string

  @IsOptional()
  landmarks?: any
}

