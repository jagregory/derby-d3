(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Parse = require('./parse'),
  Viewer = require('./viewer')

var viewer = Viewer()

$.get('example.json', function(json) {
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

},{"./parse":2,"./viewer":7}],2:[function(require,module,exports){
// Array.find polyfil
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

function parseTeams(json) {
  return (json.teams || []).map(function(team) {
    return {
      id: team.id
    }
  })
}

function parseCoordinate(json) {
  return [json.x, json.y]
}

function parseMove(json) {
  return {
    duration: json.duration,
    points: json.steps.map(parseCoordinate)
  }
}

function parsePlayer(json, movesJson, teams) {
  var player = {
    id: json.id,
    team: json.team
  }

  var maxSteps = Object.keys(movesJson).map(function(id) {
      return (movesJson[id].steps || []).length
    }).reduce(function(a, b) {
      return a + b
    })

  player.moves = (movesJson || []).map(function(move) {
    return move.players && move.players[player.id] ? parseMove(move.players[player.id]) : null
  })

  if (json.placement) {
    player.placement = parseCoordinate(json.placement)
  }

  if (json.properties && json.properties.position) {
    player.position = json.properties.position
  }

  return player
}

function parsePlayers(json, teams) {
  var movesJson = json.play && json.play.moves ? json.play.moves : {}

  return (json.players || []).map(function(player) {
    return parsePlayer(player, movesJson, teams)
  })
}

function parseGuides(json) {
  if (!json.play) {
    return []
  }

  var play = json.play
  var guides = (play.moves || []).map(function(move) {
    return move.guide ? move.guide : null
  })

  guides.splice(0, 0, play.guide ? play.guide : null)

  return guides
}

function Parse(json) {
  var teams = parseTeams(json)
  var players = parsePlayers(json, teams)
  var guides = parseGuides(json)

  return {
    guides: guides,
    players: players,
    teams: teams,
    title: (json.play || {}).title
  }
}

module.exports = Parse

},{}],3:[function(require,module,exports){
var Geometry = require('./geometry')

function getScreenCoords(el) {
  var cx = el.getAttribute('cx'),
    cy = el.getAttribute('cy'),
    ctm = el.getCTM(),
    bbox = el.getBBox(),
    matrix = el.transform.baseVal.getItem(0).matrix

  return {
    x: matrix.e - bbox.width / 2,
    y: matrix.f - bbox.height / 2,
    width: bbox.width,
    height: bbox.height,
  }
}

function zoomTo(svg, zb, pos, scale) {
  svg.attr("transform", "translate(" + pos + "), scale(" + scale + ")");
  zb.translate(pos)
  zb.scale(scale)
}

function minimalBoundingRect(query) {
  return d3.selectAll(query)[0]
    .map(getScreenCoords)
    .reduce(Geometry.unionRect)
}

function focusOnActivity(target, zb, screen) {
  var rect = minimalBoundingRect('.player')
  zoomToRect(target, zb, Geometry.scaleRect(rect, 2), screen)
}

function zoomToRect(target, zb, rect, screen) {
  var targetHeight = rect.width / screen.aspectRatio

  if (rect.height < targetHeight) {
    // make sure the height fits the aspect ratio
    var delta = targetHeight - rect.height
    rect = Geometry.growRect(rect, 0, delta)
  } else {
    // make sure the width fits the aspect ratio
    var targetWidth = rect.height * screen.aspectRatio
    var delta = targetWidth - rect.width
    rect = Geometry.growRect(rect, delta, 0)
  }

  var scale = screen.width / rect.width
  zoomTo(target, zb, [-rect.x * scale, -rect.y * scale], scale)
}

module.exports = function(width, height) {
  var shouldFocus = true
  var screen = {
    width: width,
    height: height,
    aspectRatio: width / height
  }
  var target = d3.select('body svg g')
  var zb = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .size([width, height])
    .on("zoom", function() {
      zoomTo(target, zb, d3.event.translate, d3.event.scale)
      shouldFocus = false
    })
  var svg = d3.select('body svg').call(zb)

  return {
    shouldFocus: function(v) {
      if (typeof v !== 'undefined') {
        shouldFocus = v
      }

      return shouldFocus
    },

    focusOnActivity: function() {
      focusOnActivity(target, zb, screen)
    }
  }
}

},{"./geometry":5}],4:[function(require,module,exports){
module.exports = function(width, height) {
  function toScreenX(x) {
    return (x * (width / 26)) + 140
  }

  function toScreenY(y) {
    return (y * height / 17) + 50
  }

  return {
    toScreen: function(xy) {
      return [toScreenX(xy[0]), toScreenY(xy[1])]
    }
  }
}

},{}],5:[function(require,module,exports){
function unionRect(a, b) {
  var x1 = Math.min(a.x, b.x),
    y1 = Math.min(a.y, b.y)

  return {
    x: x1,
    y: y1,
    width: Math.max(a.x + a.width, b.x + b.width) - x1,
    height: Math.max(a.y + a.height, b.y + b.height) - y1,
  }
}

function growRect(rect, wd, hd) {
  var newWidth = rect.width + wd,
    newHeight = rect.height + hd,
    widthDelta = newWidth - rect.width,
    heightDelta = newHeight - rect.height

  return {
    x: rect.x - (widthDelta / 2),
    y: rect.y - (heightDelta / 2),
    width: newWidth,
    height: newHeight,
  }
}

function scaleRect(rect, scaleX, scaleY) {
  scaleY = scaleY || scaleX
  var newWidth = rect.width * scaleX,
    newHeight = rect.height * scaleY,
    widthDelta = newWidth - rect.width,
    heightDelta = newHeight - rect.height

  return {
    x: rect.x - (widthDelta / 2),
    y: rect.y - (heightDelta / 2),
    width: newWidth,
    height: newHeight,
  }
}

module.exports = {
  unionRect: unionRect,
  growRect: growRect,
  scaleRect: scaleRect,
}

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
var width = 960,
  height = 500

var coordinateSystem = require('./coordinate-system')(width, height),
  Camera = require('./camera'),
  Geometry = require('./geometry'),
  Guides = require('./guides'),
  Shapes = require('./shapes')

function positionIs(pos) {
  return function(player) {
    return player.position == pos
  }
}

function createPlayerGraphics(svg, players) {
  var players = svg.selectAll('g.player')
    .data(players, function(d) { return d.id })

  players
    .enter()
      .append('g')
      .attr('class', function(d) {
        return 'player team-' + d.team
      })
  
  players.attr("transform", function(d) {
    return "translate(" + (d.placement || d.moves[0].points[0]) + ")"
  })

  players.append('circle')
    .attr("r", 10)

  players.filter(positionIs('jammer'))
    .append('polygon')
    .attr("points", Shapes.star)

  players.filter(positionIs('pivot'))
    .append('rect')
    .attr('width', 18)
    .attr('height', 5)
    .attr('x', -9)
    .attr('y', -2.5)
    .attr('rx', 2)

  return players
}

function playerFromRelativeToScreenCoordinates(relative) {
  var absolute = relative
  absolute.placement = coordinateSystem.toScreen(relative.placement)
  absolute.moves = relative.moves.map(function(move) {
    if (!move) {
      return null
    }

    return {
      duration: move.duration,
      points: move.points.map(coordinateSystem.toScreen),
    }
  })
  return absolute
}

var line = d3.svg.line()
  .tension(0.75)
  .interpolate('cardinal')

var activeSegment = 0

function getTotalLength() {
  return this.getTotalLength()
}

function step(svg, camera, players) {
  var playersWithMoves = players.filter(function(d) {
    return !!d.moves[activeSegment]
  })

  if (playersWithMoves.length == 0) {
    return
  }

  Guides.update(activeSegment + 1)

  var nextMovesPaths = svg.selectAll('.path')
    .data(playersWithMoves, function(d) { return d.id })

  nextMovesPaths
    .enter()
      .insert('path', '.player')
      .attr('class', 'path')

  nextMovesPaths.attr('d', function(d) {
    var move = d.moves[activeSegment]
    return line(move.points)
  })
  .style('stroke-dasharray', getTotalLength)
  .style('stroke-dashoffset', getTotalLength)
  
  nextMovesPaths.exit().remove()

  nextMovesPaths.transition()
    .duration(function(d) {
      var move = d.moves[activeSegment]
      return move ? move.duration * 1000 : 0
    })
    .styleTween('stroke-dashoffset', function() {
      return d3.interpolateNumber(this.getTotalLength(), 0)
    })

  d3.selectAll('button')
    .attr('disabled', 'disabled')

  var n = 0; 
  svg.selectAll('.player')
    .data(playersWithMoves, function(d) { return d.id })
    .transition()
      .duration(function(d) {
        var move = d.moves[activeSegment]
        return move ? move.duration * 1000 : 0
      })
      .attrTween('transform', function(d, idx) {
        var path = nextMovesPaths[0][idx]
        var l = path.getTotalLength();
        var prevTime = 0
        return function(time) {
          if (camera.shouldFocus()) {
            camera.focusOnActivity()
          }
          
          var prevPos = path.getPointAtLength(prevTime * l)
          var pos = path.getPointAtLength(time * l);
          var angle = Math.atan2(pos.y - prevPos.y, pos.x - prevPos.x) * 180 / Math.PI
          prevTime = time

          return 'translate('+pos.x+','+pos.y+')rotate('+angle+')'
        }
      })
      .each(function() { ++n; }) 
      .each('end', function(d) {
        if (!--n) {
          activeSegment++
          d3.selectAll('button')
            .attr('disabled', null)
        }
      })
}

function reset(svg, camera, players) {
  activeSegment = 0

  createPlayerGraphics(svg, players)

  svg.selectAll('.path')
    .data([]).exit().remove()

  Guides.update(0)
  shouldFocus = true
  camera.focusOnActivity()
}

module.exports = function() {
  var players = [],
    guides = []

  var board = d3.select('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 '+width+' '+height)
    .attr('class', 'svg-content-responsive')
    .append('g');

  var camera = Camera(width, height, board)

  var trackOutside = board.append('path')
    .attr('class', 'track')
    .attr('d', Shapes.track)
    .attr('transform', 'translate(120, 40), scale(2.5)')

  return {
    start: function(p, g) {
      players = p.map(playerFromRelativeToScreenCoordinates), guides = g
      Guides.create(guides)
      reset(board, camera, players)
    },

    step: function() {
      step(board, camera, players)
    },

    reset: function() {
      reset(board, camera, players)
    },

    shouldFocus: camera.shouldFocus
  }
}

},{"./camera":3,"./coordinate-system":4,"./geometry":5,"./guides":6,"./shapes":8}],8:[function(require,module,exports){
module.exports = {
  star: '8.5,0, 3.6405764746872635,2.6450336353161292, 2.6266444521870533,8.083980388508804, -1.390576474687263,4.279754323328191, -6.876644452187053,4.996174644486023, -4.5,5.51091059616309e-16, -6.876644452187053,-4.996174644486021, -1.390576474687264,-4.2797543233281905, 2.6266444521870516,-8.083980388508806, 3.6405764746872626,-2.64503363531613',
  track: 'M80.8,6.1 l106.7,-6.1 a8.08,8.08 0 0,1 0,161.5 l-106.7,6.1 a8.08,8.08 0 0,1 0,-161.5z m0,39.6 a3.81,3.81 0 0,0 0,76.2 l106.7,0 a3.81,3.81 0 0,0 0,-76.2z'
}

},{}]},{},[1]);
