import {
  animTime, tileSize, canvasTiles, viewTiles, centerTile, sunset, sunrise,
  fontSize, fontTiles, mapSize, computerIconSize, gridSize, gridTiles
} from './settings'

import { loadImages, randInt } from './utils'
import { inBounds, delta } from './geometry'

import {
  T_HEALTH, T_FOOD, API_STATE, ST_COLOR, ST_DISPLAY_ITEM, DISPLAY_TYPE,
  DTYPE_MAP, DTYPE_IMAGE, DISPLAY_NAME, DTYPE_MESSAGE, DISPLAY_MESSAGE,
  MAP_TILES, MAP_PLAYERX, MAP_PLAYERY, ST_PLAYER_HEALTH, ST_PLAYER_FACING,
  ST_PLAYER_FOOD, API_TIMESTR, API_MOVE, API_CLOSE, DTYPE_SCREEN, MAP_TYPE,
  MAP_STARTX, MAP_STARTY, MT_ISLAND, S_SKELETON, S_BOAT_LEFT, S_BOAT_RIGHT,
  ST_MONSTERS, ST_HOURS, MON_X, MON_Y, MON_FACING, S_MONSTER, MON_HEALTH,
  SCREEN_MESSAGE, SCREEN_OPTIONS, OPTION_MESSAGE, SCREEN_SELECTION, API_SELECT,
  API_CONFIRM_SELECT, T_KEY, ST_PLAYER_KEYS, T_CHIP, T_DISK, ST_PLAYER_CHIPS,
  ST_PLAYER_DISKS, T_BLACK, T_LAND, DTYPE_COMPUTER_MAP, T_SEA, C_PLAYER, T_HUT,
  C_HUT_LOCKED, T_RUINS, T_RUINS_L, C_RUINS_ACTIVE, T_SATELLITE,
  C_SATELLITE_OFFLINE, COMPUTER_MAP_MAPDB, ST_SEEN, T_FOG, T_SAND, T_SAND_L,
  T_PORTAL, C_PORTAL_ACTIVE, T_PORTAL_DAY, ST_HUTCACHE, ST_RUINCACHE,
  HUT_UNLOCKED, C_HUT_UNLOCKED, C_RUINS_EMPTY, C_PORTAL_OFFLINE,
  T_PORTAL_OFFLINE, ST_SATELLITE_FIXED, C_SATELLITE_ACTIVE, ST_MOD_CHIPS,
  ST_SATELLITE_CHIPS
} from './indices'

import { Game } from './game'
import {
  DisplayMap, DisplayScreen, Point, DisplayComputerMap, HutState, RuinItems
} from './types'

// let typescript know we have a global c (via the element's id attribute)
declare const c: HTMLCanvasElement

// a new animation frame, decide what to draw
const draw = ( time: number ) => {
  const color = api[ API_STATE ]()[ ST_COLOR ]
  const displayItem = api[ API_STATE ]()[ ST_DISPLAY_ITEM ]

  // set the canvas' color scheme
  c.className = color
  // blank the canvas
  c.width = c.height = tileSize * canvasTiles

  // now decide what to draw according to the display item's display type

  if( displayItem[ DISPLAY_TYPE ] === DTYPE_MAP ){
    drawMap( time )
    drawUi()
  }

  if( displayItem[ DISPLAY_TYPE ] === DTYPE_IMAGE ){
    // it's the splash screen
    if( displayItem[ DISPLAY_NAME ] === 's.png' ){
      ctx.drawImage( splash, 0, 0 )
      // draw a skeleton in the middle, looks cool
      ctx.drawImage(
        player,
        S_SKELETON * tileSize, 0,
        tileSize, tileSize,
        mapSize / 2 - fontSize, mapSize / 2 - fontSize,
        tileSize, tileSize
      )
      // and copyright etc
      drawText( 'Js13kGames OFFLINE', 1, 16 )
      drawText( 'C2018 Nik Coughlin', 1, 18 )
    }
  }

  if( displayItem[ DISPLAY_TYPE ] === DTYPE_MESSAGE ){
    drawMessage( <string[]>displayItem[ DISPLAY_MESSAGE ] )
  }

  if( displayItem[ DISPLAY_TYPE ] === DTYPE_SCREEN ){
    drawScreen( <DisplayScreen>displayItem )
  }

  if( displayItem[ DISPLAY_TYPE ] === DTYPE_COMPUTER_MAP ){
    drawComputerMap()
  }

  // request the next frame
  requestAnimationFrame( draw )
}

// draw a single char - tx and tx are in font units, eg a 20x20 grid with
// current settings
const drawChar = ( ch = '', tx = 0, ty = 0 ) =>
  ctx.drawImage(
    font,
    ( ch.charCodeAt( 0 ) - 32 ) * fontSize, 0,
    fontSize, fontSize,
    tx * fontSize, ty * fontSize,
    fontSize, fontSize
  )

// draw a string of text, same coord system as drawChar
const drawText = ( str = '', tx = 0, ty = 0 ) => {
  for ( let i = 0; i < str.length; i++ )
    drawChar( str[ i ], tx + i, ty )
}

// centers the lines of text on the screen vertically and horizontally
const drawMessage = ( lines: string[] ) => {
  const dy = ~~( (fontTiles - lines.length ) / 2 )

  for( let y = 0; y < lines.length; y++ ){
    const dx = ~~( (fontTiles - lines[ y ].length ) / 2 )
    drawText( lines[ y ], dx, dy + y )
  }
}

// draws a screen that may have options that the player can choose
const drawScreen = ( screen: DisplayScreen ) => {
  // first draw the message
  for( let y = 0; y < screen[ SCREEN_MESSAGE ].length; y++ ){
    drawText( screen[ SCREEN_MESSAGE ][ y ], 0, y )
  }

  /*
    clicking/tapping anywhere on the top row closes but add an <X> button
    in the top right corner as a visual hint to the player
  */
  drawText( '<X>', fontTiles - 3, 0 )

  // figure out where to start drawing the options
  const optionOffset = screen[ SCREEN_MESSAGE ].length % 2 ? 1 : 0

  // show the options, also mark the currently selected option
  for ( let y = 0; y < screen[ SCREEN_OPTIONS ].length; y++ ){
    drawText(
      `${ y + 1 } ${
        y === screen[ SCREEN_SELECTION ] ? '<' : ' '
      }${
        screen[ SCREEN_OPTIONS ][ y ][ OPTION_MESSAGE ]
      }${
        y === screen[ SCREEN_SELECTION ] ? '>' : ' '
      }`,
      0,
      y * 2 + screen[ SCREEN_MESSAGE ].length + optionOffset
    )
  }
}

// main map view
const drawMap = ( time: number ) => {
  // we only use two frames of animation - which is it currently?
  const currentFrame = ~~( time / animTime ) % 2 ? 0 : 1
  // get everything we need to know from state
  const monsters = api[ API_STATE ]()[ ST_MONSTERS ]
  const mapItem = <DisplayMap>api[ API_STATE ]()[ ST_DISPLAY_ITEM ]
  const map = mapItem[ MAP_TILES ]
  const playerX = mapItem[ MAP_PLAYERX ]
  const playerY = mapItem[ MAP_PLAYERY ]
  const mapType = mapItem[ MAP_TYPE ]
  const startX = mapItem[ MAP_STARTX ]
  const startY = mapItem[ MAP_STARTY ]
  const playerHealth = api[ API_STATE ]()[ ST_PLAYER_HEALTH ]
  const playerFacing = api[ API_STATE ]()[ ST_PLAYER_FACING ]
  const satelliteFixed = api[ API_STATE ]()[ ST_SATELLITE_FIXED ]
  const seen = api[ API_STATE ]()[ ST_SEEN ]
  const isNight = api[ API_STATE ]()[ ST_HOURS ] >= sunset || api[ API_STATE ]()[ ST_HOURS ] < sunrise

  // iterate over the viewport
  for ( let y = 0; y < viewTiles; y++ ) {
    for ( let x = 0; x < viewTiles; x++ ) {
      // convert viewport coordinates to map coordinates
      const mapX = ( playerX - centerTile ) + x
      const mapY = ( playerY - centerTile ) + y

      // assume water tile, set to either 0 or 1 depending on currentFrame
      let sx = currentFrame * tileSize

      // bounds check
      if ( inBounds( [ mapX, mapY ] ) ) {
        const tileIndex = map[ mapY ][ mapX ]

        /*
          this is the default drawing offset into the sprites, some tile with
          no animation etc - if tileIndex is 0 then it must be water so we leave
          sx as is, it was set above
        */
        if ( tileIndex ) sx = tileIndex * tileSize
      }

      // draw whatever the tile was
      ctx.drawImage(
        tiles,
        sx, 0,
        tileSize, tileSize,
        ( x + 1 ) * tileSize, ( y + 1 ) * tileSize,
        tileSize, tileSize
      )

      // special handling for portal
      if( map[ mapY ][ mapX ] === T_PORTAL ){
        // portal is only animated at night
        if( isNight ){
          ctx.drawImage(
            tiles,
            ( T_PORTAL + currentFrame ) * tileSize, 0,
            tileSize, tileSize,
            ( x + 1 ) * tileSize, ( y + 1 ) * tileSize,
            tileSize, tileSize
          )
        }
        // draw the day time, inactive portal
        else {
          ctx.drawImage(
            tiles,
            T_PORTAL_DAY * tileSize, 0,
            tileSize, tileSize,
            ( x + 1 ) * tileSize, ( y + 1 ) * tileSize,
            tileSize, tileSize
          )
        }
        /*
          if portal has been deactivated, the default drawing case above
          already drew it, no need to do anything
        */
      }

      /*
        special case for the fixed satellite, it now animates
      */
      if ( map[ mapY ][ mapX ] === T_SATELLITE && satelliteFixed ){
        ctx.drawImage(
          tiles,
          ( T_SATELLITE + currentFrame ) * tileSize, 0,
          tileSize, tileSize,
          ( x + 1 ) * tileSize, ( y + 1 ) * tileSize,
          tileSize, tileSize
        )
      }

      // only draw monsters on the island (not in huts) and only if night
      if ( mapType === MT_ISLAND && isNight ){
        for ( let i = 0; i < monsters.length; i++ ) {
          const monster = monsters[ i ]
          const mx = monster[ MON_X ]
          const my = monster[ MON_Y ]
          const monsterFacing = monster[ MON_FACING ]

          if( mx === mapX && my === mapY && monster[ MON_HEALTH ] > 0 ){
            // figure out index according to facing, current animation frame etc
            sx = ( ( S_MONSTER + currentFrame ) * tileSize ) + ( monsterFacing * tileSize * 2 )

            ctx.drawImage(
              player,
              sx, 0,
              tileSize, tileSize,
              ( x + 1 ) * tileSize, ( y + 1 ) * tileSize,
              tileSize, tileSize
            )
          }
        }
      }

      // always draw the player in the center
      if ( x === centerTile && y === centerTile ) {
        // alive
        if ( playerHealth ) {
          // get the correct animation frame according to facing etc
          sx = ( currentFrame * tileSize ) + ( playerFacing * tileSize * 2 )
        }
        // they're dead, just show skeleton
        else {
          sx = S_SKELETON * tileSize
        }

        ctx.drawImage(
          player,
          sx, 0,
          tileSize, tileSize,
          ( x + 1 ) * tileSize, ( y + 1 ) * tileSize,
          tileSize, tileSize
        )
      }

      // draw the boat next to where the player started
      if ( mapType === MT_ISLAND && mapX === startX - 2 && mapY === startY ) {
        ctx.drawImage(
          player,
          S_BOAT_LEFT * tileSize, 0,
          tileSize, tileSize,
          ( x + 1 ) * tileSize, ( y + 1 ) * tileSize,
          tileSize, tileSize
        )
      }
      if ( mapType === MT_ISLAND && mapX === startX - 1 && mapY === startY ) {
        ctx.drawImage(
          player,
          S_BOAT_RIGHT * tileSize, 0,
          tileSize, tileSize,
          ( x + 1 ) * tileSize, ( y + 1 ) * tileSize,
          tileSize, tileSize
        )
      }

      // draw fog of war over any unseen tiles - must be last obviously
      if( mapType === MT_ISLAND && !seen[ mapY * mapSize + mapX ]){
        ctx.drawImage(
          tiles,
          T_FOG * tileSize, 0,
          tileSize, tileSize,
          ( x + 1 ) * tileSize, ( y + 1 ) * tileSize,
          tileSize, tileSize
        )
      }
    }
  }
}

// show the current time, player's health, food, items etc.
const drawUi = () => {
  const playerFood = api[ API_STATE ]()[ ST_PLAYER_FOOD ]
  const playerHealth = api[ API_STATE ]()[ ST_PLAYER_HEALTH ]
  const playerKeys = api[ API_STATE ]()[ ST_PLAYER_KEYS ]
  const playerChips = api[ API_STATE ]()[ ST_PLAYER_CHIPS ]
  const playerDisks = api[ API_STATE ]()[ ST_PLAYER_DISKS ]
  const modChips = api[ API_STATE ]()[ ST_MOD_CHIPS ]
  const satelliteChips = api[ API_STATE ]()[ ST_SATELLITE_CHIPS ]

  drawText( `RANGER DOWN ${ api[ API_TIMESTR ]() }`, 2.5, 0.5 )

  ctx.drawImage(
    tiles,
    T_HEALTH * tileSize, 0,
    tileSize, tileSize,
    0, 0,
    tileSize, tileSize
  )
  drawText( `${ playerHealth }`, playerHealth < 10 ? 0.5 : 0, 2 )

  ctx.drawImage(
    tiles,
    T_FOOD * tileSize, 0,
    tileSize, tileSize,
    0, tileSize * 1.5,
    tileSize, tileSize
  )
  drawText( `${ playerFood }`, playerFood < 10 ? 0.5 : 0, 5 )

  ctx.drawImage(
    tiles,
    T_KEY * tileSize, 0,
    tileSize, tileSize,
    0, tileSize * 3,
    tileSize, tileSize
  )
  drawText( `${ playerKeys }`, playerKeys < 10 ? 0.5 : 0, 8 )

  ctx.drawImage(
    tiles,
    T_DISK * tileSize, 0,
    tileSize, tileSize,
    0, tileSize * 4.5,
    tileSize, tileSize
  )
  drawText( `${ playerDisks }`, playerDisks < 10 ? 0.5 : 0, 11 )

  ctx.drawImage(
    tiles,
    T_CHIP * tileSize, 0,
    tileSize, tileSize,
    0, tileSize * 6,
    tileSize, tileSize
  )
  drawText( `${ playerChips }`, playerChips < 10 ? 0.5 : 0, 14 )
  if ( modChips > -1 ) {
    drawText( `${ modChips }`, modChips < 10 ? 0.5 : 0, 15 )
  }
  if ( satelliteChips > -1 ) {
    drawText( `${ satelliteChips }`, satelliteChips < 10 ? 0.5 : 0, 16 )
  }
}

let lastAnimFrame = 0
// use the map db to display any unlocked map tiles
const drawComputerMap = () => {
  // get info we need from state
  const mapItem = <DisplayComputerMap>api[ API_STATE ]()[ ST_DISPLAY_ITEM ]
  const seen = api[ API_STATE ]()[ ST_SEEN ]
  const hutCache = api[ API_STATE ]()[ ST_HUTCACHE ]
  const ruinCache = api[ API_STATE ]()[ ST_RUINCACHE ]
  const satelliteFixed = api[ API_STATE ]()[ ST_SATELLITE_FIXED ]
  const playerX = mapItem[ MAP_PLAYERX ]
  const playerY = mapItem[ MAP_PLAYERY ]
  const map = mapItem[ MAP_TILES ]
  const mapDb = mapItem[ COMPUTER_MAP_MAPDB ]

  // first draw the coastlines and mark land as seen/unseen
  for( let y = 0; y < mapSize; y++ ){
    for( let x = 0; x < mapSize; x++ ){
      const gridX = ~~( x / gridSize )
      const gridY = ~~( y / gridSize )
      const tile = map[ y ][ x ]
      const isSand = tile >= T_SAND && tile < T_SAND + T_SAND_L
      // if they have this tile unlocked
      if( mapDb[ gridY * gridTiles + gridX ] ){
        // leave left and top edge clear for coords
        if ( x > fontSize && y > fontSize && tile === T_SEA ){
          if( x % 2 && !( y % 2 ) ){
            ctx.drawImage(
              tiles,
              T_LAND * tileSize, 0,
              1, 1,
              x, y,
              1, 1
            )  
          } else {
            ctx.drawImage(
              tiles,
              T_BLACK * tileSize, 0,
              1, 1,
              x, y,
              1, 1
            ) 
          }
          // not the most efficient way to draw a single pixel but map is small
        }        
        // we draw coastlines and seen tiles in white
        else if( seen[ y * mapSize + x ] || isSand ) {
          ctx.drawImage(
            tiles,
            T_LAND * tileSize, 0,
            1, 1,
            x, y,
            1, 1
          )
        }
        // unseen black
        else {
          ctx.drawImage(
            tiles,
            T_BLACK * tileSize, 0,
            1, 1,
            x, y,
            1, 1
          )
        }
      }
      // otherwise static, but leave the left and top edge
      else {
        if( x > fontSize && y > fontSize ){
          if(  randInt( 2 ) ){
            ctx.drawImage(
              tiles,
              T_LAND * tileSize, 0,
              1, 1,
              x, y,
              1, 1
            ) 
          } else {
            ctx.drawImage(
              tiles,
              T_BLACK * tileSize, 0,
              1, 1,
              x, y,
              1, 1
            ) 
          }
        }
      }
    }
  }
  // now draw icons on the map to show player interesting things
  for ( let y = 0; y < mapSize; y++ ) {
    for ( let x = 0; x < mapSize; x++ ) {
      const gridX = ~~( x / gridSize )
      const gridY = ~~( y / gridSize )
      const tile = map[ y ][ x ]
      // if they've unlocked this tile
      if( mapDb[ gridY * gridTiles + gridX ] ){
        // show two states for huts, locked or unlocked
        if ( tile === T_HUT ) {
          const currentHut = <HutState>hutCache[ y * mapSize + x ]
          if( currentHut[ HUT_UNLOCKED ] ){
            ctx.drawImage(
              computerIcons,
              C_HUT_UNLOCKED * computerIconSize, 0,
              computerIconSize, computerIconSize,
              x - 3, y - 3,
              computerIconSize, computerIconSize
            )
          } else {
            ctx.drawImage(
              computerIcons,
              C_HUT_LOCKED * computerIconSize, 0,
              computerIconSize, computerIconSize,
              x - 3, y - 3,
              computerIconSize, computerIconSize
            )
          }
        }
        // show a different state for ruins that are empty vs can still search
        if ( tile >= T_RUINS && tile < T_RUINS + T_RUINS_L ) {
          const currentRuins = <RuinItems>ruinCache[ y * mapSize + x ]
          if( currentRuins.length ){
            ctx.drawImage(
              computerIcons,
              C_RUINS_ACTIVE * computerIconSize, 0,
              computerIconSize, computerIconSize,
              x - 3, y - 3,
              computerIconSize, computerIconSize
            )
          } else {
            ctx.drawImage(
              computerIcons,
              C_RUINS_EMPTY * computerIconSize, 0,
              computerIconSize, computerIconSize,
              x - 3, y - 3,
              computerIconSize, computerIconSize
            )
          }
        }
        // fixed vs offline
        if ( tile === T_SATELLITE ) {
          if( satelliteFixed ){
            ctx.drawImage(
              computerIcons,
              C_SATELLITE_ACTIVE * computerIconSize, 0,
              computerIconSize, computerIconSize,
              x - 3, y - 3,
              computerIconSize, computerIconSize
            )
          } else {
            ctx.drawImage(
              computerIcons,
              C_SATELLITE_OFFLINE * computerIconSize, 0,
              computerIconSize, computerIconSize,
              x - 3, y - 3,
              computerIconSize, computerIconSize
            )
          }
        }
        // portal, not yet deactivated
        if ( tile === T_PORTAL ) {
          ctx.drawImage(
            computerIcons,
            C_PORTAL_ACTIVE * computerIconSize, 0,
            computerIconSize, computerIconSize,
            x - 3, y - 3,
            computerIconSize, computerIconSize
          )
        }
        // offline portal
        if( tile === T_PORTAL_OFFLINE ){
          ctx.drawImage(
            computerIcons,
            C_PORTAL_OFFLINE * computerIconSize, 0,
            computerIconSize, computerIconSize,
            x - 3, y - 3,
            computerIconSize, computerIconSize
          )
        }
      }
    }
  }
  // mark current location on the map, always show even in locked tiles
  ctx.drawImage(
    computerIcons,
    C_PLAYER * computerIconSize, 0,
    computerIconSize, computerIconSize,
    playerX - 3, playerY - 3,
    computerIconSize, computerIconSize
  )

  /*
    map coordinates - if we had room left we were going to have quests where
    notes from ranger told player to go to certain places
  */
  // draw numbers down the left edge
  for( let y = 0; y < gridSize; y++ ){
    ctx.drawImage(
      font,
      ( 16 + y ) * fontSize, 0,
      fontSize, fontSize,
      0, y * gridSize + ~~( gridSize / 2 ),
      fontSize, fontSize
    )
  }
  // draw letters along the top edge
  for( let x = 0; x < gridSize; x++ ){
    ctx.drawImage(
      font,
      ( 33 + x ) * fontSize, 0,
      fontSize, fontSize,
      x * gridSize + ~~( gridSize / 2 ), 0,
      fontSize, fontSize
    )
  }
}

// handle keyboard when moving on map - supports WADS and arrows
const keyHandlerMap = e => {
  // left
  if ( e.keyCode === 65 || e.keyCode === 37 ) {
    api[ API_MOVE ]( -1, 0 )
  }
  // right
  if ( e.keyCode === 68 || e.keyCode === 39 ) {
    api[ API_MOVE ]( 1, 0 )
  }
  // up
  if ( e.keyCode === 87 || e.keyCode === 38 ) {
    api[ API_MOVE ]( 0, -1 )
  }
  // down
  if ( e.keyCode === 83 || e.keyCode === 40 ) {
    api[ API_MOVE ]( 0, 1 )
  }
}

// initialize everything
const ctx = c.getContext( '2d' )!
let font: HTMLImageElement
let tiles: HTMLImageElement
let player: HTMLImageElement
let splash: HTMLImageElement
let computerIcons: HTMLImageElement
let api = Game()

// decide what the key press is for
document.onkeyup = e => {
  const displayItem = api[ API_STATE ]()[ ST_DISPLAY_ITEM ]

  // map, must be moving
  if ( displayItem[ DISPLAY_TYPE ] === DTYPE_MAP ) {
    keyHandlerMap( e )
  }

  // a screen that can be dismissed
  if (
    displayItem[ DISPLAY_TYPE ] === DTYPE_IMAGE ||
    displayItem[ DISPLAY_TYPE ] === DTYPE_MESSAGE ||
    displayItem[ DISPLAY_TYPE ] === DTYPE_COMPUTER_MAP
  ) {
    // space or esc or enter
    if ( e.keyCode === 32 || e.keyCode === 27 || e.keyCode === 13 ) {
      api[ API_CLOSE ]()
    }
  }

  // a screen with options
  if ( displayItem[ DISPLAY_TYPE ] === DTYPE_SCREEN ) {
    const screen = <DisplayScreen>displayItem

    // esc
    if ( e.keyCode === 27 ) {
      api[ API_CLOSE ]()
    }

    // up
    if ( e.keyCode === 87 || e.keyCode === 38 ) {
      if( screen[ SCREEN_SELECTION ] > 0 ){
        api[ API_SELECT ]( screen[ SCREEN_SELECTION ] - 1 )
      }
    }
    // down
    if ( e.keyCode === 83 || e.keyCode === 40 ) {
      if ( screen[ SCREEN_SELECTION ] < screen[ SCREEN_OPTIONS ].length - 1 ) {
        api[ API_SELECT ]( screen[ SCREEN_SELECTION ] + 1 )
      }
    }

    // space or enter
    if ( e.keyCode === 32 || e.keyCode === 13 ) {
      api[ API_CONFIRM_SELECT ]()
    }
  }
}

// handle mouse and touch events
const clickOrTouch = ( [ x, y ]: Point ) => {
  const displayItem = api[ API_STATE ]()[ ST_DISPLAY_ITEM ]
  // we need to know what the browser has sized the canvas to to get the coords
  const tileSize = c.getBoundingClientRect().width / canvasTiles
  const tx = ~~( ( x - c.getBoundingClientRect().left ) / tileSize ) - 1
  const ty = ~~( ( y - c.getBoundingClientRect().top ) / tileSize ) - 1

  if ( displayItem[ DISPLAY_TYPE ] === DTYPE_MAP ) {
    // tapped on player
    if ( tx === centerTile && ty === centerTile ) {
      return
    }

    //tapped an interface tile
    if ( tx < 0 || ty < 0 ) {
      return
    }

    /*
      figure out roughly which way player wants to move according to how far
      from center they clicked/tapped horizontally or vertically
    */
    const dx = delta( tx, centerTile )
    const dy = delta( ty, centerTile )

    let x = 0
    let y = 0
    if ( dx > dy ) {
      x = tx > centerTile ? 1 : -1
    } else if ( dx < dy ) {
      y = ty > centerTile ? 1 : -1
    }

    api[ API_MOVE ]( x, y )
  }

  // screen with no options, click or tap anywhere to close
  if (
    displayItem[ DISPLAY_TYPE ] === DTYPE_IMAGE ||
    displayItem[ DISPLAY_TYPE ] === DTYPE_MESSAGE ||
    displayItem[ DISPLAY_TYPE ] === DTYPE_COMPUTER_MAP
  ) {
    api[ API_CLOSE ]()
  }

  // screen with options
  if ( displayItem[ DISPLAY_TYPE ] === DTYPE_SCREEN ) {
    const screen = <DisplayScreen>displayItem
    const optionOffset = screen[ SCREEN_MESSAGE ].length % 2 ? 1 : 0
    const selectionStartY = ( screen[ SCREEN_MESSAGE ].length + optionOffset ) / 2
    const selectionSize = screen[ SCREEN_OPTIONS ].length
    const selection = ty - selectionStartY + 1

    // tapped the top, close
    if ( ty < 0 ) {
      api[ API_CLOSE ]()
    }

    // no options, anywhere to close
    if( !selectionSize ){
      api[ API_CLOSE ]()
    }

    /*
      if they tapped a different selection to current selection, change to it
      if they tapped the existing selection, consider it a confirm
    */
    if ( selection >= 0 && selection < selectionSize ) {
      if ( selection === screen[ SCREEN_SELECTION ] ) {
        api[ API_CONFIRM_SELECT ]()
      } else {
        api[ API_SELECT ]( selection )
      }
    }
  }
}

c.ontouchend = e => {
  e.preventDefault()
  // just handle every touch
  for ( let i = 0; i < e.changedTouches.length; i++ ) {
    clickOrTouch( [ e.changedTouches[ i ].clientX, e.changedTouches[ i ].clientY ] )
  }
}

c.onclick = e => {
  e.preventDefault()

  clickOrTouch( [ e.clientX, e.clientY ] )
}

// let's kick this thing off
loadImages( 'f.gif', 't.gif', 'p.gif', 's.png', 'c.gif' ).then( imgs => {
  // set the predefined globals
  [ font, tiles, player, splash, computerIcons ] = imgs
  requestAnimationFrame( draw )
} )
