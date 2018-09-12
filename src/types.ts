// map types
export type MapRow = number[]
export type MapTiles = MapRow[]
export type Point = [ number, number ]
export type FloodPoint = [ number, number, number ]
export type MapDb = number[]

export interface PointMap {
  [ pointKey: string ]: number
}

// the state used by the UI for drawing etc
export type GameState = [
  0 | 1,
  number,
  number,
  number,
  number,
  number,
  GameColor,
  DisplayItem,
  Monster[],
  number,
  number,
  number,
  Seen,
  HutCache,
  RuinCache,
  PortalCache,
  BoolAsNumber,
  number,
  number
]

// the api for the UI to communicate with the game code
export type GameAPI = [
  () => GameState,
  () => void,
  () => string,
  () => void,
  ( x: number, y: number ) => void,
  () => void,
  ( selection: number ) => void,
  () => void
]

// black and white, night colors, green screen, amber screen
export type GameColor = '' | 'i' | 'g' | 'a'

// various display items that the UI can draw
export type DisplayImage = [ 0, string ]
export type DisplayMessage = [ 1, string[] ]
export type DisplaySelection = [ string, number ]
export type DisplayScreen = [ 2, string[], DisplaySelection[], number, GameColor ]
export type DisplayMap = [ 3, number, number, MapTiles, MapType, number, number ]
export type DisplayAction = [ 4, number ]
export type DisplayComputerMap = [ 5, number, number, MapTiles, MapDb ]
export type DisplayItem = DisplayImage | DisplayMessage | DisplayScreen | DisplayMap | DisplayAction | DisplayComputerMap

// edges, used by map generation code
export type Edge = 0 | 1 | 2 | 3

// island or hut
export type MapType = 0 | 1

// x, y, facing, health
export type Monster = [ number, number, number, number ]

export type BoolAsNumber = 0 | 1

// unlocked, fixed, synth charging
export type HutState = [ BoolAsNumber, BoolAsNumber, BoolAsNumber ]
/*
  generally, this is an array where huts are placed within it at
  [ y * mapSize + x ] - it's actually a hash map

  it's impossible for a hut to be placed at 0,0 so we store a list of points of
  the huts there
*/
export type HutCache = [ Point[], ...HutState[] ]

// list of items remaining at a particular ruins
export type RuinItems = RuinItem[]
// same data structure as HutCache but with RuinItems
export type RuinCache = [ Point[], ...RuinItems[] ]

// unused since previous refactor
export type PortalCache = [ Point[], ...BoolAsNumber[] ]

// key, chip, backup disk, food
export type RuinItem = 0 | 1 | 2 | 3

// same data structure as HutCache, see above - 0 if unseen, 1 if seen
export type Seen = BoolAsNumber[]