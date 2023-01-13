import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { User } from './user.schema'

export type TaskMovieReviewDocument = TaskMovieReview & Document

@Schema({ collection: 'taskmoviereviews' })
export class TaskMovieReview {
  @Prop({ required: true })
  id: number

  @Prop()
  overall: number

  @Prop()
  reviewText: string

  @Prop()
  reviewerID: string
}

export const TaskMovieReviewSchema = SchemaFactory.createForClass(TaskMovieReview)
