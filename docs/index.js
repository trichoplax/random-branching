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

const renderLoopMaker = (canvas, context) => function renderLoop() {
  let width = canvas.width
  let height = canvas.height

  context.arc(
    width / 2,
    height / 2,
    Math.min(width, height) / 2,
    0,
    2 * Math.PI
  )
  context.fill()

  window.requestAnimationFrame(renderLoop)
}

