class AutoPickHandler:
    def __init__(self, lcu_client, settings):
        self.lcu = lcu_client
        self.settings = settings

    def get_assigned_role(self, session_data):
        local_cell_id = session_data.get("localPlayerCellId", 0)
        my_team = session_data.get("myTeam", [])
        for member in my_team:
            if member.get("cellId") == local_cell_id:
                assigned_pos = member.get("assignedPosition", "").upper()
                if assigned_pos in ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"]:
                    return assigned_pos
                if assigned_pos == "BOTTOM": return "ADC"
                if assigned_pos == "UTILITY": return "SUPPORT"
        return "MID"

    def check_and_act(self, session_data):
        local_cell_id = session_data.get("localPlayerCellId", 0)
        actions = session_data.get("actions", [])
        assigned_role = self.get_assigned_role(session_data)
        
        pre_picks = self.settings.get("pre_pick_champions", {}).get(assigned_role, [])
        if not pre_picks:
            return

        for action_group in actions:
            for action in action_group:
                if action.get("actorCellId") == local_cell_id and action.get("type") == "pick":
                    if action.get("isInProgress") and not action.get("completed"):
                        action_id = action.get("id")
                        for champ_id in pre_picks:
                            patch_res = self.lcu.patch(f"/lol-champ-select/v1/session/actions/{action_id}", {
                                "championId": champ_id,
                                "type": "pick"
                            })
                            if patch_res and patch_res.status_code == 204:
                                self.lcu.post(f"/lol-champ-select/v1/session/actions/{action_id}/complete")
                                break
