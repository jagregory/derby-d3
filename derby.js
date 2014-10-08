var Parse = require('./parse'),
  Viewer = require('./viewer')

var viewer = Viewer()

$.get('/example.json', function(json) {
  var result = Parse(json)

  $('#title').text(result.title)
  $('title').text(result.title + ' - Derby demos')
  
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
