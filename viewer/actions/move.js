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

  // TODO: should we update the player itself and just have the xy bind to something on the player?
  d3.select(`#player-${player.id}`)
    .transition()
      .duration(action.duration * 1000)
      .attrTween('transform', () => {
        let prevPos = null
        return (time) => {
          ticker.tick(time)
          
          let pos = pointAtTime(time)
          prevPos = prevPos || pos

          return `translate(${pos.x},${pos.y})rotate(${angle(pos, prevPos)})`
        }
      })
      .each('end', done) 
}
