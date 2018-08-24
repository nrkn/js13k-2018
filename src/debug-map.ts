const Jimp = require( 'jimp' )

import { mapSize } from './settings'
import { createIsland } from './map'
import {
  MAP_TILES, T_PATH, T_PATH_L, T_GRASS, T_GRASS_L, T_TREE, MAP_PLAYERX,
  MAP_PLAYERY
} from './indices'

const mapData = createIsland()
const map = mapData[ MAP_TILES ]
const playerX = mapData[ MAP_PLAYERX ]
const playerY = mapData[ MAP_PLAYERY ]

new Jimp( mapSize, mapSize, ( err, image ) => {
  if ( err ) {
    throw err
  }

  for ( let y = 0; y < mapSize; y++ ) {
    for ( let x = 0; x < mapSize; x++ ) {
      let color = Jimp.rgbaToInt( 0, 0, 0, 255 )

      if ( map[ y ][ x ] === 0 ) {
        color = Jimp.rgbaToInt( 0, 0, 255, 255 )
      }

      if ( map[ y ][ x ] === 1 ) {
        color = Jimp.rgbaToInt( 255, 0, 255, 255 )
      }

      if ( map[ y ][ x ] === 2 ) {
        color = Jimp.rgbaToInt( 128, 255, 128, 255 )
      }

      if ( map[ y ][ x ] >= T_PATH && map[ y ][ x ] < T_PATH + T_PATH_L ) {
        color = Jimp.rgbaToInt( 128, 128, 128, 255 )
      }

      if ( map[ y ][ x ] >= T_GRASS && map[ y ][ x ] < T_GRASS + T_GRASS_L ) {
        color = Jimp.rgbaToInt( 32, 255, 64, 255 )
      }

      if ( map[ y ][ x ] === T_TREE ) {
        color = Jimp.rgbaToInt( 0, 128, 0, 255 )
      }

      if ( x === playerX && y === playerY ) {
        color = Jimp.rgbaToInt( 0, 255, 0, 255 )
      }

      image.setPixelColor( color, x, y )
    }
  }

  image.write( './debug/island.png' )
} )