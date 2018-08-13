/*
  The world's roughest build script
*/
const fs = require( 'fs' )
const yazl = require( 'yazl' )
const uglifycss = require( 'uglifycss' )
const uglify = require( 'uglify-es' )
const uglifyOptions = require( './uglify-options.json' )

const { minify } = uglify

const js = fs.readFileSync( './src/main.js', 'utf8' )
const min = minify( js, uglifyOptions )
const { error, code } = min

if( error ) return console.error( error.message )

let css = fs.readFileSync( './src/main.css', 'utf8' )

css = uglifycss.processString( css )

let html = fs.readFileSync( './src/index.html', 'utf8' )

html = html.replace( /\n/g, '' ).replace( /\r/g, '' )

html = html.replace( '<script src=main.js></script>', `<script>${ code }</script>` )
html = html.replace( '<link rel=stylesheet href=main.css>', `<style>${ css }</style>` )

const files = [ 'font.gif' ]

const zip = new yazl.ZipFile()

files.forEach( file => zip.addFile( `./src/${ file }`, file ) )
zip.addBuffer( Buffer.from( html ), 'index.html', {
  mtime: new Date(),
  mode: parseInt( '0100664', 8 )
})
zip.outputStream.pipe( fs.createWriteStream( './dist/offline.zip' )).on( 'close', () => {
  const buffer = fs.readFileSync( './dist/offline.zip' )
  console.log( `Size: ${ buffer.byteLength }` )
})
zip.end()
