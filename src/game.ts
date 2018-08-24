import { blocks, createIsland } from './map'

import {
  DTYPE_IMAGE, DTYPE_MESSAGE, DTYPE_SCREEN, DATA_C_DIAGNOSTICS, DATA_C_SYNTH,
  DATA_C_MAIN, DATA_ISLAND, DATA_INTRO, DATA_SPLASH, DISPLAY_TYPE, DATA_SUNRISE,
  DATA_SUNSET, DTYPE_MAP, MAP_PLAYERX, MAP_PLAYERY, MAP_TILES
} from './indices'

import {
  DisplayItem, GameColor, GameState, DisplayMap, GameAPI
} from './types'

import { inBounds } from './geometry'

const gameData: DisplayItem[] = [
  // I_SPLASH
  [ DTYPE_IMAGE, 's.png' ],

  // M_INTRO
  [ DTYPE_MESSAGE,
    [
      'Lost contact with',
      'RANGER. Take boat',
      'and investigate.'
    ]
  ],

  // M_SUNRISE
  [
    DTYPE_MESSAGE,
    [
      'Sunrise'
    ]
  ],

  // M_SUNSET
  [
    DTYPE_MESSAGE,
    [
      'Sunset'
    ]
  ],

  // S_MAIN
  [
    DTYPE_SCREEN,
    [
      'RSOS v3.27',
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
    ]
  ],

  // S_DIAGNOSTICS
  [
    DTYPE_SCREEN,
    [
      'DIAGNOSTICS',
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
    []
  ],

  // S_SYNTH
  [
    DTYPE_SCREEN,
    [
      'SYNTHESIZE',
      '',
      'SYNTHDB:',
      ' OFFLINE',
      '',
      'EMERGENCY OPS:',
      ''
    ],
    [
      [ 'BASIC RATIONS', DATA_C_MAIN ] // need to implement
    ]
  ],

  // MAP_ISLAND
  createIsland()
]

export const Game = () => {
  let playerFacing: 0 | 1
  let playerFood: number
  let playerHealth: number
  let playerMaxHealth: number
  let hours: number
  let minutes: number
  let color: GameColor
  let displayStack: DisplayItem[]

  const reset = () => {
    playerFacing = 0
    playerFood = 1
    playerHealth = 1
    playerMaxHealth = 10
    hours = 17
    minutes = 55
    gameData[ DATA_ISLAND ] = createIsland()
    displayStack = [
      gameData[ DATA_ISLAND ],
      gameData[ DATA_INTRO ],
      gameData[ DATA_SPLASH ]
    ]
    color = ''
  }

  const currentColor = (): GameColor => {
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_IMAGE ) return 'g'
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_MESSAGE ) return 'g'
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_SCREEN ) return 'a'
    return color
  }

  const state = (): GameState => [
    playerFacing, playerFood, playerHealth, playerMaxHealth, hours, minutes,
    currentColor(),
    displayStack[ displayStack.length - 1 ]
  ]

  const close = () => {
    // can use this to toggle inventory for map
    displayStack.pop()
    if( !displayStack.length ) displayStack = [ gameData[ DATA_ISLAND ] ]
  }

  const incTime = () => {
    minutes++
    if ( minutes === 60 ) {
      minutes = 0
      hours++
      if ( hours === 6 ) {
        color = ''
        displayStack.push( gameData[ DATA_SUNRISE ] )
      }
      if ( hours === 18 ) {
        color = 'i'
        displayStack.push( gameData[ DATA_SUNSET ] )
      }
      if ( playerFood > 0 ) {
        playerFood--
        if ( playerHealth < playerMaxHealth ) playerHealth++
      } else {
        playerHealth--
      }
    }
    if ( hours === 24 ) {
      hours = 0
    }
  }

  const timeStr = () => `${ hours < 10 ? '0' : '' }${ hours }:${ minutes < 10 ? '0' : '' }${ minutes }`

  const move = ( x: number, y: number ) => {
    const map = <DisplayMap>displayStack[ displayStack.length - 1 ]

    if( map[ 0 ] !== DTYPE_MAP ) return

    incTime()

    if( x === -1 ){
      playerFacing = 1
    }

    if( x === 1 ){
      playerFacing = 0
    }

    x = map[ MAP_PLAYERX ] + x
    y = map[ MAP_PLAYERY ] + y

    if ( playerHealth > 0 && inBounds( [ x, y ] ) && !blocks( map[ MAP_TILES ][ y ][ x ] ) ){
      map[ MAP_PLAYERX ] = x
      map[ MAP_PLAYERY ] = y
    }
  }

  reset()

  return <GameAPI>[ state, reset, timeStr, incTime, move, close ]
}
