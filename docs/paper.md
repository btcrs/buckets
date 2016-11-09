---
title: "Buckets"
author: "Ben Carothers"
created: "Tue Nov 01 2016 11:42:28 GMT-0400 (EDT)"
original:
    title: "Blank Kajero notebook"
    url: "http://www.joelotter.com/kajero/blank"
show_footer: false
---

## Why

Plenty of NBA lineups that sounded scarily impressive on paper still managed to have completely
underwhelming seasons. So much goes into an productive team that it's easy to write these off
as flukes, but maybe there's a simple derivative that could've predicted which units had the
potential to mesh and whether or not any were doomed from the start.

## How?

I'm constructing the best offensive five man lineups using current (2015 - 2016) starting players.
Starting with the players with the highest offensive efficiency, I'll create aggregate shot charts
and determine which of the units have the highest total percentage of floor coverage. I believe
this may be the strongest metric of "spreading the floor" we can really quantify. Then I'll consider
the most versatile as those with the greatest coverage and try to determine which aggregates also
has the highest scoring potential and efficiency based on data presented in the charts.

## Comparison

Using the same exact method of building new and powerful teams I'll then rank those that have
been historically great -- including the past few championship winners and a few iconic teams.
If the idea that comprehensive efficiency holds any weight there's a chance that some of these
teams might score pretty high. If not then we know that the most important feature of any winning
team is LeBron James.

# Data

The NBA provides an API to access what they call "Advanced Stats" dating back to 1996-97 season and "Base Stats", which first started being recorded in 1946 and were ultimately digitized and hosted at different endpoints of the same api.

As more money pours into the league players, coaches, and fans are all looking to consume basketball
data in a more intelligent way. Being able to qualify and understand game-time decisions
by embracing sports analytics makes watching the games more enjoyable for fans and could be the key
to securing a competitive advantage for both coaches and players.

The most relevant feature, and the data I've used as the basis of my analysis, is an incredibly
granular log of every attempted shot taken by every active player in the NBA. This provides a basis by which
it is possible to determine particular zones where players can contribute the most simply by qualitatively spreading
the floor and providing very specific, efficient shots.

Using a popular library `nba.js` I first collected metadata for every active player on a 2015-16 roster including
registered name, player id, and player position. The API is purely RESTful so depending on URL endpoints and
various parameters with which you can shape the returned data. Data is transferred using JSON as a textual
representation so it plays very well with NodeJs. Initially I constructed objects with only the descriptive values I previously described. Because the endpoint used to gather shot data was not implemented in the `nba.js` library I
iterated through the array of player objects and constructed a HTTP call aimed at the shot chart endpoint using the players ID to gather all shots taken in the 2015-16. These results were reduced to a collection of objects indexed by the zones in which the shot was taken. These zones were calculated using a Boston Globe library `nba-shot-zones` that takes the recorded
X and Y location of the shot and maps that to pre-defined zones on the basketball court.

This leaves us with a data structure containing objects for each position (Including hybrids) each of which are holding player objects that contain the aforementioned metadata and also another object of shots binned by zone.

From here we need to determine the players that could viably be the most efficient shooter from a number of zones
on the court in a five-man lineup.

Ultimately, each zone represents it's own scoring microcosm, so it is important to consider them each in a mutually exclusive way. At this point I introduced the idea of beta distributions and probabilistic priors. In the `prior.js` file
I iterate through every player and every zone to gather a collection of shooting means. In the most general terms your average NBA player took 442 shot attempts during the 2015-16 season. This ratio is the aggregation of all considered zones so the second prior value I considered was the more granular zone-specific percentage. The last prior I included was one with and equal alpha and beta of 1, 1/2. I iterated through each of the players shot objects and augmented them with three shooting percentages with a specific prior added to each.

After calculating shooting percentages and adjusted shooting percentages was only a single map and a single reduce from being used for analysis. First, each of the players shots objects need to be separated and grouped by zone. From these groupings we can consider each of the three shooting percentages and calculate cut off values for each of the respective zones.

With these values we iterate over the player objects one last time looking through each of their zones and determining whether any of them are above their respective cut off values. If so they are included as viable lineup members to be
included in the analysis algorithm.

# Analysis

# Related Work

# Results

# Conclusion
