'use strict'
/*
  close over to make uglify minify properly as couldn't seem to find the option
  to minify top level - easy enough to remove this
*/
const s = () => {
  const ctx = c.getContext( '2d' )

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

  const messages = [
    // 0
    [
      'Lost contact with',
      'RANGER. Take boat',
      'and investigate.'
    ],

    // 1
    [ 'Sunrise' ],

    // 2
    [ 'Sunset' ],

    // 3
    [ 's.png' ],

    // 4
    [ 'Tree' ]
  ]
  let message = messages[ 3 ]

  let selected = 0
  const computerScreens = [
    [
      [
        'RSOS v3.27',
        '',
        'ERROR:',
        ' SYSTEM OFFLINE',
        '',
        'EMERGENCY OPS:',
        ''
      ],
      [
        [ 'DIAGNOSTICS', 1 ],
        [ 'SYNTHESIZE', 2 ]
      ]
    ],
    [
      [
        'DIAGNOSTICS',
        '',
        'MAIN SYSTEM:',
        ' OFFLINE',
        '',
        ' PROBLEM:',
        '  6 CAPS BLOWN',
        '',
        'SYNTHESIZE:',
        ' ONLINE'
      ],
      []
    ],
    [
      [
        'SYNTHESIZE',
        '',
        'SYNTHDB:',
        ' OFFLINE',
        '',
        'EMERGENCY OPS:',
        ''
      ],
      [
        [ 'BASIC RATIONS', 1 ]
      ]
    ]
  ]
  let screens = []

  // named indices
  const treeIndex = 8
  const foodIndex = 9
  const healthIndex = 10
  const boatLeft = 5
  const boatRight = 6

  let food = 1
  let health = 1
  let maxHealth = 10

  let boatX = 0
  let boatY = 0

  // time
  let h = 17
  let m = 30

  const incTime = () => {
    m++
    if( m === 60 ){
      m = 0
      h++
      if( h === 6 ){
        c.classList.remove( 'i' )
        message = messages[ 1 ]
      }
      if( h === 18 ){
        c.classList.add( 'i' )
        message = messages[ 2 ]
      }
      if( food > 0 ){
        food--
        if( health < maxHealth ) health++
      } else {
        health--
      }
    }
    if( h === 24 ){
      h = 0
    }
  }

  const timeStr = () => `${ h < 10 ? '0' : '' }${ h }:${ m < 10 ? '0' : '' }${ m }`

  const loadImage = path => new Promise( resolve => {
    const img = new Image()
    img.onload = () => resolve( img )
    img.src = path
  })

  const loadImages = ( ...paths ) => Promise.all( paths.map( loadImage ) )

  const pick = arr => arr[ ~~( Math.random() * arr.length ) ]

  // defines blocking tiles
  const blocks = i => i < 2 || i > 7

  const inBounds = ( x, y ) => x >= 0 && x <= mapSize - 1 && y >= 0 && y <= mapSize - 1

  const island = () => {
    const len = mapSize * mapSize
    const tileCount = ~~( 0.6 * len )
    const tiles = [ [ vX, vY ] ]
    const rows = []

    const getImmediateWaterNeighbours = ( x, y ) =>
      ([
        [ x - 1, y ],
        [ x + 1, y ],
        [ x, y - 1 ],
        [ x, y + 1 ]
      ]).filter( ( [ nx, ny ] ) => inBounds( nx, ny ) && !rows[ ny ][ nx ] )

    const getWaterNeighbours = ( x, y ) =>
      ([
        [ x - 1, y ],
        [ x + 1, y ],
        [ x, y - 1 ],
        [ x, y + 1 ],

        [ x - 1, y - 1 ],
        [ x + 1, y - 1 ],
        [ x - 1, y + 1 ],
        [ x + 1, y + 1 ]
      ]).filter( ( [ nx, ny ] ) => inBounds( nx, ny ) && !rows[ ny ][ nx ] )

    // set all to water
    for( let y = 0; y < mapSize; y++ ){
      const row = []
      for( let x = 0; x < mapSize; x++ ){
        row.push( x === vX && y === vY ? 2 : 0 )
      }
      rows.push( row )
    }

    // randomly draw out from center - end up with rough circle
    while( tiles.length < tileCount ){
      const [ cx, cy ] = pick( tiles )
      const neighbours = getImmediateWaterNeighbours( cx, cy )
      if( neighbours.length ){
        const [ nx, ny ] = pick( neighbours )
        tiles.push( [ nx, ny ] )
        rows[ ny ][ nx ] = ~~( Math.random() * 7 ) + 2
      }
    }

    let lx = canvasSize
    // make border tiles sand and remove water with no neighbours
    for( let y = 0; y < mapSize; y++ ){
      for( let x = 0; x < mapSize; x++ ){
        if( rows[ y ][ x ] ){
          // land with a water neighbour, make beach
          const neighbours = getWaterNeighbours( x, y )
          if( neighbours.length ){
            rows[ y ][ x ] = 2
            // hack - make player on leftmost
            if( x < lx ){
              lx = x
              vX = x
              vY = y
              boatX = x - 2
              boatY = y
            }
          }
        } else {
          // water with no water neighbours, make beach
          const neighbours = getImmediateWaterNeighbours( x, y )
          if( !neighbours.length ){
            rows[ y ][ x ] = 2
          }
        }
      }
    }

    return rows
  }

  loadImages( 'f.gif', 't.gif', 'p.gif', 's.png' ).then( ( [ font, tiles, player, splash ] ) => {
    const map = island()

    // nb the text grid is half the size of the tile grid, 8x8 not 16x16
    const drawChar = ( ch = '', tx = 0, ty = 0 ) => {
      const c = ch.charCodeAt( 0 ) - 32
      const sx = c * 8
      const sy = 0
      const sWidth = 8
      const sHeight = 8
      const dx = tx * 8
      const dy = ty * 8
      const dWidth = 8
      const dHeight = 8

      ctx.drawImage( font, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
    }

    const drawText = ( str = '', tx = 0, ty = 0 ) => {
      for( let i = 0; i < str.length; i++ ){
        drawChar( str[ i ], tx + i, ty )
      }
    }

    /*
      needed so we can have multiple input methods, eg touch controls, can be
      rolled into the key handler if we don't use other inputs
    */
    const move = ( x, y ) => {
      x = vX + x
      y = vY + y

      if( map[ y ][ x ] === treeIndex ){
        message = messages[ 4 ]
        return
      }

      /*
        blocks if out of bounds or a tree (the last tile) - need to be able to
        define blocking tiles but can do that later
      */
      if( health <= 0 || !inBounds( x, y ) || blocks( map[ y ][ x ] ) ) return

      vX = x
      vY = y
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

      if( screens.length ){
        c.classList.add( 'a' )

        const [ text, options ] = screens[ screens.length - 1 ]

        let y
        for( y = 0; y < text.length; y++ ){
          drawText( text[ y ], 1, y + 1 )
        }
        for( let s = 0; s < options.length; s++ ){
          drawText(
            `${ s === selected ? '> ': '  ' }${ options[ s ][ 0 ] }`, 1, y + s + 2
          )
        }

        requestAnimationFrame( draw )

        return
      }

      if( message ){
        c.classList.add( 'g' )
        if( message[ 0 ] === 's.png' ){
          ctx.drawImage( splash, 0, 0 )
          drawText( 'C2018 Wundergast', 2, 17 )
          const sx = 4 * tileSize
          const sy = 0
          const sWidth = tileSize
          const sHeight = tileSize
          const dx = ( center + 0.5 ) * tileSize
          const dy = ( center + 0.5 ) * tileSize
          const dWidth = tileSize
          const dHeight = tileSize
          ctx.drawImage( player, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
        } else {
          const yOff = ~~( ( canvasSize * 2 - message.length ) / 2 )

          for( let y = 0; y < message.length; y++ ){
            const line = message[ y ]
            const xOff = ~~( ( canvasSize * 2 - line.length ) / 2 )
            const tX = xOff
            const tY = y + yOff
            drawText( line, tX, tY )
          }
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
            if( health ){
              sx = ( playerFrame * tileSize ) + ( facing * tileSize * 2 )
            } else {
              sx = 4 * tileSize
            }

            ctx.drawImage( player, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
          }

          if( mapX === boatX && mapY === boatY ){
            const sx = boatLeft * tileSize
            const sy = 0
            const sWidth = tileSize
            const sHeight = tileSize
            const dx = ( x + 1 ) * tileSize
            const dy = ( y + 1 ) * tileSize
            const dWidth = tileSize
            const dHeight = tileSize
            ctx.drawImage( player, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
          }
          if( mapX === ( boatX + 1 ) && mapY === boatY ){
            const sx = boatRight * tileSize
            const sy = 0
            const sWidth = tileSize
            const sHeight = tileSize
            const dx = ( x + 1 ) * tileSize
            const dy = ( y + 1 ) * tileSize
            const dWidth = tileSize
            const dHeight = tileSize
            ctx.drawImage( player, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
          }
        }
      }

      drawText( `RANGER DOWN   ${ timeStr() }`, 0.5, 0.5 )
      // health
      let sx = healthIndex * tileSize
      const sy = 0
      const sWidth = tileSize
      const sHeight = tileSize
      const dx = 0
      let dy = tileSize
      const dWidth = tileSize
      const dHeight = tileSize
      ctx.drawImage( tiles, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
      drawText( `${ health }`, health < 10 ? 0.5 : 0, 4 )
      // food
      sx = foodIndex * tileSize
      dy += tileSize * 2
      ctx.drawImage( tiles, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
      drawText( `${ food }`, food < 10 ? 0.5 : 0, 8 )

      requestAnimationFrame( draw )
    }

    c.ontouchend = e => {
      const touches = [ ...e.changedTouches ]

      touches.forEach( t => {
        const { clientX, clientY } = t
        const tileSize = c.getBoundingClientRect().width / canvasSize
        const tx = Math.floor( clientX / tileSize ) - 1
        const ty = Math.floor( clientY / tileSize ) - 1

        if( screens.length ){
          // add select code
          screens.pop()
          if( !screens.length ){
            c.classList.remove( 'a' )
          }
          return
        }

        // if showing a message
        if( message ){
          c.classList.remove( 'g' )
          c.classList.remove( 'a' )

          if( message[ 0 ] === 's.png' ){
            //screens.push( computerScreens[ 0 ] )
            message = messages[ 0 ]
          } else {
            message = 0
          }

          return
        }

        if( tx === center && ty === center ){
          // tapped on player
          return
        }

        if( tx < 0 || ty < 0 ){
          //tapped an interface tile
          return
        }

        const dx = Math.max( center, tx ) - Math.min( center, tx )
        const dy = Math.max( center, ty ) - Math.min( center, ty )

        let x = 0
        let y = 0
        if( dx > dy ){
          if( tx > center ){
            x = 1
            facing = 0
          } else {
            x = -1
            facing = 1
          }
        } else if( dx < dy ){
          y = ty > center ? 1 : -1
        }

        incTime()
        move( x, y )
      })
    }

    document.onkeyup = e => {
      if( screens.length ){
        const [ text, options ] = screens[ screens.length - 1 ]
        // pop the screen if esc
        if( e.keyCode === 27 ){
          screens.pop()
          if( !screens.length ){
            c.classList.remove( 'a' )
          }
        }
        // push new screen if enter
        if( e.keyCode === 13 && options[ selected ] ){
          //const [ name, pageIndex ] = options[ selected ]
          //screens.push( computerScreens[ pageIndex ] )
          selected = 0
        }
        // up
        if( e.keyCode === 87 || e.keyCode === 38 ){
          if( selected > 0 ) selected--
        }
        // down
        if( e.keyCode === 83 || e.keyCode === 40 ){
          if( selected < options.length - 1 ) selected++
        }

        return
      }

      // if showing a message
      if( message ){
        c.classList.remove( 'g' )
        c.classList.remove( 'a' )

        // clear the message if one of these keys
        if( e.keyCode === 32 || e.keyCode === 27 || e.keyCode === 13 ){
          if( message[ 0 ] === 's.png' ){
            screens.push( computerScreens[ 0 ] )
            message = messages[ 0 ]
          } else {
            message = 0
          }
        }

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

    draw()
  })
}

s()