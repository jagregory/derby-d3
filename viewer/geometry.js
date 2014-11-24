export function unionRect(a, b) {
  let x = Math.min(a.x, b.x),
    y = Math.min(a.y, b.y),
    width = Math.max(a.x + a.width, b.x + b.width) - x,
    height = Math.max(a.y + a.height, b.y + b.height) - y

  return { x, y, width, height }
}

export function growRect(rect, wd, hd) {
  let width = rect.width + wd,
    height = rect.height + hd,
    widthDelta = width - rect.width,
    heightDelta = height - rect.height,
    x = rect.x - widthDelta / 2,
    y = rect.y - heightDelta / 2

  return { x, y, width, height }
}

export function scaleRect(rect, scaleX, scaleY) {
  scaleY = scaleY || scaleX
  let width = rect.width * scaleX,
    height = rect.height * scaleY,
    widthDelta = width - rect.width,
    heightDelta = height - rect.height,
    x = rect.x - widthDelta / 2,
    y = rect.y - heightDelta / 2

  return { x, y, width, height }
}

export default { unionRect, growRect, scaleRect }
