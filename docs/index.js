const EXPIRY_PROBABILITY = 0.1

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('branching-canvas')
  const context = canvas.getContext('2d')

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
}

const renderLoopMaker = (canvas, context) => {
  let centres = [{
    location: {
      x: 0,
      y: 0,
    },
    parent: {
      x: 0,
      y: 0,
    },
    colour: {
      red: 98,
      green: 98,
      blue: 98,
    },
    expired: 0,
  }]

  let liveCentres = [...centres]

  let midX = 0
  let midY = 0
  let scale = 1

  return function renderLoop() {
    const newCentre = attemptNewCentre(centres, liveCentres)
    if (newCentre !== null) {
      centres.push(newCentre)
      liveCentres.push(newCentre)
    }

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

    let xOffset = width / 2
    let yOffset = height / 2

    midX = approach(midX, midXTarget)
    midY = approach(midY, midYTarget)
    scale = approach(scale, scaleTarget)

    context.strokeStyle = 'white'
    context.lineWidth = scale / 2

    context.clearRect(0, 0, width, height)

    for (let centre of centres) {
      adjustedX = (centre.location.x - midX) * scale + width / 2
      adjustedY = (centre.location.y - midY) * scale + height / 2
      adjustedParentX = (centre.parent.x - midX) * scale + width / 2
      adjustedParentY = (centre.parent.y - midY) * scale + height / 2

      if (centre.expired == 0) {
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
        adjustedX,
        adjustedY,
        scale,
        0,
        2 * Math.PI
      )
      context.closePath()
      context.fill()

      context.fillStyle = 'white'
      context.beginPath()
      context.arc(
        adjustedX,
        adjustedY,
        scale / 4,
        0,
        2 * Math.PI
      )
      context.closePath()
      context.fill()

      context.beginPath()
      context.moveTo(adjustedX, adjustedY)
      context.lineTo(adjustedParentX, adjustedParentY)
      context.stroke()
    }

    window.requestAnimationFrame(renderLoop)
  }
}

const attemptNewCentre = (centres, liveCentres) => {
  let candidate = null

  if (liveCentres.length > 0) {
    const index = Math.floor(Math.random() * liveCentres.length)
    const potentialParent = liveCentres[index]

    const angle = Math.random() * 2 * Math.PI

    let expired = 0
    let colour = driftColour(potentialParent.colour)
    let potentialParentX = potentialParent.location.x
    let potentialParentY = potentialParent.location.y
    let parent = {x: potentialParentX, y: potentialParentY}
    let x = potentialParentX + Math.cos(angle) * 2
    let y = potentialParentY + Math.sin(angle) * 2
    let location = {x, y}
    candidate = {location, parent, colour, expired}

    if (overlap(centres, candidate)) {
      candidate = null
    }

    if (Math.random() < EXPIRY_PROBABILITY) {
      potentialParent.expired = 1
      liveCentres.splice(index, 1)
    }
  }

  return candidate
}

const overlap = (centres, candidate) => {
  for (let centre of centres) {
    if (distance_squared(centre.location, candidate.location) < 4) {
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

