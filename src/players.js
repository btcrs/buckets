const nba = require('nba.js').default;
const zones = require('nba-shot-zones');
var request = require('request');
var q = require('q');
var async = require('async');
var fs = require('fs');

var players = q.all([nba.stats.playerDefenseStats({
        IsOnlyCurrentSeason: 1
    }),
    nba.stats.playerBioStats({
        IsOnlyCurrentSeason: 1
    })
])

players.then(function success(data) {
    async.map(data[0]['LeagueDashPTDefend'], function(player, callback) {
        var stats = {
            id: player.close_def_person_id,
            name: player.player_name,
            position: player.player_position,
        }
        var player_id = stats.id;
        var shot_chart_url = `http://stats.nba.com/stats/shotchartdetail?CFID=33&CFPARAMS=2015-16&ContextFilter=&ContextMeasure=FGA&DateFrom=&DateTo=&GameID=&GameSegment=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerID=${player_id}&PlusMinus=N&PlayerPosition=&Rank=N&RookieYear=&Season=2015-16&SeasonSegment=&SeasonType=Regular+Season&TeamID=0&VsConference=&VsDivision=&mode=Advanced&showDetails=0&showShots=1&showZones=0`
        request.get(shot_chart_url, function(err, res, body) {
            console.log(body)
            var shots = JSON.parse(body);
            console.log(shots)
            var playersShots = shots.resultSets[0].rowSet;
            var header = shots.resultSets[0].headers;
            var shotLog = playersShots.map(shot => ({
                x: shot[header.indexOf('LOC_X')],
                y: shot[header.indexOf('LOC_Y')],
                made: shot[header.indexOf('SHOT_MADE_FLAG')],
                attempts: shot[header.indexOf('SHOT_ATTEMPTED_FLAG')],
                zone: assignZone(shot[header.indexOf('LOC_X')],
                    shot[header.indexOf('LOC_Y')])
            }))
            stats.shots = shotLog
            callback(err, stats)
        })
    }, function(err, results) {
        save(results)
    })
});

var save = function(players) {
    fs.writeFile('./data.json', JSON.stringify(players, null, 2), 'utf-8');
}
const shotZones = zones.getZones()
var assignZone = (xLoc, yLoc) => (zones.getZoneFromShot({
    x: xLoc,
    y: yLoc
}));
