import { blocks, createIsland, createHut } from './map'

import {
  DTYPE_IMAGE, DTYPE_MESSAGE, DTYPE_SCREEN, DATA_ISLAND, DATA_INTRO,
  DATA_SPLASH, DISPLAY_TYPE, DATA_SUNRISE, DATA_SUNSET, DTYPE_MAP, MAP_PLAYERX,
  MAP_PLAYERY, MAP_TILES, T_HUT, T_HUT_R, MAP_STARTY, MT_ISLAND, MAP_TYPE,
  MT_HUT, MAP_STARTX, DATA_INVESTIGATE, MON_X, MON_Y, MON_FACING, X, Y,
  MON_HEALTH, T_COMPUTER, SCREEN_SELECTION, SCREEN_OPTIONS, OPTION_DATA_INDEX,
  SCREEN_COLOR, T_BED, DATA_NOT_TIRED, DATA_BED, DTYPE_ACTION, ACTION_INDEX,
  DATA_HUNGRY, DATA_DEAD, T_RANGER, DATA_RANGER, HUT_UNLOCKED,
  DATA_LOCKED_NOKEYS, DATA_LOCKED_UNLOCK, T_RUINS, T_RUINS_L, DATA_RUINS,
  T_PORTAL, ACTION_USE_COMPUTER, HUT_COMPUTER_FIXED, DTYPE_COMPUTER_MAP,
  DATA_C_DB_INTRO, DATA_RESTORE_BACKUPS, ITEM_KEY, ITEM_CHIP, ITEM_DISK,
  ITEM_FOOD, DATA_DB, DATA_MAP, ACTION_SHOW_MAP, DATA_SYNTH, DATA_COMMS,
  DATA_USE_COMPUTER, DATA_FIX_COMPUTER, DATA_DIAGNOSTICS, DISPLAY_MESSAGE,
  DATA_CREATE_FOOD, DATA_MODCHIPS, T_PORTAL_OFFLINE, DATA_C_DB_L,
  DATA_C_DB_SHUTDOWN_PORTALS, DATA_C_DB_FIX_SATELLITE, T_SATELLITE,
  DATA_SATELLITE_CHIP, DATA_DISTRESS_SIGNAL, HUT_SYNTH_CHARGING
} from './indices'

import {
  DisplayItem, GameColor, GameState, DisplayMap, GameAPI, Monster,
  DisplayScreen, DisplayAction, HutState, Point, DisplayComputerMap,
  DisplaySelection, RuinItems, HutCache, RuinCache, RuinItem, Seen, PortalCache,
  BoolAsNumber
} from './types'

import { inBounds, hasPoint, towards, allNeighbours, dist } from './geometry'
import {
  initialMonsterCount, mapSize, sunrise, sunset, gridSize, gridTiles, centerTile
} from './settings'
import { randInt, shuffle, pick } from './utils'
import { gameData } from './data'

export const Game = () => {
  // state, things the UI might need to know to draw
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
  let satelliteFixed: BoolAsNumber
  // internal state, no need to expose to UI
  let seenRangerMessage: number
  let currentHut: HutState
  let currentRuins: RuinItems
  let notesDb: number[]
  let mapDb: number[]
  let modChips: number
  let satelliteChips: number
  let portalCache: PortalCache

  // create a clean slate, eg on first run or when restarting after died/won
  const reset = () => {
    // information about huts, ruins, portals etc.
    hutCache = [[]]
    ruinCache = [[]]
    portalCache = [[]]
    // player state
    playerFacing = 0
    playerFood = 5
    playerHealth = 20
    playerMaxHealth = 20
    playerKeys = 0
    playerChips = 0
    playerDisks = 0
    // start five minutes before dark to teach the player about sunrise/sunset
    hours = 17
    minutes = 55
    // generate main map
    gameData[ DATA_ISLAND ] = createIsland( hutCache, ruinCache, portalCache )
    /*
      setup the display stack with the splash screen, then the intro text,
      then the main map
    */
    displayStack = [
      gameData[ DATA_ISLAND ],
      gameData[ DATA_INTRO ],
      gameData[ DATA_SPLASH ]
    ]
    color = ''
    monsters = []
    seenRangerMessage = 0
    modChips = -1
    satelliteChips = -1
    notesDb = [ DATA_C_DB_INTRO ]
    mapDb = []
    seen = []
    satelliteFixed = 0

    /*
      once the player unlocks map, the tile they started on will already be
      restored
    */
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
    // images and messages use the green scheme
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_IMAGE ) return 'g'
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_MESSAGE ) return 'g'
    // computer stuff uses amber
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_COMPUTER_MAP ) return 'a'
    // screens can be either game screens (green) or computer screens (amber)
    if ( displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_SCREEN )
      return (<DisplayScreen>displayStack[ displayStack.length - 1 ])[ SCREEN_COLOR ]

    /*
      must be in game, probably empty string - black and white in day, dark
      blues at night
    */

    return color
  }

  // current game state, used by the UI
  const state = (): GameState => [
    playerFacing, playerFood, playerHealth, playerMaxHealth, hours, minutes,
    currentColor(),
    displayStack[ displayStack.length - 1 ],
    monsters,
    playerKeys, playerChips, playerDisks,
    seen,
    hutCache, ruinCache, portalCache, satelliteFixed, modChips, satelliteChips
  ]

  // close the current screen
  const close = () => {
    displayStack.pop()

    // if nothing left in stack, player won or died - restart
    if( !displayStack.length ) reset()
  }

  /*
    create a new monster at x,y unless that tile is blocked or already has a
    monster
  */
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

  // create the initial monsters
  const createMonsters = () => {
    while ( monsters.length < initialMonsterCount ) {
      const x = randInt( mapSize )
      const y = randInt( mapSize )
      createMonster([ x, y ])
    }
  }

  // monster is only "here" if it's still alive
  const isMonsterHere = ( [ x, y ]: Point ) => {
    for ( let i = 0; i < monsters.length; i++ ) {
      const monster = monsters[ i ]
      const mx = monster[ MON_X ]
      const my = monster[ MON_Y ]

      if ( monster[ MON_HEALTH ] > 0 && x === mx && y === my ) return 1
    }
  }

  // move all the monsters
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

      // at night, 66% chance the monster moves towards player.
      if ( ( hours >= sunset || hours < sunrise ) && Math.random() < 0.66 ) {
        const toPlayer = towards( [ x, y ], [ playerX, playerY ] )
        next[ X ] = toPlayer[ X ]
        next[ Y ] = toPlayer[ Y ]
      }
      // day time or 33% chance at night that monster just moves randomly
      else {
        // 50% chance of moving either horizontally or vertically
        if ( randInt( 2 ) ) {
          // either move left, stay here, or move right
          next[ X ] = x + ( randInt( 3 ) - 1 )
        } else {
          // either move up, stay here, or move down
          next[ Y ] = y + ( randInt( 3 ) - 1 )
        }
      }

      // get the tile we're trying to move to
      const mapTile = mapItem[ MAP_TILES ][ next[ Y ] ][ next[ X ] ]

      // only move if not blocked by map obstacle, another monster or player
      if (
        !blocks( mapTile ) &&
        !isMonsterHere( [ next[ X ], next[ Y ] ] ) &&
        !( playerX === next[ X ] && playerY === next[ Y ] )
      ) {
        monster[ MON_X ] = next[ X ]
        monster[ MON_Y ] = next[ Y ]
        // update monster facing if moved left or right
        if ( next[ X ] < x ) {
          monster[ MON_FACING ] = 1
        }
        if ( next[ X ] > x ) {
          monster[ MON_FACING ] = 0
        }
      }

      /*
        if nighttime and on main map and bumped player and player not already
        dead and this monster isn't dead, 50% chance of hurting player
      */
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

  // distribute items amongst ruins
  const distributeItems = () => {
    const numHuts = hutCache[ 0 ].length
    // 1 for each hut and some extra
    const numKeyCards = numHuts + 2
    // 6 for each hut and some extra
    const numChips = ~~( numHuts * 7 )
    /*
      We need:
        7 for notes
        15 for map
        2 for synth

      But make approx double that so that the game doesn't go too slowly
    */
    const numBackups = 50
    // this is just a guess
    const numFood = ~~( numHuts * 2 )

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

    /*
      ok, now shuffle items so when we distribute it's random
    */
    items = shuffle( items )

    while( items.length ){
      /*
        take an item and randomly pick a ruin to stash it in
      */
      const item = items.pop()!
      const [ rx, ry ] = pick( ruinCache[ 0 ] )
      const ruinItems = <RuinItems>ruinCache[ ry * mapSize + rx ]
      ruinItems.push( item )
    }
  }

  /*
    increase the time by 1 minute every time the player does certain actions

    also keeps track of sunset/sunrise and changes color scheme accordingly

    if sleeping, don't eat food

    if not sleeping, try to eat food, if no food, lose health
  */
  const incTime = ( sleeping: BoolAsNumber = 0 ) => {
    if( playerHealth < 1 ){
      displayStack = [ gameData[ DATA_DEAD ] ]
      return
    }

    minutes++
    // new hour
    if ( minutes === 60 ) {
      minutes = 0
      hours++
      if( sleeping ){
        // heal one HP every hour
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
          // eat food and heal 1 HP if needed
          playerFood--
          if ( playerHealth < playerMaxHealth ) playerHealth++
        } else {
          // starve if no food and lose 1 HP
          playerHealth--
          displayStack.push( gameData[ DATA_HUNGRY ] )
        }
      }
    }
    // once a day at midnight, do this
    if ( hours === 24 ) {
      // put all the synths back to full charge
      const huts = hutCache[ 0 ]
      for( let i = 0; i < huts.length; i++ ){
        const [ hx, hy ] = huts[ i ]
        hutCache[ hy * mapSize + hx ][ HUT_SYNTH_CHARGING ] = 0
      }
      // tick over the hours counter
      hours = 0
      // have remaining active portals randomly spawn more monsters
      const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
      for( let y = 0; y < mapSize; y++ ){
        for( let x = 0; x < mapSize; x++ ){
          const mapTile = mapItem[ MAP_TILES ][ y ][ x ]
          if( mapTile === T_PORTAL ){
            // every tile neighbouring portal has chance to spawn
            const neighbours = allNeighbours([ x, y ])
            for( let i = 0; i < neighbours.length; i++ ){
              // one in three chance it spawns
              if( !randInt( 3 ) ){
                createMonster( neighbours[ i ] )
              }
            }
          }
        }
      }
    }
    // move all the monsters
    updateMonsters()
  }

  // format the time string
  const timeStr = () => `${
    hours < 10 ? '0' : ''
  }${
    hours
  }:${
    minutes < 10 ? '0' : ''
  }${
    minutes
  }`

  // update the fog of war - helps player keep track of where they've been
  const updateSeen = ( map: DisplayMap ) => {
    if( map[ MAP_TYPE ] === MT_ISLAND ){
      const px = map[ MAP_PLAYERX ]
      const py = map[ MAP_PLAYERY ]

      for( let y = -centerTile; y < centerTile; y++ ){
        for( let x = -centerTile; x < centerTile; x++ ){
          const cx = px + x
          const cy = py + y
          // if we had a bigger viewport this would be a nice circle
          if( dist( [ px, py ], [ cx, cy ] ) < centerTile ){
            seen[ cy * mapSize + cx ] = 1
          }
        }
      }
    }
  }

  // the UI asked the game code to move the player
  const move = ( x: number, y: number ) => {
    const map = <DisplayMap>displayStack[ displayStack.length - 1 ]

    // must be navigating around a menu or something
    if( map[ 0 ] !== DTYPE_MAP ) return

    // takes one minute even if blocked
    incTime()

    // change player facing even if blocked
    if( x === -1 ){
      playerFacing = 1
    }
    if( x === 1 ){
      playerFacing = 0
    }

    // update current player position
    x = map[ MAP_PLAYERX ] + x
    y = map[ MAP_PLAYERY ] + y

    // find if a monster is at the new position and if it is alive
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

    // move the player if no map obstacle or monster
    if (
      playerHealth > 0 && inBounds( [ x, y ] ) &&
      !blocks( map[ MAP_TILES ][ y ][ x ] ) && !monsterHere
    ){
      map[ MAP_PLAYERX ] = x
      map[ MAP_PLAYERY ] = y
    }

    // update the fog of war
    updateSeen( map )

    // check for bumping into things on island
    if( map[ MAP_TYPE ] === MT_ISLAND ){
      // huts
      if ( map[ MAP_TILES ][ y ][ x ] === T_HUT ) {
        currentHut = <HutState>hutCache[ y * mapSize + x ]
        // if unlocked you just go in
        if( currentHut[ HUT_UNLOCKED ] ){
          displayStack.push( createHut() )
        } else {
          // if they have keys ask if want to unlock
          if( playerKeys ){
            displayStack.push( gameData[ DATA_LOCKED_UNLOCK ] )
          }
          // otherwise tell them it's locked
          else {
            displayStack.push( gameData[ DATA_LOCKED_NOKEYS ] )
          }
        }
      }

      // if they bump the boat tell them they can't leave, there's a job to do
      if( y === map[ MAP_STARTY ] ){
        if( x === map[ MAP_STARTX ] - 1 ){
          displayStack.push( gameData[ DATA_INVESTIGATE ] )
        }
      }

      // if bumped a monster, 50% chance of hurting it
      if ( monsterHere && randInt( 2 ) ){
        monsterHere[ MON_HEALTH ]--
      }

      // show the ranger message the first time the player bumps the skeleton
      if( map[ MAP_TILES ][ y ][ x ] === T_RANGER && !seenRangerMessage ){
        seenRangerMessage = 1
        displayStack.push( gameData[ DATA_RANGER ] )
        playerKeys++
        playerFood += 5
        playerChips += 3
        playerDisks += 2
      }

      // ruins
      if( map[ MAP_TILES ][ y ][ x ] >= T_RUINS && map[ MAP_TILES ][ y ][ x ] < T_RUINS + T_RUINS_L ){
        currentRuins = <RuinItems>ruinCache[ y * mapSize + x ]
        // offer them chance to search if this ruins has items left
        if( currentRuins.length ){
          displayStack.push( gameData[ DATA_RUINS ] )
        }
        // otherwise tell them it's empty
        else {
          displayStack.push( [ DTYPE_MESSAGE, [ 'Nothing here' ] ] )
        }
      }

      // portal
      if( map[ MAP_TILES ][ y ][ x ] === T_PORTAL ){
        // if they have mod chips, let them disable it
        if( modChips > 0 ){
          displayStack.push( [ DTYPE_MESSAGE, [ 'Portal disabled!' ] ] )
          map[ MAP_TILES ][ y ][ x ] = T_PORTAL_OFFLINE
          portalCache[ y * mapSize + x ] = 1
          modChips--
        }
        // they can make mod chips, but don't have any yet
        else if ( modChips > -1 ) {
          displayStack.push( [ DTYPE_MESSAGE, [ 'Need mod chips' ] ] )
        }
        // they haven't unlocked mod chips yet
        else {
          displayStack.push( [ DTYPE_MESSAGE, [ 'A strange portal' ] ] )
        }
      }

      // satellite
      if( map[ MAP_TILES ][ y ][ x ] === T_SATELLITE ){
        // if they haven't fixed it yet and have chips, fix it
        if ( satelliteChips > 0 && !satelliteFixed ) {
          displayStack.push( [ DTYPE_MESSAGE, [ 'Fixed satellite!' ] ] )
          satelliteFixed = 1
          satelliteChips--
        }
        // they can make chips but haven't yet
        else if ( satelliteChips > -1 && !satelliteFixed ) {
          displayStack.push( [ DTYPE_MESSAGE, [ 'Need satellite chip' ] ] )
        }
        // they haven't unlocked satellite chips yet
        else if ( !satelliteFixed ) {
          displayStack.push( [ DTYPE_MESSAGE, [ 'Satellite is offline' ] ] )
        }
      }
    }

    // bumps inside a hut
    if ( map[ MAP_TYPE ] === MT_HUT ) {
      // leave the hut if they bump the door
      if ( map[ MAP_TILES ][ y ][ x ] === T_HUT_R ) {
        displayStack.pop()
      }

      // use the computer
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

        // if they can fix or restore, ask them what they want to do
        if( options.length > 1 ){
          displayStack.push( computer )
        }
        // otherwise, just use the computer
        else {
          actions[ ACTION_USE_COMPUTER ]()
        }
      }

      /*
        you can sleep anytime between one hour before sunset and 1 minute
        before sunrise - 1 hour before, because if you hurried back to hut and
        misjudged slightly and got there a bit early, it's annoying killing time
        until you can sleep
      */
      if( map[ MAP_TILES ][ y ][ x ] === T_BED ){
        if( hours >= ( sunset - 1 ) || hours < sunrise ) {
          displayStack.push( gameData[ DATA_BED ] )
        } else {
          displayStack.push( gameData[ DATA_NOT_TIRED ] )
        }
      }
    }
  }

  // the UI is asking to the change the selection on a screen
  const select = ( i: number ) => {
    if (
      displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_SCREEN
    ){
      displayStack[ displayStack.length - 1 ][ SCREEN_SELECTION ] = i
    }
  }

  // the UI is asking us to execute whatever selection was chosen
  const confirmSelection = () => {
    if (
      displayStack[ displayStack.length - 1 ][ DISPLAY_TYPE ] === DTYPE_SCREEN
    ) {
      const screen = <DisplayScreen>displayStack[ displayStack.length - 1 ]

      // some screens have no options, just close the screen and return
      if( !screen[ SCREEN_OPTIONS ].length ){
        displayStack.pop()
        return
      }

      const selected = screen[ SCREEN_SELECTION ]
      const dataIndex = screen[ SCREEN_OPTIONS ][ selected ][ OPTION_DATA_INDEX ]

      // magic number used by options that just want to close this screen
      if( dataIndex === -1 ){
        close()
      }
      // if it's an action, close this screen and execute it
      else if( gameData[ dataIndex ][ DISPLAY_TYPE ] === DTYPE_ACTION ){
        displayStack.pop()
        actions[ ( <DisplayAction>gameData[ dataIndex ] )[ ACTION_INDEX ] ]()
      }
      // otherwise it must be another screen
      else {
        displayStack.push( gameData[ dataIndex ] )
      }
    }
  }

  /*
    note actions don't generally check if they're valid or not, that's done by
    the calling code
  */
  const actions: ( () => void )[] = [
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
      const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
      const playerX = mapItem[ MAP_PLAYERX ]
      const playerY = mapItem[ MAP_PLAYERY ]
      const neighbours = allNeighbours([ playerX, playerY ])
      let attacked: BoolAsNumber = 0

      /*
        searching takes one hour - if a monster is adjacent at any point, we
        want to stop searching so check every minute
      */
      for( let i = 0; i < 60; i++ ){
        incTime()
        for( let n = 0; n < neighbours.length; n++ ){
          const [ nx, ny ] = neighbours[ n ]
          if( ( hours >= sunset || hours < sunrise ) && isMonsterHere([ nx, ny ]) ){
            attacked = 1
            i = 60
          }
        }
      }

      if( attacked ){
        displayStack.push( [ DTYPE_MESSAGE, [ 'Under attack!' ] ] )
      } else {
        // take an item off the ruin stack and give it to the player
        const item = currentRuins.pop()

        if ( item === ITEM_FOOD ) {
          const food = randInt( 3 ) + 2
          displayStack.push( [ DTYPE_MESSAGE, [ `Found ${ food } food` ] ] )
          playerFood += food
        }
        else if ( item === ITEM_KEY ) {
          displayStack.push( [ DTYPE_MESSAGE, [ 'Found keycard' ] ] )
          playerKeys++
        }
        else if ( item === ITEM_CHIP ) {
          displayStack.push( [ DTYPE_MESSAGE, [ 'Found chip' ] ] )
          playerChips++
        }
        else if ( item === ITEM_DISK ) {
          displayStack.push( [ DTYPE_MESSAGE, [ 'Found backup' ] ] )
          playerDisks++
        }
      }

    },
    // ACTION_USE_COMPUTER
    () => {
      // if they've used chips to fix the computer
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
            [ 'MAP', DATA_MAP ]
          ],
          0,
          'a'
        ])
      }
      // otherwise, just basic functions
      else {
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
      currentHut[ HUT_SYNTH_CHARGING ] = 1
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
      // each hut's synth can only be used once a day
      if( currentHut[ HUT_SYNTH_CHARGING ] ){
        screen[ DISPLAY_MESSAGE ].push( '  CHARGING...' )
      }
      // if it hasn't been used
      else {
        // you can always make food if it has power
        options.push( [ 'RATIONS', DATA_CREATE_FOOD ] )
        // if they've unlocked mod chips
        if( modChips > -1 ){
          options.push( [ 'MOD CHIPS', DATA_MODCHIPS ] )
        }
        // if they've unlocked satellite chips
        if( satelliteChips > -1 ){
          options.push( [ 'SATELLITE CHIP', DATA_SATELLITE_CHIP ] )
        }
      }
      displayStack.push( screen )
    },
    // ACTION_SHOW_DB
    () => {
      // options for all the notes they've unlocked so far
      const dbOptions: DisplaySelection[] = notesDb.map( i => {
        return <DisplaySelection>[ `ENTRY ${ i }`, i ]
      })
      const dbScreen: DisplayScreen = [
        DTYPE_SCREEN,
        [
          'RSOS v3.27',
          '--------------------',
          'NOTES',
        ],
        dbOptions,
        0,
        'a'
      ]
      displayStack.push( dbScreen )
    },
    // ACTION_SHOW_COMMS
    () => {
      const options: DisplaySelection[] = []
      const screen: DisplayScreen = [
        DTYPE_SCREEN,
        [
          'RSOS v3.27',
          '--------------------',
          'COMMS',
        ],
        options,
        0,
        'a'
      ]
      // they can only send distress signal after fixing satellite
      if( satelliteFixed ){
        options.push( [ 'DISTRESS SIGNAL', DATA_DISTRESS_SIGNAL ] )
      } else {
        screen[ DISPLAY_MESSAGE ].push( '  SATELLITE OFFLINE' )
      }
      displayStack.push( screen )
    },
    // ACTION_SHOW_SECURITY
    () => {
      /*
        this was never used - can be removed but all the action indices would
        need to be updated
      */
    },
    // ACTION_SHOW_MAP
    () => {
      const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
      const playerX = mapItem[ MAP_PLAYERX ]
      const playerY = mapItem[ MAP_PLAYERY ]
      const mapTiles = mapItem[ MAP_TILES ]
      // all the information needed by the UI to display the computer map
      const computerMap: DisplayComputerMap = [ DTYPE_COMPUTER_MAP, playerX, playerY, mapTiles, mapDb ]

      displayStack.push( computerMap )
    },
    // ACTION_RESTORE_BACKUPS
    () => {
      playerDisks--

      // which note is next (if there are any left to show)
      const nextNoteDb = notesDb.length + DATA_C_DB_INTRO

      const randItem = randInt( 8 )

      /*
        mod chip for closing down portals - give to the player on first backup
        restore after they've seen the note mentioning it
      */
      if ( ( notesDb.length + DATA_C_DB_INTRO ) > DATA_C_DB_SHUTDOWN_PORTALS && modChips === -1 ){
        displayStack.push( [ DTYPE_MESSAGE, [
          'Recovered 1 synth',
          'database entry'
        ] ] )
        // lets the game know they can make them, but don't have any yet
        modChips = 0
      }
      /*
        satellite chip for fixing satellite - give after first note as above
      */
      else if ( ( notesDb.length + DATA_C_DB_INTRO ) > DATA_C_DB_FIX_SATELLITE && satelliteChips === -1 ){
        displayStack.push( [ DTYPE_MESSAGE, [
          'Recovered 1 synth',
          'database entry'
        ] ] )
        // as above
        satelliteChips = 0
      }
      // note if they haven't gotten any yet and randItem was one of 0 1 2
      else if( randItem < 3 && nextNoteDb < ( DATA_C_DB_INTRO + DATA_C_DB_L ) ){
        notesDb.push( nextNoteDb )
        displayStack.push( gameData[ notesDb.length + DATA_C_DB_INTRO - 1 ] )
        displayStack.push( [ DTYPE_MESSAGE, [
          'Recovered 1 note',
          'database entry'
        ] ] )
      }
      // otherwise give them a map tile if randItem was 3 4 5 6 7
      else {
        // check which map tiles are left
        let availableMaps: Point[] = []
        for( let y = 0; y < gridTiles; y++ ){
          for( let x = 0; x < gridTiles; x++ ){
            if( !mapDb[ y * gridTiles + x ] ){
              availableMaps.push( [ x, y ] )
            }
          }
        }
        // if there are any, pick one randomly and give it to them
        if( availableMaps.length ){
          const [ gridX, gridY ] = pick( availableMaps )
          mapDb[ gridY * gridTiles + gridX ] = 1

          actions[ ACTION_SHOW_MAP ]()
          displayStack.push( [ DTYPE_MESSAGE, [
            'Recovered 1 map',
            'database entry'
          ] ] )
        }
        // none left, try to give them a note
        else {
          if ( nextNoteDb < ( DATA_C_DB_INTRO + DATA_C_DB_L ) ){
            notesDb.push( nextNoteDb )
            displayStack.push( gameData[ notesDb.length + DATA_C_DB_INTRO - 1 ] )
            displayStack.push( [ DTYPE_MESSAGE, [
              'Recovered 1 note',
              'database entry'
            ] ] )
          }
          // no notes left either
          else {
            displayStack.push( [ DTYPE_MESSAGE, [
              'Backup already',
              'restored'
            ] ] )
          }
        }
      }
    },
    // ACTION_DIAGNOSTICS
    () => {
      // if they've fixed the computer, check what else is working properly
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
        ]
        /*
          if they haven't got satellite chips yet, there are synth backups left
          to restore
        */
        if( satelliteChips === -1 ){
          screen.push( '  RESTORE BACKUPS' )
        }
        screen.push( 'NOTES ONLINE' )
        // still some notes to restore
        if( notesDb.length < 8 ){
          screen.push( '  RESTORE BACKUPS' )
        }
        // satellite status
        if( satelliteFixed ){
          screen.push( 'COMMS ONLINE' )
          screen.push( '  DISTRESS MODE ONLY' )
        } else {
          screen.push( 'COMMS OFFLINE' )
        }
        screen.push( 'MAP ONLINE' )
        // still some map backups left to do
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
      }
      // static screen if they haven't fixed it yet telling them to fix chips
      else {
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
      // give them 2-3 chips per synth
      const chips = randInt( 2 ) + 2
      // set the synth to charge mode
      currentHut[ HUT_SYNTH_CHARGING ] = 1
      modChips += chips
      displayStack.push( [
        DTYPE_MESSAGE,
        [
          `Synthesized ${ chips }`,
          `mod chips`
        ]
      ] )
    },
    // ACTION_CREATE_SATELLITE_CHIP
    () => {
      // set the synth to charge mode
      currentHut[ HUT_SYNTH_CHARGING ] = 1
      // they only need one anyway
      satelliteChips++
      displayStack.push( [
        DTYPE_MESSAGE,
        [
          `Synthesized`,
          `satellite chip`
        ]
      ] )
    },
    // ACTION_DISTRESS_SIGNAL
    () => {
      // check if they've disabled every portal
      const portals = portalCache[ 0 ]
      const mapItem = <DisplayMap>gameData[ DATA_ISLAND ]
      const mapTiles = mapItem[ MAP_TILES ]
      let portalsLeft: BoolAsNumber = 0
      for( let i = 0; i < portals.length; i++ ){
        const [ px, py ] = portals[ i ]
        if( mapTiles[ py ][ px ] !== T_PORTAL_OFFLINE ){
          portalsLeft = 1
        }
      }

      // they didn't - bad move, the last note tells you to
      if( portalsLeft ){
        displayStack = [[
          DTYPE_MESSAGE,
          [
            `You send the`,
            `distress signal.`,
            '',
            'As the rescue team',
            'arrives monsters',
            'pour out of',
            'remaining portals',
            'and kill them all!',
            '',
            'GAME OVER!'
          ]
        ]]
      }
      // they did! good work, they won
      else {
        displayStack = [ [
          DTYPE_MESSAGE,
          [
            `You send the`,
            `distress signal.`,
            '',
            'The rescue team',
            'arrives and you',
            'help them kill',
            'the remaining',
            'monsters.',
            '',
            'YOU WIN!'
          ]
        ] ]
      }
    }
  ]

  // first run
  reset()

  // api for the UI to interact with
  const api: GameAPI = [
    state, reset, timeStr, incTime, move, close, select, confirmSelection
  ]

  return api
}
