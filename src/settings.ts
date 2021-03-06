// various settings and magic numbers, these will get inlined by uglify
export const tileSize = 16
export const fontSize = 8
export const computerIconSize = 7
export const viewTiles = 9
export const canvasTiles = viewTiles + 1
export const fontTiles = canvasTiles * 2
export const centerTile = ~~( viewTiles / 2 )
export const mapSize = tileSize * canvasTiles
export const animTime = 500
export const waterBorder = ~~( mapSize / 20 )
export const landBorder = ~~( mapSize / 8 )
export const gridTiles = 4
export const gridSize = ~~( mapSize / gridTiles )
export const initialMonsterCount = ~~( mapSize / 20 )
export const sunrise = 6
export const sunset = 18
