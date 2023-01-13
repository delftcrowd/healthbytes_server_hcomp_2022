import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { TaskBirdBeak, TaskBirdBeakSchema } from './task-bird.schema'
import { TaskMovieReview, TaskMovieReviewSchema } from './task-movie.schema'
import { TaskPerson, TaskPersonSchema } from './task-person.schema'
import { User } from './user.schema'

// TASK

export type TaskDocument = Task & Document

export type TaskTypes = 'bird' | 'movie' | 'person'
export type InputModality = 'gesture' | 'normal'

@Schema({ collection: 'progress', discriminatorKey: 'taskType' })
export class Task {
  @Prop({
    type: String,
    required: true,
    enum: ['bird', 'movie', 'person'],
  })
  taskType: TaskTypes

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User | string

  @Prop({ type: [String] })
  answers: string[]

  @Prop()
  state: string

  @Prop()
  questionNumber: number

  @Prop()
  complete: boolean
}

export const TaskSchema = SchemaFactory.createForClass(Task).index({ taskType: 1, user: 1 }, { unique: true })

// =============================================================================
// QUESTIONS
// =============================================================================
// -----------------------------------------------------------------------------
// BIRD
// -----------------------------------------------------------------------------
@Schema()
export class BirdQuestions {
  taskType: 'bird'
  user: User | string
  answers: string[]
  questionNumber: number
  complete: boolean
  state: string

  @Prop({ type: [TaskBirdBeakSchema], required: true })
  birds: TaskBirdBeak[]
}
export const BirdQuestionsSchema = SchemaFactory.createForClass(BirdQuestions)

// -----------------------------------------------------------------------------
// MOVIE
// -----------------------------------------------------------------------------
@Schema()
export class MovieQuestions {
  taskType: 'movie'
  user: User | string
  answers: string[]
  questionNumber: number
  complete: boolean
  state: string

  @Prop({ type: [TaskMovieReviewSchema], required: true })
  movieReviews: TaskMovieReview[]
}
export const MovieQuestionsSchema = SchemaFactory.createForClass(MovieQuestions)

// -----------------------------------------------------------------------------
// PERSON
// -----------------------------------------------------------------------------

@Schema()
export class PersonQuestions {
  taskType: 'person'
  user: User | string
  answers: string[]
  questionNumber: number
  complete: boolean
  state: string

  @Prop({ type: [TaskPersonSchema], required: true })
  midnamePersons: TaskPerson[]
  @Prop({ type: [TaskPersonSchema], required: true })
  professionPersons: TaskPerson[]
}
export const PersonQuestionsSchema = SchemaFactory.createForClass(PersonQuestions)
