const width = 960,
  height = 500

import Camera from './camera'
import Geometry from './geometry'
import Guides from './guides'
import Shapes from './shapes'
import CoordinateSystem from './coordinate-system'

let coordinateSystem = CoordinateSystem(width, height),
  assign = Object.assign || require('object.assign')

let positionIs = pos => p => p.position === pos

function createPlayerGraphics(svg, playerData) {
  let players = svg.selectAll('g.player')
    .data(playerData, d => d.id)

  players
    .enter()
      .append('g')
      .attr('class', d => `player team-${d.team}`)
      .attr('id', d => `player-${d.id}`)
  
  players.attr('transform', d => `translate(${d.placement})`)

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

  let refs = players.filter(positionIs('referee'))
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

let line = d3.svg.line()
  .tension(0.75)
  .interpolate('cardinal')
  .x(d => d[0])
  .y(d => d[1])

let activeStep = 0

function getTotalLength() {
  return this.getTotalLength()
}

function animatePlayers(activeMoveIndex, players) {
  let explodedActions = []
  for (let d of players) {
    let player = d[0]
    let actions = d[1]
    for (let i = 0; i < actions.length; i++) {
      let id = `${activeMoveIndex}-${player.id}-${i}`,
        action = actions[i]
      explodedActions.push({ id, player, action })
    }
  }

  let pathsForThisStep = d3.select('svg').selectAll('.path')
    .data(explodedActions, d => d.id)
    .enter()
      .append('path', '.player')
      .attr('class', 'path')
      .attr('d', d => line(d.action.to))

  // for (let action of actions) {
    // pathsForThisStep.attr('d', function(move) {
    //   console.log(move)
    //   return line(move.to)
    // })
  
    // svg.selectAll('.player')
    //   .data([player], d => d.id)
    //   .transition()
    //     .duration(m => m.duration * 1000)
    //     .attrTween('transform', function(d, idx) {
    //       var path = pathsForThisStep[0][idx]
    //       var l = path.getTotalLength();
    //       var prevTime = 0
    //       return function(time) {
    //         if (camera.shouldFocus()) {
    //           camera.focusOnActivity()
    //         }
            
    //         var prevPos = path.getPointAtLength(prevTime * l)
    //         var pos = path.getPointAtLength(time * l);
    //         var angle = Math.atan2(pos.y - prevPos.y, pos.x - prevPos.x) * 180 / Math.PI
    //         prevTime = time

    //         return 'translate('+pos.x+','+pos.y+')rotate('+angle+')'
    //       }
    //     })
  // }
}

let activeMoveIndex = 0
function step(svg, camera, play, players) {
  let activeMove = play.moves[activeMoveIndex]
  let activePlayers = Object.keys(activeMove.players).
    map(id => players.find(p => p.id === id))

  animatePlayers(activeMoveIndex, activePlayers.map(p => [p, activeMove.players[p.id]]))
  activeMoveIndex++

  // var movesForThisStep = playersInThisStep.map(function(player) {
  //   return player.steps[activeStep].map(function(move) {
  //     move.player = player
  //     return move
  //   })
  // }).reduce(function(a, b) {
  //   return a.concat(b)
  // })

  // console.log('movesForThisStep', movesForThisStep.length)

  // var pathsForThisStep = svg.selectAll('.path')
  //   .data(movesForThisStep, function(d) { return d.player.id })

  // pathsForThisStep
  //   .enter()
  //     .insert('path', '.player')
  //     .attr('class', 'path')

  // pathsForThisStep.attr('d', function(move) {
  //   return line(move.points)
  // })
  // // .style('stroke-dasharray', getTotalLength)
  // // .style('stroke-dashoffset', getTotalLength)
  
  // pathsForThisStep.exit().remove()

  // var durationFn = function(move) {
  //   return move.duration * 1000
  // }

  // pathsForThisStep.transition()
  //   .duration(durationFn)
  //   .styleTween('stroke-dashoffset', function() {
  //     return d3.interpolateNumber(this.getTotalLength(), 0)
  //   })

  // d3.selectAll('button')
  //   .attr('disabled', 'disabled')

  // // TODO: Solve this next. Paths are now created using the invividual moves
  // // but the player still need to move along them
  // var n = 0; 
  // svg.selectAll('.player')
  //   .data(movesForThisStep, function(d) {
  //     return d.id
  //   })
  //   .transition()
  //     .duration(durationFn)
  //     .attrTween('transform', function(d, idx) {
  //       var path = pathsForThisStep[0][idx]
  //       var l = path.getTotalLength();
  //       var prevTime = 0
  //       return function(time) {
  //         if (camera.shouldFocus()) {
  //           camera.focusOnActivity()
  //         }
          
  //         var prevPos = path.getPointAtLength(prevTime * l)
  //         var pos = path.getPointAtLength(time * l);
  //         var angle = Math.atan2(pos.y - prevPos.y, pos.x - prevPos.x) * 180 / Math.PI
  //         prevTime = time

  //         return 'translate('+pos.x+','+pos.y+')rotate('+angle+')'
  //       }
  //     })
  //     .each(function() { ++n; }) 
  //     .each('end', function(d) {
  //       if (!--n) {
  //         activeStep++
  //         d3.selectAll('button')
  //           .attr('disabled', null)
  //       }
  //     })
}

function reset(svg, camera, players) {
  activeStep = 0

  createPlayerGraphics(svg, players)

  svg.selectAll('.path')
    .data([]).exit().remove()

  Guides.update(0)
  // shouldFocus = true
  // camera.focusOnActivity()
}

export default function() {
  let play = [],
    players = []

  d3.select('svg').append('defs')
    .append('clipPath')
    .attr('id', 'playerClip')
    .append('circle')
    .attr('r', 10)

  let board = d3.select('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('class', 'svg-content-responsive')
    .append('g');

  let camera = Camera(width, height, board)

  let trackOutside = board.append('path')
    .attr('class', 'track')
    .attr('d', Shapes.track)
    .attr('transform', 'translate(120, 40), scale(2.5)')

  return {
    start(json) {
      play = assign({}, json.play)
      for (let move of play.moves) {
        for (let id of Object.keys(move.players)) {
          for (let pm of move.players[id]) {
            if (pm.to) {
              pm.to = pm.to.map(coordinateSystem.toScreen)
            }
          }
        }
      }

      players = json.players.map(function(player) {
        return assign({}, player, {
          placement: coordinateSystem.toScreen(player.placement)
        })
      })

      // Guides.create(guides)
      reset(board, camera, players)
    },

    step() {
      step(board, camera, play, players)
    },

    reset() {
      reset(board, camera, players)
    },

    shouldFocus: camera.shouldFocus
  }
}
