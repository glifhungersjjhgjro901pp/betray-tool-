class AutoBanHandler:
    def __init__(self, lcu_client, settings):
        self.lcu = lcu_client
        self.settings = settings

    def check_and_act(self, session_data):
        local_cell_id = session_data.get("localPlayerCellId", 0)
        actions = session_data.get("actions", [])
        pre_bans = self.settings.get("pre_ban_champions", [])
        if not pre_bans:
            return

        for action_group in actions:
            for action in action_group:
                if action.get("actorCellId") == local_cell_id and action.get("type") == "ban":
                    if action.get("isInProgress") and not action.get("completed"):
                        action_id = action.get("id")
                        for champ_id in pre_bans:
                            patch_res = self.lcu.patch(f"/lol-champ-select/v1/session/actions/{action_id}", {
                                "championId": champ_id,
                                "type": "ban"
                            })
                            if patch_res and patch_res.status_code == 204:
                                self.lcu.post(f"/lol-champ-select/v1/session/actions/{action_id}/complete")
                                break
