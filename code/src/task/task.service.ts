import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  MethodNotAllowedException,
  NotAcceptableException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { getBirdAndMovieQuestions, getBirdQuestions, getMovieQuestions, getPersonQuestions, getTaskDetails, TaskDetails } from 'src/dto'
import { Pose, PoseDocument, PoseInstance } from 'src/schemas/pose.schema'
import { TaskBirdBeak, TaskBirdBeakDocument } from 'src/schemas/task-bird.schema'
import { TaskMovieReview, TaskMovieReviewDocument } from 'src/schemas/task-movie.schema'
import { TaskPerson, TaskPersonDocument } from 'src/schemas/task-person.schema'
import { BirdAndMovieQuestions, BirdQuestions, MovieQuestions, PersonQuestions, Purpose, Task, TaskDocument, TaskTypes } from 'src/schemas/task-progress.schema'
import { UserDetails, UserService } from 'src/users/users.service'
import { interpret, InterpreterFrom } from 'xstate'
import {
  birdProgressMachine,
  isEqualFive,
  isEqualTen,
  isEqualTwenty,
  isEqualThirty,
  // isGestureTask,
  isInitialState,
  isLessThanFive,
  isLessThanTen,
  isLessThanTwenty,
  isLessThanThirty,
  isGreaterThanEqualThirtyAndLessThanForty,
  isEqualForty,
  isGreaterThanEqualFortyAndLessThanFifty,
  isEqualFifty,
  isLessThanSixty,
  isEqualSixty,
  movieProgressMachine,
  nextTask,
  personProgressMachine,
  taskModel,
  switchingMovieProgressMachine,
  requiresTaskSwitchToBirdEnd,
  requiresTaskSwitchToBirdMid,
  requiresTaskSwitchToMovieEnd,
  requiresTaskSwitchToMovieMid,
  isBirdStart,
  isMovieStart,
  optedOut,
  optedInAndRequiresMovieStart,
  optedInAndRequiresBirdStart
} from './progress/progress'

@Injectable()
export class TaskService {
  constructor(
    private userService: UserService,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(TaskBirdBeak.name) private readonly taskBirdModel: Model<TaskBirdBeakDocument>,
    @InjectModel(TaskMovieReview.name) private readonly taskMovieModel: Model<TaskMovieReviewDocument>,
    @InjectModel(TaskPerson.name) private readonly taskPersonModel: Model<TaskPersonDocument>,
    @InjectModel(Pose.name) private readonly poseModel: Model<PoseDocument>,
  ) { }

  private userProgress: { [user: string]: TaskDetails } = {}
  private userState: { [user: string]: InterpreterFrom<typeof personProgressMachine> } = {}
  private birds: TaskBirdBeak[]
  private movieReviews: TaskMovieReview[]
  private midnamePersons: TaskPerson[]
  private professionPersons: TaskPerson[]
  private loaded: boolean = false

  // ---------------------------------------------------------------------------
  // USER PROGRESS
  // ---------------------------------------------------------------------------
  private createSM(
    taskProgress: TaskDetails,
    taskProgressMachine: typeof personProgressMachine,
  ): InterpreterFrom<typeof personProgressMachine> {
    const newMachine = taskProgressMachine
      .withConfig({
        actions: {
          increase: taskModel.assign({
            taskNumber: nextTask,
          }),
          resetCount: taskModel.assign({
            taskNumber: 0,
          }),
          updateOptionalFlag: taskModel.assign({
            optedForOptional: true
          })
        },
        guards: {
          isLessThanFive: isLessThanFive,
          isEqualFive: isEqualFive,
          isLessThanTen: isLessThanTen,
          isEqualTen: isEqualTen,
          isLessThanTwenty: isLessThanTwenty,
          isEqualTwenty: isEqualTwenty,
          isLessThanThirty: isLessThanThirty,
          isEqualThirty: isEqualThirty,
          isGreaterThanEqualThirtyAndLessThanForty: isGreaterThanEqualThirtyAndLessThanForty,
          isEqualForty: isEqualForty,
          isGreaterThanEqualFortyAndLessThanFifty: isGreaterThanEqualFortyAndLessThanFifty,
          isEqualFifty: isEqualFifty,
          isLessThanSixty: isLessThanSixty,
          isEqualSixty: isEqualSixty,
          isInitialState: isInitialState,
          requiresTaskSwitchToBirdEnd: requiresTaskSwitchToBirdEnd,
          requiresTaskSwitchToBirdMid: requiresTaskSwitchToBirdMid,
          requiresTaskSwitchToMovieEnd: requiresTaskSwitchToMovieEnd,
          requiresTaskSwitchToMovieMid: requiresTaskSwitchToMovieMid,
          isMovieStart: isMovieStart,
          isBirdStart: isBirdStart,
          optedOut: optedOut,
          optedInAndRequiresMovieStart: optedInAndRequiresMovieStart,
          optedInAndRequiresBirdStart: optedInAndRequiresBirdStart
          // isGestureTask: isGestureTask,
        },
      })
      .withContext({
        condition: taskProgress.condition,
        taskType: taskProgress.taskType,
        taskNumber: taskProgress.questionNumber,
        initialState: taskProgress.state,
        inputModality: taskProgress.inputModality,
        optedForOptional: taskProgress.optedForOptional
      })

    return interpret(newMachine)
      .onTransition((state) => {
        console.debug(state.value)
        console.debug(state.context)
      })
      .start()
  }

  async createSession(taskProgress: TaskDetails) {
    switch (taskProgress.taskType) {
      case 'bird':
        if (taskProgress.purpose == "hcomp") {
          return this.createSM(taskProgress, birdProgressMachine)
        } else if (taskProgress.purpose == "switching") {
          return this.createSM(taskProgress, switchingMovieProgressMachine)
          // return this.createSM(taskProgress, switchingBirdProgressMachine)
        }
      case 'movie':
        if (taskProgress.purpose == "hcomp") {
          return this.createSM(taskProgress, movieProgressMachine)
        } else if (taskProgress.purpose == "switching") {
          return this.createSM(taskProgress, switchingMovieProgressMachine)
        }
      case 'person':
        return this.createSM(taskProgress, personProgressMachine)
      default:
        return null
    }
  }

  async createUserTask(user: UserDetails): Promise<TaskDetails> {
    const hasTask = await this.hasTask(user.id)
    if (hasTask) {
      return await this.getTask(user.id)
    }
    return getTaskDetails(await this.generateProgress(user.id))
  }

  async answerQuestion(user: UserDetails, answer: { answer: string }) {
    if (!(user.prolificId in this.userProgress)) {
      throw new BadRequestException('User has no tasks')
    }
    let questionThreshold = 10

    const condition = this.userProgress[user.prolificId].condition
    if (condition == "switching") {
      if (this.userProgress[user.prolificId].optedForOptional) {
        questionThreshold = 60
      } else {
        questionThreshold = 30
      }
    }

    if (
      !['task.midname', 'task.profession', 'task.movie', 'task.movieStart', 'task.movieMid', 'task.movieEnd', 'task.bird', 'task.birdStart', 'task.birdMid', 'task.birdEnd'].some(
        this.userState[user.prolificId].state.matches,
      ) &&
      this.userProgress[user.prolificId].questionNumber >= questionThreshold
    ) {
      throw new ForbiddenException('No more questions to answer')
    }

    const allowedAnswers = (await this.getQuestion(user.id)).answers

    if (allowedAnswers.includes('' + answer.answer)) {
      this.taskModel.updateOne({ user: user.id }, { $push: { answers: answer.answer } }).exec()
    } else {
      throw new NotAcceptableException('Not a valid answer')
    }

    const state = this.userState[user.prolificId]
    state.send('NEXT')

    this.syncProgress(user)

    return {
      task: this.userProgress[user.prolificId],
      currentQuestion: {},
    }
  }

  async nextState(user: UserDetails) {
    if (!(user.prolificId in this.userProgress)) {
      throw new BadRequestException('User has no tasks')
    }

    const state = this.userState[user.prolificId]

    if (!state.state.matches('task') || state.state.matches('task.taskEnd') || state.state.matches('task.startMidLandingPage') || state.state.matches('task.midEndLandingPage') || state.state.matches('task.optionalLandingPage')) {
      state.send('NEXT')

      this.syncProgress(user)
      // throw new MethodNotAllowedException('Not allowed to proceed right now')
    }

    return {
      task: this.userProgress[user.prolificId],
      currentQuestion: {},
    }
  }

  async updateUserProgress(taskProgress: TaskDetails) {
    if (!(taskProgress.user in this.userProgress)) {
      this.userProgress[taskProgress.user.toString()] = taskProgress
    }
    if (!(taskProgress.user in this.userState)) {
      this.userState[taskProgress.user.toString()] = await this.createSession(taskProgress)
    }
    
  }

  async syncProgress(user: UserDetails) {
    const pid = user.prolificId
    this.userProgress[pid].questionNumber = this.userState[pid].state.context.taskNumber
    this.userProgress[pid].state = this.userState[pid].state.toStrings().pop()
    this.userProgress[pid].complete = this.userState[pid].state.done
    await this.taskModel
      .updateOne(
        { user: user.id },
        {
          $set: {
            state: this.userProgress[pid].state,
            questionNumber: this.userProgress[pid].questionNumber,
            complete: this.userProgress[pid].complete,
            taskType: this.userProgress[pid].taskType,
            optedForOptional: this.userProgress[pid].optedForOptional,
            updated: new Date
          },
        },
      )
      .exec()
  }

  async toggleOptedForOptional(user: UserDetails) {
    this.userProgress[user.prolificId].optedForOptional = true
    if (user.prolificId in this.userProgress) {

      const updated = await this.taskModel
      .updateOne(
        { user: user.id },
        {
          $set: {
            optedForOptional: this.userProgress[user.prolificId].optedForOptional,
            updated: new Date
          }
        },
        {new: true}
      )
      .exec()

      const state = this.userState[user.prolificId]
      state.send("OPT_IN")

      return updated.modifiedCount == 1
    }

    throw new BadRequestException('User has no tasks')

    // return {
    //   task: {
    //     user: user.prolificId,
    //     taskType: updated.taskType,
    //     inputModality: user.inputModality,
    //     purpose: updated.purpose,
    //     condition: user.condition,
    //     state: updated.state,
    //     questionNumber: updated.questionNumber,
    //     complete: updated.complete,
    //     optedForOptional: updated.optedForOptional
    //   }
    // }
  }

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  async hasTask(user: string) {
    return !!(await this.taskModel.exists({ user }).exec())
  }

  async getTask(user: string) {
    const taskProgress = getTaskDetails(
      await this.taskModel.findOne({ user }).populate('user', 'prolificId inputModality purpose condition optedForOptional -_id'),
    )
    await this.updateUserProgress(taskProgress)
    return taskProgress
  }

  // ---------------------------------------------------------------------------
  // QUESTIONS & ANSWERS
  // ---------------------------------------------------------------------------

  async getQuestion(userId: string) {
    const task = await this.taskModel.findOne({ user: userId }).exec()

    switch (task.purpose) {
      case 'hcomp':
        switch (task.taskType) {
          case 'bird':
            return this.getBirdQuestion(userId)
          case 'movie':
            return this.getMovieQuestion(userId)
          case 'person':
            return this.getPersonQuestion(userId)
          default:
            return null
        }
      case 'switching':
        return this.getBirdAndMovieQuestion(userId)
    }
  }

  async getBirdAndMovieQuestion(userId: string) {
    const questions = getBirdAndMovieQuestions(
      (await this.taskModel.findOne({ user: userId }).exec()) as unknown as BirdAndMovieQuestions,
      )
    if (questions.answers.length >= (questions.birds.length + questions.movieReviews.length)) {
      throw new MethodNotAllowedException('No more questions available')
    }

    // Determine condition from length of movieReviews and birds
    if (questions.movieReviews.length == 60) {
      // This is an A0-A7 condition
      return this.getQuestionFromMovie(questions.movieReviews[questions.answers.length])
    } else if (questions.birds.length == 60) {
      // This is an A8-A15 condition
      return this.getQuestionFromBird(questions.birds[questions.answers.length])
    } else if (questions.movieReviews.length == 40) {
      // This is a B0-B7 condition
      if (questions.answers.length < 10) {
        return this.getQuestionFromMovie(questions.movieReviews[questions.answers.length])
      } else if (questions.answers.length >= 10 && questions.answers.length < 20) {
        // Offset for the ten movies preceding the birds
        return this.getQuestionFromBird(questions.birds[questions.answers.length - 10])
      } else if (questions.answers.length >= 20 && questions.answers.length < 40) {
        // Offset for 10 questions being on birds
        return this.getQuestionFromMovie(questions.movieReviews[questions.answers.length - 10])
      } else if (questions.answers.length >= 40 && questions.answers.length < 50) {
        // Offset to account for the intervening movies questions
        return this.getQuestionFromBird(questions.birds[questions.answers.length - 30])
      } else if (questions.answers.length >= 50) {
        // Offset for 20 questions being on birds
        return this.getQuestionFromMovie(questions.movieReviews[questions.answers.length - 20])
      }
    } else if (questions.birds.length == 40) {
      // This is a B8-B15 condition
      if (questions.answers.length < 10) {
        return this.getQuestionFromBird(questions.birds[questions.answers.length])
      } else if (questions.answers.length >= 10 && questions.answers.length < 20) {
        return this.getQuestionFromMovie(questions.movieReviews[questions.answers.length - 10])
      } else if (questions.answers.length >= 20 && questions.answers.length < 40) {
        // Offset for 10 questions being on birds
        return this.getQuestionFromBird(questions.birds[questions.answers.length - 10])
      } else if (questions.answers.length >= 40 && questions.answers.length < 50) {
        return this.getQuestionFromMovie(questions.movieReviews[questions.answers.length - 30])
      } else if (questions.answers.length >= 50) {
        // Offset for 10 questions being on birds
        return this.getQuestionFromBird(questions.birds[questions.answers.length - 20])
      }
    }
  }

  async getBirdQuestion(userId: string) {
    const questions = getBirdQuestions(
      (await this.taskModel.findOne({ user: userId }).exec()) as unknown as BirdQuestions,
    )

    if (questions.answers.length >= questions.birds.length) {
      throw new MethodNotAllowedException('No more questions available')
    }

    return this.getQuestionFromBird(questions.birds[questions.answers.length])
  }

  getQuestionFromBird(bird: TaskBirdBeak) {
    return {
      question: bird.url,
      answers: [
        'all-purpose',
        'cone',
        'curved',
        'dagger',
        'hooked',
        // 'hooked-seabird',
        'needle',
        'spatulate',
        'specialized',
      ],
    }
  }

  async getMovieQuestion(userId: string) {
    const questions = getMovieQuestions(
      (await (
        await this.taskModel.findOne({ user: userId }).exec()
      ).populate('movieReviews._id')) as unknown as MovieQuestions,
    )

    if (questions.answers.length >= questions.movieReviews.length) {
      throw new MethodNotAllowedException('No more questions available')
    }

    return this.getQuestionFromMovie(questions.movieReviews[questions.answers.length])
  }

  getQuestionFromMovie(movie: TaskMovieReview) {
    return {
      question: movie.reviewText,
      answers: ['1', '2', '3', '4', '5'],
    }
  }

  async getPersonQuestion(userId: string) {
    const questions = getPersonQuestions(
      (await this.taskModel.findOne({ user: userId }).exec()) as unknown as PersonQuestions,
    )

    const isMidname = questions.answers.length < 5

    return this.getQuestionFromPerson(
      isMidname
        ? questions.midnamePersons[questions.answers.length]
        : questions.professionPersons[questions.answers.length - 5],
    )
  }

  getQuestionFromPerson(person: TaskPerson) {
    return {
      question: `Please choose the correct ${person.type} of ${person.name}`,
      answers: this.shuffleArray([person.type == 'midname' ? person.midname : person.profession, person.alternative]),
    }
  }

  // ---------------------------------------------------------------------------
  // POSE
  // ---------------------------------------------------------------------------

  async savePose(user: UserDetails, actionType: string, landmarks?: any) {
    const stage = this.userProgress[user.prolificId].state
    const questionNumber = this.userProgress[user.prolificId].questionNumber
    const newPose: PoseInstance = {
      actionType,
      landmarks,
      stage,
      questionNumber,
    }

    return await this.poseModel.findOneAndUpdate(
      { user: user.id },
      {
        $push: {
          poses: newPose,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
  }

  // ---------------------------------------------------------------------------
  // PROGRESS GENERATION
  // ---------------------------------------------------------------------------

  private async generateProgress(userId: string): Promise<TaskDocument> {
    const user = await this.userService.findById(userId)
    const type = user.taskType
    const purpose = user.purpose
    const condition = user.condition
    let questionCount = 0
    let model: Task = null

    switch (purpose ) {
      case "hcomp":
        questionCount = 10
        switch (type) {
          case 'bird':
            model = await this.generateBirdQuestions(userId, questionCount, purpose)
            break
          case 'movie':
            model = await this.generateMovieQuestions(userId, questionCount, purpose)
            break
          case 'person':
            model = await this.generatePersonQuestions(userId, purpose)
            break
        }
        break
      case 'switching':
        if (condition.slice(0,1) == "A") {
          questionCount = 60
          switch (type) {
            case 'bird':
              model = await this.generateBirdQuestions(userId, questionCount, purpose)
              break
            case 'movie':
              model = await this.generateMovieQuestions(userId, questionCount, purpose)
              break
            case 'person':
              model = await this.generatePersonQuestions(userId, purpose)
              break
          }
        } else if (["B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7"].includes(condition)) {
          model = await this.generateBirdAndMovieQuestions(userId, 20, 40, purpose, user.taskType)
          break
        } else if (["B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15"].includes(condition)) {
          model = await this.generateBirdAndMovieQuestions(userId, 40, 20, purpose, user.taskType)
          break
        }
        break
    }
    const newUserProgress = new this.taskModel(model)
    return newUserProgress.save()
  }

  private async generateBirdAndMovieQuestions(user: string, birdQuestionCount: number, movieQuestionCount: number, purpose: Purpose, startingTaskType: TaskTypes): Promise<BirdAndMovieQuestions> {
    await this._initialize()
    return {
      user,
      answers: [],
      questionNumber: 0,
      state: 'landingPage',
      complete: false,
      taskType: startingTaskType,
      birds: this.getRandom(this.birds, birdQuestionCount),
      movieReviews: this.getRandom(this.movieReviews, movieQuestionCount),
      purpose: purpose,
      updated: new Date,
      optedForOptional: false
    }
  }

  private async generateBirdQuestions(user: string, questionCount: number, purpose: Purpose): Promise<BirdQuestions> {
  // private async generateBirdQuestions(user: UserDetails, questionCount: number): Promise<BirdQuestions> {
    await this._initialize()
    return {
      user,
      answers: [],
      questionNumber: 0,
      state: 'landingPage',
      complete: false,
      taskType: 'bird',
      birds: this.getRandom(this.birds, questionCount),
      purpose: purpose,
      updated: new Date,
      optedForOptional: false
    }
  }

  private async generateMovieQuestions(user: string, questionCount: number, purpose: Purpose): Promise<MovieQuestions> {
    await this._initialize()

    return {
      user,
      answers: [],
      questionNumber: 0,
      state: 'landingPage',
      complete: false,
      taskType: 'movie',
      movieReviews: this.getRandom(this.movieReviews, questionCount),
      purpose: purpose,
      updated: new Date,
      optedForOptional: false
    }
  }

  private async generatePersonQuestions(user: string, purpose: Purpose): Promise<PersonQuestions> {
    await this._initialize()

    return {
      user,
      answers: [],
      questionNumber: 0,
      state: 'landingPage',
      complete: false,
      taskType: 'person',
      midnamePersons: this.shuffleArray(this.midnamePersons.slice(0)),
      professionPersons: this.shuffleArray(this.professionPersons.slice(0)),
      purpose: purpose,
      updated: new Date,
      optedForOptional: false
    }
  }

  private getRandom<T>(arr: T[], n: number): T[] {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len)
    if (n > len) throw new RangeError('getRandom: more elements taken than available' + len)
    while (n--) {
      var x = Math.floor(Math.random() * len)
      result[n] = arr[x in taken ? taken[x] : x]
      taken[x] = --len in taken ? taken[len] : len
    }
    return result
  }

  private shuffleArray<T>(a: T[]) {
    //array,placeholder,placeholder,placeholder
    let c = a.length,
      b: number,
      t: T
    while (c) (b = (Math.random() * c--) | 0), (t = a[c]), (a[c] = a[b]), (a[b] = t)
    return a
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION & UTILS
  // ---------------------------------------------------------------------------

  getAllProgress() {
    return this.userProgress
  }

  getAllState() {
    return this.userState
  }

  clearComplete() {
    this.userProgress = this.filterObject(this.userProgress, ([, value]) => !value.complete)
    this.userState = this.filterObject(this.userState, ([, value]) => !value.state.done)
    return this.getAllProgress()
  }

  clearAll() {
    this.userProgress = {}
    this.userState = {}
    return this.getAllProgress()
  }

  removeSession(prolificId: string) {
    delete this.userProgress[prolificId]
    delete this.userState[prolificId]
    return this.getAllProgress()
  }

  private filterObject<T>(
    obj: { [s: string]: T } | ArrayLike<T>,
    callback: (value: [string, T], index: number, array: [string, T][]) => boolean,
  ) {
    return Object.fromEntries(Object.entries(obj).filter(callback))
  }

  private async _doInitialize() {
    this.birds = await this.taskBirdModel.find().exec()
    this.movieReviews = await this.taskMovieModel.find().exec()
    this.midnamePersons = await this.taskPersonModel.find({ type: 'midname' }).exec()
    this.professionPersons = await this.taskPersonModel.find({ type: 'profession' }).exec()
    this.loaded = true
  }

  private async _initialize() {
    if (!this.loaded) {
      await this._doInitialize()
    }
  }
}
