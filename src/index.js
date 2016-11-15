var players = require('./players')
var shots = require('./shots')
var lineups = require('./lineups')
var court = require('./court')
var priors = require('./prior')
var program = require('commander');
var Q = require('q')

program
  .version('0.0.1')
  .option('-d, --date [day]', 'specify the day the data was collected [day]')
  .option('-l, --lineup', 'run only lineup code')
  .parse(process.argv);

if (program.lineup){
  Q.try(function(){
    return lineups()
  }).then(function(lineups){
    console.log(lineups)
  })
}

if (program.date){
  Q.try(function(){
    return priors()
  }).then(function(priors){
    return players(priors)
  }).then(function(players){
    return shots(players)
  }).then(function(shots){
    return lineups(shots)
  }).then(function(lineups){
  })
}
