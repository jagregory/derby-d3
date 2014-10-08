var Parse = require('./parse'),
  Viewer = require('./viewer'),
  Url = require('url')

var viewer = Viewer()
var url = Url.parse(window.location.href)
var playUrl = 'plays/example.json'

if (url.hash) {
  playUrl = url.hash.substring(1) + '.json'
}

$.get(playUrl, function(json) {
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
