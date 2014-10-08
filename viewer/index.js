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
