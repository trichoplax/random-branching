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
    }

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

    for (let centre of centres) {
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

    window.requestAnimationFrame(renderLoop)
  }
}

const attemptNewCentre = centres => {
  let x = Math.random() * 10 - 5
  let y = Math.random() * 10 - 5
  return [x, y]
}

