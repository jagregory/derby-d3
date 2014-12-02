const width = 960,
  height = 500

import Camera from './camera'
import Geometry from './geometry'
import Guides from './guides'
import Shapes from './shapes'
import CoordinateSystem from './coordinate-system'
import ActionHandlers from './actions'

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
  
  players.attr('transform', d => `translate(${coordinateSystem.toScreen(d.placement)})`)

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

function animatePlayer(player, actions, ticker) {
  if (actions.length === 0) {
    return
  }

  let next = () => animatePlayer(player, actions.slice(1), ticker)
  let action = actions[0]

  let handler = ActionHandlers[action.type]
  if (handler) {
    handler(player, action, next, { coordinateSystem, ticker })
  } else {
    console.log('Skipping unrecognised action:', action.type)
  }
}

let activeMoveIndex = 0
function step(svg, play, ticker) {
  Guides.update(activeMoveIndex + 1)
  let activeMove = play.moves[activeMoveIndex]
  Object.keys(activeMove.players)
    .map(id => play.players.find(p => p.id === id))
    .forEach(p => animatePlayer(p, activeMove.players[p.id], ticker))
  activeMoveIndex++
}

function reset(svg, camera, play) {
  activeMoveIndex = 0
  
  createPlayerGraphics(svg, play.players)

  Guides.update(0)
  camera.reset()
}

export default function(play) {
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

  Guides.create(play.guides)
  reset(board, camera, play)

  return {
    step() {
      step(board, play, { tick: () => camera.update() })
    },

    reset() {
      reset(board, camera, play)
    },

    shouldFocus: camera.shouldFocus
  }
}
