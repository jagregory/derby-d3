import Parse from '../parse'
import chai from 'chai'

let expect = chai.expect

describe('parsing play json', () => {
  let json = null

  beforeEach(() => {
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
        "placement": [10, 1.25],
        "properties": {
          "position": "jammer"
        }
      }, {
        "id": "2",
        "team": "1",
        "placement": [5.75, 1.25],
        "properties": {
          "position": "pivot"
        }
      }, {
        "id": "3",
        "team": "1",
        "placement": [6.5, 0.5]
      }, {
        "id": "4",
        "team": "1",
        "placement": [7.25, 1.25]
      }, {
        "id": "5",
        "team": "1",
        "placement": [6.5, 2]
      }, {
        "id": "6",
        "team": "2",
        "placement": [10, 2.2],
        "properties": {
          "position": "jammer"
        }
      }, {
        "id": "7",
        "team": "2",
        "placement": [5.75, 2.45],
        "properties": {
          "position": "pivot"
        }
      }, {
        "id": "8",
        "team": "2",
        "placement": [6.5, 1.25]
      }, {
        "id": "9",
        "team": "2",
        "placement": [7.25, 2.45]
      }, {
        "id": "10",
        "team": "2",
        "placement": [6.5, 3]
      }],

      "play": {
        "guide": {
          "heading": "Before",
          "text": `<h2 class="team-a">Team a</h2><p>Do something</p><h2
                  "class="team-b">Team b</h2><p>Do something else</p>`
        },
        "moves": [{
          "guide": {
            "heading": "Step 1",
            "text": "WTF"
          },
          "players": {
            "1": [
              { "type": "move", "to": [[10, 1.25], [7.55, 1.25]], "duration": 1 },
              { "type": "move", "to": [[7.55, 1.25], [6, 0]],     "duration": 0.5 }
            ],
            "2": [
              { "type": "move", "to": [[5.75, 1.25], [5.75, 1.75]], "duration": 0.5 }
            ],
            "3": [
              { "type": "move", "to": [[6.5, 0.5], [7.15, 1.1]], "duration": 0.5 }
            ],
            "4": [
              { "type": "move", "to": [[7.25, 1.25], [6.5, 1.25]], "duration": 0.25 }
            ],
            "6": [
              { "type": "move", "to": [[10, 2.2], [7, 1.75]], "duration": 1 }
            ],
            "8": [
              { "type": "move", "to": [[6.5, 1.25], [5.75, -0.25]], "duration": 0.5 }
            ],
            "9": [
              { "type": "move", "to": [[7.25, 2.45], [7, 2.45]], "duration": 0.5 }
            ],
            "10": [
              { "type": "move", "to": [[6.5, 3], [6.5, 2.7]], "duration": 0.75 }
            ]
          }
        }, {
          "guide": {
            "heading": "Step 2",
            "text": "CTF"
          },
          "players": {
            "1": [
              { "type": "move", "to": [[7.55, 1.25], [7.75, 0.75], [7, 0.5], [4.5, 1.5]], "duration": 1 }
            ],
            "8": [
              { "type": "move", "to": [[5.75, -0.25], [7.25, -0.25], [7, 0.4]], "duration": 1 }
            ]
          }
        }, {
          "guide": {
            "heading": "Step 3",
            "text": "OMG"
          },
          "players": {
            "2": [
              { "type": "move", "to": [[5.75, 1.75], [7.75, 1.75]], "duration": 1 }
            ]
          }
        }]
      }
    }
  })

  it('extracts teams', () => {
    let result = Parse(json)

    expect(result.teams).to.contain({
      id: '1'
    })

    expect(result.teams).to.contain({
      id: '2'
    })

    expect(result.teams.length).to.eql(2)
  })

  describe('guides', () => {
    let json = null

    beforeEach(() => {
      json = {
        "play": {
          "guide": {
            "heading": "Before",
            "text": `<h2 class="team-a">Team a</h2><p>Do something</p><h2 
                     class="team-b">Team b</h2><p>Do something else</p>`
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

    it('uses play guide as first guide and the move guides after', () => {
      let result = Parse({
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

      expect(result.guides[0]).to.eql({
        heading: "First",
        text: "Text"
      })

      expect(result.guides[1]).to.eql({
        heading: "Second",
        text: "Second Text"
      })
    })

    it('uses null where there is no guide', () => {
      let result = Parse({
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

      expect(result.guides[0]).to.eql(null)
      expect(result.guides[1]).to.eql({
        heading: "Second",
        text: "Second Text"
      })
      expect(result.guides[2]).to.eql(null)
    })

    it('sets the title', () => {
      let result = Parse({
        "play": {
          "title": "blah"
        }
      })

      expect(result.title).to.eql('blah')
    })
  })

  describe('players', () => {
    it('associates players with the right team', () => {
      let result = Parse(json),
        team1 = result.teams[0],
        team2 = result.teams[1]

      expect(result.players[0].team).to.eql(team1.id)
      expect(result.players[5].team).to.eql(team2.id)
    })

    it('sets the player id', () => {
      let result = Parse(json)

      expect(result.players[0].id).to.eql('1')
      expect(result.players[1].id).to.eql('2')
      expect(result.players[2].id).to.eql('3')
    })

    it('sets the player position', () => {
      let result = Parse(json)

      expect(result.players[0].position).to.eql('jammer')
      expect(result.players[1].position).to.eql('pivot')
      expect(result.players[2].position).to.eql(undefined)
    })

    it('sets the player initial placement', () => {
      let result = Parse(json)

      expect(result.players[0].placement).to.eql([10, 1.25])
    })

    describe('steps', () => {
      it('embeds steps', () => {
        let result = Parse(json)

        let steps = result.players[0].steps
        expect(steps.length).to.eql(3)

        let step1 = steps[0]
        expect(step1.length).to.eql(2)
        expect(step1[0]).to.eql({
          duration: 1,
          points: [[10, 1.25], [7.55, 1.25]]
        })
        expect(step1[1]).to.eql({
          duration: 0.5,
          points: [[7.55, 1.25], [6, 0]]
        })

        var step2 = steps[1]
        expect(step2.length).to.eql(1)
        expect(step2[0]).to.eql({
          duration: 1,
          points: [[7.55, 1.25], [7.75, 0.75], [7, 0.5], [4.5, 1.5]]
        })
      })

      it('uses empty to indicate skipping a step', () => {
        let result = Parse(json),
          steps = result.players[1].steps

        expect(steps[1]).to.eql([])
      })

      it('has no steps for an inactive player', () => {
        let result = Parse(json),
          steps = result.players[4].steps

        expect(steps.length).to.eql(3)
        expect(steps[0]).to.eql([])
        expect(steps[1]).to.eql([])
        expect(steps[2]).to.eql([])
      })
    })
  })
})
