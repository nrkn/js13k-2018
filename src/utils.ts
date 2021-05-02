// async image loader
export const loadImage = (path: string) =>
  new Promise<HTMLImageElement>(
    resolve => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = path
    }
  )

// load a series of images
export const loadImages = (...paths: string[]) =>
  Promise.all(paths.map(loadImage))

// randomly pick something from an array
export const pick = (arr: any[]) =>
  arr[randInt(arr.length)]

// generate a random integer between min and exclusive max
export const randInt = (exclMax: number, min = 0) =>
  ~~(Math.random() * exclMax) + min

// not very sound way to shuffle an array randomly - but very cheap in bytes
export const shuffle = <T>(arr: T[]): T[] =>
  arr.slice().sort(() => randInt(3) - 1)
