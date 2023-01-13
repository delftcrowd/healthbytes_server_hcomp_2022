import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { User } from './user.schema'

export type TaskPersonDocument = TaskPerson & Document

@Schema({ collection: 'taskpersons' })
export class TaskPerson {
  @Prop({ required: true })
  id: string

  @Prop({
    type: String,
    required: true,
    enum: ['midname', 'profession'],
  })
  type: 'midname' | 'profession'

  @Prop()
  name: string

  @Prop()
  midname?: string

  @Prop()
  profession?: string

  @Prop()
  alternative?: string
}

export const TaskPersonSchema = SchemaFactory.createForClass(TaskPerson)
