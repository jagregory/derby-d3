function createSvgElement(name, attrs) {
  let el = document.createElementNS('http://www.w3.org/2000/svg', name)

  for (let attr of Object.keys(attrs)) {
    el.setAttributeNS(null, attr, attrs[attr])
  }

  return el
}

function constrainedX(x, left, right) {
  if (x > left && x < right) {
    return x
  } else if (x < left) {
    return left
  } else {
    return right
  }
}

function getIntersections(path, line) {
  let ins = Snap.path.intersection(Snap._.wrap(path), Snap._.wrap(line))
  return ins.length > 0 ? ins[0] : null
}

function normalFromPointsOnPath(p1, p2, dist) {
  let startX = p1.x,
    startY = p1.y,
    endX = p2.x,
    endY = p2.y,
    centrePointX = p1.x,
    centrePointY = p1.y,
    angle = Math.atan2(endY - startY, endX - startX)

  let vx = Math.sin(angle) + centrePointX,
    vy = -Math.cos(angle) + centrePointY,
    vx2 = -Math.sin(angle) * dist + centrePointX,
    vy2 = Math.cos(angle) * dist + centrePointY

  return [[vx, vy], [vx2, vy2]]
}

let angleRadians = (p1, p2) => Math.atan2(p2[1] - p1[1], p2[0] - p1[0])
let angleRadiansLine = l => angleRadians(l[0], l[1])
let sortByAngle = (l1, l2) => {
  let lr = angleRadiansLine(l1),
    rr = angleRadiansLine(l2)
  return lr > 0 && rr > 0 || lr < 0 && rr < 0 ? lr - rr : rr - lr
}
let sortByX = (y, l1, l2) => l1[0][1] < y ? l1[0][0] - l2[0][0] : l2[0][0] - l1[0][0]

function update() {
  let players = d3.selectAll('.player')[0]
    .map(d => d3.transform(d3.select(d).attr('transform')).translate)
  let centreLine = d3.select('#centreLine'),
    left = parseInt(centreLine.attr('x1')),
    right = parseInt(centreLine.attr('x2')),
    y = parseInt(centreLine.attr('y1'))

  let ezlines = players
    .map(pos => [[pos[0], pos[1]], [constrainedX(pos[0], left, right), y]])
    .sort((l1, l2) => sortByAngle(l1, l2) || sortByX(y, l1, l2))
  let front = ezlines[0],
    back = ezlines[ezlines.length-1]

  let inside = Snap._.wrap(document.getElementById('inside'));
  let frontLine = Snap._.wrap(createSvgElement('line', {
    d: 'M' + front[0][0] + ' ' + front[0][1] + ' L' + front[1][0] + ' ' + front[1][1]
  }))
  let backLine = Snap._.wrap(createSvgElement('line', {
    d: 'M' + back[0][0] + ' ' + back[0][1] + ' L' + back[1][0] + ' ' + back[1][1]
  }))

  d3.select('#track')
    .selectAll('line.ezline')
    .data([front, back])
    .attr('x1', d => d[0][0])
    .attr('y1', d => d[0][1])
    .attr('x2', d => d[1][0])
    .attr('y2', d => d[1][1])
    .attr('stroke-width', 2)
    .attr('stroke', function(d) {
      if (d === front) {
        return 'blue';
      } else if (d === back) {
        return 'green'
      }

      return 'red'
    })
    .enter().append('line')
      .attr('class', 'ezline')

  let frontIntersection = getIntersections(inside, frontLine)
  let backIntersection = getIntersections(inside, backLine)
  if (frontIntersection) {
    d3.select('#track')
      .selectAll('#cr')
      .data([frontIntersection, backIntersection])
      .attr('r', 3)
      .attr('fill', 'red')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .enter().append('circle').attr('id', 'cr')
    // frontLine.setAttribute('d', 'M' + front[0][0] + ' ' + front[0][1] + ' L' + intersection.x + ' ' + intersection.y)
  }
}

export default { update }
