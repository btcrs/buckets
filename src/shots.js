var fs = require('fs');
var m = require('moment');
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

fs.readFile('/Users/benjamincarothers/Projects/buckets/data/players-11-09-2016.json', function(err, data) {
  var players = JSON.parse(data);
  var positions = {};
  var percentages = {}
  allShotZones.forEach(function(shotZone) {
      percentages[shotZone] = []
  })
  var prior = math.fraction(1 / 2)
  var opinionatedPriors = {
      "three (deep)": 0.27511171556246355,
      "midrange (lower left)": 0.37811565304087735,
      "midrange (lower right)": 0.3741641769810784,
      "low post": 0.3931591568850183,
      "three (left corner)": 0.2923289564616448,
      "restricted area": 0.4611658663971022,
      "high post": 0.3767408023279984,
      "midrange (upper right)": 0.33082888996606885,
      "midrange (upper left)": 0.3444926279271466,
      "midrange (upper middle)": 0.34286826230784195,
      "three (right corner)": 0.2866595248597895,
      "three (right)": 0.2907986111111111,
      "three (middle)": 0.3099824868651489,
      "three (left)": 0.33079847908745247
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


  var fifteenthPercentile = Math.floor(percentages['midrange (upper right)'].length * .15)
  for (var key in percentages) {
      if (percentages.hasOwnProperty(key)) {
          percentages[key] = percentages[key].sort().reverse()[fifteenthPercentile]
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
  });

  var save = function(players) {
      var name = '/Users/benjamincarothers/Projects/buckets/data/shots-' + m().format('MM-DD-YYYY') + '.json';
      fs.writeFile(name, JSON.stringify(players, null, 2), 'utf-8');
  }
