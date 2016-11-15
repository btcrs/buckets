var fs = require('fs');
var m = require('moment');
var Q = require('q');
var math = require('mathjs');

const allShotZones = [
  'restricted area',
  'low post',
  'high post',
  'midrange (lower right)',
  'midrange (lower left)',
  'midrange (upper right)',
  'midrange (upper left)',
  'midrange (upper middle)',
  'three (right corner)',
  'three (left corner)',
  'three (right)',
  'three (middle)',
  'three (left)'
]

var gather = function(promisedPlayers) {
  var deferred = Q.defer();
  fs.readFile('/Users/benjamincarothers/Projects/buckets/data/players-11-09-2016.json', function(err, data) {
    var players = promisedPlayers || JSON.parse(data);
    var positions = {};
    var percentages = {}
    allShotZones.forEach(function(shotZone) {
      percentages[shotZone] = []
    })
    var prior = math.fraction(1 / 2)
    var opinionatedPriors = {
      "three (left)": 68 / 243,
      "three (left corner)": 12 / 42,
      "three (right)": 67 / 241,
      "midrange (upper left)": 6 / 18,
      "three (right corner)": 14 / 47,
      "midrange (lower left)": 18 / 48,
      "restricted area": 34 / 74,
      "three (middle)": 26 / 88,
      "low post": 9 / 24,
      "midrange (upper middle)": 6 / 16,
      "midrange (lower right)": 17 / 46,
      "high post": 11 / 30,
      "midrange (upper right)": 4 / 13,
    }
    for (var zone in opinionatedPriors) {
      if (opinionatedPriors.hasOwnProperty(zone)) {
        opinionatedPriors[zone] = math.fraction(opinionatedPriors[zone])
      }
    }

    players.forEach(function(player) {
      var zones = {};
      player.shots.forEach(function(shot) {
        zones[shot.zone] = zones[shot.zone] || {
          "percentage": 0.0,
          "total": 0,
          "made": 0,
          "shots": []
        };

        zones[shot.zone].shots.push(shot);
        zones[shot.zone].total = zones[shot.zone].total + shot.attempts;
        zones[shot.zone].made = zones[shot.zone].made + shot.made;
        zones[shot.zone].percentage = zones[shot.zone].made / zones[shot.zone].total

        var percentageFraction = math.fraction(zones[shot.zone].percentage)
        percentageFraction.n += prior.n
        percentageFraction.d += prior.d
        zones[shot.zone].adjustedPercentage = math.number(percentageFraction)

        percentageFraction = math.fraction(zones[shot.zone].percentage)
        percentageFraction.n += opinionatedPriors[shot.zone].n
        percentageFraction.d += opinionatedPriors[shot.zone].d
        zones[shot.zone].opinionatedPercentage = math.number(percentageFraction)
      })

      allShotZones.forEach(function(shotZone) {
        if (!zones[shotZone]) {
          zones[shotZone] = {
            "percentage": 0.0,
            "adjustedPercentage": 0.0,
            "opinionatedPercentage": 0.0,
            "total": 0,
            "made": 0,
            "shots": []
          };
        }
        percentages[shotZone].push(zones[shotZone].opinionatedPercentage)
      })

      player.zones = zones
      delete player.shots

      positions[player.position] = positions[player.position] || [];
      positions[player.position].push(player);
    });


    var topPercentile = Math.floor(percentages['midrange (upper right)'].length * .045)
    for (var key in percentages) {
      if (percentages.hasOwnProperty(key)) {
        percentages[key] = percentages[key].sort().reverse()[topPercentile]
      }
    }

    var viablePlayers = {}
    for (var position in positions) {
      if (positions.hasOwnProperty(position)) {
        positions[position].forEach(function(player) {
          viablePlayers[position] = []
          positions[position].forEach(function(player) {
            for (var key in player.zones) {
              if (player.zones.hasOwnProperty(key)) {
                if (player.zones[key].opinionatedPercentage > percentages[key]) {
                  viablePlayers[position].push(player)
                  break;
                }
              }
            }
          })
        })
      }
    }
    save(viablePlayers)
    deferred.resolve(viablePlayers)

  });
  return deferred.promise;
}

var save = function(players) {
  var name = '/Users/benjamincarothers/Projects/buckets/data/shots-' + m().format('MM-DD-YYYY') + '.json';
  fs.writeFile(name, JSON.stringify(players, null, 2), 'utf-8');
}

module.exports = gather
