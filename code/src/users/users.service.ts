import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { getUserDetails } from 'src/dto'
import { User, UserDocument } from 'src/schemas/user.schema'
import { InputModality, TaskTypes, Purpose } from 'src/schemas/task-progress.schema'

export type UserDetails = Pick<User, 'prolificId' | 'purpose' | 'taskType' | 'inputModality' | 'condition' > & {
  id: string
}

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<UserDocument>) { }

  async findById(id: string): Promise<UserDetails | null> {
    const user = await this.userModel.findById(id).exec()
    if (!user) return null
    return getUserDetails(user)
  }

  async findByProlificId(prolificId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ prolificId }).exec()
  }

  async isRegistered(prolificId: string) {
    return !!(await this.userModel.exists({ prolificId }).exec())
  }

  async revokeConsent(prolificId: string) {
    return await this.userModel.findOneAndUpdate({ prolificId }, { $set: { revoked: true } }, { new: true }).exec()
  }

  async isConsentRevoked(prolificId: string) {
    return (await this.userModel.findOne({ prolificId }).exec()).revoked
  }

  async isEntryQuestionnaireComplete(prolificId: string) {
    return (await this.userModel.findOne({ prolificId }).exec()).entrySurveyCompleted
  }

  async isExitQuestionnaireComplete(prolificId: string) {
    return (await this.userModel.findOne({ prolificId }).exec()).exitSurveyCompleted
  }

  async toggleInputModality(prolificId: string, inputModality: string) {
    return await this.userModel.findOneAndUpdate({ prolificId }, { $set: {inputModality: inputModality}}).exec()
  }

  async toggleTaskType(prolificId: string, taskType: string) {
    return await this.userModel.findOneAndUpdate({ prolificId }, { $set: {taskType: taskType}}).exec()
  }

  async completeEntryQuestionnaire(prolificId: string) {
    console.debug("setting completeEntryQuestionnaire flag")
    return await this.userModel.updateOne({ prolificId }, { $set: { entrySurveyCompleted: true } }).exec()
  }

  async completeExitQuestionnaire(prolificId: string) {
    console.debug("setting completeExitQuestionnaire flag")
    return await this.userModel.updateOne({ prolificId }, { $set: { exitSurveyCompleted: true } }).exec()
  }

  async create(prolificId: string, purpose: Purpose, taskType: TaskTypes, inputModality: InputModality, condition?: string): Promise<UserDocument> {
    const newUser = new this.userModel({
      prolificId: prolificId,
      purpose,
      taskType,
      inputModality,
      condition,
    })

    return newUser.save()
  }

}
