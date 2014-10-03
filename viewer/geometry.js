function unionRect(a, b) {
  var x1 = Math.min(a.x, b.x),
    y1 = Math.min(a.y, b.y)

  return {
    x: x1,
    y: y1,
    width: Math.max(a.x + a.width, b.x + b.width) - x1,
    height: Math.max(a.y + a.height, b.y + b.height) - y1,
  }
}

function growRect(rect, wd, hd) {
  var newWidth = rect.width + wd,
    newHeight = rect.height + hd,
    widthDelta = newWidth - rect.width,
    heightDelta = newHeight - rect.height

  return {
    x: rect.x - (widthDelta / 2),
    y: rect.y - (heightDelta / 2),
    width: newWidth,
    height: newHeight,
  }
}

function scaleRect(rect, scaleX, scaleY) {
  scaleY = scaleY || scaleX
  var newWidth = rect.width * scaleX,
    newHeight = rect.height * scaleY,
    widthDelta = newWidth - rect.width,
    heightDelta = newHeight - rect.height

  return {
    x: rect.x - (widthDelta / 2),
    y: rect.y - (heightDelta / 2),
    width: newWidth,
    height: newHeight,
  }
}

module.exports = {
  unionRect: unionRect,
  growRect: growRect,
  scaleRect: scaleRect,
}
