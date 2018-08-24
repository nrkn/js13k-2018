import { T_TREE, DTYPE_MAP, Y, X, T_LAND, T_WATER, TOP, RIGHT, BOTTOM, LEFT } from './indices'
import { mapSize } from './settings'
import { MapTiles, MapRow, DisplayMap, Point } from './types'
import { randInt } from './utils'
import { drunkenWalk, randomPointInLandBorder, inWaterBorder, expandLand, findTilePoints, randomLandEdge } from './geometry'

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

export const drawTilesToMap = ( tiles: MapTiles, points: Point[], tileIndex: number ) => {
  for( let i = 0; i < points.length; i++ ){
    const point = points[ i ]
    tiles[ point[ Y ] ][ point[ X ] ] = tileIndex
  }
}

export const createIsland = (): DisplayMap => {
  const tiles = createMap()
  const playerX = ~~( mapSize / 2 )
  const playerY = ~~( mapSize / 2 )

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

    drawTilesToMap( tiles, steps, T_LAND )
  }

  const land = findTilePoints( tiles, T_LAND )

  expandLand( tiles, land )

  return [ DTYPE_MAP, playerX, playerY, tiles ]
}

export const blocks = i => i < 2 || i === T_TREE
