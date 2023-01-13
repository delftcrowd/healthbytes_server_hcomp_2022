import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Pose, PoseSchema } from 'src/schemas/pose.schema'
import { TaskBirdBeak, TaskBirdBeakSchema } from 'src/schemas/task-bird.schema'
import { TaskMovieReview, TaskMovieReviewSchema } from 'src/schemas/task-movie.schema'
import { TaskPerson, TaskPersonSchema } from 'src/schemas/task-person.schema'
import {
  BirdQuestionsSchema,
  MovieQuestionsSchema,
  PersonQuestionsSchema,
  TaskSchema,
} from 'src/schemas/task-progress.schema'
import { UsersModule } from 'src/users/users.module'
import { Task } from '../schemas/task-progress.schema'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Task.name,
        schema: TaskSchema,
        discriminators: [
          { name: 'bird', schema: BirdQuestionsSchema },
          { name: 'movie', schema: MovieQuestionsSchema },
          { name: 'person', schema: PersonQuestionsSchema },
        ],
      },
    ]),
    MongooseModule.forFeature([{ name: TaskBirdBeak.name, schema: TaskBirdBeakSchema }]),
    MongooseModule.forFeature([{ name: TaskMovieReview.name, schema: TaskMovieReviewSchema }]),
    MongooseModule.forFeature([{ name: TaskPerson.name, schema: TaskPersonSchema }]),
    MongooseModule.forFeature([{ name: Pose.name, schema: PoseSchema }]),
    UsersModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
