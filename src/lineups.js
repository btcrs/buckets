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

    var centerPositions = ['C-F', 'C']
    var powerForwardPositions = ['F-C', 'F']
    var forwardPositions = ['F-G', ]
    var guardPositions = ['G-F']
    var pointPositions = ['G']

    const allShotZones = [
      'restricted area', 'low post', 'high post', 'midrange (lower right)',
      'midrange (lower left)', 'midrange (upper right)', 'midrange (upper left)',
      'midrange (upper middle)', 'three (right corner)', 'three (left corner)',
      'three (right)', 'three (middle)', 'three (left)'
    ]

    var points = []
    var guards = []
    var forwards = []
    var powers = []
    var centers = []

    var greatestTotal = 0
    var greatestTotalLineup = {}
    var bestTotalShots = {}
    var greatestAverage = 0
    var greatestAverageLineup = {}
    var bestAverageShots = {}
    var greatestScore = 0
    var greatestScoreLineup = {}
    var bestScoreShots = {}

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
        } else {
          console.log("???")
        }
      }
    }
    var cp = combinatorics.cartesianProduct(points, guards, forwards, powers, centers)

    const sumValues = (obj) => Object.keys(obj).reduce((acc, value) => acc + obj[value], 0);
    const zones = {}
    const shotLeaders = {}

    async.map(cp.toArray(), function(lineup, callback) {
      allShotZones.forEach(function(shotZone) {

        zones[shotZone] = Math.max.apply(Math, lineup.map(function(o) {
          return o.zones[shotZone].opinionatedPercentage;
        }))

        shotLeaders[shotZone] = lineup.filter(function(person) {
          return person.zones[shotZone].opinionatedPercentage == zones[shotZone]
        })[0].zones[shotZone]
      })

      if (sumValues(zones) > greatestTotal) {
        greatestTotal = sumValues(zones)
        greatestTotalLineup = lineup
        bestTotalShots = shotLeaders

      }
      if (sumValues(zones) / Object.keys(zones).length > greatestAverage) {
        greatestAverage = sumValues(zones) / Object.keys(zones).length
        greatestAverageLineup = lineup
        bestAverageShots = shotLeaders
      }

      var attemptTotal = 0
      for (var zone in shotLeaders) {
        if (shotLeaders.hasOwnProperty(zone)) {
          attemptTotal += shotLeaders[zone].total
        }
      }

      var scorePotential = 0
      var threes = ['three (right corner)', 'three (left corner)', 'three (right)', 'three (middle)', 'three (left)']
      for (var zone in shotLeaders) {
        if (shotLeaders.hasOwnProperty(zone)) {
          if (threes.indexOf(zone) > -1) {
            scorePotential += (Math.floor(shotLeaders[zone].made / attemptTotal * 85)) * 3
          } else {
            scorePotential += (Math.floor(shotLeaders[zone].made / attemptTotal * 85)) * 2
          }
        }
      }

      if (scorePotential > greatestScore) {
        greatestScore = scorePotential
        greatestScoreLineup = lineup
        bestScoreShots = shotLeaders
      }

      callback(err)
    }, function(err, results) {
      var bucketOfShots = gatherBestShots(bestScoreShots)
      save(bucketOfShots)
      deferred.resolve(greatestScoreLineup)
    })
  })
  return deferred.promise;
}

var gatherBestShots = function(splitShots) {
  var shotArray = []
  for (var zone in splitShots) {
    if (splitShots.hasOwnProperty(zone)) {
      splitShots[zone].shots.forEach(function(shot) {
        shot.z = splitShots[zone].opinionatedPercentage
        shotArray.push(shot)
      })
    }
  }
}

var save = function(players) {
  var name = '/Users/benjamincarothers/Projects/buckets/data/chart-' + m().format('MM-DD-YYYY') + '.json';
  fs.writeFile(name, JSON.stringify(players, null, 2), 'utf-8');
}

module.exports = generateLineups
