import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { InputModality, TaskTypes, Purpose } from 'src/schemas/task-progress.schema'

export type UserDocument = User & Document

@Schema()
export class User {
  @Prop({ default: Date.now })
  dateAdded: Date

  @Prop({ default: false })
  revoked: boolean

  @Prop({ default: false })
  exitSurveyCompleted: boolean

  @Prop({ default: false })
  entrySurveyCompleted: boolean

  @Prop({
    type: String,
    required: true,
    enum: ['bird', 'movie', 'person'],
  })
  taskType: TaskTypes

  @Prop({
    type: String,
    required: true,
    enum: ['gesture', 'normal'],
  })
  inputModality: InputModality

  @Prop({
    type: String,
    required: true,
    enum: ['switching', 'hcomp'],
  })
  purpose: Purpose

  @Prop({ required: true, unique: true, index: true })
  prolificId: string
}

export const UsersSchema = SchemaFactory.createForClass(User)
