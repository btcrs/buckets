---
title: Buckets
author: Ben Carothers
created: 'Tue Nov 01 2016 11:42:28 GMT-0400 (EDT)'
show_footer: false
---

# Introduction

Plenty of NBA lineups that sounded scarily impressive on paper still managed to have completely underwhelming seasons. So much goes into an productive team that it's easy to write these off as flukes, but maybe there's a simple derivative that could've predicted which units had the potential to mesh offensively and whether or not any were doomed from the start.

I went through the process of creating the best offensive five man lineups using current (2015 - 2016) starting players. Starting with the players with the highest offensive efficiency, I created selective zoned shot charts and determined which of the units have the highest total percentage of floor coverage. I believe this may be the strongest metric of "spreading the floor" we can really quantify. Then I considered the most versatile as those with the greatest coverage and used the each zone's percentage to determine which aggregates also hav3 the highest scoring potential and efficiency based on their respective players shooting data.

Using the same exact method of building new and powerful teams I then rank those that have been historically great -- including the past few championship winners and a few other iconic teams. Though comparison against the winningest teams is not entirely clear cut the results can at least hint at if floor coverage is a strong predictor of game-time performance of if the most important feature of any winning team is LeBron James.

# Data

The NBA provides an API to access an enormous collection of game-time statistics providing what are coined "Advanced Stats" dating all the way back to 1996-97 season and "Base Stats", which first started being recorded in 1946 and were ultimately digitized and hosted at separate endpoints of the same api.

As more money continues to pour into the league players, coaches, and fans are all looking to consume basketball data in a more intelligent way. Being able to qualify and understand game-time decisions by embracing sports analytics makes watching the games more enjoyable for fans and could be the key to securing a competitive advantage for both coaches and players.

The most relevant feature, and the data I've used as the basis of my analysis, is an incredibly granular log of every attempted shot taken by every active player in the NBA. This provides a basis by which it is possible to determine particular zones where players can contribute the most simply by qualitatively spreading the floor and providing very specific, efficient shots. This shotchart endpoint is one of the "Advanced Stats", so approximately 20 seasons worth of shooting data is available. For the sake of this experiment I chose to focus primarily on the most recent completed season. During the 2015-16 NBA season each of the approximately 450 active players took, on average 442 shots. This leaves nearly two million specific records to be considered.

Using [nba.js](https://github.com/kshvmdn/nba.js), a popular Node library that provides access to both the `stats.nba.com` API and `data.nba.net` API, I first collected metadata for every active player on a 2015-16 roster including registered name, the player's id, and their position. The API is purely RESTful so depending on URL endpoints and various parameters you can shape the data that is ultimately returned. Data is transferred using JSON as a textual representation, so it plays very well with Node.

```javascript
var players = Q.all([nba.stats.playerDefenseStats({
    IsOnlyCurrentSeason: 1
  }),
  nba.stats.playerBioStats({
    IsOnlyCurrentSeason: 1
  })
])
```

I created an object for each player in resulting array including only the most relevant information -- namely ID, name, and position. I also included a parameter, which was a call shotchart API call made using the respective player id. Upon success, this would hold an array of shots each with their own collection of metadata. Though the library I chose to use provides a very concise and straight-forward means of accessing most of the data made available by the NBA, the shotchart endpoint has not yet been implemented. Instead I constructed a url with the necessary parameters for each player in contention.

```javascript
var shot_chart_url = 'http://stats.nba.com/stats/shotchartdetail?CFID=33&CFPAR'+
 'AMS=2014-15&ContextFilter=&ContextMeasure=FGA&DateFrom=&D'+
 'ateTo=&GameID=&GameSegment=&LastNGames=0&LeagueID=00&Loca'+
 'tion=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&'+
 'PaceAdjust=N&PerMode=PerGame&Period=0&PlayerID=203506&Plu'+
 'sMinus=N&PlayerPosition=&Rank=N&RookieYear=&Season=2014-15&Seas'+
 'onSegment=&SeasonType=Regular+Season&TeamID=0&VsConferenc'+
 'e=&VsDivision=&mode=Advanced&showDetails=0&showShots=1&sh'+
 'owZones=0';


 request.get(shot_chart_url, function(err, res, body){
   var shots = JSON.parse(body);
   return shots.resultSets[0].rowSet;
 })
```

I also chose to reduce the shot objects returned by the shotchart call to a collection of objects, including the x and y coordinates where the shot was taken, the number of attempts, and the number of made attempts, indexed by the zones in which the shot was taken. These zones were calculated using a Boston Globe library `nba-shot-zones` that takes the recorded X and Y location of the shot and maps that to pre-defined zones on the basketball court.

The NBA defines positions in a non-traditional way. Basketball lineups have historically been made up of two guards, two forwards, and a center. The two guards are split up between the play facilitating point guard and the scorer shooting guard. Forwards are split between a standard forward and power forward. These five positions have represented some of the strongest lines ups in the history of the league. More recently, however, sports statisticians have adopted the idea of the tweener. Instead of identifying the distinction of shooting guards and power forwards two hybrid positions were inserted between the guard (G) and forward (F), which are G-F and F-G. Consolidating the seven groups into five positions was largely a judgement call. The separation, however, leaves us with a data structure containing objects for each position (Including hybrids) each of which are holding player objects that contain the aforementioned metadata and also their object of shots binned by zone.

From here we need to determine the players that could viably be the most efficient shooter from a number of zones on the court in a five-man lineup.

Each zone effectively represents it's own scoring microcosm, so it is important to consider them each in a mutually exclusive way. At this point I introduced the idea of beta distributions and probabilistic priors. In the `prior.js` file I iterate through every player and every zone to gather a collection of shooting means. In the most general terms your average NBA player took 442 shot attempts during the 2015-16 season. This ratio is the sum of all considered zones, so by repeating the same process while considering each zone separately I was left with a grouping of more targeted, granular values. The last prior I included was one with and equal alpha and beta of 1, 1/2\. I iterated through each of the players shot objects and augmented them with three shooting percentages with a specific prior added to each.

After calculating shooting percentages and adjusted shooting percentages was only a single map and a single reduce from being used for analysis. First, each of the players shots objects need to be separated and grouped by zone. From these groupings we can consider each of the three shooting percentages and calculate cut off values for each of the respective zones by inspecting the value representing the floor of target percentile.

With these values we iterate over the player objects one last time looking through each of their zones and determining whether any of them are above their respective cut off values. If so they are included as viable lineup members to be included in the analysis algorithm.

# Analysis

The process of grouping and scoring was devised to be as straight-forward and explicit as possible. I set the cutoff to be the top 5 percent of shooters from any given scoring zone. Though the distribution of players in each of the five positions is not totally uniform, we're left with about 100 of the approximately 450 players active in the NBA.

Through a cartesian product of the five groupings I was left with five million possible lineups composed of only the most viable players.

For each zone I considered only the grouping of shots from the player in that lineup with the greatest zone specific percentage.

The exact process worked as such. Each constructed lineup was considered in no particular order. For each zone that the court was divided into I reduced the opinionatedPercentage score, the value that incorporates the zone respective prior, to the max among each of the five players. After determining the greatest percentages for each considered zone I also created a an object with the group of the shots that represent that zones percentage. From this collection of highest percentage shots I summed the total number of attempts and determined the proportion that were taken from each specific zone.

This left two objects that from which all results were derived. First, an object containing the teams proposed shooting percentage broken up into each considered zone. Second, an object with each of the shots that went into these percentages. Thus, each zone is owned by one of the players in the lineup and only their shots are assigned to that zone. From the group of percentages I considered and stored both the mean of all the percentages and also the aggregate. Though crude, these values gave me a quick jumping off point and an idea of how the make up zone percentages might be affected by extreme hot spots compared to a homogenous spread.

Then I attempted to derive a average single game scoring potential for each of the lineups. Using the proportions of each zone I determined how many of the 85 shots that are taken during an average regular season NBA game would be taken from this zone and multiplied that by zone's percentage. The resulting number was the expected number of made shots that this lineup could produce from the zone in consideration. The point value of that number of shots, which depended on whether the zone was within or behind the three point line, was added to the scoring potential.

# Results

## Shotcharts

![Imgur](http://i.imgur.com/fIlyopd.png) ![Imgur](http://i.imgur.com/Lwhx3y0.png)

# Related Work

Interestingly in a 2014 [paper](https://www.boozallen.com/content/dam/boozallen/images/capabilities/Technology/sports-analytics/ssac-bball-spatial.pdf) out of Booz Allen Hamilton, Authors proposed that increased winning percentage was strongly correlated with the percentage of shots taken from specific, key zones. The authors determined which of their fourteen shooting zones, determined radially by segmenting 4 layers each starting at an equal distance further from the basket than the last, are likely to result in a significant increase in conversion. Though they determined that teams likely to shoot from these zones are also more likely to win than their adversaries, they also posited that there exist some zones with high conversion rates that lead to more points scored in the following defensive possession. It is supposed that certain shots lead to a higher percentage of defensive rebounds meaning that despite a higher conversion rate, those shots that do miss lead to fast-break opportunities for the opposing team and in turn a greater chance of losing.

A Harvard [paper](http://www.sloansportsconference.com/wp-content/uploads/2012/02/Goldsberry_Sloan_Submission.pdf), CourtVision: New Visual and Spatial Analytics for the NBA, used similar strategies as I have in this paper do determine a percentage of spread generated by any singular NBA player. In their research the authors divided the portion of the NBA court aptly named "scoring area" into 1284 unique shooting cells. Their spread metric was determined by the number of zones in which at least one shot had been attempted resulting in some number between 0 and 1284\. They then introduced the the average points per attempt and determined the number of cells in which the player scores at least 1 point per attempt. This value, called range, ultimately determines the number of cells in which a player shoots two-point shots over 50% and three-point shots over 33%. Though the 50% value is very telling, as a majority of team two-point shooting percentages are below this value, only a handful of teams, shoot below 33% on three-point attempts. Furthermore, segmenting the "shooting area" by cells that are a singe square foot each seems to overestimate the uniqueness of each location. I am interested, however, in how zone selection could effect the outcome of spacial analytics of NBA shooting.

Lastly, another Harvard [paper](http://www.sloansportsconference.com/wp-content/uploads/2013/The%20Dwight%20Effect%20A%20New%20Ensemble%20of%20Interior%20Defense%20Analytics%20for%20the%20NBA.pdf), The Dwight Effect: A New Ensemble of Interior Defense Analytics for the NBA, outlines tools by which similar methods of analysis could be employed to determine well-rounded floor coverage both offensively and defensively. arenas equipped with SportsVu systems are capable of providing data about both shots taken by and taken against any given player. With this information we can determine shooting percentage against NBA players, which can be compared against the league average to determine defensive efficiency.

![Imgur](http://i.imgur.com/wXDXMOC.png)

Obviously, qualifying defensive prowess is much more difficult than offensive because regardless of game plan at the time of any given shot the defensive plays are much more cooperative. However, it's likely that we could use similar radial zoning as the Booz Allen paper to determine defensive percentages from the perimeter to the interior and consider a lineups defensive score as a sum instead of a splice.

# Criticisms

This experiment explored the novel and intuitive perspective of effective offensive lineups as groups of players that can most efficiently tap into the most available scoring zones. ultimately this metric may possibly be too simplified to stand alone as definitive proof. For one, without an effectively run offensive strategy players may never have the opportunity to shoot from their respective zones.

Any given team would realistically need strong passing, movement without the ball, and offensive rebounding, each of which are not taken into account when scoring these lineups, in order to capitalize on the comprehensive and mutually exclusive make up of their floor coverage. It's very likely that lineups that stronger in these unaccounted for qualities could easily make up ground on teams with greater coverage.

Furthermore, though the algorithm was never meant to find holistically great, well-rounded teams it's hard to ignore that there is no consideration of defense or turn overs. The number of points, and value thereof, that can be directly attributed to defensive stops would play a factor in any real lineup's effectiveness. Similarly, if the aggregate turnovers per game of the players that make up the lineup are greater than the season's team average it's possible that the number of shot attempts scored should be lowered appropriately. Obviously it's hard to predict how these numbers would be affected by the proposed lineups and shot attempt delegations, which is why I chose not to take turnovers into consideration, but they are very likely to affect a team's scoring potential.

Lastly, and maybe less critical, many of these lineups are strictly impossible. For one, it's very likely that some of the lineups in consideration currently do, or soon will, cost a total of at least 500 million dollars over a five year period, which is nearly the cost of the most expensive yearly team payroll for only five players. Also, considering that this scoring system was based only on the stats available from the 2015-16 season, these top lineups are only valid exactly now. Because of the number of these players that are locked into long term contracts it's very likely that the the results would be very different by the time that the players in question became available. It could be interesting to consider only those players that are in free agency and then rank the affect they have on all of the team's current starting lineups.

# Conclusion

Being able to truly validate any of the findings presented in this paper is nearly impossible; however based on the evidence presented I argue that the greatest scoring potential for an NBA lineup comes from comprehensive floor coverage rather than a collection of some zones with a shooting percentage significantly above the league average and other significantly below. I proposed a method of evaluating an NBA teams offensive ability by considering the sum of each players strengths, a bold but not unwarranted proposition. Lastly, I showed how NBA data can be consumed and manipulated with Node making sports analytics and specifically basketball data more accessible and consumable by anyone that knows javascript.

# Future Work

Though this algorithm is infinitely extensible one of the main goals was to keep the process of finding and ranking teams as simple and declarative as possible. One of the less intrusive things that I'd be interested in doing is trying to find "budget" lineups. I think it would be very interesting to use a similar process to rank a teams offensive efficiency, but set the yearly salary cost of the five players as another limiting factor. It's possible that the effectiveness of current line ups and their cost are strongly correlated, but I imagine there exist lineups with comprehensive floor coverage that are much less expensive than their utility. With a league-wide average of at least 14 players per team it might be the case that adding two budget lineups could provide a sustained offensive efficiency when the starters rest. rest. rest.
