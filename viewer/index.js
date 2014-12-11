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
    .append('g')
    .attr('transform', 'translate(120, 40), scale(2.5)')

  let camera = Camera(width, height, board)

  // scale the G not the tracks?
  let trackOutside = board.append('path')
    .attr('class', 'track')
    .attr('id', 'outside')
    .attr('d', Shapes.trackOutside)

  let trackInside = board.append('path')
    .attr('class', 'track')
    .attr('id', 'inside')
    .attr('d', Shapes.trackInside)

  let line = board.append('path').attr('id', 'line')

let outerPoint = board.append('circle').attr('r', 3).attr('fill', 'red')
let innerPoint = board.append('circle').attr('r', 3).attr('fill', 'red')

let s = Snap('svg')

// hack some stuff in for engagement zone
function getIntersections() {
  var ins = Snap.path.intersection(s.select('#inside'), s.select('#line'))
  if (ins.length > 0) {
    return ins[0]
  }
  return null
}

var length = Math.ceil(trackOutside[0][0].getTotalLength());
var i = 0;

setInterval(function() {
    var p1 = trackOutside[0][0].getPointAtLength(i)
    var p2 = trackOutside[0][0].getPointAtLength(i+5)
    
    var startX = p1.x,
        startY = p1.y,
        endX = p2.x,
        endY = p2.y,
        centrePointX = p1.x,
        centrePointY = p1.y,
        angle = Math.atan2(endY - startY, endX - startX),
        dist = 75;

    var vx = Math.sin(angle) + centrePointX,
        vy = -Math.cos(angle) + centrePointY,
        vx2= -Math.sin(angle) * dist + centrePointX,
        vy2= Math.cos(angle) * dist + centrePointY
    
    line.attr('d', 'M'+vx+' '+vy+' L'+vx2+' '+vy2)
    outerPoint.attr('cx', p1.x).attr('cy', p1.y)
    
    var intersections = getIntersections()
    if (intersections) {
      innerPoint.attr('cx', intersections.x).attr('cy', intersections.y)
    }

    if (i === length) {
        i = 0;
    } else {
        i++;
    }
}, 10)

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
