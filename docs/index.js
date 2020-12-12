document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('branching-canvas')
  const context = canvas.getContext('2d')

  let computed = getComputedStyle(canvas)

  canvas.width = computed.width.slice(0, -2)
  canvas.height = computed.height.slice(0, -2)

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
})

