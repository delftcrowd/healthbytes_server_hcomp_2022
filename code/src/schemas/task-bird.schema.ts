import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { User } from './user.schema'

export type TaskBirdBeakDocument = TaskBirdBeak & Document

@Schema({ collection: 'taskbirdbeaks' })
export class TaskBirdBeak {
  @Prop()
  id: number

  @Prop()
  beakType: string

  @Prop()
  url: string
}

export const TaskBirdBeakSchema = SchemaFactory.createForClass(TaskBirdBeak)
