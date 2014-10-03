module.exports = function(width, height) {
  function toScreenX(x) {
    return (x * (width / 26)) + 140
  }

  function toScreenY(y) {
    return (y * height / 17) + 50
  }

  return {
    toScreen: function(xy) {
      return [toScreenX(xy[0]), toScreenY(xy[1])]
    }
  }
}
