from __future__ import print_function
from collections import defaultdict
from nba_py import player
import pandas as pd
import requests

HEADERS = {'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'}
def get_all_player_ids():
    url = "http://stats.nba.com/stats/commonallplayers?IsOnlyCurrentSeason=1&LeagueID=00&Season=2015-16"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    headers = response.json()['resultSets'][0]['headers']
    players = response.json()['resultSets'][0]['rowSet']
    df = pd.DataFrame(players, columns=headers)
    df = df.apply(pd.to_numeric, args=('ignore',))
    return df.iloc[:, 0:2]

players = get_all_player_ids().values

positions = defaultdict(list)
for person in players:
    positions[player.PlayerSummary(person[0]).info()['POSITION'][0]].append(person)


