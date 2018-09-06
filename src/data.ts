import { DisplayItem } from './types'
import {
  DTYPE_IMAGE, DTYPE_MESSAGE, DTYPE_SCREEN, DATA_C_DIAGNOSTICS, DATA_C_SYNTH,
  DATA_C_MAIN, DTYPE_ACTION, DATA_SLEEP, ACTION_SLEEP, DATA_UNLOCK, ACTION_UNLOCK, DATA_SEARCH_RUINS, ACTION_SEARCH, DATA_USE_COMPUTER, ACTION_USE_COMPUTER, DATA_FIX_COMPUTER, ACTION_FIX_COMPUTER, ACTION_CREATE_FOOD, DATA_CREATE_FOOD, ACTION_SHOW_SYNTH, DATA_SYNTH
} from './indices'

import { createIsland } from './map'

export const gameData: DisplayItem[] = [
  // DATA_SPLASH
  [ DTYPE_IMAGE, 's.png' ],

  // DATA_INTRO
  [ DTYPE_MESSAGE,
    [
      'Lost contact with',
      'RANGER. Take boat',
      'and investigate.'
    ]
  ],

  // DATA_SUNRISE
  [
    DTYPE_MESSAGE,
    [
      'Sunrise'
    ]
  ],

  // DATA_SUNSET
  [
    DTYPE_MESSAGE,
    [
      'Sunset'
    ]
  ],

  // DATA_C_MAIN
  [
    DTYPE_SCREEN,
    [
      'RSOS v3.27',
      '--------------------',
      'MAIN MENU',
      '',
      'ERROR:',
      ' SYSTEM OFFLINE',
      '',
      'EMERGENCY OPS:',
      ''
    ],
    [
      [ 'DIAGNOSTICS', DATA_C_DIAGNOSTICS ],
      [ 'SYNTHESIZE', DATA_SYNTH ]
    ],
    0,
    'a'
  ],

  // DATA_C_DIAGNOSTICS
  [
    DTYPE_SCREEN,
    [
      'RSOS v3.27',
      '--------------------',
      'DIAGNOSTICS MENU',
      '',
      'MAIN SYSTEM:',
      ' OFFLINE',
      '',
      ' PROBLEM:',
      '  6 CAPS BLOWN',
      '',
      'SYNTHESIZE:',
      ' ONLINE'
    ],
    [],
    0,
    'a'
  ],

  // DATA_C_SYNTH
  [
    DTYPE_SCREEN,
    [
      'RSOS v3.27',
      '--------------------',
      'SYNTHESIZER MENU',
      '',
      'SYNTHDB:',
      ' OFFLINE',
      '',
      'POWER:',
      ' FULL',
      '',
      'EMERGENCY OPS:',
      ''
    ],
    [
      [ 'BASIC RATIONS', DATA_CREATE_FOOD ]
    ],
    0,
    'a'
  ],

  // DATA_ISLAND
  createIsland( [] ),

  // DATA_INVESTIGATE
  [
    DTYPE_MESSAGE,
    [
      'I should',
      'investigate'
    ]
  ],

  // DATA_BED
  [
    DTYPE_SCREEN,
    [
      'Sleep?',
      ''
    ],
    [
      [ 'Yes', DATA_SLEEP ],
      [ 'No', -1 ]
    ],
    0,
    'g'
  ],

  // DATA_NOT_TIRED
  [
    DTYPE_MESSAGE,
    [
      `I'm not tired!`
    ]
  ],

  // DATA_SLEEP
  [
    DTYPE_ACTION,
    ACTION_SLEEP
  ],

  // DATA_HUNGRY
  [
    DTYPE_MESSAGE,
    [
      `I'm hungry!`
    ]
  ],

  // DATA_DEAD
  [
    DTYPE_MESSAGE,
    [
      'You died'
    ]
  ],

  // DATA_RANGER
  [
    DTYPE_MESSAGE,
    [
      `It's RANGER!`,
      '',
      `RANGER is DEAD!`,
      '',
      `Found keycard`
    ]
  ],

  // DATA_LOCKED_NOKEYS
  [
    DTYPE_MESSAGE,
    [
      `It's locked!`
    ]
  ],

  // DATA_LOCKED_UNLOCK
  [
    DTYPE_SCREEN,
    [
      `It's locked!`,
      '',
      'Use keycard?',
      ''
    ],
    [
      [ 'Yes', DATA_UNLOCK ],
      [ 'No', -1 ]
    ],
    0,
    'g'
  ],  

  // DATA_UNLOCK
  [
    DTYPE_ACTION,
    ACTION_UNLOCK
  ],

  // DATA_RUINS
  [
    DTYPE_SCREEN,
    [
      `Search ruins?`,
      '',
      '1 hour',
      ''
    ],
    [
      [ 'Yes', DATA_SEARCH_RUINS ],
      [ 'No', -1 ]
    ],
    0,
    'g'
  ],

  // DATA_SEARCH_RUINS
  [
    DTYPE_ACTION,
    ACTION_SEARCH
  ],

  // DATA_COMPUTER
  [
    DTYPE_SCREEN,
    [
      `A computer`,
      '',
    ],
    [
      [ 'Use', DATA_USE_COMPUTER ]
    ],
    0,
    'g'
  ],

  // DATA_USE_COMPUTER
  [
    DTYPE_ACTION,
    ACTION_USE_COMPUTER
  ],

  // DATA_FIXABLE_COMPUTER
  [
    DTYPE_SCREEN,
    [
      `A computer`,
      '',
    ],
    [
      [ 'Use', DATA_USE_COMPUTER ],
      [ 'Fix', DATA_FIX_COMPUTER ]
    ],
    0,
    'g'
  ],

  // DATA_FIX_COMPUTER
  [
    DTYPE_ACTION,
    ACTION_FIX_COMPUTER
  ],  

  // DATA_C_FIXED
  [
    DTYPE_SCREEN,
    [
      'RSOS v3.27',
      '--------------------',
      'MAIN MENU',
      '',
      'SYSTEM ONLINE',
      '',
      'OPS:',
      ''
    ],
    [
      [ 'DIAGNOSTICS', DATA_C_DIAGNOSTICS ],
      [ 'SYNTHESIZE', DATA_C_SYNTH ]
    ],
    0,
    'a'
  ],  

  // DATA_C_SYNTH_CHARGING
  [
    DTYPE_SCREEN,
    [
      'RSOS v3.27',
      '--------------------',
      'SYNTHESIZER MENU',
      '',
      'SYNTHDB:',
      ' OFFLINE',
      '',
      'POWER:',
      ' CHARGING',
      '',
    ],
    [
    ],
    0,
    'a'
  ],  

  // DATA_CREATE_FOOD
  [
    DTYPE_ACTION,
    ACTION_CREATE_FOOD
  ],    

  // DATA_SYNTH
  [
    DTYPE_ACTION,
    ACTION_SHOW_SYNTH
  ]
]