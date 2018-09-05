import { Point, MapTiles, Edge, FloodPoint } from './types'
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

export const getImmediateNeighbours = ( tiles: MapTiles, p: Point, tileIndex: number ) =>
  immediateNeighbours( p ).filter( p => tiles[ p[ Y ] ][ p[ X ] ] === tileIndex )

export const withinDist = ( tiles: Point[], [ x , y ]: Point, min: number, max: number ) => {
  const candidates = tiles.filter( ( [ tx, ty ] ) => {
    return delta( tx, x ) >= min &&
      delta( ty, y ) >= min &&
      delta( tx, x ) <= max &&
      delta( ty, y ) <= max
  })

  return <Point>pick( candidates )
}

export const dist = ( [ x1, y1 ]: Point, [ x2, y2 ]: Point ) =>
  Math.hypot( delta( x1, x2 ), delta( y1, y2 ) )

export const nearest = ( p1: Point, points: Point[] ) => {
  let d = mapSize * mapSize
  let p

  for( let i = 0; i < points.length; i++ ){
    const currentDist = dist( p1, points[ i ] )
    if( currentDist < d ){
      d = currentDist
      p = points[ i ]
    }
  }

  return p
}

export const unique = ( points: Point[] ) => {
  const result: Point[] = []
  const cache: number[] = []

  for( let i = 0; i < points.length; i++ ){
    const [ x, y ] = points[ i ]
    if( !cache[ y * mapSize + x ] ){
      result.push( points[ i ] )
      cache[ y * mapSize + x ] = 1
    }
  }

  console.log( 'unique', points.length, result.length  )
  
  return result
}

export const floodFill = ( [ x, y ]: Point, canFlood: ( p: Point ) => boolean ) => {
  const flooded: FloodPoint[] = []
  const queue: FloodPoint[] = [ [ x, y, 0 ] ]
  const cache: number[] = []

  const floodPoint = ( [ x, y, d ]: FloodPoint ) => {
    if ( !inBounds( [ x, y ] ) ) return
    if ( !canFlood( [ x, y ] ) ) return
    if ( cache[ y * mapSize + x ] ) return

    flooded.push( [ x, y, d ] )
    cache[ y * mapSize + x ] = 1

    queue.push(
      ...immediateNeighbours( [ x, y ] ).map(
        ( [ x, y ] ) =>
          <FloodPoint>[ x, y, d + 1 ]
      )
    )
  }

  while ( queue.length ) {
    floodPoint( queue.shift()! )
  }

  return flooded
}

const findTile = ( tiles: Point[] | FloodPoint[], [ x, y ] ) => {
  for( let i = 0; i < tiles.length; i++ ){
    if( tiles[ i ][ X ] === x && tiles[ i ][ Y ] === y ) return tiles[ i ]
  }
}

export const findPath = ( flood: FloodPoint[], [ x2, y2 ] ) => {
  const path: Point[] = []

  const [ x1, y1 ] = flood[ 0 ]
  const end = findTile( flood, [ x2, y2 ] )

  if( !end ) return path

  const queue: FloodPoint[] = [ <FloodPoint>end ]

  const connectNext = ( [ x, y, min ]: FloodPoint ) => {
    path.unshift( [ x, y ] )

    if ( x === x1 && y === y1 ) return

    const neighbours = immediateNeighbours( [ x, y ] )
    let n
    neighbours.forEach( ( [ x, y ] ) => {
      const t = flood.find( ( [ fx, fy ] ) => fx === x && fy === y )
      if ( t ) {
        const [ ,, d ] = t
        if ( d < min ) {
          min = d
          n = t
        }
      }
    } )

    if ( n ) queue.push( n )
  }

  while ( queue.length ) {
    connectNext( queue.shift()! )
  }

  return path
}

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
  const cache: number[] = []

  const step = ( [ x, y ]: Point ) => {
    if ( !cache[ y * mapSize + x ] ){
      steps.push( [ x, y ] )
      cache[ y * mapSize + x ] = 1
    }
     

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
    const neighbours = getImmediateNeighbours( mapTiles, [ cx, cy ], T_WATER ).filter( inWaterBorder )

    if ( neighbours.length ) {
      const [ nx, ny ] = pick( neighbours )
      if( !hasPoint( landTiles, [ nx, ny ] ) ){
        landTiles.push( [ nx, ny ] )
        mapTiles[ ny ][ nx ] = T_LAND
      }
    }
  }
}

export const expanded = ( points: Point[], tileCount = ~~( ( mapSize * mapSize ) * 0.33 ) ) => {
  const expandedPoints = points.slice()
  const cache: number[] = []
  for( let i = 0; i < expandedPoints.length; i++ ){
    const [ x, y ] = expandedPoints[ i ]
    cache[ y * mapSize + x ] = 1 
  }

  while( expandedPoints.length < tileCount ){
    const [ cx, cy ] = pick( expandedPoints )
    const neighbours = immediateNeighbours( [ cx, cy ] )

    if ( neighbours.length ) {
      const [ nx, ny ] = pick( neighbours )
      if( !cache[ ny * mapSize + nx ] ){
        expandedPoints.push( [ nx, ny ] )
        cache[ ny * mapSize + nx ] = 1
      }
    }
  }

  return expandedPoints
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

export const leftMost = ( tiles: Point[] | FloodPoint[] ) => {
  let left = mapSize
  let p: Point = [ 0, 0 ]

  for( let i = 0; i < tiles.length; i++ ){
    const [ x, y ] = tiles[ i ]
    if( x < left ){
      left = x
      p = [ x, y ]
    }
  }

  return p
}

export const hasPoint = ( tiles: Point[] | FloodPoint[], [ x, y ]: Point | FloodPoint ) => {
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
