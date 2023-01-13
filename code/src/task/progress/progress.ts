import { createModel } from 'xstate/lib/model'

export const nextTask = (context: MyContext) => context.taskNumber + 1

export const isLessThanTen = (context: MyContext) => {
  return context.taskNumber < 9
}

export const isEqualTen = (context: MyContext) => {
  return context.taskNumber >= 9
}

export const isLessThanFive = (context: MyContext) => {
  return context.taskNumber < 4
}

export const isEqualFive = (context: MyContext) => {
  return context.taskNumber >= 4
}

export const isInitialState = (context: MyContext, event, { cond }) => {
  if (cond.targetState == 'task' && context.initialState.startsWith('task')) return true
  return context.initialState == cond.targetState
}

export const isGestureTask = (context: MyContext, event, { cond }) => {
  return context.inputModality == 'gesture'
}

export interface MyContext {
  taskType?: 'person' | 'movie' | 'bird'
  inputModality?: 'gesture' | 'normal'
  taskNumber: number
  initialState: string
}

export type NextEvent = {
  type: 'NEXT'
}

export type InitEvent = {
  type: 'INIT'
}

export const taskModel = createModel({} as MyContext, {
  events: {
    NEXT: () => ({}),
    INIT: () => ({}),
  },
})

export const enum stages {
  landingPage,
  entryQuestionnaire,
  tutorial,
  task,
  taskStart,
  taskEnd,
  exitQuestionnaire,
}
interface StateMachineTask {
  initial: 'taskStart'
  states: {
    taskStart: {}
    taskEnd: {}
    movie?: {}
    bird?: {}
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

const generateMachine = (taskState: StateMachineTask) => {
  return taskModel.createMachine({
    context: { taskType: 'bird', taskNumber: 0, initialState: '' },
    tsTypes: {} as import('./progress.typegen').Typegen0,
    schema: { context: {} as MyContext, events: {} as NextEvent | InitEvent },
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

// const { initialState } = taskProgressMachine

// const toggleService = interpret(taskProgressMachine)
//   .onTransition((state) => console.log(state.value))
//   .start()

// toggleService.send('NEXT')
// toggleService.send('NEXT')
// toggleService.stop()
