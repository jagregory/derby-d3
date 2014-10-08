var width = 960,
  height = 500

var coordinateSystem = require('./coordinate-system')(width, height),
  Geometry = require('./geometry'),
  Camera = require('./camera')

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
    .attr("points", '8.5,0, 3.6405764746872635,2.6450336353161292, 2.6266444521870533,8.083980388508804, -1.390576474687263,4.279754323328191, -6.876644452187053,4.996174644486023, -4.5,5.51091059616309e-16, -6.876644452187053,-4.996174644486021, -1.390576474687264,-4.2797543233281905, 2.6266444521870516,-8.083980388508806, 3.6405764746872626,-2.64503363531613')

  players.filter(positionIs('pivot'))
    .append('rect')
    .attr('width', 18)
    .attr('height', 5)
    .attr('x', -9)
    .attr('y', -2.5)
    .attr('rx', 2)

  return players
}

function createGuides(guides) {
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

function updateGuide(step) {
  d3.selectAll('.guide')
    .style('display', function(d, idx) {
      return idx == step ? '' : 'none'
    })
}

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

  updateGuide(activeSegment + 1)

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
        return function (t) {
          if (camera.shouldFocus()) {
            camera.focusOnActivity()
          }
          var p = path.getPointAtLength(t * l);
          return "translate(" + p.x + "," + p.y + ")";
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

  updateGuide(0)
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
    .attr('d', 'M80.8,6.1 l106.7,-6.1 a8.08,8.08 0 0,1 0,161.5 l-106.7,6.1 a8.08,8.08 0 0,1 0,-161.5z m0,39.6 a3.81,3.81 0 0,0 0,76.2 l106.7,0 a3.81,3.81 0 0,0 0,-76.2z')
    .attr('transform', 'translate(120, 40), scale(2.5)')

  return {
    start: function(p, g) {
      players = p.map(playerFromRelativeToScreenCoordinates), guides = g
      createGuides(guides)
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
