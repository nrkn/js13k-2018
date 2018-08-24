/*
  The world's roughest build script
*/
const fs = require( 'fs' )
const yazl = require( 'yazl' )
const uglifycss = require( 'uglifycss' )
const uglify = require( 'uglify-es' )
const uglifyOptions = require( './uglify-options.json' )

const { minify } = uglify

const js = fs.readFileSync( './dist/browser.js', 'utf8' )
const min = minify( js, uglifyOptions )
let { error, code } = min

if( error ) return console.error( error.message )

code = code.replace( /const/g, 'let' )

fs.writeFileSync( './dist/browser.min.js', code, 'utf8' )

let css = fs.readFileSync( './dist/main.css', 'utf8' )

css = uglifycss.processString( css )

let html = fs.readFileSync( './dist/index.html', 'utf8' )

html = html.replace( /\n/g, '' ).replace( /\r/g, '' )

const parts = html.split( '<script src=browser.js></script>' )
html = parts[ 0 ] + '<script>' + code + '</script>' + parts[ 1 ]

//html = html.replace( '<script src=browser.js></script>', '<script>' + code + '</script>' )
html = html.replace( '<link rel=stylesheet href=main.css>', `<style>${ css }</style>` )

const files = [ 'f.gif', 't.gif', 'p.gif', 's.png' ]

const zip = new yazl.ZipFile()

files.forEach( file => zip.addFile( `./dist/${ file }`, file ) )
zip.addBuffer( Buffer.from( html ), 'index.html', {
  mtime: new Date(),
  mode: parseInt( '0100664', 8 )
})
zip.outputStream.pipe( fs.createWriteStream( './zip/offline.zip' )).on( 'close', () => {
  const buffer = fs.readFileSync( './zip/offline.zip' )
  const { byteLength } = buffer
  console.log( `Size: ${ byteLength }, Remaining: ${ 13312 - byteLength }` )
})
zip.end()
