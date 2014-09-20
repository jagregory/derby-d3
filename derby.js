var width = 960
var height = 500

function CalculateStarPoints(centerX, centerY, arms, outerRadius, innerRadius) {
   var results = "";
 
   var angle = Math.PI / arms;
 
   for (var i = 0; i < 2 * arms; i++)
   {
      // Use outer or inner radius depending on what iteration we are in.
      var r = (i & 1) == 0 ? outerRadius : innerRadius;
      
      var currX = centerX + Math.cos(i * angle) * r;
      var currY = centerY + Math.sin(i * angle) * r;
 
      // Our first time we simply append the coordinates, subsequet times
      // we append a ", " to distinguish each coordinate pair.
      if (i == 0)
      {
         results = currX + "," + currY;
      }
      else
      {
         results += ", " + currX + "," + currY;
      }
   }
 
   return results;
}

function flatten(arr) {
  return arr.reduce(function(a, b) {
    return a.concat(b)
  })
}

function firstOfEach(arr) {
  return arr.map(function(a) {
    return a[0]
  })
}

function createPlayerGraphic(p) {
  var point = p.moves[0].points[0]
  var player = svg.append('g')
    .attr('class', 'player team-' + p.team)
    .attr("transform", "translate(" + point + ")");

  player.append('circle')
    .attr("r", 10)

  if (p.position == 'jammer') {
    player.append('polygon')
      .attr("points", CalculateStarPoints(0, 0, 5, 8.5, 4.5))
  } else if (p.position == 'pivot') {
    player.append('rect')
      .attr('width', 18)
      .attr('height', 5)
      .attr('x', -9)
      .attr('y', -2.5)
      .attr('rx', 2)
  }

  return player
}

function scaleX(x) {
  return (x * (width / 26)) + 140
}

function scaleY(y) {
  return (y * height / 17) + 50
}

function scale(xy) {
  return [scaleX(xy[0]), scaleY(xy[1])]
}

function playerFromRelative(relative) {
  var moves = relative.moves.map(function(move) {
    return {
      duration: move.duration,
      points: move.points.map(scale),
    }
  })

  moves.splice(0, 0, {
    duration: .5,
    points: [
      scale([relative.x, relative.y]),
    ]
  })

  return {
    team: relative.team,
    position: relative.position,
    moves: moves,
  }
}

var p = playerFromRelative({
  team: 'a',
  position: 'jammer',
  x: 12,
  y: 1,
  moves: [{
    duration: .5,
    points: [
      [12, 1],
      [5, 1]
    ]
  }]
})

var teamAJammer = {
  team: 'a',
  position: 'jammer',
  moves: [{
    duration: 1,
    points: [
      [500, 85],
      [420, 85],
    ]
  }, {
    duration: 1,
    points: [
      [420, 85],
      [430, 75],
      [400, 60],
      [300, 90],
    ]
  }]
};

var teamAPivot = {
  team: 'a',
  position: 'pivot',
  moves: [{
    duration: .5,
    points: [
      [350, 87.5],
      [350, 100],
    ]
  }]
};

var teamABlocker1 = {
  team: 'a',
  moves: [{
    duration: .5,
    points: [
      [380, 65],
      [405, 80],
    ]
  }]
};

var teamABlocker2 = {
  team: 'a',
  moves: [{
    duration: .25,
    points: [
      [410, 87.5],
      [380, 87.5],
    ]
  }]
};

var teamABlocker3 = {
  team: 'a',
  moves: [{
    duration: .5,
    points: [
      [380, 110],
    ]
  }]
};

var teamBJammer = {
  team: 'b',
  position: 'jammer',
  moves: [{
    duration: 1,
    points: [
      [500, 115],
      [400, 100],
    ]
  }]
};

var teamBPivot = {
  team: 'b',
  position: 'pivot',
  moves: [{
    duration: .75,
    points: [
      [350, 120],
    ]
  }]
};

var teamBBlocker1 = {
  team: 'b',
  moves: [{
    duration: .5,
    points: [
      [380, 87.5],
      [350, 40],
    ]
  }, {
    duration: 1,
    points: [
      [350, 40],
      [410, 40],
      [400, 60],
    ]
  }]
};

var teamBBlocker2 = {
  team: 'b',
  moves: [{
    duration: .5,
    points: [
      [410, 120],
      [400, 120],
    ]
  }]
};

var teamBBlocker3 = {
  team: 'b',
  moves: [{
    duration: .75,
    points: [
      [380, 135],
      [380, 130],
    ]
  }]
};

var players = [
  teamAJammer, teamABlocker1, teamABlocker2, teamABlocker3, teamAPivot,
  teamBJammer, teamBBlocker1, teamBBlocker2, teamBBlocker3, teamBPivot,
]

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

var animateFunctions = players.map(function(player) {
  var paths = svg.selectAll('.path')
    .data(player.moves)
    .enter()
      .insert('path', 'path')
      .attr('d', function(d) {
        return line(d.points)
      });

  var circle = createPlayerGraphic(player)

  var activeSegment = 0
  var trans = function() {
    if (activeSegment >= paths[0].length) {
      return
    }

    var path = paths[0][activeSegment]
    var move = player.moves[activeSegment]

    circle.transition()
      .duration(move.duration * 1000)
      .attrTween('transform', function(d, idx) {
        var l = path.getTotalLength();
        return function (t) {
          if (shouldFocus) {
            focusOnActivity()
          }
          var p = path.getPointAtLength(t * l);
          return "translate(" + p.x + "," + p.y + ")";
        }
      })
      .each('end', function() {
        activeSegment++
      })
  }

  return trans
})

function step() {
  animateFunctions.forEach(function(fn) {
    fn()
  })
}

focusOnActivity()
