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
    teams: teams,
    players: players,
    guides: guides
  }
}

module.exports = Parse