function constrainedX(x, left, right) {
  if (x > left && x < right) {
    return x
  } else if (x < left) {
    return left
  } else {
    return right
  }
}

let angleRadians = (p1, p2) => Math.atan2(p2[1] - p1[1], p2[0] - p1[0])
let angleRadiansLine = l => angleRadians(l[0], l[1])
let sortLines = (l1, l2) => angleRadiansLine(l1) - angleRadiansLine(l2)
let sortLinesHorizontally = (y, l1, l2) => {
  if (l1[0][1] < y) {
    return l1[0][0] - l2[0][0]
  } else {
    console.log('inverted')
    return l2[0][0] - l1[0][0]
  }
}

function update() {
  let players = d3.selectAll('.player')[0]
    .map(d => d3.transform(d3.select(d).attr('transform')).translate)
  let centreLine = d3.select('#centreLine'),
    left = parseInt(centreLine.attr('x1')),
    right = parseInt(centreLine.attr('x2')),
    y = parseInt(centreLine.attr('y1')),
    centre = left+(right-left)/2

  let ezlines = players
    .map(pos => [[pos[0], pos[1]], [constrainedX(pos[0], left, right), y]])
    .sort((l1, l2) => sortLines(l1, l2) || sortLinesHorizontally(y, l1, l2))
  let front = ezlines[0],
    back = ezlines[ezlines.length-1]

  console.log('Front:', angleRadiansLine(front), 'Back:', angleRadiansLine(back))

  d3.select('svg g')
    .selectAll('line.ezline')
    .data(ezlines)
    .attr('x1', d => d[0][0])
    .attr('y1', d => d[0][1])
    .attr('x2', d => d[1][0])
    .attr('y2', d => d[1][1])
    .attr('visibility', d => d === front || d === back ? 'visible' : 'hidden')
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
}

export default { update }
