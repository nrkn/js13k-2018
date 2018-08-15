'use strict'
/*
  close over to make uglify minify properly as couldn't seem to find the option
  to minify top level - easy enough to remove this
*/
const s = () => {
  const ctx = c.getContext( '2d' )

  const loadImage = path => new Promise( resolve => {
    const img = new Image()
    img.onload = () => resolve( img )
    img.src = path
  })

  const loadImages = ( ...paths ) => Promise.all( paths.map( loadImage ) )

  const pick = arr => arr[ ~~( Math.random() * arr.length ) ]

  // defines blocking tiles
  const blocks = i => i < 2 || i > 7

  // geometry etc
  const tileSize = 16
  const tileCount = 9
  const viewSize = 9
  const canvasSize = viewSize + 1
  const center = ~~( viewSize / 2 )
  // map settings
  const mapSize = 128
  // center the map on this tile - typically the player location
  let vX = ~~( mapSize / 2 )
  let vY = ~~( mapSize / 2 )
  // player settings
  const playerAnimationTime = 500
  let facing = 0

  const inBounds = ( x, y ) => x >= 0 && x <= mapSize - 1 && y >= 0 && y <= mapSize - 1

  // time
  let h = 6
  let m = 30
  const incTime = () => {
    m++
    if( m === 60 ){
      m = 0
      h++
      if( h === 6 ){
        c.classList.toggle( 'i' )
        message = messages[ 1 ]
      }
      if( h === 18 ){
        c.classList.toggle( 'i' )
        message = messages[ 2 ]
      }
    }
    if( h === 24 ){
      h = 0
    }
  }

  const timeStr = () => `${ h < 10 ? '0' : '' }${ h }:${ m < 10 ? '0' : '' }${ m }`

  const messages = [
    [
      'Lost contact with',
      'RANGER. Take boat,',
      'find out what ',
      'happened'
    ],
    [ 'Sunrise' ],
    [ 'Sunset' ],
  ]

  let message = messages[ 0 ]

  const island = () => {
    const len = mapSize * mapSize
    const tileCount = ~~( 0.6 * len )
    const tiles = [ [ vX, vY ] ]
    const rows = []

    for( let y = 0; y < mapSize; y++ ){
      const row = []
      for( let x = 0; x < mapSize; x++ ){
        row.push( x === vX && y === vY ? 2 : 0 )
      }
      rows.push( row )
    }

    while( tiles.length < tileCount ){
      const [ cx, cy ] = pick( tiles )
      // check if smaller to extract this to fn
      const neighbours = ([
        [ cx - 1, cy ],
        [ cx + 1, cy ],
        [ cx, cy - 1 ],
        [ cx, cy + 1 ]
      ]).filter( ( [ nx, ny ] ) => inBounds( nx, ny ) && !rows[ ny ][ nx ] )
      if( neighbours.length ){
        const [ nx, ny ] = pick( neighbours )
        tiles.push( [ nx, ny ] )
        rows[ ny ][ nx ] = ~~( Math.random() * 7 ) + 2
      }
    }

    // make border tiles sand and remove water with no neighbours
    for( let y = 0; y < mapSize; y++ ){
      for( let x = 0; x < mapSize; x++ ){
        if( rows[ y ][ x ] ){
          const neighbours = ([
            [ x - 1, y ],
            [ x + 1, y ],
            [ x, y - 1 ],
            [ x, y + 1 ]
          ]).filter( ( [ nx, ny ] ) => inBounds( nx, ny ) && !rows[ ny ][ nx ] )
          if( neighbours.length ){
            // replace with sand tile when we have one
            rows[ y ][ x ] = 2
          }
        } else {
          const neighbours = ([
            [ x - 1, y ],
            [ x + 1, y ],
            [ x, y - 1 ],
            [ x, y + 1 ]
          ]).filter( ( [ nx, ny ] ) => inBounds( nx, ny ) && !rows[ ny ][ nx ] )
          //no water neighbours
          if( !neighbours.length ){
            // replace with sand tile when we have one
            rows[ y ][ x ] = 2
          }
        }
      }
    }

    return rows
  }

  loadImages( 'f.gif', 't.gif', 'p.gif' ).then( ( [ font, tiles, player ] ) => {
    // nb the text grid is half the size of the tile grid, 8x8 not 16x16
    const drawText = ( str = '', tx = 0, ty = 0 ) => {
      for( let i = 0; i < str.length; i++ ){
        const c = str.charCodeAt( i ) - 32
        const sx = c * 8
        const sy = 0
        const sWidth = 8
        const sHeight = 8
        const dx = tx * 8
        const dy = ty * 8
        const dWidth = 8
        const dHeight = 8

        ctx.drawImage( font, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )

        tx++
      }
    }

    const map = island()

    /*
      needed so we can have multiple input methods, eg touch controls, can be
      rolled into the key handler if we don't use other inputs
    */
    const move = ( x, y ) => {
      x = vX + x
      y = vY + y

      /*
        blocks if out of bounds or a tree (the last tile) - need to be able to
        define blocking tiles but can do that later
      */
      if( !inBounds( x, y ) || blocks( map[ y ][ x ] ) ) return

      vX = x
      vY = y
    }

    document.onkeyup = e => {
      // if showing a message
      if( message ){
        // clear the message if one of these keys
        if( e.keyCode === 32 || e.keyCode === 27 || e.keyCode === 13 ) message = 0

        return
      }

      let x = 0
      let y = 0

      // left, change the facing as well
      if( e.keyCode === 65 || e.keyCode === 37 ){
        facing = 1
        x = -1
      }
      // right, change the facing as well
      if( e.keyCode === 68 || e.keyCode === 39 ){
        facing = 0
        x = 1
      }
      // up
      if( e.keyCode === 87 || e.keyCode === 38 ){
        y = -1
      }
      // down
      if( e.keyCode === 83 || e.keyCode === 40 ){
        y = 1
      }

      incTime()
      move( x, y )
    }

    let start
    let elapsed
    const draw = time => {
      // set up start when we first get a proper tick time
      if( time && !start ) start = time

      elapsed = time - start

      // is this over complicated? might be a simpler way to do this
      const playerTime = ~~( elapsed / playerAnimationTime )
      const playerFrame = playerTime % 2 ? 0 : 1

      // blank the canvas
      c.width = c.height = tileSize * canvasSize

      if( message ){
        for( let y = 0; y < message.length; y++ ){
          const line = message[ y ]
          const tX = 1
          const tY = 1 + y
          drawText( line, tX, tY )
        }

        requestAnimationFrame( draw )

        return
      }

      for( let y = 0; y < viewSize; y++ ){
        for( let x = 0; x < viewSize; x++ ){
          const mapX = ( vX - center ) + x
          const mapY = ( vY - center ) + y

          const sy = 0
          const sWidth = tileSize
          const sHeight = tileSize
          const dx = ( x + 1 ) * tileSize
          const dy = ( y + 1 ) * tileSize
          const dWidth = tileSize
          const dHeight = tileSize

          let sx = playerFrame * tileSize

          // bounds check
          if( inBounds( mapX, mapY ) ){
            const tileIndex = map[ mapY ][ mapX ]

            if( tileIndex ) sx = tileIndex * tileSize
          }

          ctx.drawImage( tiles, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )

          if( x === center && y === center ){
            // when we add movement we'll toggle facing, this should work
            sx = ( playerFrame * tileSize ) + ( facing * tileSize * 2 )

            ctx.drawImage( player, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
          }
        }
      }

      drawText( `MOMOS Down    ${ timeStr() }`, 0.5, 0.5 )

      requestAnimationFrame( draw )
    }

    draw()
  })
}

s()