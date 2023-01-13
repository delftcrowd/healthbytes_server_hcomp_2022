import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { User } from './user.schema'

export type RefreshTokenDocument = RefreshToken & Document

@Schema()
export class RefreshToken {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: User

  @Prop()
  isRevoked: boolean

  @Prop({ default: Date.now })
  createdAt: Date
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken)
