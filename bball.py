import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import nbashots as nba

plt.rcParams['figure.figsize'] = (12, 11)
cmap=plt.cm.gist_heat_r

# team = ["Thompson, Klay", "Green, Draymond", "Durant, Kevin", "Iguodala, Andre"]
# shots = nba.Shots(nba.get_player_id("Curry, Stephen")[0]).get_shots()

team= ["Irving, Kyrie", "Love, Kevin", "Thompson, Tristan", "Smith, J.R."]
shots = nba.Shots(nba.get_player_id("James, LeBron")[0]).get_shots()

for player in team:
   print(player)
   stats = nba.get_player_id(player)[0]
   shots.append(nba.Shots(stats).get_shots())

nba.shot_chart_jointplot(shots.LOC_X, shots.LOC_Y, kind="kde", color = cmap(.2), cmap=cmap, n_levels=20)
plt.show()
