class RoseSkinChanger:
    def __init__(self, lcu_client, settings):
        self.lcu = lcu_client
        self.settings = settings
        self.active_skins = {}

    def set_skin(self, champ_id, skin_id, chroma_id=None):
        self.active_skins[int(champ_id)] = {
            "skin_id": int(skin_id),
            "chroma_id": chroma_id
        }
        return True

    def check_and_apply_in_game(self):
        if not self.settings.get("rose_skin_changer_enabled", True):
            return
        pass
