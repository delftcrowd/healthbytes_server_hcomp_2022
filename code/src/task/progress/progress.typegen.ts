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
    | 'task.movie'
    | 'task.bird'
    | 'task.midname'
    | 'task.profession'
  tags: never
}
