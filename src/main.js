'use strict'
/*
  close over to make uglify minify properly as couldn't seem to find the option
  to minify top level - easy enough to remove this
*/
const s = () => {
  let debug = false
  let ctx = debug ? 0 : c.getContext( '2d' )

  const settings_tileSize = 16
  const settings_viewTiles = 9
  const settings_canvasTiles = settings_viewTiles + 1
  const settings_centerTile = ~~( settings_viewTiles / 2 )
  const settings_mapSize = 128
  const settings_animTime = 500
  const settings_waterBorder = 15

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

  const inBounds = ( x, y ) =>
    x >= 0 &&
    x <= settings_mapSize - 1 &&
    y >= 0 &&
    y <= settings_mapSize - 1

  const inBorder = ( x, y ) =>
    x >= settings_waterBorder &&
    x <= settings_mapSize - settings_waterBorder &&
    y >= settings_waterBorder &&
    y <= settings_mapSize - settings_waterBorder

  const allTiles = () => {
    const tiles = []
    for( let y = 0; y < settings_mapSize; y++ ){
      for( let x = 0; x < settings_mapSize; x++ ){
        tiles.push( [ x, y ] )
      }
    }
    return tiles
  }

  const hasTile = ( x, y ) => tiles.some( t => t[ 0 ] === x && t[ 1 ] === y )

  const waterTiles = () => allTiles().filter( ( [ x, y ] ) => !map[ y ][ x ] )

  const waterNear = ( x1, y1, min, max ) =>
    pick( waterTiles().filter( ( [ x2, y2 ] ) => {
      let dx = delta( x1, x2 )
      let dy = delta( y1, y2 )

      return dx >= min && dx <= max && dy >= min && dy <= max
    } ) )

  const emptyNear = ( x1, y1, min, max ) =>
    pick( tiles.filter( ( [ x2, y2 ] ) => {
      let dx = delta( x1, x2 )
      let dy = delta( y1, y2 )

      return dx >= min && dx <= max && dy >= min && dy <= max
    } ) )

  const isNear = ( x1, y1, x2, y2, dist ) => {
    let dx = delta( x1, x2 )
    let dy = delta( y1, y2 )

    return dx <= dist && dy <= dist
  }

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

  const getPassableNeighbours = ( x, y ) =>
    immediateNeighbours( x, y ).filter( ( [ nx, ny ] ) => inBounds( nx, ny ) && !blocks( map[ ny ][ nx ] ) )

  const getImmediateWaterNeighbours = ( x, y ) =>
    immediateNeighbours( x, y ).filter( ( [ nx, ny ] ) => inBounds( nx, ny ) && !map[ ny ][ nx ] )

  const getWaterNeighbours = ( x, y ) =>
    allNeighbours( x, y ).filter( ( [ nx, ny ] ) => inBounds( nx, ny ) && !map[ ny ][ nx ] )

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
    tiles = []
    map = []

    for( let y = 0; y < settings_mapSize; y++ ){
      const row = []
      for( let x = 0; x < settings_mapSize; x++ ){
        row.push( 0 )
      }
      map.push( row )
    }
  }

  const expandLand = tileCount => {
    while( tiles.length < tileCount ){
      const [ cx, cy ] = pick( tiles )
      if( inBorder( cx, cy ) ){
        const neighbours = getImmediateWaterNeighbours( cx, cy )
        if( neighbours.length ){
          const [ nx, ny ] = pick( neighbours )
          tiles.push( [ nx, ny ] )
          map[ ny ][ nx ] = ~~( Math.random() * 7 ) + 2
        }
      }
    }
  }

  const leftmostLand = () => {
    let lx = settings_mapSize
    let ly = settings_mapSize
    for( let y = 0; y < settings_mapSize; y++ ){
      for( let x = 0; x < settings_mapSize; x++ ){
        if( map[ y ][ x ] ){
          const neighbours = getWaterNeighbours( x, y )

          if( neighbours.length && x < lx ){
            lx = x
            ly = y
          }
        }
      }
    }
    return [ lx, ly ]
  }

  const addSand = () => {
    for( let y = 0; y < settings_mapSize; y++ ){
      for( let x = 0; x < settings_mapSize; x++ ){
        if( map[ y ][ x ] ){
          // land with a water neighbour, make beach
          const neighbours = getWaterNeighbours( x, y )

          if( neighbours.length ){
            map[ y ][ x ] = 2
          }
        } else {
          // water with no water neighbours, make beach
          const neighbours = getImmediateWaterNeighbours( x, y )

          if( !neighbours.length ){
            map[ y ][ x ] = 2
          }
        }
      }
    }
  }

  const drunkenWalk2 = ( x1, y1, x2, y2, getTileIndex, d = 0.66 ) => {
    map[ y1 ][ x1 ] = getTileIndex()

    if( !hasTile( x1, y1 ) )
      tiles.push( [ x1, y1 ] )

    if( x1 === x2 && y1 === y2 ) return

    const neighbours = immediateNeighbours( x1, y1 )

    if( Math.random() < d ){
      const neighbour = pick( neighbours )

      drunkenWalk2( neighbour[ 0 ], neighbour[ 1 ], x2, y2, getTileIndex, d )

      return
    }

    const [ x, y ] = towards( x1, y1, x2, y2 )

    drunkenWalk2( x, y, x2, y2, getTileIndex, d )
  }

  const drunkenWalk = ( x1, y1, x2, y2, getTileIndex, d = 0.66 ) => {
    map[ y1 ][ x1 ] = getTileIndex()

    if( x1 === x2 && y1 === y2 ) return

    const neighbours = getPassableNeighbours( x1, y1, map )

    if( Math.random() < d ){
      const neighbour = pick( neighbours )

      drunkenWalk( neighbour[ 0 ], neighbour[ 1 ], x2, y2, getTileIndex, d )

      return
    }

    const [ x, y ] = towards( x1, y1, x2, y2 )

    if( blocks( x, y ) ){
      drunkenWalk( x1, y1, x2, y2, getTileIndex, d )

      return
    }

    drunkenWalk( x, y, x2, y2, getTileIndex, d )
  }

  const island = () => {
    emptyMap()

    const waypoints = [
      pick( waterTiles().filter( ( [ x, y ] ) => inBorder( x, y ) ) )
    ]

    const waypointSize = 20

    for( let w = 1; w < waypointSize; w++ ){
      const [ cx, cy ] = waypoints[ w - 1 ]
      const [ wx, wy ] = pick( waterTiles().filter( ( [ x, y ] ) => inBorder( x, y ) ) )
      waypoints.push( [ wx, wy ] )

      drunkenWalk2( cx, cy, wx, wy, () => ~~( Math.random() * 3 ) + index_path )
    }

    const len = settings_mapSize * settings_mapSize
    const tileCount = ~~( 0.4 * len )

    expandLand( tileCount )
    addSand()

    const [ lx, ly ] = leftmostLand()

    player_x = lx
    player_y = ly
    map_boatX = player_x - 2
    map_boatY = player_y

    const hut = waypoints[ 1 ]

    map_hutX = hut[ 0 ]
    map_hutY = hut[ 1 ]
  }

  // nb the text grid is half the size of the tile grid, 8x8 not 16x16
  const drawChar = ( font, ch = '', tx = 0, ty = 0 ) =>
    ctx.drawImage( font, ( ch.charCodeAt( 0 ) - 32 ) * 8 , 0, 8, 8, tx * 8, ty * 8, 8, 8 )

  const drawText = ( font, str = '', tx = 0, ty = 0 ) => {
    for( let i = 0; i < str.length; i++ )
      drawChar( font, str[ i ], tx + i, ty )
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

  const newState = () => {
    player_x = ~~( settings_mapSize / 2 )
    player_y = ~~( settings_mapSize / 2 )
    player_facing = 0
    player_food = 1
    player_health = 1
    player_maxHealth = 10
    hours = 17
    minutes = 30
    message = messages[ 3 ]
    computer_selected = 0
    screens = []
    map = []
    tiles = []
    island()
  }

  let player_x
  let player_y
  let player_facing
  let player_food
  let player_health
  let player_maxHealth
  let hours
  let minutes
  let message
  let computer_selected
  let screens
  let map_boatX
  let map_boatY
  let map_hutX
  let map_hutY
  let map
  let tiles

  newState()

  if( debug ){
    const Jimp = require( 'jimp' )

    new Jimp( settings_mapSize, settings_mapSize, ( err, image ) => {
      if( err ) {
        throw err
        return
      }

      for( let y = 0; y < settings_mapSize; y++ ){
        for( let x = 0; x < settings_mapSize; x++ ){
          let color = Jimp.rgbaToInt( 0, 0, 0, 255 )

          if( map[ y ][ x ] ){
            color = Jimp.rgbaToInt( 255, 255, 255, 255 )
          }

          if( x === map_hutX && y === map_hutY ){
            color = Jimp.rgbaToInt( 255, 0, 0, 255 )
          }

          if( y === map_boatY && ( x === map_boatX || x === map_boatX + 1 ) ){
            color = Jimp.rgbaToInt( 0, 0, 255, 255 )
          }

          if( x === player_x && y === player_y ){
            color = Jimp.rgbaToInt( 0, 255, 0, 255 )
          }

          image.setPixelColor( color, x, y )
        }
      }

      image.write( 'map.png' )
    })

    return
  }

  loadImages( 'f.gif', 't.gif', 'p.gif', 's.png' ).then( ( [ font, tiles, player, splash ] ) => {
    const draw = time => {
      const currentFrame = ~~( time / settings_animTime ) % 2 ? 0 : 1

      // blank the canvas
      c.width = c.height = settings_tileSize * settings_canvasTiles

      if( screens.length ){
        c.classList.add( 'a' )

        const [ text, options ] = screens[ screens.length - 1 ]

        let y
        for( y = 0; y < text.length; y++ ){
          drawText( font, text[ y ], 1, y + 1 )
        }
        for( let s = 0; s < options.length; s++ ){
          drawText(
            font,
            `${ s === computer_selected ? '> ': '  ' }${ options[ s ][ 0 ] }`,
            1, y + s + 2
          )
        }

        requestAnimationFrame( draw )

        return
      }

      if( message ){
        c.classList.add( 'g' )
        if( message[ 0 ] === 's.png' ){
          ctx.drawImage( splash, 0, 0 )

          drawText( font, 'C2018 Wundergast', 2, 17 )

          ctx.drawImage(
            player,
            4 * settings_tileSize, 0,
            settings_tileSize, settings_tileSize,
            ( settings_centerTile + 0.5 ) * settings_tileSize, ( settings_centerTile + 0.5 ) * settings_tileSize,
            settings_tileSize, settings_tileSize
          )
        } else {
          const yOff = ~~( ( settings_canvasTiles * 2 - message.length ) / 2 )

          for( let y = 0; y < message.length; y++ ){
            const line = message[ y ]
            const xOff = ~~( ( settings_canvasTiles * 2 - line.length ) / 2 )
            const tX = xOff
            const tY = y + yOff
            drawText( font, line, tX, tY )
          }
        }

        requestAnimationFrame( draw )

        return
      }

      for( let y = 0; y < settings_viewTiles; y++ ){
        for( let x = 0; x < settings_viewTiles; x++ ){
          const mapX = ( player_x - settings_centerTile ) + x
          const mapY = ( player_y - settings_centerTile ) + y

          let sx = currentFrame * settings_tileSize

          // bounds check
          if( inBounds( mapX, mapY ) ){
            const tileIndex = map[ mapY ][ mapX ]

            if( tileIndex ) sx = tileIndex * settings_tileSize
          }

          ctx.drawImage(
            tiles,
            sx, 0,
            settings_tileSize, settings_tileSize,
            ( x + 1 ) * settings_tileSize, ( y + 1 ) * settings_tileSize,
            settings_tileSize, settings_tileSize
          )

          if( x === settings_centerTile && y === settings_centerTile ){
            if( player_health ){
              sx = ( currentFrame * settings_tileSize ) + ( player_facing * settings_tileSize * 2 )
            } else {
              sx = 4 * settings_tileSize
            }

            ctx.drawImage(
              player,
              sx, 0,
              settings_tileSize, settings_tileSize,
              ( x + 1 ) * settings_tileSize, ( y + 1 ) * settings_tileSize,
              settings_tileSize, settings_tileSize
            )
          }

          if( mapX === map_boatX && mapY === map_boatY ){
            ctx.drawImage(
              player,
              index_boatLeft * settings_tileSize, 0,
              settings_tileSize, settings_tileSize,
              ( x + 1 ) * settings_tileSize, ( y + 1 ) * settings_tileSize,
              settings_tileSize, settings_tileSize
            )
          }
          if( mapX === ( map_boatX + 1 ) && mapY === map_boatY ){
            ctx.drawImage(
              player,
              index_boatRight * settings_tileSize, 0,
              settings_tileSize, settings_tileSize,
              ( x + 1 ) * settings_tileSize, ( y + 1 ) * settings_tileSize,
              settings_tileSize, settings_tileSize
            )
          }
        }
      }

      drawText( font, `RANGER DOWN   ${ timeStr() }`, 0.5, 0.5 )

      ctx.drawImage(
        tiles,
        index_health * settings_tileSize, 0,
        settings_tileSize, settings_tileSize,
        0, settings_tileSize,
        settings_tileSize, settings_tileSize
      )

      drawText( font, `${ player_health }`, player_health < 10 ? 0.5 : 0, 4 )

      ctx.drawImage(
        tiles,
        index_food * settings_tileSize, 0,
        settings_tileSize, settings_tileSize,
        0, settings_tileSize * 3,
        settings_tileSize, settings_tileSize
      )

      drawText( font, `${ player_food }`, player_food < 10 ? 0.5 : 0, 8 )

      requestAnimationFrame( draw )
    }

    c.ontouchend = e => {
      const touches = [ ...e.changedTouches ]

      touches.forEach( t => {
        const { clientX, clientY } = t
        const tileSize = c.getBoundingClientRect().width / settings_canvasTiles
        const tx = ~~( clientX / tileSize ) - 1
        const ty = ~~( clientY / tileSize ) - 1

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

        const dx = delta( settings_centerTile, tx )
        const dy = delta( settings_centerTile, ty )

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

    requestAnimationFrame( draw )
  })
}

s()