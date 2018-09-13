const Jimp = require( 'jimp' )

import { mapSize, tileSize } from './settings'
import { createIsland } from './map'
import {
  MAP_TILES, T_GRASS, T_GRASS_L, T_TREE, T_TREE_L, MAP_PLAYERX, MAP_PLAYERY,
  T_SAND, T_SAND_L, T_HUT, T_MOUNTAINS, T_MOUNTAINS_L, T_RUINS, T_RUINS_L,
  T_LAND, T_RANGER, T_SATELLITE, T_PORTAL
} from './indices'

const start = process.hrtime()
const mapData = createIsland([[]],[[]],[[]])
const end = process.hrtime( start )

console.log( `time: ${ end[ 0 ] }s ${ end[ 1] / 1000000 }ms` )

const map = mapData[ MAP_TILES ]
const playerX = mapData[ MAP_PLAYERX ]
const playerY = mapData[ MAP_PLAYERY ]

new Jimp( mapSize, mapSize, ( err, image ) => {
  if ( err ) {
    throw err
  }

  for ( let y = 0; y < mapSize; y++ ) {
    for ( let x = 0; x < mapSize; x++ ) {
      let color = Jimp.rgbaToInt( 255, 0, 255, 255 )

      if ( map[ y ][ x ] === 0 ) {
        color = Jimp.rgbaToInt( 0, 0, 255, 255 )
      }

      if ( map[ y ][ x ] === 1 ) {
        color = Jimp.rgbaToInt( 0, 0, 0, 255 )
      }

      if ( map[ y ][ x ] === T_LAND ) {
        color = Jimp.rgbaToInt( 96, 255, 96, 255 )
      }

      if ( map[ y ][ x ] >= T_GRASS && map[ y ][ x ] < T_GRASS + T_GRASS_L ) {
        color = Jimp.rgbaToInt( 32, 192, 96, 255 )
      }

      if ( map[ y ][ x ] >= T_TREE && map[ y ][x ] < T_TREE + T_TREE_L ) {
        color = Jimp.rgbaToInt( 0, 128, 0, 255 )
      }

      if ( map[ y ][ x ] >= T_SAND && map[ y ][ x ] < T_SAND + T_SAND_L ) {
        color = Jimp.rgbaToInt( 255, 255, 0, 255 )
      }

      if ( map[ y ][ x ] >= T_MOUNTAINS && map[ y ][ x ] < T_MOUNTAINS + T_MOUNTAINS_L ) {
        color = Jimp.rgbaToInt( 128, 64, 0, 255 )
      }

      if ( map[ y ][ x ] >= T_RUINS && map[ y ][ x ] < T_RUINS + T_RUINS_L ) {
        color = Jimp.rgbaToInt( 192, 192, 192, 255 )
      }

      if ( map[ y ][ x ] >= T_SAND && map[ y ][ x ] < T_SAND + T_SAND_L ) {
        color = Jimp.rgbaToInt( 192, 192, 0, 255 )
      }

      if ( map[ y ][ x ] === T_HUT ) {
        color = Jimp.rgbaToInt( 255, 255, 255, 255 )
      }

      if ( map[ y ][ x ] === T_RANGER ) {
        color = Jimp.rgbaToInt( 255, 128, 0, 255 )
      }

      if ( map[ y ][ x ] === T_SATELLITE ) {
        color = Jimp.rgbaToInt( 0, 255, 255, 255 )
      }

      if ( map[ y ][ x ] === T_PORTAL ) {
        color = Jimp.rgbaToInt( 128, 0, 255, 255 )
      }

      if ( x === playerX && y === playerY ) {
        color = Jimp.rgbaToInt( 255, 0, 0, 255 )
      }

      image.setPixelColor( color, x, y )
    }
  }

  image.write( './debug/island.png' )
} )

// async image loader
const loadImage = ( path: string ) => Jimp.read( path )

// load a series of images
const loadImages = ( ...paths: string[] ) => Promise.all( paths.map( loadImage ) )

loadImages( './dist/f.gif', './dist/t.gif', './dist/p.gif', './dist/s.png', './dist/c.gif' ).then( imgs => {
  const [ font, tiles, player, splash, computerIcons ] = imgs

  // big map
  new Jimp( mapSize * tileSize, mapSize * tileSize, ( err, image ) => {
    if ( err ) {
      throw err
    }
    for( let mapY = 0; mapY < mapSize; mapY++ ){
      for( let mapX = 0; mapX < mapSize; mapX++ ){
        const tileIndex = map[ mapY ][ mapX ]

        image.blit( 
          tiles,
          mapX * tileSize, mapY * tileSize,
          tileIndex * tileSize, 0,
          tileSize, tileSize
        )
      }
    }

    image.write( './debug/map.png' )
  }) 
} )

