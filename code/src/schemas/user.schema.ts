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

  @Prop({
    type: String,
    required: false,
    enum: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15']
  })
  condition: string

  @Prop({ required: true, unique: true, index: true })
  prolificId: string
}

export const UsersSchema = SchemaFactory.createForClass(User)
