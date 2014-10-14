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
      .attr('id', function(d) {
        return 'player-' + d.id
      })
  
  players.attr('transform', function(d) {
    return 'translate(' + d.placement + ')'
  })

  players.append('circle')
    .attr('r', 10)

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

  var refs = players.filter(positionIs('referee'))
    .attr('clip-path', 'url(#playerClip)')

  refs.append('rect')
    .attr('width', 3)
    .attr('height', 20)
    .attr('x', -7.5)
    .attr('y', -10)
  
  refs.append('rect')
    .attr('width', 3)
    .attr('height', 20)
    .attr('x', -1.5)
    .attr('y', -10)

  refs.append('rect')
    .attr('width', 3)
    .attr('height', 20)
    .attr('x', 4.5)
    .attr('y', -10)

  refs.append('circle')
    .attr('class', 'outline')
    .attr('r', 10)

  return players
}

function playerFromRelativeToScreenCoordinates(relative) {
  var absolute = relative
  absolute.placement = coordinateSystem.toScreen(relative.placement)
  absolute.steps = relative.steps.map(function(step) {
    if (!step) {
      return null
    }

    return {
      duration: step.duration,
      points: step.points.map(coordinateSystem.toScreen),
    }
  })
  return absolute
}

var line = d3.svg.line()
  .tension(0.75)
  .interpolate('cardinal')

var activeStep = 0

function getTotalLength() {
  return this.getTotalLength()
}

function step(svg, camera, players) {
  var playersInThisStep = players.filter(function(d) {
    return !!d.steps[activeStep]
  })

  if (playersInThisStep.length == 0) {
    return
  }

  Guides.update(activeStep + 1)

  var pathsForThisStep = svg.selectAll('.path')
    .data(playersInThisStep, function(d) { return d.id })

  pathsForThisStep
    .enter()
      .insert('path', '.player')
      .attr('class', 'path')

  pathsForThisStep.attr('d', function(d) {
    var step = d.steps[activeStep]
    return line(step.points)
  })
  .style('stroke-dasharray', getTotalLength)
  .style('stroke-dashoffset', getTotalLength)
  
  pathsForThisStep.exit().remove()

  var durationFn = function(d) {
    var step = d.steps[activeStep]
    return step ? step.duration * 1000 : 0
  }

  pathsForThisStep.transition()
    .duration(durationFn)
    .styleTween('stroke-dashoffset', function() {
      return d3.interpolateNumber(this.getTotalLength(), 0)
    })

  d3.selectAll('button')
    .attr('disabled', 'disabled')

  var n = 0; 
  svg.selectAll('.player')
    .data(playersInThisStep, function(d) { return d.id })
    .transition()
      .duration(durationFn)
      .attrTween('transform', function(d, idx) {
        var path = pathsForThisStep[0][idx]
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
          activeStep++
          d3.selectAll('button')
            .attr('disabled', null)
        }
      })
}

function reset(svg, camera, players) {
  activeStep = 0

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

  d3.select('svg').append('defs')
    .append('clipPath')
    .attr('id', 'playerClip')
    .append('circle')
    .attr('r', 10)

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
