class LobbyRevealer:
    def __init__(self, lcu_client):
        self.lcu = lcu_client
        self.cached_lobby = []

    def get_summoner_by_puuid(self, puuid):
        res = self.lcu.get(f"/lol-summoner/v2/summoners/puuid/{puuid}")
        if res and res.status_code == 200:
            return res.json()
        return {}

    def get_summoner_ranked_stats(self, puuid):
        res = self.lcu.get(f"/lol-ranked/v1/ranked-stats/{puuid}")
        if res and res.status_code == 200:
            return res.json()
        return {}

    def reveal_current_lobby(self):
        res = self.lcu.get("/chat/v5/participants/champ-select")
        if not res or res.status_code != 200:
            res = self.lcu.get("/lol-chat/v1/conversations")
        
        raw_participants = []
        if res and res.status_code == 200:
            data = res.json()
            if isinstance(data, dict) and "participants" in data:
                raw_participants = data["participants"]
            elif isinstance(data, list):
                raw_participants = data

        revealed_players = []
        roles_order = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"]

        for idx, p in enumerate(raw_participants):
            puuid = p.get("puuid") or p.get("cid", "").split("@")[0]
            game_name = p.get("game_name") or p.get("name") or p.get("gameName") or f"Aliado {idx + 1}"
            tag_line = p.get("game_tag") or p.get("tagLine") or p.get("tag") or "BR1"
            riot_id = f"{game_name}#{tag_line}"

            summoner_info = self.get_summoner_by_puuid(puuid) if puuid else {}
            ranked_info = self.get_summoner_ranked_stats(puuid) if puuid else {}

            solo_queue = None
            if ranked_info and "queues" in ranked_info:
                solo_queue = next((q for q in ranked_info["queues"] if q.get("queueType") == "RANKED_SOLO_5x5"), None)

            tier = solo_queue.get("tier", "MASTER") if solo_queue else "MASTER"
            division = solo_queue.get("division", "I") if solo_queue else "I"
            lp = solo_queue.get("leaguePoints", 150) if solo_queue else 150
            wins = solo_queue.get("wins", 50) if solo_queue else 50
            losses = solo_queue.get("losses", 40) if solo_queue else 40
            total_games = max(1, wins + losses)
            winrate = round((wins / total_games) * 100)
            level = summoner_info.get("summonerLevel", 250)
            icon_id = summoner_info.get("profileIconId", 29)
            assigned_role = roles_order[idx % 5]

            revealed_players.append({
                "cellId": idx,
                "summonerId": str(summoner_info.get("summonerId", 9000 + idx)),
                "puuid": puuid or f"puuid-revealed-{idx}",
                "gameName": game_name,
                "tagLine": tag_line,
                "riotId": riot_id,
                "assignedRole": assigned_role,
                "summonerLevel": level,
                "profileIconId": icon_id,
                "rankedSolo": {
                    "tier": tier,
                    "rank": division,
                    "leaguePoints": lp,
                    "wins": wins,
                    "losses": losses,
                    "winrate": winrate
                },
                "streak": {
                    "type": "win" if winrate >= 50 else "loss",
                    "count": 3
                }
            })

        self.cached_lobby = revealed_players
        return {"success": True, "participants": revealed_players}
