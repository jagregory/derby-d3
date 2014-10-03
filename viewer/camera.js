var Geometry = require('./geometry')

function getScreenCoords(el) {
  var cx = el.getAttribute('cx'),
    cy = el.getAttribute('cy'),
    ctm = el.getCTM(),
    bbox = el.getBBox(),
    matrix = el.transform.baseVal.getItem(0).matrix

  return {
    x: matrix.e - bbox.width / 2,
    y: matrix.f - bbox.height / 2,
    width: bbox.width,
    height: bbox.height,
  }
}

function zoomTo(svg, zb, pos, scale) {
  svg.attr("transform", "translate(" + pos + "), scale(" + scale + ")");
  zb.translate(pos)
  zb.scale(scale)
}

function minimalBoundingRect(query) {
  return d3.selectAll(query)[0]
    .map(getScreenCoords)
    .reduce(Geometry.unionRect)
}

function focusOnActivity(target, zb, screen) {
  var rect = minimalBoundingRect('.player')
  zoomToRect(target, zb, Geometry.scaleRect(rect, 2), screen)
}

function zoomToRect(target, zb, rect, screen) {
  var targetHeight = rect.width / screen.aspectRatio

  if (rect.height < targetHeight) {
    // make sure the height fits the aspect ratio
    var delta = targetHeight - rect.height
    rect = Geometry.growRect(rect, 0, delta)
  } else {
    // make sure the width fits the aspect ratio
    var targetWidth = rect.height * screen.aspectRatio
    var delta = targetWidth - rect.width
    rect = Geometry.growRect(rect, delta, 0)
  }

  var scale = screen.width / rect.width
  zoomTo(target, zb, [-rect.x * scale, -rect.y * scale], scale)
}

module.exports = function(width, height) {
  var shouldFocus = true
  var screen = {
    width: width,
    height: height,
    aspectRatio: width / height
  }
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
    shouldFocus: function(v) {
      if (typeof v !== 'undefined') {
        shouldFocus = v
      }

      return shouldFocus
    },

    focusOnActivity: function() {
      focusOnActivity(target, zb, screen)
    }
  }
}
