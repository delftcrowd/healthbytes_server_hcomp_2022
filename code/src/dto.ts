import { BirdQuestions, InputModality, MovieQuestions, PersonQuestions } from 'src/schemas/task-progress.schema'
import { UserDocument } from 'src/schemas/user.schema'
import { UserDetails } from 'src/users/users.service'
import { Task, TaskDocument } from './schemas/task-progress.schema'

export type TaskDetails = Pick<Task, 'taskType' | 'state' | 'questionNumber' | 'complete'> & {
  user: string
  inputModality: InputModality
}
export type PersonQuestionsDetails = Pick<PersonQuestions, 'midnamePersons' | 'professionPersons' | 'answers'>
export type MovieQuestionsDetails = Pick<MovieQuestions, 'movieReviews' | 'answers'>
export type BirdQuestionsDetails = Pick<BirdQuestions, 'birds' | 'answers'>
export interface PersonTaskResponse {}

export const getUserDetails = (user: UserDocument): UserDetails => {
  return {
    id: user._id,
    prolificId: user.prolificId,
    taskType: user.taskType,
    inputModality: user.inputModality,
  }
}

export const getTaskDetails = (
  task: TaskDocument | (Exclude<Task, 'user'> & { user: { prolificId: string; inputModality: string } }),
): TaskDetails => {
  const userDetails = getUserDetails(task.user as UserDocument)
  return {
    user: userDetails.prolificId,
    taskType: task.taskType,
    inputModality: userDetails.inputModality,
    state: task.state,
    questionNumber: task.questionNumber,
    complete: task.complete,
  }
}

export const getPersonQuestions = (task: PersonQuestions): PersonQuestionsDetails => {
  return {
    answers: task.answers,
    midnamePersons: task.midnamePersons,
    professionPersons: task.professionPersons,
  }
}

export const getMovieQuestions = (task: MovieQuestions): MovieQuestionsDetails => {
  return {
    answers: task.answers,
    movieReviews: task.movieReviews,
  }
}

export const getBirdQuestions = (task: BirdQuestions): BirdQuestionsDetails => {
  return {
    answers: task.answers,
    birds: task.birds,
  }
}
