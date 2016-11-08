var fs = require('fs');

fs.readFile('/Users/benjamincarothers/Projects/buckets/data/11-6-16.json', function (err, data) {
    var players = JSON.parse(data);
    var positions = {};
    var prior = 1/2
    players.forEach(function (player) {
        var zones = {};
        player.shots.forEach(function (shot) {
            zones[shot.zone] = zones[shot.zone] || {"percentage":0.0, "total": 0, "made": 0, "shots": []};
            zones[shot.zone].shots.push(shot);
            zones[shot.zone].total = zones[shot.zone].total + shot.attempts;
            zones[shot.zone].made = zones[shot.zone].made + shot.made;
            zones[shot.zone].percentage = zones[shot.zone].made/zones[shot.zone].total
            zones[shot.zone].adjustedPercentage = zones[shot.zone].percentage * prior
        });
        player.zones = zones

        positions[player.position] = positions[player.position] || [];
        positions[player.position].push(player);
    });
    console.log(positions[Object.keys(positions)[0]][0])
});


//  Introduce Priors and determine the top 15% of each zones
//  Create collections of lineups
//  Rank their scoring potential
