import { blocks, createIsland, createHut } from './map'

import {
  DTYPE_IMAGE, DTYPE_MESSAGE, DTYPE_SCREEN, DATA_C_MAIN, DATA_ISLAND,
  DATA_INTRO, DATA_SPLASH, DISPLAY_TYPE, DATA_SUNRISE, DATA_SUNSET, DTYPE_MAP,
  MAP_PLAYERX, MAP_PLAYERY, MAP_TILES, T_HUT, T_HUT_R, MAP_STARTY, MT_ISLAND,
  MAP_TYPE, MT_HUT, MAP_STARTX, DATA_INVESTIGATE, MON_X, MON_Y, MON_FACING, X,
  Y, MON_HEALTH, T_COMPUTER, SCREEN_SELECTION, SCREEN_OPTIONS,
  OPTION_DATA_INDEX, SCREEN_COLOR, T_BED, DATA_NOT_TIRED, DATA_BED,
  DTYPE_ACTION, ACTION_INDEX, DATA_HUNGRY, DATA_DEAD, T_RANGER, DATA_RANGER, HUT_UNLOCKED, DATA_LOCKED_NOKEYS, DATA_LOCKED_UNLOCK, T_RUINS, T_RUINS_L, DATA_RUINS, T_PORTAL, DATA_COMPUTER, ACTION_USE_COMPUTER, HUT_COMPUTER_FIXED, DATA_C_FIXED, DATA_FIXABLE_COMPUTER, DATA_C_SYNTH_CHARGING, DATA_C_SYNTH, DTYPE_COMPUTER_MAP, DATA_C_DB_INTRO, DATA_RESTORE_BACKUPS
} from './indices'

import {
  DisplayItem, GameColor, GameState, DisplayMap, GameAPI, Monster,
  DisplayScreen, DisplayAction, HutState, Point, DisplayComputerMap, DisplaySelection
} from './types'

import { inBounds, hasPoint, towards, allNeighbours } from './geometry'
import { initialMonsterCount, mapSize, sunrise, sunset, gridSize, gridTiles } from './settings'
import { randInt } from './utils'
import { gameData } from './data';

export const Game = () => {
  // state
  let hutCache: HutState[]
  let playerFacing: 0 | 1
  let playerFood: number
  let playerHealth: number
  let playerMaxHealth: number
  let playerKeys: number
  let playerChips: number
  let playerDisks: number
  let hours: number
  let minutes: number
  let color: GameColor
  let displayStack: DisplayItem[]
  let monsters: Monster[]
  // internal state
  let seenRangerMessage: number
  let currentHut: HutState
  let madeFoodToday: number
  let notesDb: number[]
  let mapDb: number[]

  const reset = () => {
    hutCache = []
    playerFacing = 0
    playerFood = 20
    playerHealth = 20
    playerMaxHealth = 20
    playerKeys = 0
    playerChips = 5
    playerDisks = 0
    hours = 17
    minutes = 55
    gameData[ DATA_ISLAND ] = createIsland( hutCache )
    displayStack = [
      gameData[ DATA_ISLAND ],
      gameData[ DATA_INTRO ],
      gameData[ DATA_SPLASH ]
    ]
    color = ''
    monsters = []
    seenRangerMessage = 0
    madeFoodToday = 0
    notesDb = [ DATA_C_DB_INTRO ]
    mapDb = []

    const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
    const playerX = mapItem[ MAP_PLAYERX ]
    const playerY = mapItem[ MAP_PLAYERY ]        
    const gridX = ~~( playerX / gridSize )
    const gridY = ~~( playerY / gridSize )
    mapDb[ gridY * gridTiles + gridX ] = 1

    createMonsters()
  }

  const currentColor = (): GameColor => {
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_IMAGE ) return 'g'
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_MESSAGE ) return 'g'
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_COMPUTER_MAP ) return 'a'
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_SCREEN )
      return (<DisplayScreen>displayStack[ displayStack.length - 1 ])[ SCREEN_COLOR ]

    return color
  }

  const state = (): GameState => [
    playerFacing, playerFood, playerHealth, playerMaxHealth, hours, minutes,
    currentColor(),
    displayStack[ displayStack.length - 1 ],
    monsters,
    playerKeys, playerChips, playerDisks
  ]

  const close = () => {
    // can use this to toggle inventory for map
    displayStack.pop()

    if( !displayStack.length ) reset()
  }

  const createMonster = ( [ x, y ]: Point ) => {
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

  const createMonsters = () => {
    while ( monsters.length < initialMonsterCount ) {
      const x = randInt( mapSize )
      const y = randInt( mapSize )
      createMonster([ x, y ])
    }
  }

  const updateMonsters = () => {
    const monsterHere = ( [ x, y ]: Point ) => {
      for( let i = 0; i < monsters.length; i++ ){
        const monster = monsters[ i ]
        const mx = monster[ MON_X ]
        const my = monster[ MON_Y ]

        if( monster[ MON_HEALTH ] > 0 && x === mx && y === my ) return 1
      }
    }

    for ( let i = 0; i < monsters.length; i++ ) {
      const monster = monsters[ i ]
      const x = monster[ MON_X ]
      const y = monster[ MON_Y ]
      const currentMapItem = <DisplayMap>displayStack[ displayStack.length - 1 ]
      const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
      const playerX = mapItem[ MAP_PLAYERX ]
      const playerY = mapItem[ MAP_PLAYERY ]
      const next = [ x, y ]

      if ( ( hours >= sunset || hours < sunrise ) && Math.random() < 0.66 ) {
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
        !monsterHere( [ next[ X ], next[ Y ] ] ) &&
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

  const incTime = ( sleeping = 0 ) => {
    if( playerHealth < 1 ){
      displayStack = [ gameData[ DATA_DEAD ] ]
      return
    }

    minutes++
    if ( minutes === 60 ) {
      minutes = 0
      hours++
      if( sleeping ){
        if ( playerHealth < playerMaxHealth ) playerHealth++
        if ( hours === sunrise ) {
          color = ''
        }
      } else {
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
    }
    if ( hours === 24 ) {
      madeFoodToday = 0
      hours = 0
      const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
      for( let y = 0; y < mapSize; y++ ){
        for( let x = 0; x < mapSize; x++ ){
          const mapTile = mapItem[ MAP_TILES ][ y ][ x ]
          if( mapTile === T_PORTAL ){
            const neighbours = allNeighbours([ x, y ])
            for( let i = 0; i < neighbours.length; i++ ){
              createMonster( neighbours[ i ] )
            }
          }
        }
      }
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
        currentHut = hutCache[ y * mapSize + x ]
        if( currentHut[ HUT_UNLOCKED ] ){
          displayStack.push( createHut() )
        } else {
          if( playerKeys ){
            displayStack.push( gameData[ DATA_LOCKED_UNLOCK ] )
          } else {
            displayStack.push( gameData[ DATA_LOCKED_NOKEYS ] )
          }
        }
      }

      if( y === map[ MAP_STARTY ] ){
        if( x === map[ MAP_STARTX ] - 1 ){
          displayStack.push( gameData[ DATA_INVESTIGATE ] )
        }
      }

      if ( monsterHere && randInt( 2 ) ){
        monsterHere[ MON_HEALTH ]--
      }

      if( map[ MAP_TILES ][ y ][ x ] === T_RANGER && !seenRangerMessage ){
        seenRangerMessage = 1
        displayStack.push( gameData[ DATA_RANGER ] )
        playerKeys++
      }

      if( map[ MAP_TILES ][ y ][ x ] >= T_RUINS && map[ MAP_TILES ][ y ][ x ] < T_RUINS + T_RUINS_L ){
        displayStack.push( gameData[ DATA_RUINS ] )
      }
    }

    if ( map[ MAP_TYPE ] === MT_HUT ) {
      if ( map[ MAP_TILES ][ y ][ x ] === T_HUT_R ) {
        displayStack.pop()
      }

      if ( map[ MAP_TILES ][ y ][ x ] === T_COMPUTER ) {
        const computerOptions = <DisplayScreen>gameData[ DATA_FIXABLE_COMPUTER ].slice()

        computerOptions[ SCREEN_OPTIONS ] = computerOptions[ SCREEN_OPTIONS ].filter( ( _o, i ) => {
          if( i === 1 && currentHut[ HUT_COMPUTER_FIXED ] ) return 0
          if( i === 1 && playerChips < 6 ) return 0
          if( i === 2 && !currentHut[ HUT_COMPUTER_FIXED ] ) return 0
          if( i === 2 && playerDisks < 1 ) return 0
          return 1
        })

        displayStack.push( computerOptions )
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
        displayStack.pop()
        actions[ ( <DisplayAction>gameData[ dataIndex ] )[ ACTION_INDEX ] ]()
      } else {
        displayStack.push( gameData[ dataIndex ] )
      }
    }
  }

  const actions: (()=>void)[] = [
    // ACTION_SLEEP
    () => {
      while ( hours !== sunrise ) {
        incTime( 1 )
      }
    },
    // ACTION_UNLOCK
    () => {
      currentHut[ HUT_UNLOCKED ] = 1
      playerKeys--
    },
    // ACTION_SEARCH
    () => {
      for( let i = 0; i < 60; i++ ){
        incTime()
      }
      if( playerHealth > 0 ){
        const found = randInt( 16 )

        // food 0 1
        if( found < 2 ){
          const food = randInt( 3 ) + 1
          displayStack.push( [ DTYPE_MESSAGE, [ `Found ${ food } food` ] ] )
          playerFood += food
        }
        // keycard 2 3
        else if ( found < 4 ){
          displayStack.push( [ DTYPE_MESSAGE, [ 'Found keycard' ] ] )
          playerKeys++
        }
        // chip 4 5
        else if( found < 6 ){
          displayStack.push( [ DTYPE_MESSAGE, [ 'Found chip' ] ] )
          playerChips++
        }
        // disk 6 7
        else if( found < 8 ){
          displayStack.push( [ DTYPE_MESSAGE, [ 'Found backup' ] ] )
          playerDisks++
        }
        // got hurt 8
        else if( found < 9 ){
          displayStack.push( [
            DTYPE_MESSAGE,
            [
              'Rocks fell!',
              '',
              'Lost health'
            ]
          ] )
          playerHealth--
        }
        // nothing
        else {
          displayStack.push( [ DTYPE_MESSAGE, [ 'Found nothing' ] ] )
        }
      }
    },
    // ACTION_USE_COMPUTER
    () => {
      if( currentHut[ HUT_COMPUTER_FIXED ] ){
        displayStack.push( gameData[ DATA_C_FIXED ] )
      } else {
        displayStack.push( gameData[ DATA_C_MAIN ] )
      }
    },
    // ACTION_FIX_COMPUTER
    () => {
      displayStack.push( [ DTYPE_MESSAGE, [ 'Replaced 6 chips' ] ] )
      playerChips -= 6
      currentHut[ HUT_COMPUTER_FIXED ] = 1
    },
    // ACTION_CREATE_FOOD
    () => {
      const food = randInt( 3 ) + 6
      madeFoodToday = 1
      playerFood += food
      displayStack.push( [ DTYPE_MESSAGE, [ `Synthesized ${ food } food` ] ] )
    },
    // ACTION_SHOW_SYNTH
    () => {
      if( madeFoodToday ){
        displayStack.push( gameData[ DATA_C_SYNTH_CHARGING ] )
      } else {
        displayStack.push( gameData[ DATA_C_SYNTH ] )
      }
    },
    // ACTION_SHOW_DB
    () => {
      const dbOptions: DisplaySelection[] = notesDb.map( i => {
        return <DisplaySelection>[ `ENTRY ${ i }`, i ]
      })
      const dbScreen: DisplayScreen = [
        DTYPE_SCREEN,
        [
          'RSOS v3.27',
          '--------------------',
          'DATABASE MENU',
        ],
        dbOptions,
        0,
        'a'
      ]
      displayStack.push( dbScreen )
    },
    // ACTION_SHOW_COMMS
    () => {

    },
    // ACTION_SHOW_SECURITY
    () => {

    },
    // ACTION_SHOW_MAP
    () => {
      const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
      const playerX = mapItem[ MAP_PLAYERX ]
      const playerY = mapItem[ MAP_PLAYERY ]
      const mapTiles = mapItem[ MAP_TILES ]
      const computerMap: DisplayComputerMap = [ DTYPE_COMPUTER_MAP, playerX, playerY, mapTiles, mapDb ]

      console.log( 'showing map', { playerX, playerY } )

      displayStack.push( computerMap )
    },
    // ACTION_RESTORE_BACKUPS
    () => {
      playerDisks--

      const randItem = randInt( 2 )
      
      // note
      if( randItem < 1 ){
        const nextNoteDb = notesDb.length + DATA_C_DB_INTRO

        if( nextNoteDb < DATA_RESTORE_BACKUPS ){
          notesDb.push( nextNoteDb )
          displayStack.push( [ DTYPE_MESSAGE, [ 
            'Recovered 1 note', 
            'database entry'
          ] ] )
        } else {
          displayStack.push( [ DTYPE_MESSAGE, [ 
            'Could not read disk,',
            'try again'
          ] ] )
          playerDisks++
        } 
      } 
      // map tile
      else {
        let gridX = randInt( gridTiles )
        let gridY = randInt( gridTiles )

        if( !mapDb[ gridY * gridTiles + gridX ] ){
          mapDb[ gridY * gridTiles + gridX ] = 1
          displayStack.push( [ DTYPE_MESSAGE, [ 
            'Recovered 1 map', 
            'database entry'
          ] ] )
        } else {
          displayStack.push( [ DTYPE_MESSAGE, [ 
            'Could not read disk,',
            'try again'
          ] ] )
          playerDisks++
        } 
      }
    }
  ]

  reset()

  const api: GameAPI = [
    state, reset, timeStr, incTime, move, close, select, confirmSelection
  ]

  return api
}
