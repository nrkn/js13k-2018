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

  c.width = c.height = tileSize * canvasSize

  loadImages( 'font.gif', 'tiles.gif', 'player.gif' ).then( ( [ font, tiles, player ] ) => {
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

    drawText( 'Offline         $10', 0.5, 0.5 )

    for( let i = 1; i < 10; i++ ){
      drawText( i + '', 0.5, ( i * 2 ) + 0.5 )
    }
  })
}

s()