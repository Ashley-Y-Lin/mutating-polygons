let main
let offscreen
let img
let polygons = 100
let polygonCoord = 3
let DNA = []
let mutationRate = .001
let mutatedDNA
let mutatedPixels
let mutatedFitness
let currFitness = Number.MAX_VALUE
let totalMutations = 0
let successfulMutations = 0

function preload(){
  img = loadImage("girl.jpeg")
}

function setup(){
  createCanvas(1050, 300)
  pixelDensity(1)
  img.resize(300, 300)
  img.loadPixels()
  offscreen = createGraphics(img.width, img.height)
  main = createGraphics(img.width, img.height)
  colorMode(RGB)
  noStroke()
  for (let i=0; i<polygons; i++){
    let px, py
    let red, green, blue, alpha
    let ipx, ipy
    let ipixel

    for (let j=0; j<polygonCoord; j++){
      px = Math.floor(map(Math.random(), 0, 1, 0, main.width))
      py = Math.floor(map(Math.random(), 0, 1, 0, main.height))
      DNA.push(px, py)
    }

    ipx = floor(map(Math.random(), 0, 1, 0, img.width))
    ipy = floor(map(Math.random(), 0, 1, 0, img.height))
    ipixel = img.get(ipx, ipy)
    console.log(ipixel)

    red = ipixel[0]
    green = ipixel[1]
    blue = ipixel[2]
    alpha = 50

    DNA.push(red, green, blue, alpha)
  }
  console.log(DNA)
}

function draw(){
  clear()
  mutatedDNA = mutate()
  totalMutations += 1
  mutatedPixels = renderPolygonsOffscreen()
  mutatedFitness = getFitness(mutatedPixels, img.pixels)
  if (currFitness > mutatedFitness){
    currFitness = mutatedFitness
    DNA = mutatedDNA
    renderPolygonsOnCanvas()
    //renderDiff()
    successfulMutations += 1
  }
  console.log(currFitness)
  image(main, 0, 0)
  image(offscreen, 350, 0)
  image(img, 700, 0)
}

function getFitness(mutatedPixels, imagePixels){
  let squaredDiff = 0
  for (let i=0; i<img.width; i++){
    for (let j=0; j<img.height; j++){
      let location = (j * img.width + i) * 4
      squaredDiff += (mutatedPixels[location] - imagePixels[location]) * (mutatedPixels[location] - imagePixels[location])
      squaredDiff += (mutatedPixels[location+1] - imagePixels[location+1]) * (mutatedPixels[location+1] - imagePixels[location+1])
      squaredDiff += (mutatedPixels[location+2] - imagePixels[location+2]) * (mutatedPixels[location+2] - imagePixels[location+2])
      squaredDiff += (mutatedPixels[location+3] - imagePixels[location+3]) * (mutatedPixels[location+3] - imagePixels[location+3])
    }
  }
  //console.log(squaredDiff)
  return squaredDiff / (img.width * img.height * 4)
}

function mutate(){
  let roll1
  let roll2
  mutatedDNA = DNA.slice()
  for (let i=0; i<DNA.length; i+=10){
    for (let j=0; j<polygonCoord * 2; j+=2){
      roll1 = Math.random()
      roll2 = Math.random()
      if (roll1 < mutationRate){
        let tempX = map(Math.random(), 0, 1, 0, main.width)
        mutatedDNA[i+j] = tempX
      }
      if (roll2 < mutationRate){
        let tempY = map(Math.random(), 0, 1, 0, main.height)
        mutatedDNA[i+j+1] = tempY
      }
    }
    roll1 = Math.random()
    if (roll1 < mutationRate){
      for (let k=0; k<3; k++){
        let temp = map(Math.random(), 0, 1, -50, 50)
        if (mutatedDNA[i+k+6] + temp > 255){
          temp = 255
        }
        if (mutatedDNA[i+k+6] + temp < 0){
          temp = 0
        }
        mutatedDNA[i+k+6] += temp
      }
    }
  }
  return mutatedDNA
}

function renderPolygonsOffscreen(){
  offscreen.clear()
  offscreen.noStroke()
  for (let i=0; i<mutatedDNA.length; i+=10){
    offscreen.fill(mutatedDNA[i+6], mutatedDNA[i+7], mutatedDNA[i+8], mutatedDNA[i+9])
    offscreen.triangle(mutatedDNA[i], mutatedDNA[i+1], mutatedDNA[i+2], mutatedDNA[i+3], mutatedDNA[i+4], mutatedDNA[i+5])
  }
  offscreen.loadPixels()
  return offscreen.pixels
}

function renderPolygonsOnCanvas(){
  main.clear()
  main.noStroke()
  for (let i=0; i<DNA.length; i+=10){
    main.fill(DNA[i+6], DNA[i+7], DNA[i+8], DNA[i+9])
    main.triangle(DNA[i], DNA[i+1], DNA[i+2], DNA[i+3], DNA[i+4], DNA[i+5])
  }
}

/*
function renderDiff(){
// I want renderDiff to display which pixels from the current graphic contribute the most to its fitness score. The pixels that are higher fitness should be more red, and the lower fitness ones should be black.
  diff.clear()
  main.loadPixels()
  img.loadPixels()
  diff.loadPixels()

  let allFitness = []
  let highestFitness = 0

  for (let i=0; i<img.width; i++){
    for (let j=0; j<img.height; j++){
      let location = (j * img.width + i) * 4
      let fitness = pixelFitness(main.pixels, img.pixels, location)
      allFitness.push(fitness)
      if (fitness > highestFitness){
        highestFitness = fitness
      }
    }
  }

  for (let i=0; i<img.width; i++){
    for (let j=0; j<img.height; j++){
      let redComponent = round(map(allFitness[i*img.height+j], 0, highestFitness, 255, 0))
      diff.set(i, j, color(redComponent, 0, 0, 255))
    }
  }

  diff.updatePixels()
}
*/

function pixelFitness(image1, image2, loc){
  let fitness = 0
  fitness += (image1[loc] - image2[loc]) * (image1[loc] - image2[loc])
  fitness += (image1[loc+1] - image2[loc+1]) * (image1[loc+1] - image2[loc+1])
  fitness += (image1[loc+2] - image2[loc+2]) * (image1[loc+2] - image2[loc+2])
  fitness += (image1[loc+3] - image2[loc+3]) * (image1[loc+3] - image2[loc+3])
  return fitness / 4
}