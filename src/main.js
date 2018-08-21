'use strict'
/*
  close over to make uglify minify properly as couldn't seem to find the option
  to minify top level - easy enough to remove this
*/
const s = () => {
  const ctx = c.getContext( '2d' )

  const settings_tileSize = 16
  const settings_viewTiles = 9
  const settings_canvasTiles = settings_viewTiles + 1
  const settings_centerTile = ~~( settings_viewTiles / 2 )
  const settings_mapSize = 128
  const settings_animTime = 500

  // named indices
  const index_tree = 8
  const index_food = 9
  const index_health = 10
  const index_path = 11
  const index_boatLeft = 5
  const index_boatRight = 6

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

  const computer_screens = [
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

  let player_x = ~~( settings_mapSize / 2 )
  let player_y = ~~( settings_mapSize / 2 )
  let player_facing = 0
  let player_food = 1
  let player_health = 1
  let player_maxHealth = 10
  let hours = 17
  let minutes = 30
  let message = messages[ 3 ]
  let computer_selected = 0
  let screens = []
  let map_boatX = 0
  let map_boatY = 0
  let start = 0
  let elapsed = 0

  const incTime = () => {
    minutes++
    if( minutes === 60 ){
      minutes = 0
      hours++
      if( hours === 6 ){
        c.classList.remove( 'i' )
        message = messages[ 1 ]
      }
      if( hours === 18 ){
        c.classList.add( 'i' )
        message = messages[ 2 ]
      }
      if( player_food > 0 ){
        player_food--
        if( player_health < player_maxHealth ) player_health++
      } else {
        player_health--
      }
    }
    if( hours === 24 ){
      hours = 0
    }
  }

  const timeStr = () => `${ hours < 10 ? '0' : '' }${ hours }:${ minutes < 10 ? '0' : '' }${ minutes }`

  const loadImage = path => new Promise( resolve => {
    const img = new Image()
    img.onload = () => resolve( img )
    img.src = path
  })

  const loadImages = ( ...paths ) => Promise.all( paths.map( loadImage ) )

  const pick = arr => arr[ ~~( Math.random() * arr.length ) ]

  // defines blocking tiles
  const blocks = i => i < 2 || i === index_tree

  const inBounds = ( x, y ) => x >= 0 && x <= settings_mapSize - 1 && y >= 0 && y <= settings_mapSize - 1

  const emptyNear = ( tiles, x1, y1, min, max ) =>
    pick( tiles.filter( ( [ x2, y2 ] ) => {
      let dx = delta( x1, x2 )
      let dy = delta( y1, y2 )

      return dx >= min && dx <= max && dy >= min && dy <= max
    } ) )

  const immediateNeighbours = ( x, y ) => [
    [ x - 1, y ],
    [ x + 1, y ],
    [ x, y - 1 ],
    [ x, y + 1 ]
  ]

  const allNeighbours = ( x, y ) => [
    [ x - 1, y ],
    [ x + 1, y ],
    [ x, y - 1 ],
    [ x, y + 1 ],
    [ x - 1, y - 1 ],
    [ x + 1, y - 1 ],
    [ x - 1, y + 1 ],
    [ x + 1, y + 1 ]
  ]

  const getPassableNeighbours = ( x, y, rows ) =>
    immediateNeighbours( x, y ).filter( ( [ nx, ny ] ) => inBounds( nx, ny ) && !blocks( rows[ ny ][ nx ] ) )

  const getImmediateWaterNeighbours = ( x, y, rows ) =>
    immediateNeighbours( x, y ).filter( ( [ nx, ny ] ) => inBounds( nx, ny ) && !rows[ ny ][ nx ] )

  const getWaterNeighbours = ( x, y, rows ) =>
    allNeighbours( x, y ).filter( ( [ nx, ny ] ) => inBounds( nx, ny ) && !rows[ ny ][ nx ] )

  const delta = ( i, j ) => Math.max( i, j ) - Math.min( i, j )

  const towards = ( x1, y1, x2, y2 ) => {
    let dx = delta( x1, x2 )
    let dy = delta( y1, y2 )
    let x = x1
    let y = y1

    if( dx > dy ){
      if( x2 > x1 ){
        x = x1 + 1
      }
      if( x1 > x2 ){
        x = x1 - 1
      }
    }
    if( dy > dx ){
      if( y2 > y1 ){
        y = y1 + 1
      }
      if( y1 > y2 ){
        y = y1 - 1
      }
    }

    return [ x, y ]
  }

  const emptyMap = () => {
    const rows = []

    for( let y = 0; y < settings_mapSize; y++ ){
      const row = []
      for( let x = 0; x < settings_mapSize; x++ ){
        row.push( 0 )
      }
      rows.push( row )
    }

    return rows
  }

  const expandLand = ( rows, tiles, tileCount ) => {
    while( tiles.length < tileCount ){
      const [ cx, cy ] = pick( tiles )
      const neighbours = getImmediateWaterNeighbours( cx, cy, rows )
      if( neighbours.length ){
        const [ nx, ny ] = pick( neighbours )
        tiles.push( [ nx, ny ] )
        rows[ ny ][ nx ] = ~~( Math.random() * 7 ) + 2
      }
    }
  }

  const leftmostLand = rows => {
    let lx = settings_canvasTiles
    let ly = settings_canvasTiles
    for( let y = 0; y < settings_mapSize; y++ ){
      for( let x = 0; x < settings_mapSize; x++ ){
        if( rows[ y ][ x ] ){
          const neighbours = getWaterNeighbours( x, y, rows )

          if( neighbours.length && x < lx ){
            lx = x
            ly = y
          }
        }
      }
    }
    return [ lx, ly ]
  }

  const addSand = rows => {
    for( let y = 0; y < settings_mapSize; y++ ){
      for( let x = 0; x < settings_mapSize; x++ ){
        if( rows[ y ][ x ] ){
          // land with a water neighbour, make beach
          const neighbours = getWaterNeighbours( x, y, rows )

          if( neighbours.length ){
            rows[ y ][ x ] = 2
          }
        } else {
          // water with no water neighbours, make beach
          const neighbours = getImmediateWaterNeighbours( x, y, rows )

          if( !neighbours.length ){
            rows[ y ][ x ] = 2
          }
        }
      }
    }
  }

  const drunkenWalk = ( rows, x1, y1, x2, y2, getTileIndex, d = 0.66 ) => {
    rows[ y1 ][ x1 ] = getTileIndex()

    if( x1 === x2 && y1 === y2 ) return

    const neighbours = getPassableNeighbours( x1, y1, rows )

    if( Math.random() < d ){
      const neighbour = pick( neighbours )

      drunkenWalk( rows, neighbour[ 0 ], neighbour[ 1 ], x2, y2, getTileIndex, d )

      return
    }

    const [ x, y ] = towards( x1, y1, x2, y2 )

    if( blocks( x, y ) ){
      drunkenWalk( rows, x1, y1, x2, y2, getTileIndex, d )

      return
    }

    drunkenWalk( rows, x, y, x2, y2, getTileIndex, d )
  }

  const island = () => {
    const len = settings_mapSize * settings_mapSize
    const tileCount = ~~( 0.6 * len )
    const tiles = [ [ player_x, player_y ] ]
    const rows = emptyMap()

    rows[ player_y ][ player_x ] = 2

    expandLand( rows, tiles, tileCount )
    addSand( rows )

    const [ lx, ly ] = leftmostLand( rows )

    player_x = lx
    player_y = ly
    map_boatX = player_x - 2
    map_boatY = player_y

    const hut = emptyNear( tiles, player_x, player_y, 15, 25 )

    drunkenWalk( rows, player_x, player_y, hut[ 0 ], hut[ 1 ], () => ~~( Math.random() * 3 ) + index_path )

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
      x = player_x + x
      y = player_y + y

      if( map[ y ][ x ] === index_tree ){
        message = messages[ 4 ]
        return
      }

      if( player_health <= 0 || !inBounds( x, y ) || blocks( map[ y ][ x ] ) ) return

      player_x = x
      player_y = y
    }

    const draw = time => {
      // set up start when we first get a proper tick time
      if( time && !start ) start = time

      elapsed = time - start

      // is this over complicated? might be a simpler way to do this
      const frameTime = ~~( elapsed / settings_animTime )
      const currentFrame = frameTime % 2 ? 0 : 1

      // blank the canvas
      c.width = c.height = settings_tileSize * settings_canvasTiles

      if( screens.length ){
        c.classList.add( 'a' )

        const [ text, options ] = screens[ screens.length - 1 ]

        let y
        for( y = 0; y < text.length; y++ ){
          drawText( text[ y ], 1, y + 1 )
        }
        for( let s = 0; s < options.length; s++ ){
          drawText(
            `${ s === computer_selected ? '> ': '  ' }${ options[ s ][ 0 ] }`, 1, y + s + 2
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
          const sx = 4 * settings_tileSize
          const sy = 0
          const sWidth = settings_tileSize
          const sHeight = settings_tileSize
          const dx = ( settings_centerTile + 0.5 ) * settings_tileSize
          const dy = ( settings_centerTile + 0.5 ) * settings_tileSize
          const dWidth = settings_tileSize
          const dHeight = settings_tileSize
          ctx.drawImage( player, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
        } else {
          const yOff = ~~( ( settings_canvasTiles * 2 - message.length ) / 2 )

          for( let y = 0; y < message.length; y++ ){
            const line = message[ y ]
            const xOff = ~~( ( settings_canvasTiles * 2 - line.length ) / 2 )
            const tX = xOff
            const tY = y + yOff
            drawText( line, tX, tY )
          }
        }

        requestAnimationFrame( draw )

        return
      }

      for( let y = 0; y < settings_viewTiles; y++ ){
        for( let x = 0; x < settings_viewTiles; x++ ){
          const mapX = ( player_x - settings_centerTile ) + x
          const mapY = ( player_y - settings_centerTile ) + y

          const sy = 0
          const sWidth = settings_tileSize
          const sHeight = settings_tileSize
          const dx = ( x + 1 ) * settings_tileSize
          const dy = ( y + 1 ) * settings_tileSize
          const dWidth = settings_tileSize
          const dHeight = settings_tileSize

          let sx = currentFrame * settings_tileSize

          // bounds check
          if( inBounds( mapX, mapY ) ){
            const tileIndex = map[ mapY ][ mapX ]

            if( tileIndex ) sx = tileIndex * settings_tileSize
          }

          ctx.drawImage( tiles, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )

          if( x === settings_centerTile && y === settings_centerTile ){
            if( player_health ){
              sx = ( currentFrame * settings_tileSize ) + ( player_facing * settings_tileSize * 2 )
            } else {
              sx = 4 * settings_tileSize
            }

            ctx.drawImage( player, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
          }

          if( mapX === map_boatX && mapY === map_boatY ){
            const sx = index_boatLeft * settings_tileSize
            const sy = 0
            const sWidth = settings_tileSize
            const sHeight = settings_tileSize
            const dx = ( x + 1 ) * settings_tileSize
            const dy = ( y + 1 ) * settings_tileSize
            const dWidth = settings_tileSize
            const dHeight = settings_tileSize
            ctx.drawImage( player, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
          }
          if( mapX === ( map_boatX + 1 ) && mapY === map_boatY ){
            const sx = index_boatRight * settings_tileSize
            const sy = 0
            const sWidth = settings_tileSize
            const sHeight = settings_tileSize
            const dx = ( x + 1 ) * settings_tileSize
            const dy = ( y + 1 ) * settings_tileSize
            const dWidth = settings_tileSize
            const dHeight = settings_tileSize
            ctx.drawImage( player, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
          }
        }
      }

      drawText( `RANGER DOWN   ${ timeStr() }`, 0.5, 0.5 )
      // health
      let sx = index_health * settings_tileSize
      const sy = 0
      const sWidth = settings_tileSize
      const sHeight = settings_tileSize
      const dx = 0
      let dy = settings_tileSize
      const dWidth = settings_tileSize
      const dHeight = settings_tileSize
      ctx.drawImage( tiles, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
      drawText( `${ player_health }`, player_health < 10 ? 0.5 : 0, 4 )
      // food
      sx = index_food * settings_tileSize
      dy += settings_tileSize * 2
      ctx.drawImage( tiles, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
      drawText( `${ player_food }`, player_food < 10 ? 0.5 : 0, 8 )

      requestAnimationFrame( draw )
    }

    c.ontouchend = e => {
      const touches = [ ...e.changedTouches ]

      touches.forEach( t => {
        const { clientX, clientY } = t
        const tileSize = c.getBoundingClientRect().width / settings_canvasTiles
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

        if( tx === settings_centerTile && ty === settings_centerTile ){
          // tapped on player
          return
        }

        if( tx < 0 || ty < 0 ){
          //tapped an interface tile
          return
        }

        const dx = Math.max( settings_centerTile, tx ) - Math.min( settings_centerTile, tx )
        const dy = Math.max( settings_centerTile, ty ) - Math.min( settings_centerTile, ty )

        let x = 0
        let y = 0
        if( dx > dy ){
          if( tx > settings_centerTile ){
            x = 1
            player_facing = 0
          } else {
            x = -1
            player_facing = 1
          }
        } else if( dx < dy ){
          y = ty > settings_centerTile ? 1 : -1
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
        if( e.keyCode === 13 && options[ computer_selected ] ){
          //const [ name, pageIndex ] = options[ selected ]
          //screens.push( computerScreens[ pageIndex ] )
          computer_selected = 0
        }
        // up
        if( e.keyCode === 87 || e.keyCode === 38 ){
          if( computer_selected > 0 ) computer_selected--
        }
        // down
        if( e.keyCode === 83 || e.keyCode === 40 ){
          if( computer_selected < options.length - 1 ) computer_selected++
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
            //screens.push( computerScreens[ 0 ] )
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
        player_facing = 1
        x = -1
      }
      // right, change the facing as well
      if( e.keyCode === 68 || e.keyCode === 39 ){
        player_facing = 0
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