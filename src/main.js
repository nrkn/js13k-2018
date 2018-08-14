/*
  close over to make uglify minify properly as couldn't seem to find the option
  to minify top level - easy enough to remove this
*/
const s = () => {
  'use strict'

  const ctx = c.getContext( '2d' )

  const loadImage = path => new Promise( resolve => {
    const img = new Image()
    img.onload = () => resolve( img )
    img.src = path
  })

  const loadImages = ( ...paths ) => Promise.all( paths.map( loadImage ) )

  const tileSize = 16
  const viewSize = 9
  const canvasSize = viewSize + 1
  const center = ~~( viewSize / 2 )
  const mapSize = 50
  // center the map on this tile
  const vX = 25
  const vY = 25

  loadImages( 'font.gif', 'tiles.gif', 'player.gif' ).then( ( [ font, tiles, player ] ) => {
    const tileCount = tiles.width / tileSize

    // nb the text grid is half the size of the tile grid, 8x8 not 16x16
    const drawText = ( str = '', x = 0, y = 0 ) => {
      for( let i = 0; i < str.length; i++ ){
        const c = str.charCodeAt( i ) - 32
        const sx = c * 8
        const sy = 0
        const sWidth = 8
        const sHeight = 8
        const dx = x * 8
        const dy = y * 8
        const dWidth = 8
        const dHeight = 8

        ctx.drawImage( font, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )

        x++
      }
    }

    const generateMap = () => {
      const tiles = []

      for( let y = 0; y < mapSize; y++ ){
        for( let x = 0; x < mapSize; x++ ){
          // always start on a blank tile, otherwise pick a tile randomly
          const tileIndex = x === center && y === center ? 0 : Math.floor( Math.random() * tileCount )

          tiles.push( tileIndex )
        }
      }

      return tiles
    }

    const map = generateMap()

    const draw = () => {
      // blank the canvas
      c.width = c.height = tileSize * canvasSize

      for( let y = 0; y < viewSize; y++ ){
        for( let x = 0; x < viewSize; x++ ){
          const mapX = ( vX - center ) + x
          const mapY = ( vY - center ) + y

          // bounds check
          if( mapX < 0 || mapY < 0 || mapX >= mapSize || mapY >= mapSize ) continue

          const i = ( mapY * mapSize ) + mapX
          const tileIndex = map[ i ]

          const sx = tileIndex * tileSize
          const sy = 0
          const sWidth = tileSize
          const sHeight = tileSize
          const dx = ( x + 1 ) * tileSize
          const dy = ( y + 1 ) * tileSize
          const dWidth = tileSize
          const dHeight = tileSize

          ctx.drawImage( tiles, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
        }
      }

      drawText( 'Offline         $10', 0.5, 0.5 )

      for( let i = 1; i < 10; i++ ){
        drawText( i + '', 0.5, ( i * 2 ) + 0.5 )
      }

      requestAnimationFrame( draw )
    }

    draw()
  })
}

s()