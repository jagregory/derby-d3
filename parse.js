import 'array.prototype.find'

let parseCoordinate = json => [json[0], json[1]]
let parseMove = json => ({ duration: json.duration, points: json.to })
let parsePlayers = json => (json.players || []).map(parsePlayer)
let parseTeams = json => (json.teams || []).map(t => ({ id: t.id }))

function parsePlayer(json) {
  let player = {
    id: json.id,
    team: json.team
  }

  if (!json.placement) {
    throw 'Player ' + player.id + ' missing placement'
  }

  player.placement = parseCoordinate(json.placement)

  if (json.properties && json.properties.position) {
    player.position = json.properties.position
  }

  return player
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
  let play = (json.play || {})
  let teams = parseTeams(json),
    players = parsePlayers(json),
    guides = parseGuides(json),
    moves = play.moves,
    title = play.title

  return { guides, moves, players, teams, title }
}
