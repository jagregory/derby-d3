function update() {
  let players = d3.selectAll('.player')[0].map(d => d3.transform(d3.select(d).attr('transform')).translate)
  let centreLine = d3.select('#centreLine'),
    x1 = new Number(centreLine.attr('x1')),
    x2 = new Number(centreLine.attr('x2')),
    y = new Number(centreLine.attr('y1'))

  let ezline = d3.select('svg g')
    .selectAll('line.ezline')
    .data(players)
    .attr('x1', d => d[0])
    .attr('y1', d => d[1])
    .attr('x2', function(d) {
      if (d[0] > x1 && d[0] < x2) {
        return d[0]
      } else if (d[0] < x1) {
        return x1
      } else {
        return x2
      }
    })
    .attr('y2', y)
    .enter().append('line')
      .attr('class', 'ezline')
      .attr('stroke', 'red')
}

export default { update }
