import {
  T_TREE, DTYPE_MAP, T_LAND, T_WATER, TOP, RIGHT, BOTTOM, LEFT, T_SEA, T_SAND_L,
  T_SAND, T_HUT, T_BLACK, T_HUT_L, T_HUT_M, T_HUT_R, T_COMPUTER, T_SYNTH, T_BED,
  MT_ISLAND, MT_HUT, T_TREE_L, T_RUINS_L, T_RUINS, T_MOUNTAINS_L, T_MOUNTAINS,
  T_GRASS_L, T_PORTAL, T_SATELLITE, T_RANGER, T_PORTAL_DAY, T_PORTAL_OFFLINE,
  QUEST_HUT, QUEST_PORTAL, QUEST_RUINS, QUEST_RANGER, QUEST_SATELLITE, QUEST_BLANK
} from './indices'

import { mapSize, landBorder } from './settings'

import {
  MapTiles, MapRow, DisplayMap, Point, FloodPoint, HutCache, RuinCache,
  PortalCache
} from './types'

import { randInt, pick, shuffle } from './utils'

import {
  drunkenWalk, randomPointInLandBorder, inWaterBorder, randomLandEdge,
  floodFill, leftMost, getImmediateNeighbours, nearest, unique, allNeighbours,
  expanded, sortByDistance, dist
} from './geometry'

// create a new map filled with water
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
// clone an existing map
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

// draw some points to map according to return value of passed in function
export const drawTilesToMap = ( tiles: MapTiles, points: Point[] | FloodPoint[], getTileIndex: ( p: Point ) => number ) => {
  for( let i = 0; i < points.length; i++ ){
    const [ px, py ] = points[ i ]
    tiles[ py ][ px ] = getTileIndex( [ px, py ] )
  }
}

// any internal water tiles on the map become a randomly selected biome
export const addBiomes = ( tiles: MapTiles ) => {
  let i = 0

  // make sure there's at least one of each biome for variety
  const oneOfEachBiome = shuffle( [ 0, 3, 6, 9 ] )

  for( let y = 0; y < mapSize; y++ ){
    for( let x = 0; x < mapSize; x++ ){
      if( tiles[ y ][ x ] === T_WATER ){
        const flood = floodFill( [ x, y ], ( [ tx, ty ] ) => tiles[ ty ][ tx ] === T_WATER )

        let biome = 0

        // don't use up the interesting biomes on small areas
        if( flood.length > 5 ){
          // the first four times, add one of each for variety
          if( i < 4 ){
            biome = oneOfEachBiome[ i ]
          }
          // if there is an area left to make biomes, choose biome randomly
          else {
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
        }
        // 9
        else {
          // lake/inland sea
          drawTilesToMap( tiles, flood, () => T_SEA )
        }
      }
    }
  }
}

/*
  decorate coastlines with sand and any other land tiles with grass or trees
*/
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

// make a hut map
export const createHut = (): DisplayMap => {
  const tiles = createMap()
  const black = floodFill( [ 0, 0 ], ( [ tx, ty ] ) => tiles[ ty ][ tx ] === T_WATER )
  drawTilesToMap( tiles, black, () => T_BLACK )

  /*
    we need an arbitrary point to draw the hut at, anything reasonably far from
    the map edge will do so we use landBorder
  */
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

// draw a nice island with believable coastlines, different biomes to help the
// player build a mental map, quest locations that are guaranteed to be
// connected etc
export const createIsland = ( hutCache: HutCache, ruinCache: RuinCache, portalCache: PortalCache ): DisplayMap => {
  const tiles = createMap()

  // choose clearways (they will become quest locations, define path ends etc)
  // start with one on each side so that we generally end up with a rough
  // polygon shaped island
  const clearwayCount = randInt( 10, 40 )
  const clearways: Point[] = [
    randomLandEdge( TOP ),
    randomLandEdge( RIGHT ),
    randomLandEdge( BOTTOM ),
    randomLandEdge( LEFT )
  ]

  /*
    only select points for clearways that are at least 10 tiles apart -
    does two things, prevents from picking already picked points, and makes sure
    that the icons on the computer map never overlap
  */
  while( clearways.length < clearwayCount ){
    const clearway = randomPointInLandBorder()
    const near = nearest( clearway, clearways )
    if( dist( clearway, near ) > 10 ){
      clearways.push( clearway )
    }
  }

  // make paths between waypoints
  const paths: Point[] = []
  const pathSegs = clearways.slice()
  let current = pathSegs.pop()!
  const start = current

  while( pathSegs.length ){
    // pick the nearest and draw a rough line to it
    const near = nearest( current, pathSegs )
    const steps = drunkenWalk( current, near, inWaterBorder, 0.33 )

    paths.push( ...steps )

    current = pathSegs.pop()!
  }

  // draw a rough line from the last waypoint to the first
  // so we generally end up with a rough polygon
  const steps = drunkenWalk( current, start, inWaterBorder, 0.33 )
  paths.push( ...steps )

  // now randomly join 10 of the waypoints, helps make a higher number of
  // different biomes
  for( let i = 0; i < 10; i++ ){
    const steps = drunkenWalk( pick( clearways ), pick( clearways ), inWaterBorder, 0.33 )
    paths.push( ...steps )
  }

  // take all the quest points and mark all of their neighbours so that later
  // we know not to put anything blocking next to a quest point
  const clearings: Point[] = []
  for( let i = 0; i < clearways.length; i++ ){
    clearings.push( ...allNeighbours( clearways[ i ] ) )
  }

  // make a collection of all the areas we've marked so far
  const land = unique( [ ...clearways, ...clearings, ...paths ] )
  // now expand it out until we have the desired amount of land area
  const expandedLand = expanded( land )

  // start the player at the leftmost point
  const [ playerX, playerY ] = leftMost( expandedLand )

  // fill in the map with the land we have so far
  drawTilesToMap( tiles, expandedLand, () => T_LAND )

  // flood the outside of the map with sea (as opposed to water) - the areas
  // that remain water will be used for placing biomes
  const sea = floodFill( [ 0, 0 ], ( [ tx, ty ] ) => tiles[ ty ][ tx ] === T_WATER )
  drawTilesToMap( tiles, sea, () => T_SEA )

  // sort all the quest points by distance so we can place useful things close
  // and the satellite far away
  const waypoints = sortByDistance( [ playerX, playerY ], clearways )

  // make sure there's a clear path from the player to the first waypoint
  const playerSteps = drunkenWalk( [ playerX, playerY ], waypoints[ 0 ], inWaterBorder, 0.33 )
  paths.push( ...playerSteps )

  // change all the internal water to different biomes
  addBiomes( tiles )
  // add sand along coastlines, decorate the remaining land with random grass, trees etc
  decorate( tiles )

  // now draw all the paths to the map to make sure you can always walk between
  // quest points - make them as blank tiles to the player can visually pick
  // out the paths, unless it's coastline in which case leave it as sand
  drawTilesToMap( tiles, paths, ( [ wx, wy ] ) => {
    if ( tiles[ wy ][ wx ] >= T_SAND && tiles[ wy ][ wx ] < T_SAND + T_SAND_L ){
      return tiles[ wy ][ wx ]
    }
    return T_LAND
  })
  // decorate all the clearing around quest locations with various non-blocking
  // grass tiles etc
  drawTilesToMap( tiles, clearings, ( [ wx, wy ] ) => {
    if ( tiles[ wy ][ wx ] >= T_SAND && tiles[ wy ][ wx ] < T_SAND + T_SAND_L ){
      return tiles[ wy ][ wx ]
    }
    return randInt( T_GRASS_L + 1 ) + T_LAND
  })

  // now let's allocate quest locations to all the waypoints
  // 50% ruins, 25% huts, 15% portals
  const questSlots = waypoints.length - 4
  const numHuts = ~~( questSlots * 0.25 )
  const numPortals = ~~( questSlots * 0.15 )
  const numRuins = ~~( questSlots * 0.5 )
  const numBlank = waypoints.length - numHuts - numPortals - numRuins
  const randQuests: number[] = []
  for ( let i = 0; i < numHuts; i++ ) {
    randQuests.push( QUEST_HUT )
  }
  for ( let i = 0; i < numPortals; i++ ) {
    randQuests.push( QUEST_PORTAL )
  }
  for ( let i = 0; i < numRuins; i++ ) {
    randQuests.push( QUEST_RUINS )
  }
  for ( let i = 0; i < numBlank; i++ ) {
    randQuests.push( QUEST_BLANK )
  }
  // make sure that the closest ones are useful, the furthest is satellite,
  // the rest are random
  const quests = [ QUEST_RANGER, QUEST_HUT, QUEST_RUINS, ...shuffle( randQuests ), QUEST_SATELLITE ]

  // add them to the map
  for( let i = 0; i < waypoints.length; i++ ){
    const [ wx, wy ] = waypoints[ i ]

    const type = quests[ i ]

    // dead ranger
    if( type === QUEST_RANGER ){
      tiles[ wy ][ wx ] = T_RANGER
    }
    // hut
    else if( type === QUEST_HUT ){
      tiles[ wy ][ wx ] = T_HUT
      hutCache[ wy * mapSize + wx ] = [ 0, 0, 0 ]
      hutCache[ 0 ].push([ wx, wy ])
    }
    // ruins
    else if( type === QUEST_RUINS ){
      tiles[ wy ][ wx ] = randInt( T_RUINS_L ) + T_RUINS
      ruinCache[ wy * mapSize + wx ] = []
      ruinCache[ 0 ].push([ wx, wy ])
    }
    // portal
    else if( type === QUEST_PORTAL ){
      tiles[ wy ][ wx ] = T_PORTAL
      portalCache[ 0 ].push([ wx, wy ])
    }
    // satellite
    else if( type === QUEST_SATELLITE ){
      tiles[ wy ][ wx ] = T_SATELLITE
    }
  }

  // done! return the island
  return [ DTYPE_MAP, playerX, playerY, tiles, MT_ISLAND, playerX, playerY ]
}

// is this tileindex blocking?
export const blocks = i =>
  i < 2 || ( i >= T_TREE && i < T_TREE + T_TREE_L ) || i === T_HUT ||
  i === T_BLACK || i === T_HUT_L || i === T_HUT_M || i === T_HUT_R ||
  i === T_COMPUTER || i === T_SYNTH || i === T_BED ||
  ( i >= T_RUINS && i < T_RUINS + T_RUINS_L ) ||
  ( i >= T_MOUNTAINS && i < T_MOUNTAINS + T_MOUNTAINS_L ) ||
  i === T_PORTAL || i === T_PORTAL_DAY || i === T_PORTAL_OFFLINE ||
  i === T_SATELLITE
