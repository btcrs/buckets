var fs = require('fs');
var m = require('moment');

fs.readFile('/Users/benjamincarothers/Projects/buckets/data/11-6-16.json', function (err, data) {
    var players = JSON.parse(data);
    var positions = {};
    var prior = 1/2
    // Averages: 200 made 442 taken
    var opinionatedPrior = 200/642
    players.forEach(function (player) {
        var zones = {};
        player.shots.forEach(function (shot) {
            zones[shot.zone] = zones[shot.zone] || {"percentage":0.0, "total": 0, "made": 0, "shots": []};
            zones[shot.zone].shots.push(shot);
            zones[shot.zone].total = zones[shot.zone].total + shot.attempts;
            zones[shot.zone].made = zones[shot.zone].made + shot.made;
            zones[shot.zone].percentage = zones[shot.zone].made/zones[shot.zone].total
            zones[shot.zone].adjustedPercentage = zones[shot.zone].percentage * prior
            zones[shot.zone].opinionatedPercentage = zones[shot.zone].percentage * opinionatedPrior
        });
        player.zones = zones

        positions[player.position] = positions[player.position] || [];
        positions[player.position].push(player);
    });
    save(positions)
});

var save = function(players) {
    var name = '/Users/benjamincarothers/Projects/buckets/data/shots-' + m().format('MM-DD-YYYY') + '.json';
    console.log(name)
    fs.writeFile(name, JSON.stringify(players, null, 2), 'utf-8');
}

//  determine the top 15% of each zones
