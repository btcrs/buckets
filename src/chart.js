var dl = require('datalib');
var d3 = require('d3');

var draw_graph = (player) => {
      var coll = d3.nest()
          .key(function(d) {return [d.x, d.y]; })
          .rollup(function(v){return{
              made: d3.sum(v, function(d) {return d.made}),
              attempts: d3.sum(v, function(d){return d.attempts}),
              shootingPercentage:  d3.sum(v, function(d) {return d.made})/d3.sum(v, function(d){return d.attempts})
          }})
          .entries(tenderData);

      console.log(coll);

      var shotper = [];
      var finalData = [];
      var z = [];
      coll.forEach(function(a){
          a.key = JSON.parse("[" + a.key + "]");
          z.push(a.value.shootingPercentage);
      });

      var meanShot = dl.mean(z);
      var shotSTDV = dl.stdev(z);

      coll.forEach(function(a){
          var k = (a.value.shootingPercentage - meanShot)/shotSTDV;
          finalData.push({"x": a.key[0], "y": a.key[1], "z": k, "made": a.value.made, "attempts": a.value.attempts})
      });

     var heatRange = ['#5458A2', '#6689BB', '#FADC97', '#F08460', '#B02B48'];
  d3.select(document.getElementById('chart'))
      .append("svg")
      .chart("BasketballShotChart", {
          width: 600,
          title: 'Victor Oladipo 2014-15',
          // instead of makes/attempts, use z
          hexagonFillValue: function(d) {  return d.z; },
          // switch heat scale domain to [-2.5, 2.5] to reflect range of z values
          heatScale: d3.scale.quantile()
              .domain([-2.5, 2.5])
              .range(heatRange),
          // update our binning algorithm to properly join z values
          // here, we update the z value to be proportional to the events of each point
          hexagonBin: function (point, bin) {
              var currentZ = bin.z || 0;
              var totalAttempts = bin.attempts || 0;
              var totalZ = currentZ * totalAttempts;

              var attempts = point.attempts || 1;
              bin.attempts = totalAttempts + attempts;
              bin.z = (totalZ + (point.z * attempts))/bin.attempts;
          },
      })
      .draw(data);
  };

    // for(var i = 0; i < playersShots.length; i++){
    //   tenderData.push({"x":Math.ceil((x[i]+243)/10),
    //     "y": Math.ceil((y[i]+17)/9),
    //     "made": made[i],
    //     "attempts": attempts[i]});
    //   };
//   })
