import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { Document } from 'mongoose'
import { User } from 'src/schemas/user.schema'

export const enum PoseAction {
  START = 'start',
  SUBMIT = 'submit',
}

@Schema()
export class PoseInstance {
  @Prop({ required: true })
  actionType: string

  @Prop({ type: mongoose.Schema.Types.Mixed })
  landmarks?: any

  @Prop()
  stage: string

  @Prop()
  questionNumber: number

  @Prop({ required: true, default: Date.now })
  timestamp?: Date
}
export const PoseInstanceSchema = SchemaFactory.createForClass(PoseInstance)

export type PoseDocument = Pose & Document

@Schema({ collection: 'poses' })
export class Pose {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User

  @Prop({ type: [PoseInstanceSchema], required: true, default: [] })
  poses: PoseInstance[]
}

export const PoseSchema = SchemaFactory.createForClass(Pose)
