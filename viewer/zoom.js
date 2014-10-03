var Geometry = require('./geometry')

function zoomTo(svg, zb, pos, scale) {
  svg.attr("transform", "translate(" + pos + "), scale(" + scale + ")");
  zb.translate(pos)
  zb.scale(scale)
}

module.exports = function(width, height) {
  var shouldFocus = true

  var aspectRatio = width / height
  var target = d3.select('body svg g')
  var zb = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .size([width, height])
    .on("zoom", function() {
      zoomTo(target, zb, d3.event.translate, d3.event.scale)
      shouldFocus = false
    })
  var svg = d3.select('body svg').call(zb)

  return {
    shouldFocus: function() {
      return shouldFocus
    },
    
    zoomToRect: function(rect) {
      var targetHeight = rect.width / aspectRatio

      if (rect.height < targetHeight) {
        // make sure the height fits the aspect ratio
        var delta = targetHeight - rect.height
        rect = Geometry.growRect(rect, 0, delta)
      } else {
        // make sure the width fits the aspect ratio
        var targetWidth = rect.height * aspectRatio
        var delta = targetWidth - rect.width
        rect = Geometry.growRect(rect, delta, 0)
      }

      var scale = width / rect.width
      zoomTo(target, zb, [-rect.x * scale, -rect.y * scale], scale)
    }
  }
}
