const EXPIRY_PROBABILITY = 0.1
let mouseLocation = {x: 0, y: 0}
let midpoint = {x: 0, y: 0}
let offset = {x: 0, y: 0}
let scale = 1

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('branching-canvas')
  const context = canvas.getContext('2d')

  canvas.addEventListener('mousemove', event => {
    mouseLocation = {x: event.offsetX, y: event.offsetY}
  })

  const fitCanvas = fitCanvasMaker(canvas)
  fitCanvas()
  window.onresize = fitCanvas

  const renderLoop = renderLoopMaker(canvas, context)
  window.requestAnimationFrame(renderLoop)
})

const fitCanvasMaker = canvas => () => {
  let computed = getComputedStyle(canvas)

  canvas.width = computed.width.slice(0, -2)
  canvas.height = computed.height.slice(0, -2)

  offset = {x: canvas.width / 2, y: canvas.height / 2}
}

const renderLoopMaker = (canvas, context) => {
  let centres = [{
    location: {
      x: 0,
      y: 0,
    },
    parent: null,
    children: [],
    colour: {
      red: 98,
      green: 98,
      blue: 98,
    },
    expired: 0,
  }]

  let liveCentres = [...centres]

  return function renderLoop() {
    attemptNewCentre(centres, liveCentres)

    let width = canvas.width
    let height = canvas.height

    let minX = Math.min(...centres.map(centre => centre.location.x)) - 1
    let maxX = Math.max(...centres.map(centre => centre.location.x)) + 1
    let midXTarget = (minX + maxX) / 2
    let minY = Math.min(...centres.map(centre => centre.location.y)) - 1
    let maxY = Math.max(...centres.map(centre => centre.location.y)) + 1
    let midYTarget = (minY + maxY) / 2

    let xScale = width / (maxX - minX)
    let yScale = height / (maxY - minY)
    let scaleTarget = Math.min(xScale, yScale)

    midpoint = {
      x: approach(midpoint.x, midXTarget),
      y: approach(midpoint.y, midYTarget),
    }

    scale = approach(scale, scaleTarget)

    context.strokeStyle = 'white'
    context.lineWidth = scale / 2

    context.clearRect(0, 0, width, height)

    drawCircleAndDescendants(context, centres[0], false)

    window.requestAnimationFrame(renderLoop)
  }
}

const drawCircleAndDescendants = (context, centre, ancestorSelected) => {
  let adjustedLocation = adjusted(centre.location)
  let affected = containsMouse(adjustedLocation, scale) || ancestorSelected

  if (affected) {
    context.fillStyle = 'grey'
  } else if (centre.expired == 0) {
    context.fillStyle = 'rgb(196, 255, 150)'
  } else {
    let colour = centre.colour
    context.fillStyle = `rgb(
      ${colour.red},
      ${colour.green},
      ${colour.blue}
    )`
  }

  context.beginPath()
  context.arc(
    adjustedLocation.x,
    adjustedLocation.y,
    scale,
    0,
    2 * Math.PI
  )
  context.closePath()
  context.fill()

  context.fillStyle = 'white'
  context.beginPath()
  context.arc(
    adjustedLocation.x,
    adjustedLocation.y,
    scale / 4,
    0,
    2 * Math.PI
  )
  context.closePath()
  context.fill()

  if (centre.parent) {
    let adjustedParentLocation = adjusted(centre.parent.location)
    context.beginPath()
    context.moveTo(adjustedLocation.x, adjustedLocation.y)
    context.lineTo(adjustedParentLocation.x, adjustedParentLocation.y)
    context.stroke()
  }

  for (let child of centre.children) {
    drawCircleAndDescendants(context, child, affected)
  }
}

const adjusted = (location) => ({
  x: (location.x - midpoint.x) * scale + offset.x,
  y: (location.y - midpoint.y) * scale + offset.y,
})

const containsMouse = (location, scale) => {
  if (distance_squared(mouseLocation, location) < scale ** 2) {
    return true
  }
  return false
}

const attemptNewCentre = (centres, liveCentres) => {
  if (liveCentres.length > 0) {
    const index = Math.floor(Math.random() * liveCentres.length)
    const potentialParent = liveCentres[index]

    const angle = Math.random() * 2 * Math.PI

    let x = potentialParent.location.x + Math.cos(angle) * 2
    let y = potentialParent.location.y + Math.sin(angle) * 2
    let location = {x, y}

    if (!overlap(centres, location)) {
      let expired = 0
      let colour = driftColour(potentialParent.colour)
      let children = []
      let parent = potentialParent
      let candidate = {location, parent, children, colour, expired}
      centres.push(candidate)
      liveCentres.push(candidate)
      potentialParent.children.push(candidate)
    }

    if (Math.random() < EXPIRY_PROBABILITY) {
      potentialParent.expired = 1
      liveCentres.splice(index, 1)
    }
  }
}

const overlap = (centres, location) => {
  for (let centre of centres) {
    if (distance_squared(centre.location, location) < 4) {
      return true
    }
  }

  return false
}

const distance_squared = (a, b) => {
  return (b.x - a.x) ** 2 + (b.y - a.y) ** 2
}

const driftColour = colour => {
  const red = Math.min(
    196,
    Math.max(
      0,
      colour.red + Math.floor(Math.random() * 25) - 12
    )
  )
  const green = Math.min(
    196,
    Math.max(
      0,
      colour.green + Math.floor(Math.random() * 25) - 12
    )
  )
  const blue = Math.min(
    196,
    Math.max(
      0,
      colour.blue + Math.floor(Math.random() * 25) - 12
    )
  )

  return {red, green, blue}
}

const approach = (value, target) => {
  const difference = target - value
  return value + difference * 0.03
}

