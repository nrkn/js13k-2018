import {
  animTime, tileSize, canvasTiles, viewTiles, centerTile, sunset, sunrise, fontSize, fontTiles, mapSize, computerIconSize, gridSize, gridTiles
} from './settings'

import { loadImages } from './utils'
import { inBounds, delta } from './geometry'

import {
  T_HEALTH, T_FOOD, API_STATE, ST_COLOR, ST_DISPLAY_ITEM, DISPLAY_TYPE,
  DTYPE_MAP, DTYPE_IMAGE, DISPLAY_NAME, DTYPE_MESSAGE, DISPLAY_MESSAGE,
  MAP_TILES, MAP_PLAYERX, MAP_PLAYERY, ST_PLAYER_HEALTH, ST_PLAYER_FACING,
  ST_PLAYER_FOOD, API_TIMESTR, API_MOVE, API_CLOSE, DTYPE_SCREEN, MAP_TYPE,
  MAP_STARTX, MAP_STARTY, MT_ISLAND, S_SKELETON, S_BOAT_LEFT, S_BOAT_RIGHT,
  ST_MONSTERS, ST_HOURS, MON_X, MON_Y, MON_FACING, S_MONSTER, MON_HEALTH,
  SCREEN_MESSAGE, SCREEN_OPTIONS, OPTION_MESSAGE, SCREEN_SELECTION, API_SELECT,
  API_CONFIRM_SELECT,
  T_KEY,
  ST_PLAYER_KEYS,
  T_CHIP,
  T_DISK,
  ST_PLAYER_CHIPS,
  ST_PLAYER_DISKS,
  T_BLACK,
  T_LAND,
  DTYPE_COMPUTER_MAP,
  T_WATER,
  T_SEA,
  T_MOUNTAINS,
  T_MOUNTAINS_L,
  C_PLAYER,
  T_HUT,
  C_HUT,
  T_RUINS,
  T_RUINS_L,
  C_RUINS,
  T_SATELLITE,
  C_SATELLITE,
  COMPUTER_MAP_MAPDB,
  ST_SEEN,
  T_FOG,
  T_SAND,
  T_SAND_L,
  T_PORTAL,
  C_PORTAL
} from './indices'

import { Game } from './game'
import { DisplayMap, DisplayScreen, Point, DisplayComputerMap } from './types'
import { blocks } from './map';

declare const c: HTMLCanvasElement

const draw = ( time: number ) => {
  const color = api[ API_STATE ]()[ ST_COLOR ]
  const displayItem = api[ API_STATE ]()[ ST_DISPLAY_ITEM ]

  c.className = color
  c.width = c.height = tileSize * canvasTiles

  if( displayItem[ DISPLAY_TYPE ] === DTYPE_MAP ){
    drawMap( time )
    drawUi()
  }

  if( displayItem[ DISPLAY_TYPE ] === DTYPE_IMAGE ){
    if( displayItem[ DISPLAY_NAME ] === 's.png' ){
      ctx.drawImage( splash, 0, 0 )
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

  requestAnimationFrame( draw )
}

const drawChar = ( ch = '', tx = 0, ty = 0 ) =>
  ctx.drawImage(
    font,
    ( ch.charCodeAt( 0 ) - 32 ) * fontSize, 0,
    fontSize, fontSize,
    tx * fontSize, ty * fontSize,
    fontSize, fontSize
  )

const drawText = ( str = '', tx = 0, ty = 0 ) => {
  for ( let i = 0; i < str.length; i++ )
    drawChar( str[ i ], tx + i, ty )
}

const drawMessage = ( lines: string[] ) => {
  const dy = ~~( (fontTiles - lines.length ) / 2 )

  for( let y = 0; y < lines.length; y++ ){
    const dx = ~~( (fontTiles - lines[ y ].length ) / 2 )
    drawText( lines[ y ], dx, dy + y )
  }
}

const drawScreen = ( screen: DisplayScreen ) => {
  for( let y = 0; y < screen[ SCREEN_MESSAGE ].length; y++ ){
    drawText( screen[ SCREEN_MESSAGE ][ y ], 0, y )
  }

  drawText( '<X>', fontTiles - 3, 0 )

  const optionOffset = screen[ SCREEN_MESSAGE ].length % 2 ? 1 : 0

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

const drawMap = ( time: number ) => {
  const currentFrame = ~~( time / animTime ) % 2 ? 0 : 1
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
  const seen = api[ API_STATE ]()[ ST_SEEN ]
  const isNight = api[ API_STATE ]()[ ST_HOURS ] >= sunset || api[ API_STATE ]()[ ST_HOURS ] < sunrise

  for ( let y = 0; y < viewTiles; y++ ) {
    for ( let x = 0; x < viewTiles; x++ ) {
      const mapX = ( playerX - centerTile ) + x
      const mapY = ( playerY - centerTile ) + y

      // assume water, set to either 0 or 1 depending on currentFrame
      let sx = currentFrame * tileSize

      // bounds check
      if ( inBounds( [ mapX, mapY ] ) ) {
        const tileIndex = map[ mapY ][ mapX ]

        // if not water, use the tileIndex
        if ( tileIndex ) sx = tileIndex * tileSize
      }

      ctx.drawImage(
        tiles,
        sx, 0,
        tileSize, tileSize,
        ( x + 1 ) * tileSize, ( y + 1 ) * tileSize,
        tileSize, tileSize
      )

      if ( mapType === MT_ISLAND && isNight ){
        for ( let i = 0; i < monsters.length; i++ ) {
          const monster = monsters[ i ]
          const mx = monster[ MON_X ]
          const my = monster[ MON_Y ]
          const monsterFacing = monster[ MON_FACING ]

          if( mx === mapX && my === mapY && monster[ MON_HEALTH ] > 0 ){
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

      if ( x === centerTile && y === centerTile ) {
        if ( playerHealth ) {
          sx = ( currentFrame * tileSize ) + ( playerFacing * tileSize * 2 )
        } else {
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

const drawUi = () => {
  const playerFood = api[ API_STATE ]()[ ST_PLAYER_FOOD ]
  const playerHealth = api[ API_STATE ]()[ ST_PLAYER_HEALTH ]
  const playerKeys = api[ API_STATE ]()[ ST_PLAYER_KEYS ]
  const playerChips = api[ API_STATE ]()[ ST_PLAYER_CHIPS ]
  const playerDisks = api[ API_STATE ]()[ ST_PLAYER_DISKS ]

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
    0, tileSize * 2,
    tileSize, tileSize
  )

  drawText( `${ playerFood }`, playerFood < 10 ? 0.5 : 0, 6 )

  ctx.drawImage(
    tiles,
    T_KEY * tileSize, 0,
    tileSize, tileSize,
    0, tileSize * 4,
    tileSize, tileSize
  )

  drawText( `${ playerKeys }`, playerKeys < 10 ? 0.5 : 0, 10 )

  ctx.drawImage(
    tiles,
    T_CHIP * tileSize, 0,
    tileSize, tileSize,
    0, tileSize * 6,
    tileSize, tileSize
  )

  drawText( `${ playerChips }`, playerChips < 10 ? 0.5 : 0, 14 )

  ctx.drawImage(
    tiles,
    T_DISK * tileSize, 0,
    tileSize, tileSize,
    0, tileSize * 8,
    tileSize, tileSize
  )

  drawText( `${ playerDisks }`, playerDisks < 10 ? 0.5 : 0, 18 )
}

const drawComputerMap = () => {
  const mapItem = <DisplayComputerMap>api[ API_STATE ]()[ ST_DISPLAY_ITEM ]
  const seen = api[ API_STATE ]()[ ST_SEEN ]
  const playerX = mapItem[ MAP_PLAYERX ]
  const playerY = mapItem[ MAP_PLAYERY ]
  const map = mapItem[ MAP_TILES ]
  const mapDb = mapItem[ COMPUTER_MAP_MAPDB ]

  for( let y = 0; y < mapSize; y++ ){
    for( let x = 0; x < mapSize; x++ ){
      const gridX = ~~( x / gridSize )
      const gridY = ~~( y / gridSize )
      const tile = map[ y ][ x ]
      const isSand = tile >= T_SAND && tile < T_SAND + T_SAND_L
      if( mapDb[ gridY * gridTiles + gridX ] ){       
        if ( tile === T_SEA || ( !seen[ y * mapSize + x ] && !isSand ) ){
          ctx.drawImage(
            tiles,
            T_BLACK * tileSize, 0,
            1, 1,
            x, y,
            1, 1
          )
        } else {
          ctx.drawImage(
            tiles,
            T_LAND * tileSize, 0,
            1, 1,
            x, y,
            1, 1
          )
        } 
      } else {
        if( x > fontSize && y > fontSize && ( ( x % 2 && !( y % 2 ) ) || ( !( x % 2 ) && y % 2 ) ) ){
          ctx.drawImage(
            tiles,
            T_LAND * tileSize, 0,
            1, 1,
            x, y,
            1, 1
          )
        }
      }
    }
  }
  for ( let y = 0; y < mapSize; y++ ) {
    for ( let x = 0; x < mapSize; x++ ) {
      const gridX = ~~( x / gridSize )
      const gridY = ~~( y / gridSize )
      const tile = map[ y ][ x ]
      if( mapDb[ gridY * gridTiles + gridX ] ){
        if ( tile === T_HUT ) {
          ctx.drawImage(
            computerIcons,
            C_HUT * computerIconSize, 0,
            computerIconSize, computerIconSize,
            x - 3, y - 3,
            computerIconSize, computerIconSize
          )
        }
        if ( tile >= T_RUINS && tile < T_RUINS + T_RUINS_L ) {
          ctx.drawImage(
            computerIcons,
            C_RUINS * computerIconSize, 0,
            computerIconSize, computerIconSize,
            x - 3, y - 3,
            computerIconSize, computerIconSize
          )
        }
        if ( tile === T_SATELLITE ) {
          ctx.drawImage(
            computerIcons,
            C_SATELLITE * computerIconSize, 0,
            computerIconSize, computerIconSize,
            x - 3, y - 3,
            computerIconSize, computerIconSize
          )
        }
        if ( tile === T_PORTAL ) {
          ctx.drawImage(
            computerIcons,
            C_PORTAL * computerIconSize, 0,
            computerIconSize, computerIconSize,
            x - 3, y - 3,
            computerIconSize, computerIconSize
          )
        }
        if( x === playerX && y === playerY ){
          ctx.drawImage(
            computerIcons,
            C_PLAYER * computerIconSize, 0,
            computerIconSize, computerIconSize,
            x - 3, y - 3,
            computerIconSize, computerIconSize
          )
        }
      }
    }
  }
  for( let y = 0; y < gridSize; y++ ){
    ctx.drawImage(
      font,
      ( 16 + y ) * fontSize, 0,
      fontSize, fontSize,
      0, y * gridSize + ~~( gridSize / 2 ), 
      fontSize, fontSize
    )
  }
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

const ctx = c.getContext( '2d' )!
let font: HTMLImageElement
let tiles: HTMLImageElement
let player: HTMLImageElement
let splash: HTMLImageElement
let computerIcons: HTMLImageElement
let api = Game()

document.onkeyup = e => {
  const displayItem = api[ API_STATE ]()[ ST_DISPLAY_ITEM ]

  if ( displayItem[ DISPLAY_TYPE ] === DTYPE_MAP ) {
    keyHandlerMap( e )
  }

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

const clickOrTouch = ( [ x, y ]: Point ) => {
  const displayItem = api[ API_STATE ]()[ ST_DISPLAY_ITEM ]
  const tileSize = c.getBoundingClientRect().width / canvasTiles
  const tx = ~~( ( x - c.getBoundingClientRect().left ) / tileSize ) - 1
  const ty = ~~( ( y - c.getBoundingClientRect().top ) / tileSize ) - 1

  if ( displayItem[ DISPLAY_TYPE ] === DTYPE_MAP ) {
    if ( tx === centerTile && ty === centerTile ) {
      // tapped on player
      return
    }

    if ( tx < 0 || ty < 0 ) {
      //tapped an interface tile
      return
    }

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

  if (
    displayItem[ DISPLAY_TYPE ] === DTYPE_IMAGE ||
    displayItem[ DISPLAY_TYPE ] === DTYPE_MESSAGE ||
    displayItem[ DISPLAY_TYPE ] === DTYPE_COMPUTER_MAP
  ) {
    api[ API_CLOSE ]()
  }

  if ( displayItem[ DISPLAY_TYPE ] === DTYPE_SCREEN ) {
    if ( ty < 0 ) {
      api[ API_CLOSE ]()
    }

    const screen = <DisplayScreen>displayItem
    const optionOffset = screen[ SCREEN_MESSAGE ].length % 2 ? 1 : 0
    const selectionStartY = ( screen[ SCREEN_MESSAGE ].length + optionOffset ) / 2
    const selectionSize = screen[ SCREEN_OPTIONS ].length
    const selection = ty - selectionStartY + 1

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

  for ( let i = 0; i < e.changedTouches.length; i++ ) {
    clickOrTouch( [ e.changedTouches[ i ].clientX, e.changedTouches[ i ].clientY ] )
  }
}

c.onclick = e => {
  e.preventDefault()

  clickOrTouch( [ e.clientX, e.clientY ] )
}

loadImages( 'f.gif', 't.gif', 'p.gif', 's.png', 'c.gif' ).then( imgs => {
  [ font, tiles, player, splash, computerIcons ] = imgs
  requestAnimationFrame( draw )
} )
