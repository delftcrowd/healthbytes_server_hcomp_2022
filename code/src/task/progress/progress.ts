import { StateMachine } from 'xstate'
import { createModel } from 'xstate/lib/model'

export const nextTask = (context: MyContext) => context.taskNumber + 1

export const isLessThanFive = (context: MyContext) => {
  return context.taskNumber < 4
}

export const isEqualFive = (context: MyContext) => {
  return context.taskNumber >= 4
}

export const isLessThanTen = (context: MyContext) => {
  return context.taskNumber < 9
}

export const isEqualTen = (context: MyContext) => {
  return context.taskNumber >= 9 && context.taskNumber <= 10
}

export const isLessThanTwenty = (context: MyContext) => {
  return context.taskNumber < 19
}

export const isEqualTwenty = (context: MyContext) => {
  return context.taskNumber >= 19 && context.taskNumber <= 20
}

export const isLessThanThirty = (context: MyContext) => {
  return context.taskNumber < 29
}

export const isEqualThirty = (context: MyContext) => {
  return context.taskNumber >= 29 && context.taskNumber <= 30
}

export const isGreaterThanEqualThirtyAndLessThanForty = (context: MyContext) => {
  return context.taskNumber >= 29 && context.taskNumber < 39
}

export const isEqualForty = (context: MyContext) => {
  return context.taskNumber >= 39 && context.taskNumber <= 40
}

export const isGreaterThanEqualFortyAndLessThanFifty = (context: MyContext) => {
  return context.taskNumber >= 39 && context.taskNumber < 49
}

export const isEqualFifty = (context: MyContext) => {
  return context.taskNumber >= 49 && context.taskNumber <= 50
}

export const isLessThanSixty = (context: MyContext) => {
  return context.taskNumber < 59
}

export const isEqualSixty = (context: MyContext) => {
  return context.taskNumber >= 59 && context.taskNumber <= 60
}

export const isInitialState = (context: MyContext, event, { cond }) => {
  if (cond.targetState == 'task' && context.initialState.startsWith('task')) return true
  return context.initialState == cond.targetState
}

export const isGestureTask = (context: MyContext, event, { cond }) => {
  return context.inputModality == 'gesture'
}

export const requiresTaskSwitchToBirdMid = (context: MyContext, event, { cond }) => {
  return ["B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15"].includes(context.condition)
}

export const requiresTaskSwitchToMovieMid = (context: MyContext, event, { cond }) => {
  return ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15"].includes(context.condition)
}

export const requiresTaskSwitchToMovieEnd = (context: MyContext, event, { cond }) => {
  return ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7"].includes(context.condition)
}

export const requiresTaskSwitchToBirdEnd = (context: MyContext, event, { cond }) => {
  return ["A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15", "B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15"].includes(context.condition)
}

export const isMovieStart = (context: MyContext, event, { cond }) => {
  return ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7"].includes(context.condition)
}

export const isBirdStart = (context: MyContext, event, { cond }) => {
  return ["A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15", "B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15"].includes(context.condition)
}

export const optedOut = (context: MyContext, event, { cond }) => {
  return !context.optedForOptional
}

export const optedInAndRequiresMovieStart = (context: MyContext, event, { cond }) => {
  return context.optedForOptional && ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7"].includes(context.condition)
}

export const optedInAndRequiresBirdStart = (context: MyContext, event, { cond }) => {
  return context.optedForOptional && ["A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15", "B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15"].includes(context.condition)
}

export interface MyContext {
  taskType?: 'person' | 'movie' | 'bird'
  inputModality?: 'gesture' | 'normal'
  taskNumber: number
  initialState: string
  condition: string
  optedForOptional: boolean
}

export type NextEvent = {
  type: 'NEXT'
}

export type InitEvent = {
  type: 'INIT'
}

export type OptInEvent = {
  type: 'OPT_IN'
}

export const taskModel = createModel({} as MyContext, {
  events: {
    NEXT: () => ({}),
    INIT: () => ({}),
    OPT_IN: () => ({})
  },
})

interface StateMachineTask {
  initial: 'taskStart'
  states: {
    taskStart: {}
    taskEnd: {}
    startMidLandingPage?: {}
    midEndLandingPage?: {}
    optionalLandingPage?: {}
    movie?: {}
    movieStart?: {}
    movieMid?: {}
    movieEnd?: {}
    bird?: {}
    birdStart?: {}
    birdMid?: {}
    birdEnd?: {}
    profession?: {}
    midname?: {}
    [stateName: string]: any
  }
}

const personTask: StateMachineTask = {
  initial: 'taskStart',
  states: {
    taskStart: {
      always: [
        { target: 'taskEnd', cond: { type: 'isInitialState', targetState: 'task.taskEnd' } },
        { target: 'profession', cond: { type: 'isInitialState', targetState: 'task.profession' } },
        { target: 'midname' },
      ],
    },
    midname: {
      on: {
        NEXT: [
          {
            actions: 'increase',
            cond: 'isLessThanFive',
            target: 'midname',
            internal: false,
          },
          {
            cond: 'isEqualFive',
            target: 'profession',
            actions: 'resetCount',
          },
        ],
      },
    },
    profession: {
      on: {
        NEXT: [
          {
            actions: 'increase',
            cond: 'isLessThanFive',
            target: 'profession',
            internal: false,
          },
          {
            cond: 'isEqualFive',
            target: 'taskEnd',
          },
        ],
      },
    },
    taskEnd: {},
  },
}

const birdTask: StateMachineTask = {
  initial: 'taskStart',

  states: {
    taskStart: {
      always: [
        { target: 'taskEnd', cond: { type: 'isInitialState', targetState: 'task.taskEnd' } },
        { target: 'bird' },
      ],
    },
    bird: {
      on: {
        NEXT: [
          {
            actions: 'increase',
            cond: 'isLessThanTen',
            target: 'bird',
            internal: false,
          },
          {
            cond: 'isEqualTen',
            target: 'taskEnd',
          },
        ],
      },
    },
    taskEnd: {},
  },
}

const movieTask: StateMachineTask = {
  initial: 'taskStart',
  states: {
    taskStart: {
      always: [
        { target: 'taskEnd', cond: { type: 'isInitialState', targetState: 'task.taskEnd' } },
        { target: 'movie' },
      ],
    },
    movie: {
      on: {
        NEXT: [
          {
            actions: 'increase',
            cond: 'isLessThanTen',
            target: 'movie',
            internal: false,
          },
          {
            cond: 'isEqualTen',
            target: 'taskEnd',
          },
        ],
      },
    },
    taskEnd: {},
  },
}

const switchingTask: StateMachineTask = {
  initial: 'taskStart',
  states: {
    taskStart: {
      always: [
        { target: 'taskEnd', cond: { type: 'isInitialState', targetState: 'task.taskEnd' } },
        { target: 'movieStart', cond: {type: 'isMovieStart', targetState: 'task.movieStart'} },
        { target: 'birdStart', cond: {type: 'isBirdStart', targetState: 'task.birdStart'} },
      ],
    },
    movieStart: {
      on: {
        NEXT: [
          {
            actions: 'increase',
            cond: 'isLessThanTen',
            target: 'movieStart',
            internal: false,
          },
          {
            cond: 'isEqualTen',
            target: 'startMidLandingPage',
          },
          {
            actions: 'increase',
            cond: 'isGreaterThanEqualThirtyAndLessThanForty',
            target: 'movieStart',
            internal: false,
          },
          {
            cond: 'isEqualForty',
            target: 'startMidLandingPage',
          }
        ],
      },
    },
    birdStart: {
      on: {
        NEXT: [
          {
            actions: 'increase',
            cond: 'isLessThanTen',
            target: 'birdStart',
            internal: false,
          },
          {
            cond: 'isEqualTen',
            target: 'startMidLandingPage',
          },
          {
            actions: 'increase',
            cond: 'isGreaterThanEqualThirtyAndLessThanForty',
            target: 'birdStart',
            internal: false,
          },
          {
            cond: 'isEqualForty',
            target: 'startMidLandingPage',
          }
        ],
      },
    },
    startMidLandingPage: {
      on: {
        NEXT: [
          {
            actions: 'increase',
            cond: 'requiresTaskSwitchToMovieMid',
            target: 'movieMid',
            internal: false,
          },
          {
            actions: 'increase',
            cond: 'requiresTaskSwitchToBirdMid',
            target: 'birdMid',
            internal: false
          }
        ]
      }
    },
    movieMid: {
      on: {
        NEXT: [
          {
            actions: 'increase',
            cond: 'isLessThanTwenty',
            target: 'movieMid',
            internal: false,
          },
          {
            cond: 'isEqualTwenty',
            target: 'midEndLandingPage',
          },
          {
            actions: 'increase',
            cond: 'isGreaterThanEqualFortyAndLessThanFifty',
            target: 'movieMid',
            internal: false,
          },
          {
            cond: 'isEqualFifty',
            target: 'midEndLandingPage',
          }
        ],
      },
    },
    birdMid: {
      on: {
        NEXT: [
          {
            actions: 'increase',
            cond: 'isLessThanTwenty',
            target: 'birdMid',
            internal: false,
          },
          {
            cond: 'isEqualTwenty',
            target: 'midEndLandingPage',
          },
          {
            actions: 'increase',
            cond: 'isGreaterThanEqualFortyAndLessThanFifty',
            target: 'birdMid',
            internal: false,
          },
          {
            cond: 'isEqualFifty',
            target: 'midEndLandingPage',
          }
        ],
      },
    },
    midEndLandingPage: {
      on: {
        NEXT: [
          {
            actions: 'increase',
            cond: 'requiresTaskSwitchToMovieEnd',
            target: 'movieEnd',
            internal: false,
          },
          {
            actions: 'increase',
            cond: 'requiresTaskSwitchToBirdEnd',
            target: 'birdEnd',
            internal: false,
          },
        ]
      }
    },
    movieEnd: {
      on: {
        NEXT: [
          {
            actions: 'increase',
            cond: 'isLessThanThirty',
            target: 'movieEnd',
            internal: false,
          },
          {
            cond: 'isEqualThirty',
            target: 'optionalLandingPage',
          },
          {
            actions: 'increase',
            cond: 'isLessThanSixty',
            target: 'movieEnd',
            internal: false,
          },
          {
            cond: 'isEqualSixty',
            target: 'taskEnd'
          },
        ],
      },
    },
    birdEnd: {
      on: {
        NEXT: [
          {
            actions: 'increase',
            cond: 'isLessThanThirty',
            target: 'birdEnd',
            internal: false,
          },
          {
            cond: 'isEqualThirty',
            target: 'optionalLandingPage',
          },
          {
            actions: 'increase',
            cond: 'isLessThanSixty',
            target: 'birdEnd',
            internal: false,
          },
          {
            cond: 'isEqualSixty',
            target: 'taskEnd'
          },
        ],
      },
    },
    optionalLandingPage: {
      on: {
        NEXT: [
          {
            actions: 'increase',
            cond: 'optedInAndRequiresMovieStart',
            target: 'movieStart'
          },
          {
            actions: 'increase',
            cond: 'optedInAndRequiresBirdStart',
            target: 'birdStart'
          },
          {
            cond: 'optedOut',
            target: 'taskEnd',
          },
        ],
        OPT_IN: [
          {
            actions: 'updateOptionalFlag'
          }
        ]
      }
    },
    
    taskEnd: {},
  },
}

const generateMachine = (taskState: StateMachineTask) => {
  return taskModel.createMachine({
    context: { taskType: 'bird', taskNumber: 0, initialState: '', condition: '', optedForOptional: false },
    tsTypes: {} as import('./progress.typegen').Typegen0,
    schema: { context: {} as MyContext, events: {} as NextEvent | InitEvent | OptInEvent },
    id: 'progress',
    initial: 'boot',
    states: {
      boot: {
        always: [
          { target: 'entryQuestionnaire', cond: { type: 'isInitialState', targetState: 'entryQuestionnaire' } },
          { target: 'exitQuestionnaire', cond: { type: 'isInitialState', targetState: 'exitQuestionnaire' } },
          { target: 'task', cond: { type: 'isInitialState', targetState: 'task' } },
          { target: 'tutorial', cond: { type: 'isInitialState', targetState: 'tutorial' } },
          { target: 'end', cond: { type: 'isInitialState', targetState: 'end' } },
          { target: 'landingPage' },
        ],
      },
      landingPage: {
        on: {
          NEXT: {
            target: 'entryQuestionnaire',
          },
        },
      },
      entryQuestionnaire: {
        on: {
          NEXT:
            // [
            // {
            //   target: 'tutorial',
            //   cond: 'isGestureTask',
            // },
            // {
            //   target: 'task',
            // },
            {
              target: 'tutorial',
            },
          // ],
        },
      },
      tutorial: {
        on: {
          NEXT: {
            target: 'task',
          },
        },
      },
      task: {
        on: {
          NEXT: {
            target: 'exitQuestionnaire',
          },
        },
        // Typegen does not process the states from this, which leads to a faulty typgen.ts file...
        ...taskState,
      },
      exitQuestionnaire: {
        on: {
          NEXT: {
            target: 'end',
          },
        },
      },
      end: {
        type: 'final',
      },
    },
  })
}

export const birdProgressMachine = generateMachine(birdTask)
export const movieProgressMachine = generateMachine(movieTask)
export const personProgressMachine = generateMachine(personTask)
export const switchingMovieProgressMachine = generateMachine(switchingTask)

// const { initialState } = taskProgressMachine

// const toggleService = interpret(taskProgressMachine)
//   .onTransition((state) => console.log(state.value))
//   .start()

// toggleService.send('NEXT')
// toggleService.send('NEXT')
// toggleService.stop()
