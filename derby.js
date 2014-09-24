var width = 960
var height = 500

function positionIs(pos) {
  return function(player) {
    return player.position == pos
  }
}

function createPlayerGraphics(players) {
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

function toScreenX(x) {
  return (x * (width / 26)) + 140
}

function toScreenY(y) {
  return (y * height / 17) + 50
}

function toScreen(xy) {
  return [toScreenX(xy[0]), toScreenY(xy[1])]
}

function playerFromRelativeToScreenCoordinates(relative) {
  var absolute = relative
  absolute.placement = toScreen(relative.placement)
  absolute.moves = relative.moves.map(function(move) {
    if (!move) {
      return null
    }

    return {
      duration: move.duration,
      points: move.points.map(toScreen),
    }
  })
  return absolute
}

var json = {
  "teams": [{
    "id": "1"
  }, {
    "id": "2"
  }],

  "players": [{
    "id": "1",
    "team": "1",
    "placement": { "x": 10, "y": 1.25 },
    "properties": {
      "position": "jammer"
    }
  }, {
    "id": "2",
    "team": "1",
    "placement": { "x": 5.75, "y": 1.25 },
    "properties": {
      "position": "pivot"
    }
  }, {
    "id": "3",
    "team": "1",
    "placement": { "x": 6.5, "y": 0.5 }
  }, {
    "id": "4",
    "team": "1",
    "placement": { "x": 7.25, "y": 1.25 }
  }, {
    "id": "5",
    "team": "1",
    "placement": { "x": 6.5, "y": 2 }
  }, {
    "id": "6",
    "team": "2",
    "placement": { "x": 10, "y": 2.2 },
    "properties": {
      "position": "jammer"
    }
  }, {
    "id": "7",
    "team": "2",
    "placement": { "x": 5.75, "y": 2.45 },
    "properties": {
      "position": "pivot"
    }
  }, {
    "id": "8",
    "team": "2",
    "placement": { "x": 6.5, "y": 1.25 }
  }, {
    "id": "9",
    "team": "2",
    "placement": { "x": 7.25, "y": 2.45 }
  }, {
    "id": "10",
    "team": "2",
    "placement": { "x": 6.5, "y": 3 }
  }],

  "play": {
    "guide": {
      "heading": "Before",
      "text": "<h2 class=\"team-1\">Team 1</h2><p>Do something</p><h2 class=\"team-2\">Team 2</h2><p>Do something else</p>"
    },
    "moves": [{
      "guide": {
        "heading": "Step 1",
        "text": "WTF"
      },
      "players": {
        "1":  { "duration": 1,    "steps": [{ "x": 10, "y": 1.25 }, { "x": 7.55, "y": 1.25 }] },
        "2":  { "duration": 0.5,  "steps": [{ "x": 5.75, "y": 1.25 }, { "x": 5.75, "y": 1.75 }] },
        "3":  { "duration": 0.5,  "steps": [{ "x": 6.5, "y": 0.5 }, { "x": 7.15, "y": 1.1 }] },
        "4":  { "duration": 0.25, "steps": [{ "x": 7.25, "y": 1.25 }, { "x": 6.5, "y": 1.25 }] },
        "6":  { "duration": 1,    "steps": [{ "x": 10, "y": 2.2 }, { "x": 7, "y": 1.75 }] },
        "8":  { "duration": 0.5,  "steps": [{ "x": 6.5, "y": 1.25 }, { "x": 5.75, "y": -0.25 }] },
        "9":  { "duration": 0.5,  "steps": [{ "x": 7.25, "y": 2.45 }, { "x": 7, "y": 2.45 }] },
        "10": { "duration": 0.75, "steps": [{ "x": 6.5, "y": 3 }, { "x": 6.5, "y": 2.7 }] }
      }
    }, {
      "guide": {
        "heading": "Step 2",
        "text": "CTF"
      },
      "players": {
        "1": { "duration": 1, "steps": [{ "x": 7.55, "y": 1.25 }, { "x": 7.75, "y": 0.75 }, { "x": 7, "y": 0.5 }, { "x": 4.5, "y": 1.5 }] },
        "8": { "duration": 1, "steps": [{ "x": 5.75, "y": -0.25 }, { "x": 7.25, "y": -0.25 }, { "x": 7, "y": 0.4 }] }
      }
    }]
  }
}

var result = Parse(json)

var players = result.players.map(playerFromRelativeToScreenCoordinates)
var guides = result.guides

var zb = d3.behavior.zoom()
  .scaleExtent([1, 8])
  .size([width, height])
  .on("zoom", zoom)

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
      .call(zb)
    .append("g");

function zoomTo(pos, scale) {
  svg.attr("transform", "translate(" + pos + "), scale(" + scale + ")");
  zb.translate(pos)
  zb.scale(scale)
}

var aspectRatio = width / height
function zoomToRect(rect) {
  var targetHeight = rect.width / aspectRatio

  if (rect.height < targetHeight) {
    // make sure the height fits the aspect ratio
    var delta = targetHeight - rect.height
    rect = growRect(rect, 0, delta)
  } else {
    // make sure the width fits the aspect ratio
    var targetWidth = rect.height * aspectRatio
    var delta = targetWidth - rect.width
    rect = growRect(rect, delta, 0)
  }

  var scale = width / rect.width
  zoomTo([-rect.x * scale, -rect.y * scale], scale)
}

var shouldFocus = true
function zoom() {
  zoomTo(d3.event.translate, d3.event.scale)
  shouldFocus = false
}

var trackOutside = svg.append('path')
  .attr('class', 'track')
  .attr('d', 'M80.8,6.1 l106.7,-6.1 a8.08,8.08 0 0,1 0,161.5 l-106.7,6.1 a8.08,8.08 0 0,1 0,-161.5z m0,39.6 a3.81,3.81 0 0,0 0,76.2 l106.7,0 a3.81,3.81 0 0,0 0,-76.2z')
  .attr('transform', 'translate(120, 40), scale(2.5)')

var line = d3.svg.line()
  .tension(0.75)
  .interpolate('cardinal')

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

function minimalBoundingRect(query) {
  return svg.selectAll(query)[0]
    .map(getScreenCoords)
    .reduce(unionRect)
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

function focusOnActivity() {
  var rect = minimalBoundingRect('.player')
  zoomToRect(scaleRect(rect, 2))
}

createPlayerGraphics(players)
createGuides(guides)

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

function step() {
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
          if (shouldFocus) {
            focusOnActivity()
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

function reset() {
  activeSegment = 0

  createPlayerGraphics(players)

  svg.selectAll('.path')
    .data([]).exit().remove()

  updateGuide(0)
  focusOnActivity()
}

updateGuide(0)
focusOnActivity()
