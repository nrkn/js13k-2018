import {
  T_TREE, DTYPE_MAP, T_LAND, T_WATER, TOP, RIGHT, BOTTOM, LEFT, T_SEA, T_SAND_L,
  T_SAND, T_HUT, T_BLACK, T_HUT_L, T_HUT_M, T_HUT_R, T_COMPUTER, T_SYNTH, T_BED,
  MT_ISLAND, MT_HUT, T_TREE_L, T_RUINS_L, T_RUINS, T_MOUNTAINS_L, T_MOUNTAINS, T_GRASS_L, T_PORTAL, T_SATELLITE, T_RANGER
} from './indices'
import { mapSize, gridSize, gridTiles, landBorder } from './settings'
import { MapTiles, MapRow, DisplayMap, Point, FloodPoint, HutState } from './types'
import { randInt, pick, shuffle } from './utils'
import {
  drunkenWalk, randomPointInLandBorder, inWaterBorder, expandLand,
  findTilePoints, randomLandEdge, floodFill, leftMost, findPath,
  getImmediateNeighbours, hasPoint, withinDist, nearest, unique, immediateNeighbours, allNeighbours, expanded, sortByDistance, dist
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

export const addBiomes = ( tiles: MapTiles ) => {
  let i = 0;
  const oneOfEachBiome = shuffle( [ 0, 3, 6, 9 ] )
  for( let y = 0; y < mapSize; y++ ){
    for( let x = 0; x < mapSize; x++ ){
      if( tiles[ y ][ x ] === T_WATER ){
        const flood = floodFill( [ x, y ], ( [ tx, ty ] ) => tiles[ ty ][ tx ] === T_WATER )

        let biome = 0

        if( flood.length > 5 ){
          if( i < 4 ){
            biome = oneOfEachBiome[ i ]
          } else {
            biome = randInt( 10 )
          }
          i++
        }

        // 0 1 2
        if( biome < 3 ){
          // meadow, no trees
          drawTilesToMap( tiles, flood, () =>
            randInt( T_GRASS_L + 1 ) + T_LAND
          )
        }
        // 3 4 5
        else if( biome < 6 ) {
          // 75% trees, 25% meadow
          drawTilesToMap( tiles, flood, () =>
            randInt( 3 ) ?
              randInt( T_TREE_L ) + T_TREE :
              randInt( T_GRASS_L + 1 ) + T_LAND
          )
        }
        // 6 7 8
        else if( biome < 9 ) {
          // 75% mountains, 25% meadow
          drawTilesToMap( tiles, flood, () =>
            randInt( 4 ) ?
              randInt( T_MOUNTAINS_L ) + T_MOUNTAINS :
              randInt( T_GRASS_L + 1 ) + T_LAND
          )
        } else {
          drawTilesToMap( tiles, flood, () => T_SEA )
        }
      }
    }
  }
}

export const decorate = ( tiles: MapTiles ) => {
  for( let y = 0; y < mapSize; y++ ){
    for( let x = 0; x < mapSize; x++ ){
      if ( tiles[ y ][ x ] === T_LAND ){
        const neighbours = getImmediateNeighbours( tiles, [ x, y ], T_SEA )

        if ( neighbours.length ) {
          tiles[ y ][ x ] = randInt( T_SAND_L ) + T_SAND
        } else {
          // The 1 is for the bare land tile: T_GRASS_L + T_TREE_L + 1
          tiles[ y ][ x ] = randInt( T_GRASS_L + T_TREE_L + 1 ) + T_LAND
        }
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

  return [ DTYPE_MAP, landBorder, landBorder, tiles, MT_HUT, landBorder, landBorder ]
}

export const createIsland = ( hutCache: HutState[] ): DisplayMap => {
  const tiles = createMap()

  // choose clearways (waypoints)
  const clearwayCount = randInt( 10, 40 )
  const clearways: Point[] = [
    randomLandEdge( TOP ),
    randomLandEdge( RIGHT ),
    randomLandEdge( BOTTOM ),
    randomLandEdge( LEFT )
  ]

  while( clearways.length < clearwayCount ){
    const clearway = randomPointInLandBorder()
    const near = nearest( clearway, clearways )
    if( dist( clearway, near ) > 10 ){
      clearways.push( clearway )
    }
  }

  // make paths between them
  const paths: Point[] = []
  const pathSegs = clearways.slice()
  let current = pathSegs.pop()!
  const start = current

  while( pathSegs.length ){
    const near = nearest( current, pathSegs )
    const steps = drunkenWalk( current, near, inWaterBorder, 0.33 )

    paths.push( ...steps )

    current = pathSegs.pop()!
  }

  const steps = drunkenWalk( current, start, inWaterBorder, 0.33 )
  paths.push( ...steps )

  for( let i = 0; i < 10; i++ ){
    const steps = drunkenWalk( pick( clearways ), pick( clearways ), inWaterBorder, 0.33 )
    paths.push( ...steps )
  }

  const clearings: Point[] = []
  for( let i = 0; i < clearways.length; i++ ){
    clearings.push( ...allNeighbours( clearways[ i ] ) )
  }

  const land = unique( [ ...clearways, ...clearings, ...paths ] )
  const expandedLand = expanded( land )

  const [ playerX, playerY ] = leftMost( expandedLand )

  drawTilesToMap( tiles, expandedLand, () => T_LAND )

  const sea = floodFill( [ 0, 0 ], ( [ tx, ty ] ) => tiles[ ty ][ tx ] === T_WATER )

  drawTilesToMap( tiles, sea, () => T_SEA )

  const waypoints = sortByDistance( [ playerX, playerY ], clearways )

  const playerSteps = drunkenWalk( [ playerX, playerY ], waypoints[ 0 ], inWaterBorder, 0.33 )
  paths.push( ...playerSteps )

  addBiomes( tiles )
  decorate( tiles )

  drawTilesToMap( tiles, paths, ( [ wx, wy ] ) => {
    if ( tiles[ wy ][ wx ] >= T_SAND && tiles[ wy ][ wx ] < T_SAND + T_SAND_L ){
      return tiles[ wy ][ wx ]
    }
    return T_LAND
  })
  drawTilesToMap( tiles, clearings, ( [ wx, wy ] ) => {
    if ( tiles[ wy ][ wx ] >= T_SAND && tiles[ wy ][ wx ] < T_SAND + T_SAND_L ){
      return tiles[ wy ][ wx ]
    }
    return randInt( T_GRASS_L + 1 ) + T_LAND
  })
  // insert various quest elements here instead of just hut

  for( let i = 0; i < waypoints.length; i++ ){
    const [ wx, wy ] = waypoints[ i ]

    const type = randInt( 10 )

    // dead ranger
    if( i === 0 ){
      tiles[ wy ][ wx ] = T_RANGER
    }
    // hut
    else if( i === 1 ){
      tiles[ wy ][ wx ] = T_HUT
      hutCache[ wy * mapSize + wx ] = [ 0, 0 ]
    }
    // ruins
    else if( i === 2 ){
      tiles[ wy ][ wx ] = randInt( T_RUINS_L ) + T_RUINS
    }
    // satellite
    else if( i === waypoints.length - 1 ){
      tiles[ wy ][ wx ] = T_SATELLITE
    }
    // ruins, 0 1 2 3 4 5
    else if( type < 6 ){
      tiles[ wy ][ wx ] = randInt( T_RUINS_L ) + T_RUINS
    }
    // hut 6 7 8
    else if( type < 9 ){
      tiles[ wy ][ wx ] = T_HUT
      hutCache[ wy * mapSize + wx ] = [ 0, 0 ]
    }
    // portal 9
    else {
      tiles[ wy ][ wx ] = T_PORTAL
    }
  }

  return [ DTYPE_MAP, playerX, playerY, tiles, MT_ISLAND, playerX, playerY ]
}

export const blocks = i =>
  i < 2 || ( i >= T_TREE && i < T_TREE + T_TREE_L ) || i === T_HUT ||
  i === T_BLACK || i === T_HUT_L || i === T_HUT_M || i === T_HUT_R ||
  i === T_COMPUTER || i === T_SYNTH || i === T_BED ||
  ( i >= T_RUINS && i < T_RUINS + T_RUINS_L ) ||
  ( i >= T_MOUNTAINS && i < T_MOUNTAINS + T_MOUNTAINS_L )
