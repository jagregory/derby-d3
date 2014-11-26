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

function createSvgElement(name, attrs) {
  let el = document.createElementNS('http://www.w3.org/2000/svg', name)

  for (let attr of Object.keys(attrs)) {
    el.setAttributeNS(null, attr, attrs[attr])
  }

  return el
}

let angle = (pos, prevPos) => Math.atan2(pos.y - prevPos.y, pos.x - prevPos.x) * 180 / Math.PI

function animatePlayerAlongPath(player, action, path, done) {
  let pointAtTime = t => path.getPointAtLength(t * path.getTotalLength())

  d3.select(`#player-${player.id}`)
    .transition()
      .duration(action.duration * 1000)
      .attrTween('transform', () => {
        let prevPos = null
        return (time) => {
          // if (camera.shouldFocus()) {
          //   camera.focusOnActivity()
          // }
          
          let pos = pointAtTime(time)
          prevPos = prevPos || pos

          return `translate(${pos.x},${pos.y})rotate(${angle(pos, prevPos)})`
        }
      })
      .each('end', done) 
}

function animatePlayer(player, actions) {
  if (actions.length === 0) {
    return
  }

  let next = () => animatePlayer(player, actions.slice(1))
  let action = actions[0]

  if (action.type === 'move') {
    let path = createSvgElement('path', {
      class: 'path',
      d: line(action.to)
    })

    animatePlayerAlongPath(player, action, path, next)
  } else if (action.type === 'halt') {
    setTimeout(next, action.duration * 1000)
  }
}

let activeMoveIndex = 0
function step(svg, camera, play, players) {
  let activeMove = play.moves[activeMoveIndex]
  let activePlayers = Object.keys(activeMove.players).
    map(id => players.find(p => p.id === id))

  for (let p of activePlayers) {
    animatePlayer(p, activeMove.players[p.id])
  }
  activeMoveIndex++
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
