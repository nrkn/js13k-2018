import { DisplayItem } from './types'
import {
  DTYPE_IMAGE, DTYPE_MESSAGE, DTYPE_SCREEN, DATA_C_DIAGNOSTICS, DATA_C_SYNTH,
  DTYPE_ACTION, DATA_SLEEP, ACTION_SLEEP, DATA_UNLOCK, ACTION_UNLOCK,
  DATA_SEARCH_RUINS, ACTION_SEARCH, DATA_USE_COMPUTER, ACTION_USE_COMPUTER,
  DATA_FIX_COMPUTER, ACTION_FIX_COMPUTER, ACTION_CREATE_FOOD, DATA_CREATE_FOOD,
  ACTION_SHOW_SYNTH, DATA_SYNTH, DTYPE_MAP, MT_ISLAND, DATA_C_DIAGNOSTICS_FIXED, 
  DATA_DB, DATA_COMMS, DATA_SECURITY, DATA_MAP, ACTION_SHOW_DB, 
  ACTION_SHOW_COMMS, ACTION_SHOW_SECURITY, ACTION_SHOW_MAP, 
  DATA_RESTORE_BACKUPS, ACTION_RESTORE_BACKUPS, DATA_SPLASH, DATA_INTRO, 
  DATA_SUNRISE, DATA_SUNSET, DATA_C_MAIN, DATA_ISLAND, DATA_INVESTIGATE, 
  DATA_BED, DATA_NOT_TIRED, DATA_HUNGRY, DATA_DEAD, DATA_RANGER, 
  DATA_LOCKED_NOKEYS, DATA_LOCKED_UNLOCK, DATA_RUINS, DATA_COMPUTER, 
  DATA_FIXABLE_COMPUTER, DATA_C_FIXED, DATA_C_SYNTH_CHARGING, 
  DATA_C_DB_INTRO, DATA_C_DB_PORTALS, DATA_C_DB_GHOSTS, DATA_C_DB_ERRORS, 
  DATA_C_DB_SHUTDOWN_PORTALS, DATA_C_DB_SECURITY, DATA_C_DB_FIX_SATELLITE, 
  DATA_C_DB_RESCUE_TEAM,
  DATA_DIAGNOSTICS,
  ACTION_DIAGNOSTICS,
  DATA_MODCHIPS,
  ACTION_CREATE_MODCHIP
} from './indices'

export const gameData: DisplayItem[] = []

gameData[ DATA_SPLASH ] = [ 
  DTYPE_IMAGE, 
  's.png' 
]

gameData[ DATA_INTRO ] = [ 
  DTYPE_MESSAGE,
  [
    'Lost contact with',
    'RANGER. Take boat',
    'and investigate.'
  ]
]

gameData[ DATA_SUNRISE ] = [
  DTYPE_MESSAGE,
  [
    'Sunrise'
  ]
]

gameData[ DATA_SUNSET ] = [
  DTYPE_MESSAGE,
  [
    'Sunset'
  ]
]

gameData[ DATA_INVESTIGATE ] = [
  DTYPE_MESSAGE,
  [
    'I should',
    'investigate'
  ]
]

gameData[ DATA_BED ] = [
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
]

gameData[ DATA_NOT_TIRED ] = [
  DTYPE_MESSAGE,
  [
    `I'm not tired!`
  ]
]

gameData[ DATA_SLEEP ] = [
  DTYPE_ACTION,
  ACTION_SLEEP
]

gameData[ DATA_HUNGRY ] = [
  DTYPE_MESSAGE,
  [
    `I'm hungry!`
  ]
]

gameData[ DATA_DEAD ] = [
  DTYPE_MESSAGE,
  [
    'You died'
  ]
]

gameData[ DATA_RANGER ] = [
  DTYPE_MESSAGE,
  [
    `It's RANGER!`,
    '',
    `RANGER is DEAD!`,
    '',
    `Found keycard`
  ]
]

gameData[ DATA_LOCKED_NOKEYS ] = [
  DTYPE_MESSAGE,
  [
    `It's locked!`
  ]
]

gameData[ DATA_LOCKED_UNLOCK ] = [
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
]

gameData[ DATA_UNLOCK ] = [
  DTYPE_ACTION,
  ACTION_UNLOCK
]

gameData[ DATA_RUINS ] = [
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
]

gameData[ DATA_SEARCH_RUINS ] = [
  DTYPE_ACTION,
  ACTION_SEARCH
]

gameData[ DATA_USE_COMPUTER ] = [
  DTYPE_ACTION,
  ACTION_USE_COMPUTER
]

gameData[ DATA_FIX_COMPUTER ] = [
  DTYPE_ACTION,
  ACTION_FIX_COMPUTER
]

gameData[ DATA_CREATE_FOOD ] = [
  DTYPE_ACTION,
  ACTION_CREATE_FOOD
]

gameData[ DATA_SYNTH ] = [
  DTYPE_ACTION,
  ACTION_SHOW_SYNTH
]

gameData[ DATA_DB ] = [
  DTYPE_ACTION,
  ACTION_SHOW_DB
]

gameData[ DATA_COMMS ] = [
  DTYPE_ACTION,
  ACTION_SHOW_COMMS
]

gameData[ DATA_SECURITY ] = [
  DTYPE_ACTION,
  ACTION_SHOW_SECURITY
]

gameData[ DATA_MAP ] = [
  DTYPE_ACTION,
  ACTION_SHOW_MAP
]

gameData[ DATA_C_DB_INTRO ] = [
  DTYPE_SCREEN,
  [
    'RSOS v3.27',
    '--------------------',
    'NOTES ENTRY 1',
    '',
    'RANGER:',
    'Sent to investigate',
    'ruins. Found strange',
    'technology'
  ],
  [
  ],
  0,
  'a'
]

gameData[ DATA_C_DB_PORTALS ] = [
  DTYPE_SCREEN,
  [
    'RSOS v3.27',
    '--------------------',
    'NOTES ENTRY 2',
    '',
    'RANGER:',
    'Was testing strange',
    'technology. Portals',
    'appeared!'
  ],
  [
  ],
  0,
  'a'
]

gameData[ DATA_C_DB_GHOSTS ] = [
  DTYPE_SCREEN,
  [
    'RSOS v3.27',
    '--------------------',
    'NOTES ENTRY 3',
    '',
    'RANGER:',
    'Monsters coming out',
    'of portals! Made it',
    'back to hut. They',
    'only come out at',
    'night'
  ],
  [
  ],
  0,
  'a'
]

gameData[ DATA_C_DB_ERRORS ] = [
  DTYPE_SCREEN,
  [
    'RSOS v3.27',
    '--------------------',
    'NOTES ENTRY 4',
    '',
    'RANGER:',
    'Monsters affecting',
    'computers. Have been',
    'stashing items in',
    'ruins for emergency.',
    'Tried comms but the',
    'satellite is offline'
  ],
  [
  ],
  0,
  'a'
]

gameData[ DATA_C_DB_SHUTDOWN_PORTALS ] = [
  DTYPE_SCREEN,
  [
    'RSOS v3.27',
    '--------------------',
    'NOTES ENTRY 5',
    '',
    'RANGER:',
    'Programmed synth to',
    'make mod chips that',
    'can shut down portal',
    'but computer went',
    'offline! There are',
    'more of them every',
    'night'
  ],
  [
  ],
  0,
  'a'
]

gameData[ DATA_C_DB_SECURITY ] = [
  DTYPE_SCREEN,
  [
    'RSOS v3.27',
    '--------------------',
    'NOTES ENTRY 6',
    '',
    'RANGER:',
    'Got computer online.',
    'Still has errors.',
    'Security system',
    'should be able to',
    'deal with monsters',
    'if can get it online'
  ],
  [
  ],
  0,
  'a'
]

gameData[ DATA_C_DB_FIX_SATELLITE ] = [
  DTYPE_SCREEN,
  [
    'RSOS v3.27',
    '--------------------',
    'NOTES ENTRY 7',
    '',
    'RANGER:',
    'Comms damaged beyond',
    'repair but can send',
    'a distress signal if',
    'repair the satellite',
    'transmitter with',
    'some chips. Not sure',
    'where the dish is',
    'on island and maps',
    'are offline'
  ],
  [
  ],
  0,
  'a'
]

gameData[ DATA_C_DB_RESCUE_TEAM ] = [
  DTYPE_SCREEN,
  [
    'RSOS v3.27',
    '--------------------',
    'NOTES ENTRY 8',
    '',
    'RANGER:',
    'No way to warn',
    'rescue team of',
    'monsters with comms',
    `offline. Can't send`,
    'distress signal',
    'until deal with',
    'monsters!'
  ],
  [
  ],
  0,
  'a'
]

gameData[ DATA_RESTORE_BACKUPS ] = [
  DTYPE_ACTION,
  ACTION_RESTORE_BACKUPS
]

gameData[ DATA_DIAGNOSTICS ] = [
  DTYPE_ACTION,
  ACTION_DIAGNOSTICS
]

gameData[ DATA_MODCHIPS ] = [
  DTYPE_ACTION,
  ACTION_CREATE_MODCHIP
]
