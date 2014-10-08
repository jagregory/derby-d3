var Parse = require('../parse')

describe('parsing play json', function() {
  var json = null

  beforeEach(function() {
    json = {
      "teams": [{
        "id": "1",
        "properties": {
          "random": "value"
        }
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
          "text": "<h2 class=\"team-a\">Team a</h2><p>Do something</p><h2 class=\"team-b\">Team b</h2><p>Do something else</p>"
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
        }, {
          "guide": {
            "heading": "Step 3",
            "text": "OMG"
          },
          "players": {
            "2": { "duration": 1, "steps": [{ "x": 5.75, "y": 1.75 }, { "x": 7.75, "y": 1.75 }] },
          }
        }]
      }
    }
  })

  it('extracts teams', function() {
    var result = Parse(json)

    expect(result.teams).toContain({
      id: '1'
    })

    expect(result.teams).toContain({
      id: '2'
    })

    expect(result.teams.length).toBe(2)
  })

  describe('guides', function() {
    var json = null

    beforeEach(function() {
      json = {
        "play": {
          "guide": {
            "heading": "Before",
            "text": "<h2 class=\"team-a\">Team a</h2><p>Do something</p><h2 class=\"team-b\">Team b</h2><p>Do something else</p>"
          },
          "moves": [{
            "guide": {
              "heading": "Step 1",
              "text": "WTF"
            }
          }, {
            "guide": {
              "heading": "Step 2",
              "text": "CTF"
            }
          }]
        }
      }
    })

    it('uses play guide as first guide and the move guides after', function() {
      var result = Parse({
        "play": {
          "guide": {
            "heading": "First",
            "text": "Text"
          },
          "moves": [{
            "guide": {
              "heading": "Second",
              "text": "Second Text"
            }
          }]
        }
      })

      expect(result.guides[0]).toEqual({
        heading: "First",
        text: "Text"
      })

      expect(result.guides[1]).toEqual({
        heading: "Second",
        text: "Second Text"
      })
    })

    it('uses null where there is no guide', function() {
      var result = Parse({
        "play": {
          "moves": [{
            "guide": {
              "heading": "Second",
              "text": "Second Text"
            }
          }, {

          }]
        }
      })

      expect(result.guides[0]).toEqual(null)
      expect(result.guides[1]).toEqual({
        heading: "Second",
        text: "Second Text"
      })
      expect(result.guides[2]).toEqual(null)
    })

    it('sets the title', function() {
      var result = Parse({
        "play": {
          "title": "blah"
        }
      })

      expect(result.title).toEqual('blah')
    })
  })

  describe('players', function() {
    it('associates players with the right team', function() {
      var result = Parse(json)
      var team1 = result.teams[0]
      var team2 = result.teams[1]

      expect(result.players[0].team).toBe(team1.id)
      expect(result.players[5].team).toBe(team2.id)
    })

    it('sets the player id', function() {
      var result = Parse(json)

      expect(result.players[0].id).toBe('1')
      expect(result.players[1].id).toBe('2')
      expect(result.players[2].id).toBe('3')
    })

    it('sets the player position', function() {
      var result = Parse(json)

      expect(result.players[0].position).toBe('jammer')
      expect(result.players[1].position).toBe('pivot')
      expect(result.players[2].position).toBe(undefined)
    })

    it('sets the player initial placement', function() {
      var result = Parse(json)

      expect(result.players[0].placement).toEqual([10, 1.25])
    })

    describe('moves', function() {
      it('embeds moves', function() {
        var result = Parse(json)

        expect(result.players[0].moves.length).toBe(3)
        expect(result.players[0].moves[0]).toEqual({
          duration: 1,
          points: [[10, 1.25], [7.55, 1.25]]
        })
        expect(result.players[0].moves[1]).toEqual({
          duration: 1,
          points: [[7.55, 1.25], [7.75, 0.75], [7, 0.5], [4.5, 1.5]]
        })
        expect(result.players[0].moves[2]).toBe(null)
      })

      it('uses null to indicate skipping a move', function() {
        var result = Parse(json)

        expect(result.players[1].moves.length).toBe(3)
        expect(result.players[1].moves[0]).toEqual({
          duration: 0.5,
          points: [[5.75, 1.25], [5.75, 1.75]]
        })
        expect(result.players[1].moves[1]).toBe(null)
        expect(result.players[1].moves[2]).toEqual({
          duration: 1,
          points: [[5.75, 1.75], [7.75, 1.75]]
        })
      })

      it('has no moves for a non-moving player', function() {
        var result = Parse(json)

        expect(result.players[4].moves.length).toBe(3)
        expect(result.players[4].moves[0]).toBe(null)
        expect(result.players[4].moves[1]).toBe(null)
        expect(result.players[4].moves[2]).toBe(null)
      })
    })
  })
})
