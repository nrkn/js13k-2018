/*
  The world's roughest build script
*/
const fs = require( 'fs' )
const yazl = require( 'yazl' )
const uglifycss = require( 'uglifycss' )
const uglify = require( 'uglify-es' )
const uglifyOptions = require( './uglify-options.json' )

const { minify } = uglify

const js = fs.readFileSync( './src/main.js', 'utf8' ).replace( /const/g, 'let' )
const min = minify( js, uglifyOptions )
let { error, code } = min

if( error ) return console.error( error.message )

code = code.replace( `"use strict";const s=()=>{`, '' ).replace( `};s();`, '' ).replace( /\"/g, '`' )

let css = fs.readFileSync( './src/main.css', 'utf8' )

css = uglifycss.processString( css )

let html = fs.readFileSync( './src/index.html', 'utf8' )

html = html.replace( /\n/g, '' ).replace( /\r/g, '' )

html = html.replace( '<script src=main.js></script>', `<script>${ code }</script>` )
html = html.replace( '<link rel=stylesheet href=main.css>', `<style>${ css }</style>` )

const files = [ 'f.gif', 't.gif', 'p.gif', 's.png' ]

const zip = new yazl.ZipFile()

files.forEach( file => zip.addFile( `./src/${ file }`, file ) )
zip.addBuffer( Buffer.from( html ), 'index.html', {
  mtime: new Date(),
  mode: parseInt( '0100664', 8 )
})
zip.outputStream.pipe( fs.createWriteStream( './dist/offline.zip' )).on( 'close', () => {
  const buffer = fs.readFileSync( './dist/offline.zip' )
  const { byteLength } = buffer
  console.log( `Size: ${ byteLength }, Remaining: ${ 13312 - byteLength }` )
})
zip.end()
