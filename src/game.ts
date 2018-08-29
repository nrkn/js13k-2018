import { blocks, createIsland, createHut } from './map'

import {
  DTYPE_IMAGE, DTYPE_MESSAGE, DTYPE_SCREEN, DATA_C_DIAGNOSTICS, DATA_C_SYNTH,
  DATA_C_MAIN, DATA_ISLAND, DATA_INTRO, DATA_SPLASH, DISPLAY_TYPE, DATA_SUNRISE,
  DATA_SUNSET, DTYPE_MAP, MAP_PLAYERX, MAP_PLAYERY, MAP_TILES, T_HUT, T_HUT_R, MAP_STARTY, MT_ISLAND, MAP_TYPE, MT_HUT, MAP_STARTX, DATA_INVESTIGATE, MON_X, MON_Y, MON_FACING, X, Y, MON_HEALTH
} from './indices'

import {
  DisplayItem, GameColor, GameState, DisplayMap, GameAPI, Monster, Point
} from './types'

import { inBounds, hasPoint, towards } from './geometry'
import { initialMonsterCount, mapSize } from './settings';
import { randInt } from './utils';

const gameData: DisplayItem[] = [
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

  // DATA_C_DIAGNOSTICS
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

  // DATA_C_SYNTH
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

  // DATA_ISLAND
  createIsland(),

  // DATA_INVESTIGATE
  [
    DTYPE_MESSAGE,
    [
      'I should',
      'investigate'
    ]
  ]
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
  let monsters: Monster[]

  const reset = () => {
    playerFacing = 0
    playerFood = 5
    playerHealth = 2
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
    monsters = []

    while( monsters.length < initialMonsterCount ){
      const x = randInt( mapSize )
      const y = randInt( mapSize )
      const facing = randInt( 2 )
      const health = randInt( 2 ) + 1

      const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
      const mapTile = mapItem[ MAP_TILES ][ y ][ x ]
      const playerX = mapItem[ MAP_PLAYERX ]
      const playerY = mapItem[ MAP_PLAYERY ]

      if( !blocks( mapTile ) && !hasPoint( <any>monsters, [ x, y ] ) && !( playerX === x && playerY === y ) )
        monsters.push([ x, y, facing, health ])
    }
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
    displayStack[ displayStack.length - 1 ],
    monsters
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
    for( let i = 0; i < monsters.length; i++ ){
      const monster = monsters[ i ]
      const x = monster[ MON_X ]
      const y = monster[ MON_Y ]
      const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
      const playerX = mapItem[ MAP_PLAYERX ]
      const playerY = mapItem[ MAP_PLAYERY ]
      const newLocation = [ x, y ]

      if( Math.random() < 0.66 ){
        const toPlayer = towards( [ x, y ], [ playerX, playerY ] )
        newLocation[ X ] = toPlayer[ X ]
        newLocation[ Y ] = toPlayer[ Y ]
      } else {
        if( randInt( 2 ) ){
          newLocation[ X ] = x + ( randInt( 3 ) - 1 )
        } else {
          newLocation[ Y ] = y + ( randInt( 3 ) - 1 )
        }
      }

      const mapTile = mapItem[ MAP_TILES ][ newLocation[ Y ] ][ newLocation[ X ] ]

      if (
        !blocks( mapTile ) &&
        !hasPoint( <any>monsters, [ newLocation[ X ], newLocation[ Y ] ] ) &&
        !( playerX === newLocation[ X ] && playerY === newLocation[ Y ] )
      ){
        monster[ MON_X ] = newLocation[ X ]
        monster[ MON_Y ] = newLocation[ Y ]
        if( newLocation[ X ] < x ){
          monster[ MON_FACING ] = 1
        }
        if( newLocation[ X ] > x ){
          monster[ MON_FACING ] = 0
        }
      }

      if ( playerX === newLocation[ X ] && playerY === newLocation[ Y ] && randInt( 2 ) && playerHealth > 0 && monster[ MON_HEALTH ] > 0 ){
        playerHealth--
      }
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

    let monsterHere
    if ( map[ MAP_TYPE ] === MT_ISLAND ){
      for ( let i = 0; i < monsters.length; i++ ) {
        if ( monsters[ i ][ MON_X ] === x && monsters[ i ][ MON_Y ] === y && monsters[ i ][ MON_HEALTH ] > 0 ){
          monsterHere = monsters[ i ]
        }
      }
    }

    if ( playerHealth > 0 && inBounds( [ x, y ] ) && !blocks( map[ MAP_TILES ][ y ][ x ] ) && !monsterHere ){
      map[ MAP_PLAYERX ] = x
      map[ MAP_PLAYERY ] = y
    }

    // bumps
    if( map[ MAP_TYPE ] === MT_ISLAND ){
      if ( map[ MAP_TILES ][ y ][ x ] === T_HUT ) {
        displayStack.push( createHut() )
      }

      if( y === map[ MAP_STARTY ] ){
        if( x === map[ MAP_STARTX ] - 1 ){
          displayStack.push( gameData[ DATA_INVESTIGATE ] )
        }
      }

      if ( monsterHere && randInt( 2 ) ){
        monsterHere[ MON_HEALTH ]--
      }
    }

    if ( map[ MAP_TYPE ] === MT_HUT ) {
      if ( map[ MAP_TILES ][ y ][ x ] === T_HUT_R ) {
        displayStack.pop()
      }
    }
  }

  reset()

  return <GameAPI>[ state, reset, timeStr, incTime, move, close ]
}
