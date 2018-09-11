import { blocks, createIsland, createHut } from './map'

import {
  DTYPE_IMAGE, DTYPE_MESSAGE, DTYPE_SCREEN, DATA_C_MAIN, DATA_ISLAND,
  DATA_INTRO, DATA_SPLASH, DISPLAY_TYPE, DATA_SUNRISE, DATA_SUNSET, DTYPE_MAP,
  MAP_PLAYERX, MAP_PLAYERY, MAP_TILES, T_HUT, T_HUT_R, MAP_STARTY, MT_ISLAND,
  MAP_TYPE, MT_HUT, MAP_STARTX, DATA_INVESTIGATE, MON_X, MON_Y, MON_FACING, X,
  Y, MON_HEALTH, T_COMPUTER, SCREEN_SELECTION, SCREEN_OPTIONS,
  OPTION_DATA_INDEX, SCREEN_COLOR, T_BED, DATA_NOT_TIRED, DATA_BED,
  DTYPE_ACTION, ACTION_INDEX, DATA_HUNGRY, DATA_DEAD, T_RANGER, DATA_RANGER, HUT_UNLOCKED, DATA_LOCKED_NOKEYS, DATA_LOCKED_UNLOCK, T_RUINS, T_RUINS_L, DATA_RUINS, T_PORTAL, DATA_COMPUTER, ACTION_USE_COMPUTER, HUT_COMPUTER_FIXED, DATA_C_FIXED, DATA_FIXABLE_COMPUTER, DATA_C_SYNTH_CHARGING, DATA_C_SYNTH, DTYPE_COMPUTER_MAP, DATA_C_DB_INTRO, DATA_RESTORE_BACKUPS, ITEM_KEY, ITEM_CHIP, ITEM_DISK, ITEM_FOOD, DATA_DB, DATA_MAP, ACTION_SHOW_COMMS, ACTION_SHOW_DB, ACTION_SHOW_MAP, DATA_C_DIAGNOSTICS, DATA_SYNTH, DATA_C_DIAGNOSTICS_FIXED, DATA_COMMS, DATA_SECURITY, DATA_USE_COMPUTER, DATA_FIX_COMPUTER, DATA_DIAGNOSTICS, ACTION_SHOW_SYNTH, DISPLAY_MESSAGE, DATA_CREATE_FOOD, DATA_MODCHIPS, T_PORTAL_OFFLINE
} from './indices'

import {
  DisplayItem, GameColor, GameState, DisplayMap, GameAPI, Monster,
  DisplayScreen, DisplayAction, HutState, Point, DisplayComputerMap, DisplaySelection, RuinItems, HutCache, RuinCache, RuinItem, Seen, PortalCache
} from './types'

import { inBounds, hasPoint, towards, allNeighbours, dist } from './geometry'
import { initialMonsterCount, mapSize, sunrise, sunset, gridSize, gridTiles, centerTile } from './settings'
import { randInt, shuffle, pick } from './utils'
import { gameData } from './data';

export const Game = () => {
  // state
  let hutCache: HutCache
  let ruinCache: RuinCache
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
  let seen: Seen
  // internal state
  let seenRangerMessage: number
  let currentHut: HutState
  let currentRuins: RuinItems
  let synthCharging: number
  let notesDb: number[]
  let mapDb: number[]
  let modChips: number
  let satelliteChips: number
  let portalCache: PortalCache

  const reset = () => {
    hutCache = [[]]
    ruinCache = [[]]
    portalCache = [[]]
    playerFacing = 0
    playerFood = 99
    playerHealth = 99
    playerMaxHealth = 99
    playerKeys = 5
    playerChips = 50
    playerDisks = 50
    hours = 17
    minutes = 55
    gameData[ DATA_ISLAND ] = createIsland( hutCache, ruinCache, portalCache )
    displayStack = [
      gameData[ DATA_ISLAND ],
      gameData[ DATA_INTRO ],
      gameData[ DATA_SPLASH ]
    ]
    color = ''
    monsters = []
    seenRangerMessage = 0
    synthCharging = 0
    modChips = -1
    satelliteChips = -1
    notesDb = [ DATA_C_DB_INTRO ]
    mapDb = []
    seen = []

    const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
    const playerX = mapItem[ MAP_PLAYERX ]
    const playerY = mapItem[ MAP_PLAYERY ]        
    const gridX = ~~( playerX / gridSize )
    const gridY = ~~( playerY / gridSize )
    mapDb[ gridY * gridTiles + gridX ] = 1

    createMonsters()
    distributeItems()
    updateSeen( mapItem )
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
    playerKeys, playerChips, playerDisks,
    seen,
    hutCache, ruinCache, portalCache
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

  const distributeItems = () => {
    const numHuts = hutCache[ 0 ].length
    const numKeyCards = ~~( numHuts * 2 )
    const numChips = ~~( numHuts * 9 )
    const numBackups = 50 // guess
    const numFood = ~~( numHuts * 2 ) // also guess

    let items: RuinItem[] = []

    for( let i = 0; i < numKeyCards; i++ ){
      items.push( ITEM_KEY )
    }
    for( let i = 0; i < numChips; i++ ){
      items.push( ITEM_CHIP )
    }
    for( let i = 0; i < numBackups; i++ ){
      items.push( ITEM_DISK )
    }
    for( let i = 0; i < numFood; i++ ){
      items.push( ITEM_FOOD )
    }

    items = shuffle( items )

    while( items.length ){
      const item = items.pop()!   
      const [ rx, ry ] = pick( ruinCache[ 0 ] )
      const ruinItems = <RuinItems>ruinCache[ ry * mapSize + rx ]
      ruinItems.push( item )
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
      synthCharging = 0
      hours = 0
      const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
      for( let y = 0; y < mapSize; y++ ){
        for( let x = 0; x < mapSize; x++ ){
          const mapTile = mapItem[ MAP_TILES ][ y ][ x ]
          if( mapTile === T_PORTAL ){
            const neighbours = allNeighbours([ x, y ])
            for( let i = 0; i < neighbours.length; i++ ){
              if( !randInt( 3 ) ){
                createMonster( neighbours[ i ] )
              }              
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

  const updateSeen = ( map: DisplayMap ) => {
    if( map[ MAP_TYPE ] === MT_ISLAND ){
      const px = map[ MAP_PLAYERX ]
      const py = map[ MAP_PLAYERY ]
  
      for( let y = -centerTile; y < centerTile; y++ ){
        for( let x = -centerTile; x < centerTile; x++ ){
          const cx = px + x
          const cy = py + y
          if( dist( [ px, py ], [ cx, cy ] ) < centerTile ){
            seen[ cy * mapSize + cx ] = 1
          }
        } 
      } 
    }
  }

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

    updateSeen( map )

    // bumps
    if( map[ MAP_TYPE ] === MT_ISLAND ){
      if ( map[ MAP_TILES ][ y ][ x ] === T_HUT ) {
        currentHut = <HutState>hutCache[ y * mapSize + x ]
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
        currentRuins = <RuinItems>ruinCache[ y * mapSize + x ]
        if( currentRuins.length ){
          displayStack.push( gameData[ DATA_RUINS ] )
        } else {
          displayStack.push( [ DTYPE_MESSAGE, [ 'Nothing here' ] ] )
        }       
      }

      if( map[ MAP_TILES ][ y ][ x ] === T_PORTAL ){
        if( modChips > 0 ){
          displayStack.push( [ DTYPE_MESSAGE, [ 'Portal disabled!' ] ] )
          map[ MAP_TILES ][ y ][ x ] = T_PORTAL_OFFLINE
          portalCache[ y * mapSize + x ] = 1
          modChips--
          playerChips--
        } else if ( modChips > -1 ) {
          displayStack.push( [ DTYPE_MESSAGE, [ 'Need mod chips' ] ] )
        } else {
          displayStack.push( [ DTYPE_MESSAGE, [ 'A strange portal' ] ] )
        }
      }
    }

    if ( map[ MAP_TYPE ] === MT_HUT ) {
      if ( map[ MAP_TILES ][ y ][ x ] === T_HUT_R ) {
        displayStack.pop()
      }

      if ( map[ MAP_TILES ][ y ][ x ] === T_COMPUTER ) {
        const options: DisplaySelection[] = [
          [ 'Use', DATA_USE_COMPUTER ]
        ]
        const computer: DisplayScreen = [
          DTYPE_SCREEN,
          [
            `A computer`,
            '',
          ],
          options,
          0,
          'g'        
        ]

        if( !currentHut[ HUT_COMPUTER_FIXED ] && playerChips > 5 ){
          options.push( [ 'Fix Chips', DATA_FIX_COMPUTER ] )
        }
        if( currentHut[ HUT_COMPUTER_FIXED ] && playerDisks > 0 ){
          options.push( [ 'Restore Backups', DATA_RESTORE_BACKUPS ] )
        }
        
        if( options.length > 1 ){
          displayStack.push( computer )
        } else {
          actions[ ACTION_USE_COMPUTER ]()
        }
      }

      if( map[ MAP_TILES ][ y ][ x ] === T_BED ){
        if( hours >= ( sunset - 1 ) || hours < sunrise ) {
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
      //displayStack.push( [ DTYPE_MESSAGE, [ 'Unlocked' ] ] )
    },
    // ACTION_SEARCH
    () => {
      for( let i = 0; i < 60; i++ ){
        incTime()
      }

      const item = currentRuins.pop()

      if( item === ITEM_FOOD ){
        const food = randInt( 3 ) + 1
        displayStack.push( [ DTYPE_MESSAGE, [ `Found ${ food } food` ] ] )
        playerFood += food
      } 
      else if( item === ITEM_KEY ){
        displayStack.push( [ DTYPE_MESSAGE, [ 'Found keycard' ] ] )
        playerKeys++
      }
      else if( item === ITEM_CHIP ){
        displayStack.push( [ DTYPE_MESSAGE, [ 'Found chip' ] ] )
        playerChips++
      }
      else if( item === ITEM_DISK ){
        displayStack.push( [ DTYPE_MESSAGE, [ 'Found backup' ] ] )
        playerDisks++
      }
    },
    // ACTION_USE_COMPUTER
    () => {
      if( currentHut[ HUT_COMPUTER_FIXED ] ){
        displayStack.push([
          DTYPE_SCREEN,
          [
            'RSOS v3.27',
            '--------------------',
            ''
          ],
          [
            [ 'SYNTHESIZE', DATA_SYNTH ],
            [ 'DIAGNOSTICS', DATA_DIAGNOSTICS ],
            [ 'NOTES', DATA_DB ],
            [ 'COMMS', DATA_COMMS ],
            [ 'SECURITY', DATA_SECURITY ],
            [ 'MAP', DATA_MAP ]
          ],
          0,
          'a'
        ])
      } else {
        displayStack.push([
          DTYPE_SCREEN,
          [
            'RSOS v3.27',
            '--------------------',
            'NETWORK OFFLINE',
            '',
            'EMERGENCY MODE',
            ''
          ],
          [
            [ 'SYNTHESIZE', DATA_SYNTH ],
            [ 'DIAGNOSTICS', DATA_DIAGNOSTICS ],
          ],
          0,
          'a'
        ])
      }
    },
    // ACTION_FIX_COMPUTER
    () => {
      displayStack.push( [ DTYPE_MESSAGE, [ 'Fixed 6 chips' ] ] )
      playerChips -= 6
      currentHut[ HUT_COMPUTER_FIXED ] = 1
    },
    // ACTION_CREATE_FOOD
    () => {
      const food = randInt( 3 ) + 6
      synthCharging = 1
      playerFood += food
      displayStack.push( [ DTYPE_MESSAGE, [ `Synthesized ${ food } food` ] ] )
    },
    // ACTION_SHOW_SYNTH
    () => {
      const options: DisplaySelection[] = []
      const screen: DisplayScreen = [
        DTYPE_SCREEN,
        [
          'RSOS v3.27',
          '--------------------',
          'SYNTHESIZER',
        ],
        options,
        0,
        'a'
      ]
      if( synthCharging ){
        screen[ DISPLAY_MESSAGE ].push( '  CHARGING...' )
      } else {
        options.push( [ 'RATIONS', DATA_CREATE_FOOD ] )
        if( modChips > -1 ){
          options.push( [ 'MOD CHIPS', DATA_MODCHIPS ] )
        }
      }
      displayStack.push( screen )
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
          'NOTES MENU',
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

      displayStack.push( computerMap )
    },
    // ACTION_RESTORE_BACKUPS
    () => {
      playerDisks--

      const nextNoteDb = notesDb.length + DATA_C_DB_INTRO
      const randItem = randInt( 8 )
      
      // mod chip
      if( notesDb.length > 4 && modChips === -1 ){
        displayStack.push( [ DTYPE_MESSAGE, [ 
          'Recovered 1 synth', 
          'database entry'
        ] ] )
        modChips = 0
      } 
      // note
      else if( randItem < 3 && nextNoteDb < DATA_RESTORE_BACKUPS ){
        notesDb.push( nextNoteDb )
        displayStack.push( gameData[ notesDb.length + DATA_C_DB_INTRO - 1 ] )
        displayStack.push( [ DTYPE_MESSAGE, [ 
          'Recovered 1 note', 
          'database entry'
        ] ] )
      }
      // map tile
      else {
        let availableMaps: Point[] = []
        for( let y = 0; y < gridTiles; y++ ){
          for( let x = 0; x < gridTiles; x++ ){
            if( !mapDb[ y * gridTiles + x ] ){
              availableMaps.push( [ x, y ] )
            }
          }
        }
        if( availableMaps.length ){
          const [ gridX, gridY ] = pick( availableMaps )
          mapDb[ gridY * gridTiles + gridX ] = 1

          actions[ ACTION_SHOW_MAP ]()
          displayStack.push( [ DTYPE_MESSAGE, [ 
            'Recovered 1 map', 
            'database entry'
          ] ] )
        } else {
          if( nextNoteDb < DATA_RESTORE_BACKUPS ){
            notesDb.push( nextNoteDb )
            displayStack.push( gameData[ notesDb.length + DATA_C_DB_INTRO - 1 ] )
            displayStack.push( [ DTYPE_MESSAGE, [ 
              'Recovered 1 note', 
              'database entry'
            ] ] )
          } else {
            displayStack.push( [ DTYPE_MESSAGE, [ 
              'Disk corrupt'
            ] ] )  
          }
        }
      }
    },
    // ACTION_DIAGNOSTICS
    () => {
      if( currentHut[ HUT_COMPUTER_FIXED ] ){
        let availableMaps: Point[] = []
        for( let y = 0; y < gridTiles; y++ ){
          for( let x = 0; x < gridTiles; x++ ){
            if( !mapDb[ y * gridTiles + x ] ){
              availableMaps.push( [ x, y ] )
            }
          }
        }        
        const screen: string[] = [
          'RSOS v3.27',
          '--------------------',
          'DIAGNOSTICS',
          '',
          'NETWORK ONLINE',
          'SYNTHESIZE ONLINE',
          '  RESTORE BACKUPS',
          'NOTES ONLINE',
        ]
        if( notesDb.length < 8 ){
          screen.push( '  RESTORE BACKUPS' )
        }
        screen.push(
          ...[
            'COMMS OFFLINE',
            'SECURITY OFFLINE',
            'MAP ONLINE'
          ]
        )
        if( availableMaps.length ){
          screen.push( '  RESTORE BACKUPS' )
        }
        displayStack.push( [
          DTYPE_SCREEN,
          screen,
          [],
          0,
          'a'
        ])
      } else {
        displayStack.push([
          DTYPE_SCREEN,
          [
            'RSOS v3.27',
            '--------------------',
            'DIAGNOSTICS',
            '',
            'NETWORK OFFLINE',
            '  FIX 6 CHIPS',
            'SYNTHESIZE ONLINE',
            '  EMERGENCY MODE',
            'NOTES OFFLINE',
            'COMMS OFFLINE',
            'SECURITY OFFLINE',
            'MAP OFFLINE'
          ],
          [],
          0,
          'a'
        ])
      }
    },
    // ACTION_CREATE_MODCHIPS
    () => {
      const chips = randInt( 3 ) + 1
      synthCharging = 1
      modChips += chips
      playerChips += chips
      displayStack.push( [ 
        DTYPE_MESSAGE, 
        [ 
          `Synthesized ${ chips }`, 
          `mod chips` 
        ] 
      ] )
    }
  ]

  reset()

  const api: GameAPI = [
    state, reset, timeStr, incTime, move, close, select, confirmSelection
  ]

  return api
}
