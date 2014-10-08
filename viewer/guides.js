module.exports = {
  create: function(guides) {
    var guideGraphics = d3.select('body').selectAll('.guide')
      .data(guides)
      .enter()
        .insert('div', 'svg')
        .attr('class', 'guide')
        .style('display', 'none')

    guideGraphics
      .append('h1')
      .text(function(d) { return d.heading })

    guideGraphics
      .append('div')
      .html(function(d) { return d.text })
  },

  update: function(step) {
    d3.selectAll('.guide')
      .style('display', function(d, idx) {
        return idx == step ? '' : 'none'
      })
  }
}
