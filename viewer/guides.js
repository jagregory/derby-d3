let create = guides => {
  let guideGraphics = d3.select('body').selectAll('.guide')
    .data(guides)
    .enter()
      .insert('div', 'svg')
      .attr('class', 'guide')
      .style('display', 'none')

  guideGraphics
    .append('h1')
    .text(d => d ? d.heading : '')

  guideGraphics
    .append('div')
    .html(d => d ? d.text : '')
}

let update = step =>
  d3.selectAll('.guide')
    .style('display', (d, idx) => idx == step ? '' : 'none')

export default { create, update }
