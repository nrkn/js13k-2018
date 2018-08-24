const fs = require( 'fs' )

const root = fs.readFileSync( './dist/browser/browser.js', 'utf8' )

const names = new Set()

const resolve = src => {
  const lines = src.split( '\n' )

  const resolved = lines.map( line => {
    if( line.startsWith( 'export ' ) ) return line.replace( 'export ', '' )
    if( line.startsWith( 'import ' ) ){
      const segs = line.split( ' ' )
      const name = segs[ segs.length - 1 ].replace( ';', '' ).replace( /\'/g, '' ).substr( 2 )

      if( names.has( name ) ) return ''

      const code = fs.readFileSync( `./dist/browser/${ name }.js`, 'utf8' )
      names.add( name )

      return resolve( code )
    }
    if( line.startsWith( '//#' ) ) return ''
    return line
  })

  return resolved.join( '\n' )
}

const resolved = resolve( root )

const output = `const s = () => {${ resolved }};s()`

fs.writeFileSync( './dist/browser.js', output, 'utf8' )

module.exports = output

