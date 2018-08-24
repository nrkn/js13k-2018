import {
  animTime, tileSize, canvasTiles, viewTiles, centerTile
} from './settings'

import { loadImages } from './utils'
import { inBounds } from './geometry'

import {
  T_HEALTH, T_FOOD, API_STATE, ST_COLOR, ST_DISPLAY_ITEM, DISPLAY_TYPE,
  DTYPE_MAP, DTYPE_IMAGE, DISPLAY_NAME, DTYPE_MESSAGE, DISPLAY_MESSAGE,
  MAP_TILES, MAP_PLAYERX, MAP_PLAYERY, ST_PLAYER_HEALTH, ST_PLAYER_FACING,
  ST_PLAYER_FOOD, API_TIMESTR, API_MOVE, API_CLOSE, DTYPE_SCREEN
} from './indices'

import { Game } from './game'
import { DisplayMap } from './types'

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

  requestAnimationFrame( draw )
}

const drawChar = ( ch = '', tx = 0, ty = 0 ) =>
  ctx.drawImage( font, ( ch.charCodeAt( 0 ) - 32 ) * 8, 0, 8, 8, tx * 8, ty * 8, 8, 8 )

const drawText = ( str = '', tx = 0, ty = 0 ) => {
  for ( let i = 0; i < str.length; i++ )
    drawChar( str[ i ], tx + i, ty )
}

const drawMessage = ( lines: string[] ) => {
  const dy = ~~( ( canvasTiles * 2 - lines.length ) / 2 )

  for( let y = 0; y < lines.length; y++ ){
    const dx = ~~( ( canvasTiles * 2 - lines[ y ].length ) / 2 )
    drawText( lines[ y ], dx, dy + y )
  }
}

const drawMap = ( time: number ) => {
  const currentFrame = ~~( time / animTime ) % 2 ? 0 : 1
  const mapItem = <DisplayMap>api[ API_STATE ]()[ ST_DISPLAY_ITEM ]
  const map = mapItem[ MAP_TILES ]
  const playerX = mapItem[ MAP_PLAYERX ]
  const playerY = mapItem[ MAP_PLAYERY ]
  const playerHealth = api[ API_STATE ]()[ ST_PLAYER_HEALTH ]
  const playerFacing = api[ API_STATE ]()[ ST_PLAYER_FACING ]

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

      if ( x === centerTile && y === centerTile ) {
        if ( playerHealth ) {
          sx = ( currentFrame * tileSize ) + ( playerFacing * tileSize * 2 )
        } else {
          sx = 4 * tileSize
        }

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
}

const drawUi = () => {
  const playerFood = api[ API_STATE ]()[ ST_PLAYER_FOOD ]
  const playerHealth = api[ API_STATE ]()[ ST_PLAYER_HEALTH ]

  drawText( `RANGER DOWN   ${ api[ API_TIMESTR ]() }`, 0.5, 0.5 )

  ctx.drawImage(
    tiles,
    T_HEALTH * tileSize, 0,
    tileSize, tileSize,
    0, tileSize,
    tileSize, tileSize
  )

  drawText( `${ playerHealth }`, playerHealth < 10 ? 0.5 : 0, 4 )

  ctx.drawImage(
    tiles,
    T_FOOD * tileSize, 0,
    tileSize, tileSize,
    0, tileSize * 3,
    tileSize, tileSize
  )

  drawText( `${ playerFood }`, playerFood < 10 ? 0.5 : 0, 8 )
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
let api = Game()

document.onkeyup = e => {
  const displayItem = api[ API_STATE ]()[ ST_DISPLAY_ITEM ]

  if ( displayItem[ DISPLAY_TYPE ] === DTYPE_MAP ) {
    keyHandlerMap( e )
  }

  if ( displayItem[ DISPLAY_TYPE ] === DTYPE_IMAGE || displayItem[ DISPLAY_TYPE ] === DTYPE_MESSAGE ) {
    if ( e.keyCode === 32 || e.keyCode === 27 || e.keyCode === 13 ) {
      api[ API_CLOSE ]()
    }
  }

  if ( displayItem[ DISPLAY_TYPE ] === DTYPE_SCREEN ) {
    // close, change selection, confirm selection
  }
}

c.ontouchend = () => {
  const displayItem = api[ API_STATE ]()[ ST_DISPLAY_ITEM ]

  if ( displayItem[ DISPLAY_TYPE ] === DTYPE_MAP ) {
    // todo
  }

  if ( displayItem[ DISPLAY_TYPE ] === DTYPE_IMAGE || displayItem[ DISPLAY_TYPE ] === DTYPE_MESSAGE ) {
    api[ API_CLOSE ]()
  }

  if ( displayItem[ DISPLAY_TYPE ] === DTYPE_SCREEN ) {
    // close, change selection, confirm selection
  }
}

loadImages( 'f.gif', 't.gif', 'p.gif', 's.png' ).then( imgs => {
  [ font, tiles, player, splash ] = imgs
  requestAnimationFrame( draw )
} )
