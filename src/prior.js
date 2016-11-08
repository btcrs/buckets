const chalk = require('chalk');
const log = console.log;
var math = require('mathjs');
var fs = require('fs');

fs.readFile('/Users/benjamincarothers/Projects/buckets/data/shots-11-08-2016.json', function (err, data) {
    var positions = JSON.parse(data);
    var shotsTaken = [];
    var shotsMade = [];
    var zoneAverages = {} 
    for (var key in positions) {
       if (positions.hasOwnProperty(key)) {
             var position = positions[key];
             position.forEach(function (player) {
                 var made = 0;
                 player.shots.forEach(function (shot) {
                     made += shot.made
                 })
                shotsMade.push(made)
                shotsTaken.push(player.shots.length)
                for (var zone in player.zones) {
                   if (player.zones.hasOwnProperty(zone)) {
                     var currentZone = player.zones[zone];
                     zoneAverages[zone] = zoneAverages[zone] || {"total": [], "made":[], };
                     zoneAverages[zone].total.push(currentZone.total)
                     zoneAverages[zone].made.push(currentZone.made)
                }};
            });
          }
    }

    log(chalk.red.underline.bold('Percentages:'))
    for (var key in zoneAverages) {
        log(chalk.green.underline.bold(key + ':'))
        log(math.mean(zoneAverages[key].made) / math.mean(zoneAverages[key].total))
    }
    log(chalk.blue.underline.bold('Average:'))
    log(math.mean(shotsMade)/math.mean(shotsTaken))
    log(math.sum(shotsMade)/math.sum(shotsTaken))





    log(chalk.red.underline.bold('Average Taken and Made:'))
    log(chalk.red.underline.bold('Percentages:'))
    for (var key in zoneAverages) {
        log(chalk.green.underline.bold(key + ':'))
        log(chalk.blue.underline.bold('Shots Taken:'))
        if(key === 'three (deep)'){
            log(zoneAverages[key])
        }
        log(math.mean(zoneAverages[key].total))
        log(chalk.blue.underline.bold('Shots Made:'))
        log(math.mean(zoneAverages[key].made))
    }
    log(chalk.blue.underline.bold('Max:'))
    log(math.max(shotsTaken))
    log(chalk.blue.underline.bold('Min:'))
    log(math.min(shotsTaken))
    log(chalk.blue.underline.bold('Shots Taken:'))
    log(math.mean(shotsTaken))
    log(chalk.blue.underline.bold('Shots Made:'))
    log(math.mean(shotsMade))
});
