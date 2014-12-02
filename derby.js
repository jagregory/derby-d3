import Parse from './parse'
import Viewer from './viewer'
import Url from 'url'

let viewer = null,
  url = Url.parse(window.location.href),
  playUrl = 'plays/example.json'

if (url.hash) {
  playUrl = url.hash.substring(1) + '.json'
}

$.get(playUrl, json => {
  let result = Parse(json)

  $('#title').text(result.title)
  $('title').text(result.title + ' - Derby demos')
  viewer = Viewer(result)
})

$(() => {
  $('#step').click(() => viewer.step())
  $('#reset').click(() => viewer.reset())
  $('#shouldFocus').change(() => viewer.shouldFocus(!viewer.shouldFocus()))
})
