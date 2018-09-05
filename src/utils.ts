export const loadImage = ( path: string ) => new Promise<HTMLImageElement>( resolve => {
  const img = new Image()
  img.onload = () => resolve( img )
  img.src = path
} )

export const loadImages = ( ...paths: string[] ) => Promise.all( paths.map( loadImage ) )

export const pick = ( arr: any[] ) => arr[ randInt( arr.length ) ]

export const randInt = ( exclMax: number, min = 0 ) => ~~( Math.random() * exclMax ) + min

export const shuffle = <T>( arr: T[] ): T[] => arr.slice().sort( () => randInt( 3 ) - 1 )
