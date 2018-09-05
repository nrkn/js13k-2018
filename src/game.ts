import { blocks, createIsland, createHut } from './map'

import {
  DTYPE_IMAGE, DTYPE_MESSAGE, DTYPE_SCREEN, DATA_C_MAIN, DATA_ISLAND,
  DATA_INTRO, DATA_SPLASH, DISPLAY_TYPE, DATA_SUNRISE, DATA_SUNSET, DTYPE_MAP,
  MAP_PLAYERX, MAP_PLAYERY, MAP_TILES, T_HUT, T_HUT_R, MAP_STARTY, MT_ISLAND,
  MAP_TYPE, MT_HUT, MAP_STARTX, DATA_INVESTIGATE, MON_X, MON_Y, MON_FACING, X,
  Y, MON_HEALTH, T_COMPUTER, SCREEN_SELECTION, SCREEN_OPTIONS,
  OPTION_DATA_INDEX, SCREEN_COLOR, T_BED, DATA_NOT_TIRED, DATA_BED,
  DTYPE_ACTION, ACTION_INDEX, DATA_HUNGRY, DATA_DEAD
} from './indices'

import {
  DisplayItem, GameColor, GameState, DisplayMap, GameAPI, Monster,
  DisplayScreen, DisplayAction
} from './types'

import { inBounds, hasPoint, towards } from './geometry'
import { initialMonsterCount, mapSize, sunrise, sunset } from './settings'
import { randInt } from './utils'
import { gameData } from './data';

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
    playerFood = 10
    playerHealth = 10
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

    createMonsters()
  }

  const currentColor = (): GameColor => {
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_IMAGE ) return 'g'
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_MESSAGE ) return 'g'
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_SCREEN )
      return (<DisplayScreen>displayStack[ displayStack.length - 1 ])[ SCREEN_COLOR ]

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

    if( !displayStack.length ) reset()
  }

  const createMonsters = () => {
    while ( monsters.length < initialMonsterCount ) {
      const x = randInt( mapSize )
      const y = randInt( mapSize )
      const facing = randInt( 2 )
      const health = randInt( 2 ) + 1

      const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
      const mapTile = mapItem[ MAP_TILES ][ y ][ x ]
      const playerX = mapItem[ MAP_PLAYERX ]
      const playerY = mapItem[ MAP_PLAYERY ]

      if (
        !blocks( mapTile ) && !hasPoint( <any>monsters, [ x, y ] ) &&
        !( playerX === x && playerY === y )
      ) monsters.push( [ x, y, facing, health ] )
    }
  }

  const updateMonsters = () => {
    for ( let i = 0; i < monsters.length; i++ ) {
      const monster = monsters[ i ]
      const x = monster[ MON_X ]
      const y = monster[ MON_Y ]
      const currentMapItem = <DisplayMap>displayStack[ displayStack.length - 1 ]
      const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
      const playerX = mapItem[ MAP_PLAYERX ]
      const playerY = mapItem[ MAP_PLAYERY ]
      const next = [ x, y ]

      if ( Math.random() < 0.66 ) {
        const toPlayer = towards( [ x, y ], [ playerX, playerY ] )
        next[ X ] = toPlayer[ X ]
        next[ Y ] = toPlayer[ Y ]
      } else {
        if ( randInt( 2 ) ) {
          next[ X ] = x + ( randInt( 3 ) - 1 )
        } else {
          next[ Y ] = y + ( randInt( 3 ) - 1 )
        }
      }

      const mapTile = mapItem[ MAP_TILES ][ next[ Y ] ][ next[ X ] ]

      if (
        !blocks( mapTile ) &&
        !hasPoint( <any>monsters, [ next[ X ], next[ Y ] ] ) &&
        !( playerX === next[ X ] && playerY === next[ Y ] )
      ) {
        monster[ MON_X ] = next[ X ]
        monster[ MON_Y ] = next[ Y ]
        if ( next[ X ] < x ) {
          monster[ MON_FACING ] = 1
        }
        if ( next[ X ] > x ) {
          monster[ MON_FACING ] = 0
        }
      }

      if (
        currentMapItem[ DISPLAY_TYPE ] === DTYPE_MAP &&
        currentMapItem[ MAP_TYPE ] === MT_ISLAND &&
        ( hours >= sunset || hours < sunrise ) &&
        playerX === next[ X ] && playerY === next[ Y ] &&
        randInt( 2 ) && playerHealth > 0 && monster[ MON_HEALTH ] > 0
      ) {
        playerHealth--
      }
    }
  }

  const incTime = () => {
    if( playerHealth < 1 ){
      displayStack = [ gameData[ DATA_DEAD ] ]
      return
    }

    minutes++
    if ( minutes === 60 ) {
      minutes = 0
      hours++
      if ( hours === sunrise ) {
        color = ''
        displayStack.push( gameData[ DATA_SUNRISE ] )
      }
      if ( hours === sunset ) {
        color = 'i'
        displayStack.push( gameData[ DATA_SUNSET ] )
      }
      if ( playerFood > 0 ) {
        playerFood--
        if ( playerHealth < playerMaxHealth ) playerHealth++
      } else {
        playerHealth--
        displayStack.push( gameData[ DATA_HUNGRY ] )
      }
    }
    if ( hours === 24 ) {
      hours = 0
    }
    updateMonsters()
  }

  const timeStr = () => `${
    hours < 10 ? '0' : ''
  }${
    hours
  }:${
    minutes < 10 ? '0' : ''
  }${
    minutes
  }`

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
    if (
      ( hours >= sunset || hours < sunrise ) &&
      map[ MAP_TYPE ] === MT_ISLAND
    ){
      for ( let i = 0; i < monsters.length; i++ ) {
        if (
          monsters[ i ][ MON_X ] === x && monsters[ i ][ MON_Y ] === y &&
          monsters[ i ][ MON_HEALTH ] > 0
        ){
          monsterHere = monsters[ i ]
        }
      }
    }

    if (
      playerHealth > 0 && inBounds( [ x, y ] ) &&
      !blocks( map[ MAP_TILES ][ y ][ x ] ) && !monsterHere
    ){
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

      if ( map[ MAP_TILES ][ y ][ x ] === T_COMPUTER ) {
        displayStack.push( gameData[ DATA_C_MAIN ] )
      }

      if( map[ MAP_TILES ][ y ][ x ] === T_BED ){
        if( hours >= sunset || hours < sunrise ){
          displayStack.push( gameData[ DATA_BED ] )
        } else {
          displayStack.push( gameData[ DATA_NOT_TIRED ] )
        }
      }
    }
  }

  const select = ( i: number ) => {
    if (
      displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_SCREEN
    ){
      displayStack[ displayStack.length - 1 ][ SCREEN_SELECTION ] = i
    }
  }

  const confirmSelection = () => {
    if (
      displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_SCREEN
    ) {
      const screen = <DisplayScreen>displayStack[ displayStack.length - 1 ]

      if( !screen[ SCREEN_OPTIONS ].length ){
        displayStack.pop()
        return
      }

      const selected = screen[ SCREEN_SELECTION ]
      const dataIndex = screen[ SCREEN_OPTIONS ][ selected ][ OPTION_DATA_INDEX ]

      if( dataIndex === -1 ){
        close()
      } else if( gameData[ dataIndex ][ DISPLAY_TYPE ] === DTYPE_ACTION ){
        actions[ ( <DisplayAction>gameData[ dataIndex ] )[ ACTION_INDEX ] ]()
        displayStack.pop()
      } else {
        displayStack.push( gameData[ dataIndex ] )
      }
    }
  }

  const actions: (()=>void)[] = [
    // ACTION_SLEEP
    () => {
      while ( !( hours === ( sunrise - 1 ) && minutes === 59 ) ) {
        minutes++
        if ( minutes === 60 ) {
          minutes = 0
          hours++
          if ( playerHealth < playerMaxHealth ) playerHealth++
        }
        if ( hours === 24 ) {
          hours = 0
        }
        updateMonsters()
      }
    }
  ]

  reset()

  const api: GameAPI = [
    state, reset, timeStr, incTime, move, close, select, confirmSelection
  ]

  return api
}
