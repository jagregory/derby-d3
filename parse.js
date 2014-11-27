import 'array.prototype.find'

let parseTeams = json => (json.teams || []).map(t => ({ id: t.id }))
let parseCoordinate = json => [json[0], json[1]]
let parseMove = json => ({ duration: json.duration, points: json.to })

function parsePlayer(json, movesJson, teams) {
  let player = {
    id: json.id,
    team: json.team
  }

  player.steps = (movesJson || []).map(m => ((m.players || {})[player.id] || []).map(parseMove))

  if (!json.placement) {
    throw 'Player ' + player.id + ' missing placement'
  }

  player.placement = parseCoordinate(json.placement)

  if (json.properties && json.properties.position) {
    player.position = json.properties.position
  }

  return player
}

function parsePlayers(json, teams) {
  var movesJson = json.play && json.play.moves ? json.play.moves : {}

  return (json.players || []).map(p => parsePlayer(p, movesJson, teams))
}

function parseGuides(json) {
  if (!json.play) {
    return []
  }

  let play = json.play,
    guides = (play.moves || []).map(m => m.guide ? m.guide : null)

  guides.splice(0, 0, play.guide ? play.guide : null)

  return guides
}

export default function Parse(json) {
  let teams = parseTeams(json),
    players = parsePlayers(json, teams),
    guides = parseGuides(json),
    title = (json.play || {}).title

  return { guides, players, teams, title }
}
