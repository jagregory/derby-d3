import { unionRect, growRect, scaleRect } from './geometry'

function getScreenCoords(el) {
  let { width, height } = el.getBBox(),
    matrix = el.transform.baseVal.getItem(0).matrix,
    x = matrix.e - width / 2,
    y = matrix.f - height / 2

  return { x, y, width, height }
}

function zoomTo(svg, zb, pos, scale) {
  svg.attr('transform', `translate(${pos}), scale(${scale})`);
  zb.translate(pos)
  zb.scale(scale)
}

let minimalBoundingRect = query =>
  d3.selectAll(query)[0]
    .map(getScreenCoords)
    .reduce(unionRect)

let focusOnActivity = (target, zb, screen) =>
  zoomToRect(target, zb, scaleRect(minimalBoundingRect('.player'), 2), screen)

function zoomToRect(target, zb, rect, screen) {
  let targetHeight = rect.width / screen.aspectRatio

  if (rect.height < targetHeight) {
    // make sure the height fits the aspect ratio
    let delta = targetHeight - rect.height
    rect = growRect(rect, 0, delta)
  } else {
    // make sure the width fits the aspect ratio
    let targetWidth = rect.height * screen.aspectRatio
    let delta = targetWidth - rect.width
    rect = growRect(rect, delta, 0)
  }

  let scale = screen.width / rect.width
  zoomTo(target, zb, [-rect.x * scale, -rect.y * scale], scale)
}

export default function(width, height) {
  let shouldFocus = true
  let screen = {
    width,
    height,
    aspectRatio: width / height
  }
  let target = d3.select('body svg g')
  let zb = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .size([width, height])
    .on("zoom", () => {
      zoomTo(target, zb, d3.event.translate, d3.event.scale)
      shouldFocus = false
    })
  let svg = d3.select('body svg').call(zb)

  return {
    shouldFocus(v) {
      if (typeof v !== 'undefined') {
        shouldFocus = v
      }

      return shouldFocus
    },

    focusOnActivity() {
      focusOnActivity(target, zb, screen)
    },

    update() {
      if (this.shouldFocus()) {
        this.focusOnActivity()
      }
    },

    reset() {
      this.shouldFocus(true)
      this.focusOnActivity()
    }
  }
}
