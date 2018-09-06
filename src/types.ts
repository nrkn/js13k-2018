// map types
export type MapRow = number[]
export type MapTiles = MapRow[]
export type Point = [ number, number ]
export type FloodPoint = [ number, number, number ]

export interface PointMap {
  [ pointKey: string ]: number
}

// game types
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
  number
]

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

export type GameColor = '' | 'i' | 'g' | 'a'

export type DisplayImage = [ 0, string ]
export type DisplayMessage = [ 1, string[] ]
export type DisplaySelection = [ string, number ]
export type DisplayScreen = [ 2, string[], DisplaySelection[], number, GameColor ]
export type DisplayMap = [ 3, number, number, MapTiles, MapType, number, number ]
export type DisplayAction = [ 4, number ]
export type DisplayItem = DisplayImage | DisplayMessage | DisplayScreen | DisplayMap | DisplayAction

export type Edge = 0 | 1 | 2 | 3

export type MapType = 0 | 1

export type Monster = [ number, number, number, number ]

export type BoolAsNumber = 0 | 1

export type HutState = [ BoolAsNumber, BoolAsNumber ]