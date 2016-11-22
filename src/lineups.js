var fs = require('fs');
var Q = require('q');
var m = require('moment');
var async = require('async');
var math = require('mathjs');
var combinatorics = require('js-combinatorics');

var generateLineups = function(promisedShots) {
  var deferred = Q.defer();
  fs.readFile('/Users/benjamincarothers/Projects/buckets/data/shots-11-13-2016.json', function(err, data) {
    //https://en.wikipedia.org/wiki/Tweener_(basketball)
    const allShotZones = [
      'restricted area', 'low post', 'high post', 'midrange (lower right)',
      'midrange (lower left)', 'midrange (upper right)', 'midrange (upper left)',
      'midrange (upper middle)', 'three (right corner)', 'three (left corner)',
      'three (right)', 'three (middle)', 'three (left)'
    ]

    var centerPositions = ['C-F', 'C']
    var powerForwardPositions = ['F-C', 'F']
    var forwardPositions = ['F-G', ]
    var guardPositions = ['G-F']
    var pointPositions = ['G']

    var points = []
    var guards = []
    var forwards = []
    var powers = []
    var centers = []

    var greatestTotal = 0
    var greatestAverage = 0
    var greatestScore = 0

    var lineups = {
      "total": {
        "players": [],
        "shots": []
      },
      "average": {
        "players": [],
        "shots": []
      },
      "score": {
        "players": [],
        "shots": []
      }
    }

    var positions = promisedShots || JSON.parse(data);
    for (var position in positions) {
      if (positions.hasOwnProperty(position)) {
        if (guardPositions.indexOf(position) > -1) {
          guards = guards.concat(positions[position])
        } else if (centerPositions.indexOf(position) > -1) {
          centers = centers.concat(positions[position])
        } else if (forwardPositions.indexOf(position) > -1) {
          forwards = forwards.concat(positions[position])
        } else if (powerForwardPositions.indexOf(position) > -1) {
          powers = powers.concat(positions[position])
        } else if (pointPositions.indexOf(position) > -1) {
          points = points.concat(positions[position])
        }
      }
    }
    var cp = combinatorics.cartesianProduct(points, guards, forwards, powers, centers)
    async.map(cp.toArray(), function(lineup, callback) {
      let bigLeagues = {}
      allShotZones.forEach(function(shotZone) {
        var bestPlayer = lineup.reduce(function(max, x) {
          return x.zones[shotZone].opinionatedPercentage > max.zones[shotZone].opinionatedPercentage ? x : max;
        })
        bestPlayer['shots'] = bestPlayer['zones'][shotZone]
        bestPlayer['shots'].name = bestPlayer['name']
        bigLeagues[shotZone] = bestPlayer['shots']

      })
      var attemptTotal = 0
      for (var zone in bigLeagues) {
        if (bigLeagues.hasOwnProperty(zone)) {
          attemptTotal += bigLeagues[zone].total
        }
      }

      var scorePotential = 0
      var threes = ['three (right corner)', 'three (left corner)', 'three (right)', 'three (middle)', 'three (left)']
      for (var zone in bigLeagues) {
        if (bigLeagues.hasOwnProperty(zone)) {
          if (threes.indexOf(zone) > -1) {
            scorePotential += (Math.floor(((bigLeagues[zone].made / attemptTotal) * bigLeagues[zone].opinionatedPercentage) * 85) * 3)
          } else {
            scorePotential += (Math.floor(((bigLeagues[zone].made / attemptTotal) * bigLeagues[zone].opinionatedPercentage) * 85) * 2)
          }
        }
      }

      let sum = a => a.reduce((n, x) => n + x);
      let totalAmount = sum(Object.keys(bigLeagues).map(x => Number(bigLeagues[x].opinionatedPercentage)));
      lineup = lineup.map(x => x.name)
      if (totalAmount > greatestTotal) {
        greatestTotal = totalAmount
        lineups['total'] = {
          'players': lineup,
          'shots': bigLeagues
        }
      } else if (totalAmount / Object.keys(bigLeagues).length > greatestAverage) {
        greatestAverage = totalAmount / Object.keys(bigLeagues).length
        lineups['average'] = {
          'players': lineup,
          'shots': bigLeagues
        }
      } else if (scorePotential > greatestScore) {
        greatestScore = scorePotential
        console.log(greatestScore)
        lineups['score'] = {
          'players': lineup,
          'shots': bigLeagues
        }
      }
      callback(err)
    }, function(err, results) {
      save(gatherBestShots(lineups['total']), 'total')
      save(gatherBestShots(lineups['score']), 'score')
      deferred.resolve(lineups)
    })
  })
  return deferred.promise;
}

var gatherBestShots = function(splitShots) {
  var shotArray = []
  for (var zone in splitShots['shots']) {
    if (splitShots['shots'].hasOwnProperty(zone)) {
      splitShots['shots'][zone]['shots'].forEach(function(shot) {
        shot.z = splitShots['shots'][zone].opinionatedPercentage
        shotArray.push(shot)
      })
    }
  }
  return shotArray
}

var save = function(players, best) {
  var name = '/Users/benjamincarothers/Projects/buckets/data/chart-' + best +
    '-' + m().format('MM-DD-YYYY') + '.json';
  fs.writeFile(name, JSON.stringify(players, null, 2), 'utf-8');
}

module.exports = generateLineups
