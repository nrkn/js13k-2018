import { DisplayItem } from './types'
import {
  DTYPE_IMAGE, DTYPE_MESSAGE, DTYPE_SCREEN, DATA_C_DIAGNOSTICS, DATA_C_SYNTH,
  DATA_C_MAIN, DTYPE_ACTION, DATA_SLEEP, ACTION_SLEEP
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
      [ 'SYNTHESIZE', DATA_C_SYNTH ]
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
      'EMERGENCY OPS:',
      ''
    ],
    [
      [ 'BASIC RATIONS', -1 ] // need to implement
    ],
    0,
    'a'
  ],

  // DATA_ISLAND
  createIsland(),

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
      'Sleep?'
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
  ]
]