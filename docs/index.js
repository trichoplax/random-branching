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
  let centres = [[0, 0]]

  return function renderLoop() {
    newCentre = attemptNewCentre(centres)
    if (newCentre !== null) {
      centres.push(newCentre)

      let width = canvas.width
      let height = canvas.height

      let minX = Math.min(...centres.map(centre => centre[0])) - 1
      let maxX = Math.max(...centres.map(centre => centre[0])) + 1
      let midX = (minX + maxX) / 2
      let minY = Math.min(...centres.map(centre => centre[1])) - 1
      let maxY = Math.max(...centres.map(centre => centre[1])) + 1
      let midY = (minY + maxY) / 2

      xScale = width / (maxX - minX)
      yScale = height / (maxY - minY)
      scale = Math.min(xScale, yScale)

      xOffset = width / 2
      yOffset = height / 2

      context.clearRect(0, 0, width, height)

      for (let centre of centres) {
        context.beginPath()
        context.arc(
          (centre[0] - midX) * scale + width / 2,
          (centre[1] - midY) * scale + height / 2,
          scale,
          0,
          2 * Math.PI
        )
        context.closePath()
        context.fill()
      }
    }

    window.requestAnimationFrame(renderLoop)
  }
}

const attemptNewCentre = centres => {
  const parent = centres[Math.floor(Math.random() * centres.length)]
  const angle = Math.random() * 2 * Math.PI

  let x = parent[0] + Math.cos(angle) * 2
  let y = parent[1] + Math.sin(angle) * 2
  candidate = [x, y]

  if (overlap(centres, candidate)) {
    candidate = null
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
  return (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2
}

