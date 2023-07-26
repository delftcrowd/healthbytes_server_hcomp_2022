// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true
  eventsCausingActions: {}
  internalEvents: {
    '': { type: '' }
    'xstate.init': { type: 'xstate.init' }
  }
  invokeSrcNameMap: {}
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingServices: {}
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | 'boot'
    | 'landingPage'
    | 'entryQuestionnaire'
    | 'tutorial'
    | 'task'
    | 'exitQuestionnaire'
    | 'end'
    | 'task.taskStart'
    | 'task.taskEnd'
    | 'task.startMidLandingPage'
    | 'task.midEndLandingPage'
    | 'task.movie'
    | 'task.movieStart'
    | 'task.movieMid'
    | 'task.movieEnd'
    | 'task.bird'
    | 'task.birdStart'
    | 'task.birdMid'
    | 'task.birdEnd'
    | 'task.midname'
    | 'task.profession'
  tags: never
}
