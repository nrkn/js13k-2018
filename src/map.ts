import { T_TREE, DTYPE_MAP, Y, X, T_LAND, T_WATER, TOP, RIGHT, BOTTOM, LEFT, T_SEA, T_PATH, T_PATH_L, T_SAND_L, T_SAND } from './indices'
import { mapSize } from './settings'
import { MapTiles, MapRow, DisplayMap, Point, FloodPoint } from './types'
import { randInt, pick } from './utils'
import {
  drunkenWalk, randomPointInLandBorder, inWaterBorder, expandLand,
  findTilePoints, randomLandEdge, floodFill, leftMost, findPath,
  getImmediateNeighbours,
  hasPoint
} from './geometry'

export const createMap = () => {
  const rows: MapTiles = []

  for ( let y = 0; y < mapSize; y++ ) {
    const row: MapRow = []
    for ( let x = 0; x < mapSize; x++ ) {
      row.push( T_WATER )
    }
    rows.push( row )
  }

  return rows
}

export const cloneMap = ( tiles: MapTiles ) => {
  const rows: MapTiles = []

  for ( let y = 0; y < mapSize; y++ ) {
    const row: MapRow = []
    for ( let x = 0; x < mapSize; x++ ) {
      row.push( tiles[ y ][ x ] )
    }
    rows.push( row )
  }

  return rows
}

export const drawTilesToMap = ( tiles: MapTiles, points: Point[] | FloodPoint[], getTileIndex: () => number ) => {
  for( let i = 0; i < points.length; i++ ){
    const point = points[ i ]
    tiles[ point[ Y ] ][ point[ X ] ] = getTileIndex()
  }
}

export const decorate = ( tiles: MapTiles, clear: Point[] ) => {
  for( let y = 0; y < mapSize; y++ ){
    for( let x = 0; x < mapSize; x++ ){
      if ( tiles[ y ][ x ] === T_LAND ){
        const neighbours = getImmediateNeighbours( tiles, [ x, y ], T_SEA )

        if ( neighbours.length ) {
          tiles[ y ][ x ] = randInt( T_SAND_L ) + T_SAND
        } else {
          if( hasPoint( clear, [ x, y ] ) ){
            // no trees
            tiles[ y ][ x ] = randInt( 6 ) + T_LAND
          } else {
            // all land tiles including trees
            tiles[ y ][ x ] = randInt( 7 ) + T_LAND
          }
        }
      }
      if( tiles[ y ][ x ] === T_WATER ){
        tiles[ y ][ x ] = randInt( 2 ) + ( T_TREE - 1 )
      }
    }
  }
}

export const createIsland = (): DisplayMap => {
  const tiles = createMap()

  const clearwayCount = randInt( 15, 10 )
  const clearways: Point[] = [
    randomLandEdge( TOP ),
    randomLandEdge( RIGHT ),
    randomLandEdge( BOTTOM ),
    randomLandEdge( LEFT )
  ]

  for( let i = 4; i < clearwayCount; i++ ){
    clearways.push( randomPointInLandBorder() )
  }

  for( let i = 1; i < clearwayCount; i++ ){
    const steps = drunkenWalk( clearways[ i - 1 ], clearways[ i ], inWaterBorder )

    drawTilesToMap( tiles, steps, () => T_LAND )
  }

  const land = findTilePoints( tiles, T_LAND )
  const clear = land.slice()

  expandLand( tiles, land )

  const sea = floodFill( tiles, 0, 0, T_WATER )

  drawTilesToMap( tiles, sea, () => T_SEA )

  const [ playerX, playerY ] = leftMost( land )

  const hut = pick( clear )
  const playerFlood = floodFill( tiles, playerX, playerY, T_LAND )
  const pathToHut = findPath( playerFlood, hut )

  drawTilesToMap( tiles, pathToHut, () => randInt( T_PATH_L ) + T_PATH )

  decorate( tiles, clear )

  return [ DTYPE_MAP, playerX, playerY, tiles ]
}

export const blocks = i => i < 2 || i === T_TREE
