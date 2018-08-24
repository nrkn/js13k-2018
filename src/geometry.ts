import { Point, MapTiles, Edge } from './types'
import { pick, randInt } from './utils'
import { mapSize, waterBorder, landBorder } from './settings'
import { X, Y, T_WATER, T_LAND, LEFT, RIGHT, TOP, BOTTOM } from './indices'

export const delta = ( i: number, j: number ) => Math.max( i, j ) - Math.min( i, j )

export const immediateNeighbours = ( [ x, y ]: Point ): Point[] => [
  [ x - 1, y ],
  [ x + 1, y ],
  [ x, y - 1 ],
  [ x, y + 1 ]
]

export const allNeighbours = ( [ x, y ]: Point ): Point[] => [
  [ x - 1, y ],
  [ x + 1, y ],
  [ x, y - 1 ],
  [ x, y + 1 ],
  [ x - 1, y - 1 ],
  [ x + 1, y - 1 ],
  [ x - 1, y + 1 ],
  [ x + 1, y + 1 ]
]

export const getImmediateWaterNeighbours = ( tiles: MapTiles, p: Point ) =>
  immediateNeighbours( p ).filter( p => tiles[ p[ Y ] ][ p[ X ] ] === T_WATER )

export const towards = ( [ x1, y1 ]: Point, [ x2, y2 ]: Point ): Point => {
  let dx = delta( x1, x2 )
  let dy = delta( y1, y2 )
  let x = x1
  let y = y1

  if ( dx > dy ) {
    if ( x2 > x1 ) {
      x = x1 + 1
    }
    if ( x1 > x2 ) {
      x = x1 - 1
    }
  }
  if ( dy > dx ) {
    if ( y2 > y1 ) {
      y = y1 + 1
    }
    if ( y1 > y2 ) {
      y = y1 - 1
    }
  }

  return [ x, y ]
}

export const drunkenWalk = ( [ x1, y1 ]: Point, [ x2, y2 ]: Point, allowed = inBounds, drunkenness = 0.66 ) => {
  const steps: Point[] = []

  const step = ( [ x, y ]: Point ) => {
    if ( !hasPoint( steps, [ x, y ] ) )
      steps.push( [ x, y ] )

    if( x === x2 && y === y2 ) return

    step(
      Math.random() < drunkenness ?
      pick( immediateNeighbours( [ x, y ] ).filter( allowed ) ) || [ x, y ] :
      towards( [ x, y ], [ x2, y2 ] )
    )
  }

  step( [ x1, y1 ] )

  return steps
}

export const expandLand = ( mapTiles: MapTiles, landTiles: Point[], tileCount = ~~( ( mapSize * mapSize ) * 0.2 ) ) => {
  while ( landTiles.length < tileCount ) {
    const [ cx, cy ] = pick( landTiles )
    const neighbours = getImmediateWaterNeighbours( mapTiles, [ cx, cy ] ).filter( inWaterBorder )

    if ( neighbours.length ) {
      const [ nx, ny ] = pick( neighbours )
      if( !hasPoint( landTiles, [ nx, ny ] ) ){
        landTiles.push( [ nx, ny ] )
        mapTiles[ ny ][ nx ] = T_LAND
      }
    }
  }
}

export const randomPoint = (): Point =>
  [ randInt( mapSize ), randInt( mapSize ) ]

export const randomLandEdge = ( edge: Edge ): Point =>
  [
    edge === LEFT ?
      landBorder :
      edge === RIGHT ?
      mapSize - landBorder :
      randInt( mapSize - landBorder * 2, landBorder ),
    edge === TOP ?
      landBorder :
      edge === BOTTOM ?
      mapSize - landBorder :
      randInt( mapSize - landBorder * 2, landBorder ),
  ]

export const randomPointInLandBorder = (): Point =>
  [
    randInt( mapSize - landBorder * 2, landBorder ),
    randInt( mapSize - landBorder * 2, landBorder )
  ]

export const hasPoint = ( tiles: Point[], [ x, y ]: Point ) => {
  for( let i = 0; i < tiles.length; i++ ){
    if( tiles[ i ][ X ] === x && tiles[ i ][ Y ] === y ) return true
  }
  return false
}

export const findTilePoints = ( mapTiles: MapTiles, tileIndex: number ) => {
  const tiles: Point[] = []

  for ( let y = 0; y < mapSize; y++ ) {
    for ( let x = 0; x < mapSize; x++ ) {
      if( mapTiles[ y ][ x ] === tileIndex ) tiles.push( [ x, y ] )
    }
  }

  return tiles
}

export const inBounds = ( [ x, y ] ) =>
  x >= 0 &&
  x <= mapSize - 1 &&
  y >= 0 &&
  y <= mapSize - 1

export const inWaterBorder = ( [ x, y ] ) =>
  x >= waterBorder &&
  x <= mapSize - waterBorder &&
  y >= waterBorder &&
  y <= mapSize - waterBorder

export const inLandBorder = ( [ x, y ] ) =>
  x >= landBorder &&
  x <= mapSize - landBorder &&
  y >= landBorder &&
  y <= mapSize - landBorder
