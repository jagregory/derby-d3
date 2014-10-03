var Parse = require('./parse'),
  Viewer = require('./viewer')

var viewer = Viewer()

$.get('/example.json', function(json) {
  var result = Parse(json)

  viewer.start(result.players, result.guides)
})

$(function() {
  $('#step').click(function() {
    viewer.step()
  })

  $('#reset').click(function() {
    viewer.reset()
  })

  $('#shouldFocus').change(function() {
    viewer.shouldFocus(!viewer.shouldFocus())
  })
})
