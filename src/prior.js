const chalk = require('chalk');
const log = console.log;
var math = require('mathjs');
var Fraction = require('fraction.js');
Fraction.REDUCE = false;
var m = require('moment');
var Q = require('q');
var fs = require('fs');

var generatePriors = function() {
  var deferred = Q.defer();
  fs.readFile('/Users/benjamincarothers/Projects/buckets/data/shots-11-10-2016.json', function(err, data) {
    var positions = JSON.parse(data);
    var shotsTaken = [];
    var shotsMade = [];
    var zoneAverages = {}
    for (var key in positions) {
      if (positions.hasOwnProperty(key)) {
        position[key].forEach(function(player) {
          for (var zone in player.zones) {
            if (player.zones.hasOwnProperty(zone)) {
              var made = 0;
              player.zones[zone].shots.forEach(function(shot) {
                made += shot.made
              })
              shotsMade.push(made)
              shotsTaken.push(player.zones[zone].shots.length)
              for (var zone in player.zones) {
                if (player.zones.hasOwnProperty(zone)) {
                  var currentZone = player.zones[zone];
                  zoneAverages[zone] = zoneAverages[zone] || {
                    "total": [],
                    "made": [],
                  };
                  zoneAverages[zone].total.push(currentZone.total)
                  zoneAverages[zone].made.push(currentZone.made)
                }
              };
            };
          };
        })
      }
    }
    var zonePriors = {}
    for (var key in zoneAverages) {
      zonePriors[key] = calculatePrior(zoneAverages[key])
    }
    save(zonePriors)
    deferred.resolve(zonePriors)
  });
  return deferred.promise;
}

var calculatePrior = function(averages) {
  log(chalk.green.underline.bold('"' + key + '"' + ': ') + Math.floor(math.mean(averages.made)) + '/' + Math.floor(math.mean(averages.total) + math.mean(averages.made)) + ',')
  var alpha = Math.floor(math.mean(averages.made))
  var alphaBeta = Math.floor(math.mean(averages.made) + math.mean(averages.total))
  return Fraction(alpha, alphaBeta)
}

var save = function(zones) {
  var name = '/Users/benjamincarothers/Projects/buckets/data/priors-' + m().format('MM-DD-YYYY') + '.json';
  fs.writeFile(name, JSON.stringify(zones, null, 2), 'utf-8');
}

module.exports = generatePriors
