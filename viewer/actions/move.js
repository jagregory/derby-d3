function createSvgElement(name, attrs) {
  let el = document.createElementNS('http://www.w3.org/2000/svg', name)

  for (let attr of Object.keys(attrs)) {
    el.setAttributeNS(null, attr, attrs[attr])
  }

  return el
}

let angle = (pos, prevPos) => Math.atan2(pos.y - prevPos.y, pos.x - prevPos.x) * 180 / Math.PI

export default function(player, action, done, context) {
  let {coordinateSystem,ticker} = context
  let line = d3.svg.line()
    .tension(0.75)
    .interpolate('cardinal')
    .x(d => coordinateSystem.toScreen(d)[0])
    .y(d => coordinateSystem.toScreen(d)[1])
  let path = createSvgElement('path', {
    class: 'path',
    d: line(action.to)
  })
  let pointAtTime = t => path.getPointAtLength(t * path.getTotalLength())

  let ezline = d3.select('svg g').append('line').attr('stroke', 'red')
  let centreLine = d3.select('#centreLine'),
    x1 = new Number(centreLine.attr('x1')),
    x2 = new Number(centreLine.attr('x2')),
    y = new Number(centreLine.attr('y1'))

  d3.select(`#player-${player.id}`)
    .transition()
      .duration(action.duration * 1000)
      .attrTween('transform', () => {
        let prevPos = null
        return (time) => {
          ticker.tick(time)
          
          let pos = pointAtTime(time)
          prevPos = prevPos || pos

          let constrainedX = 0

          if (pos.x > x1 && pos.x < x2) {
            constrainedX = pos.x
          } else if (pos.x < x1) {
            constrainedX = x1
          } else {
            constrainedX = x2
          }

          ezline.attr('x1', pos.x)
            .attr('y1', pos.y)
            .attr('x2', constrainedX)
            .attr('y2', y)

          return `translate(${pos.x},${pos.y})rotate(${angle(pos, prevPos)})`
        }
      })
      .each('end', done) 
}
