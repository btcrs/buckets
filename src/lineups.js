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

    var points = []
    var guards = []
    var forwards = []
    var powers = []
    var centers = []

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
    var greatestTotal = 0
    var greatestTotalLineup = {}
    var greatestAverage = 0
    var greatestAverageLineup = {}
    var greatestScore = 0
    var greatestScoreLineup = {}
    var bestShots = {}
    async.map(cp.toArray(), function(lineup, callback) {
      const zones = {
        "restricted area": Math.max.apply(Math, lineup.map(function(o) {
          return o.zones["restricted area"].opinionatedPercentage;
        })),
        "low post": Math.max.apply(Math, lineup.map(function(o) {
          return o.zones["low post"].opinionatedPercentage;
        })),
        "high post": Math.max.apply(Math, lineup.map(function(o) {
          return o.zones["high post"].opinionatedPercentage;
        })),
        "midrange (lower right)": Math.max.apply(Math, lineup.map(function(o) {
          return o.zones["midrange (lower right)"].opinionatedPercentage;
        })),
        "midrange (lower left)": Math.max.apply(Math, lineup.map(function(o) {
          return o.zones["midrange (lower left)"].opinionatedPercentage;
        })),
        "midrange (upper right)": Math.max.apply(Math, lineup.map(function(o) {
          return o.zones["midrange (upper right)"].opinionatedPercentage;
        })),
        "midrange (upper left)": Math.max.apply(Math, lineup.map(function(o) {
          return o.zones["midrange (upper left)"].opinionatedPercentage;
        })),
        "midrange (upper middle)": Math.max.apply(Math, lineup.map(function(o) {
          return o.zones["midrange (upper middle)"].opinionatedPercentage;
        })),
        "three (right corner)": Math.max.apply(Math, lineup.map(function(o) {
          return o.zones["three (right corner)"].opinionatedPercentage;
        })),
        "three (left corner)": Math.max.apply(Math, lineup.map(function(o) {
          return o.zones["three (left corner)"].opinionatedPercentage;
        })),
        "three (right)": Math.max.apply(Math, lineup.map(function(o) {
          return o.zones["three (right)"].opinionatedPercentage;
        })),
        "three (middle)": Math.max.apply(Math, lineup.map(function(o) {
          return o.zones["three (middle)"].opinionatedPercentage;
        })),
        "three (left)": Math.max.apply(Math, lineup.map(function(o) {
          return o.zones["three (left)"].opinionatedPercentage;
        })),
      }

      const shotLeaders = {
        "restricted area": lineup.filter(function(person) {
          return person.zones['restricted area'].opinionatedPercentage == zones['restricted area']
        })[0].zones['restricted area'],
        "low post": lineup.filter(function(person) {
          return person.zones['low post'].opinionatedPercentage == zones['low post']
        })[0].zones['low post'],
        "high post": lineup.filter(function(person) {
          return person.zones['high post'].opinionatedPercentage == zones['high post']
        })[0].zones['high post'],
        "midrange (lower right)": lineup.filter(function(person) {
          return person.zones['midrange (lower right)'].opinionatedPercentage == zones['midrange (lower right)']
        })[0].zones['midrange (lower right)'],
        "midrange (lower left)": lineup.filter(function(person) {
          return person.zones['midrange (lower left)'].opinionatedPercentage == zones['midrange (lower left)']
        })[0].zones['midrange (lower left)'],
        "midrange (upper right)": lineup.filter(function(person) {
          return person.zones['midrange (upper right)'].opinionatedPercentage == zones['midrange (upper right)']
        })[0].zones['midrange (upper right)'],
        "midrange (upper left)": lineup.filter(function(person) {
          return person.zones['midrange (upper left)'].opinionatedPercentage == zones['midrange (upper left)']
        })[0].zones['midrange (upper left)'],
        "midrange (upper middle)": lineup.filter(function(person) {
          return person.zones['midrange (upper middle)'].opinionatedPercentage == zones['midrange (upper middle)']
        })[0].zones['midrange (upper middle)'],
        "three (right corner)": lineup.filter(function(person) {
          return person.zones['three (right corner)'].opinionatedPercentage == zones['three (right corner)']
        })[0].zones['three (right corner)'],
        "three (left corner)": lineup.filter(function(person) {
          return person.zones['three (left corner)'].opinionatedPercentage == zones['three (left corner)']
        })[0].zones['three (left corner)'],
        "three (right)": lineup.filter(function(person) {
          return person.zones['three (right)'].opinionatedPercentage == zones['three (right)']
        })[0].zones['three (right)'],
        "three (middle)": lineup.filter(function(person) {
          return person.zones['three (middle)'].opinionatedPercentage == zones['three (middle)']
        })[0].zones['three (middle)'],
        "three (left)": lineup.filter(function(person) {
          return person.zones['three (left)'].opinionatedPercentage == zones['three (left)']
        })[0].zones['three (left)'],
      }



      if (sumValues(zones) > greatestTotal) {
        greatestTotal = sumValues(zones)
        greatestTotalLineup = lineup
          // bestShots = shotLeaders

      }
      if (sumValues(zones) / Object.keys(zones).length > greatestAverage) {
        greatestAverage = sumValues(zones) / Object.keys(zones).length
        greatestAverageLineup = lineup
          // bestShots = shotLeaders
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
        bestShots = shotLeaders
      }

      callback(err)
    }, function(err, results) {
      var shotArray = []
      for (var zone in bestShots) {
        if (bestShots.hasOwnProperty(zone)) {
          bestShots[zone].shots.forEach(function(shot) {
            delete shot.zone
              // shot.x = Math.ceil((shot.x+243)/10),
              // shot.y = Math.ceil((shot.y+17)/9),
            shot.z = bestShots[zone].opinionatedPercentage
            shotArray.push(shot)
          })
        }
      }
      save(shotArray)
      deferred.resolve(greatestScoreLineup)
    })
  })
  return deferred.promise;
}
var save = function(players) {
  var name = '/Users/benjamincarothers/Projects/buckets/data/chart-' + m().format('MM-DD-YYYY') + '.json';
  fs.writeFile(name, JSON.stringify(players, null, 2), 'utf-8');
}

module.exports = generateLineups
