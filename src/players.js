const nba = require('nba.js').default;
var request = require('request');
var q = require('q');
var async = require('async');
var m = require('moment');
var fs = require('fs');
import filter from 'lodash.filter'
import map from 'lodash.map'

const restricted = 4
const freeThrowLine = 13.75
const paint = 16
const cornerThreeX = 22
const cornerThreeY = 8.75
const three = 23.75

const zones = [
	{ name: 'restricted area', contains: ({ d }) =>
		d <= restricted,
	},
	{ name: 'low post', contains: ({ x, y, d }) =>
		d > restricted &&
		y <= (freeThrowLine / 2) &&
		Math.abs(x) <= (paint / 2),
	},
	{ name: 'high post', contains: ({ x, y }) =>
		y > (freeThrowLine / 2) &&
		y < freeThrowLine &&
		Math.abs(x) <= (paint / 2),
	},
	{ name: 'midrange (lower right)', contains: ({ x, y }) =>
		x >= -cornerThreeX &&
		x < -(paint / 2) &&
		y < cornerThreeY,
	},
	{ name: 'midrange (lower left)', contains: ({ x, y }) =>
		x > (paint / 2) &&
		x <= cornerThreeX &&
		y < cornerThreeY,
	},
	{ name: 'midrange (upper right)', contains: ({ x, y, d }) =>
		x >= -cornerThreeX &&
		x < -(paint / 2) &&
		y >= cornerThreeY &&
		d <= three,
	},
	{ name: 'midrange (upper left)', contains: ({ x, y, d }) =>
		x > (paint / 2) &&
		x <= cornerThreeX &&
		y >= cornerThreeY &&
		d <= three,
	},
	{ name: 'midrange (upper middle)', contains: ({ x, y, d }) =>
		Math.abs(x) <= paint &&
		y > freeThrowLine &&
		d <= three,
	},
	{ name: 'three (right corner)', contains: ({ x, y }) =>
		x < -cornerThreeX &&
		y < cornerThreeY,
	},
	{ name: 'three (left corner)', contains: ({ x, y }) =>
		x > cornerThreeX &&
		y < cornerThreeY,
	},
	{ name: 'three (right)', contains: ({ x, y, d }) =>
		d > three &&
		x < -paint &&
		y > cornerThreeY,
	},
	{ name: 'three (middle)', contains: ({ x, y, d }) =>
		d > three &&
		Math.abs(x) <= paint &&
		y > cornerThreeY,
	},
	{ name: 'three (left)', contains: ({ x, y, d }) =>
		d > three &&
		x > paint &&
		y > cornerThreeY,
	}
]

function dist(x, y) {
	return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)).toFixed(2)
}

function getZones() {
	return map(zones, 'name')
}

function getZoneFromShot({ x, y }) {
	const d = dist(x, y)
	const zone = filter(zones, z => z.contains({ x, y, d }))
		.shift()
	return zone ? zone.name : null
}
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
            var shots = JSON.parse(body);
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

var assignZone = (xLoc, yLoc) => (getZoneFromShot({
    x: xLoc,
    y: yLoc
}));

var save = function(players) {
    var name = '/Users/benjamincarothers/Projects/buckets/data/players-' + m().format('MM-DD-YYYY') + '.json';
    fs.writeFile(name, JSON.stringify(players, null, 2), 'utf-8');
}
