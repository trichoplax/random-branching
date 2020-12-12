const OPPORTUNITIES = 7

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
    x: 0,
    y: 0,
    parentX: 0,
    parentY: 0,
    colour: {
      red: 98,
      green: 98,
      blue: 98,
    },
    opportunities: OPPORTUNITIES,
  }]

  let liveCentres = [...centres]

  return function renderLoop() {
    newCentre = attemptNewCentre(centres, liveCentres)
    if (newCentre !== null) {
      centres.push(newCentre)
      liveCentres.push(newCentre)
    }

    let width = canvas.width
    let height = canvas.height

    let minX = Math.min(...centres.map(centre => centre.x)) - 1
    let maxX = Math.max(...centres.map(centre => centre.x)) + 1
    let midX = (minX + maxX) / 2
    let minY = Math.min(...centres.map(centre => centre.y)) - 1
    let maxY = Math.max(...centres.map(centre => centre.y)) + 1
    let midY = (minY + maxY) / 2

    xScale = width / (maxX - minX)
    yScale = height / (maxY - minY)
    scale = Math.min(xScale, yScale)

    xOffset = width / 2
    yOffset = height / 2

    context.strokeStyle = 'white'
    context.lineWidth = scale / 2

    context.clearRect(0, 0, width, height)

    for (let centre of centres) {
      adjustedX = (centre.x - midX) * scale + width / 2
      adjustedY = (centre.y - midY) * scale + height / 2
      adjustedParentX = (centre.parentX - midX) * scale + width / 2
      adjustedParentY = (centre.parentY - midY) * scale + height / 2

      if (centre.opportunities > 0) {
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
    const parent = liveCentres[index]

    parent.opportunities -= 1

    const angle = Math.random() * 2 * Math.PI

    let opportunities = OPPORTUNITIES
    let colour = driftColour(parent.colour)
    let parentX = parent.x
    let parentY = parent.y
    let x = parentX + Math.cos(angle) * 2
    let y = parentY + Math.sin(angle) * 2
    candidate = {x, y, parentX, parentY, colour, opportunities}

    if (overlap(centres, candidate)) {
      candidate = null
    }

    if (parent.opportunities == 0) {
      liveCentres.splice(index, 1)
    }
  }

  return candidate
}

const overlap = (centres, candidate) => {
  for (let centre of centres) {
    if (distance_squared(centre, candidate) < 4) {
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

