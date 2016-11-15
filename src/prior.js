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
        var position = positions[key];
        position.forEach(function(player) {
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

    var save = function(zones) {
      var name = '/Users/benjamincarothers/Projects/buckets/data/priors-' + m().format('MM-DD-YYYY') + '.json';
      fs.writeFile(name, JSON.stringify(zones, null, 2), 'utf-8');
    }

    var zonePriors = {}
    log(chalk.red.underline.bold('Percentages:'))
    for (var key in zoneAverages) {
      log(chalk.green.underline.bold('"' + key + '"' + ': ') + Math.floor(math.mean(zoneAverages[key].made)) + '/' + Math.floor(math.mean(zoneAverages[key].total) + math.mean(zoneAverages[key].made)) + ',')
      var alpha = Math.floor(math.mean(zoneAverages[key].made))
      var alphaBeta = Math.floor(math.mean(zoneAverages[key].made) + math.mean(zoneAverages[key].total))
      zonePriors[key] = Fraction(alpha, alphaBeta)
    }
    save(zonePriors)
    deferred.resolve(zonePriors)
  });
  return deferred.promise;
}

module.exports = generatePriors
