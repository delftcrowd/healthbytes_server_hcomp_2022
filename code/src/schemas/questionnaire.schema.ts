import { Prop, Schema } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { User } from './user.schema'

@Schema()
export class Questionnaire {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User

  @Prop()
  entryQuestionnaire: object

  @Prop()
  exitQuestionnaire: object
}
