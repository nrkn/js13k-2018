import { T_TREE, DTYPE_MAP, Y, X, T_LAND, T_WATER, TOP, RIGHT, BOTTOM, LEFT, T_SEA, T_PATH, T_PATH_L, T_SAND_L, T_SAND, T_HUT, T_BLACK, T_HUT_L, T_HUT_M, T_HUT_R, T_COMPUTER, T_SYNTH, T_BED } from './indices'
import { mapSize, gridSize, gridTiles, landBorder } from './settings'
import { MapTiles, MapRow, DisplayMap, Point, FloodPoint } from './types'
import { randInt, pick } from './utils'
import {
  drunkenWalk, randomPointInLandBorder, inWaterBorder, expandLand,
  findTilePoints, randomLandEdge, floodFill, leftMost, findPath,
  getImmediateNeighbours,
  hasPoint,
  withinDist,
  allNeighbours
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

export const drawTilesToMap = ( tiles: MapTiles, points: Point[] | FloodPoint[], getTileIndex: ( p: Point ) => number ) => {
  for( let i = 0; i < points.length; i++ ){
    const [ px, py ] = points[ i ]
    tiles[ py ][ px ] = getTileIndex( [ px, py ] )
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

export const createHut = (): DisplayMap => {
  const tiles = createMap()
  const black = floodFill( [ 0, 0 ], ( [ tx, ty ] ) => tiles[ ty ][ tx ] === T_WATER )
  drawTilesToMap( tiles, black, () => T_BLACK )

  tiles[ landBorder - 1 ][ landBorder - 2 ] = T_COMPUTER
  tiles[ landBorder - 1 ][ landBorder - 1 ] = T_SYNTH
  tiles[ landBorder - 1 ][ landBorder ] = T_BED
  tiles[ landBorder ][ landBorder - 2 ] = T_LAND
  tiles[ landBorder ][ landBorder - 1 ] = T_LAND
  tiles[ landBorder ][ landBorder ] = T_LAND
  tiles[ landBorder + 1 ][ landBorder - 2 ] = T_HUT_L
  tiles[ landBorder + 1 ][ landBorder - 1 ] = T_HUT_M
  tiles[ landBorder + 1 ][ landBorder ] = T_HUT_R

  return [ DTYPE_MAP, landBorder, landBorder, tiles ]
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

  const sea = floodFill( [ 0, 0 ], ( [ tx, ty ] ) => tiles[ ty ][ tx ] === T_WATER )

  drawTilesToMap( tiles, sea, () => T_SEA )

  decorate( tiles, clear )

  const [ playerX, playerY ] = leftMost( land )

  let r
  while( !r ){
    r = withinDist( clear, [ playerX, playerY ], randInt( 5 ) + 10, randInt( 5 ) + 20 )
  }
  const [ rangerX, rangerY ] = r

  const [ hutX, hutY ] = withinDist( clear, [ rangerX, rangerY ], randInt( 5 ) + 10, randInt( 5 ) + 20 )

  const waypoints: Point[] = [
    [ playerX, playerY ],
    [ rangerX, rangerY ],
    [ hutX, hutY ]
  ]

  const waypointCount = 15

  while ( waypoints.length < waypointCount ){
    const [ px, py ] = pick( waypoints )
    const gx = randInt( gridTiles ) * gridSize
    const gy = randInt( gridTiles ) * gridSize
    const w = withinDist( clear, [ gx, gy ], 1, gridSize )
    const flood = floodFill( [ px, py ], ( [ tx, ty ] ) => tiles[ ty ][ tx ] !== T_SEA )
    if ( w && flood.length ) {
      const pathToNext = findPath( flood, w )
      waypoints.push( w )
      drawTilesToMap( tiles, pathToNext, ( [ wx, wy ] ) => {
        if ( tiles[ wy ][ wx ] >= T_SAND && tiles[ wy ][ wx ] < T_SAND + T_SAND_L ){
          return tiles[ wy ][ wx ]
        }
        return T_LAND
      })
    }
  }

  for( let i = 2; i < waypointCount; i++ ){
    const [ wx, wy ] = waypoints[ i ]
    // const neighbours = allNeighbours( [ wx, wy ] )
    // for( let n = 0; n < neighbours.length; n++ ){
    //   const [ nx, ny ] = neighbours[ n ]
    //   if( blocks( tiles[ ny ][ nx ] ) ) tiles[ ny ][ nx ] = T_LAND
    // }
    tiles[ wy ][ wx ] = T_HUT
  }

  return [ DTYPE_MAP, playerX, playerY, tiles ]
}

export const blocks = i =>
  i < 2 || i === T_TREE || i === T_HUT || i === T_BLACK || i === T_HUT_L ||
  i === T_HUT_M || i === T_HUT_R || i === T_COMPUTER || i === T_SYNTH ||
  i === T_BED
