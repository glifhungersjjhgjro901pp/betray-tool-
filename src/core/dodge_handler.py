import os
import sys
import time
import subprocess

class DodgeHandler:
    def __init__(self, lcu_client):
        self.lcu = lcu_client
        self.is_armed = False
        self.last_second_seconds = 3

    def arm_last_second(self, seconds=3):
        self.last_second_seconds = max(1, min(15, seconds))
        self.is_armed = True

    def cancel_last_second(self):
        self.is_armed = False

    def execute_multi_vector_lcu(self):
        endpoints = [
            ("/lol-gameflow/v1/session/dodge", {"dodgeType": "Quit"}),
            ("/lol-gameflow/v1/session/dodge", {}),
            ("/lol-login/v1/session/invoke?destination=lcdsServiceProxy&method=call&args=[\"\",\"teambuilder-draft\",\"quitV2\",\"\"]", None),
            ("/lol-login/v1/session/invoke?destination=gameService&method=quitChampSelect", [""]),
            ("/lol-lobby/v2/lobby/matchmaking/dodge", None),
            ("/lol-matchmaking/v1/dodge", None)
        ]
        
        results = []
        for ep, payload in endpoints:
            try:
                if payload is not None:
                    res = self.lcu.post(ep, json=payload)
                else:
                    res = self.lcu.post(ep)
                if res and res.status_code in [200, 204]:
                    results.append(True)
            except Exception:
                pass
        return len(results) > 0

    def execute_restart_ux(self):
        try:
            res = self.lcu.post("/riotclient/kill-and-restart-ux")
            if res and res.status_code in [200, 204]:
                return True
        except Exception:
            pass
        return False

    def execute_process_kill(self):
        if os.name == 'nt':
            try:
                subprocess.run(["taskkill", "/F", "/IM", "LeagueClientUx.exe", "/T"], 
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=2)
                return True
            except Exception:
                try:
                    os.system("taskkill /F /IM LeagueClientUx.exe /T >nul 2>&1")
                    return True
                except Exception:
                    pass
        return False

    def dodge(self, method="auto"):
        self.cancel_last_second()
        if method == "restart_ux":
            success = self.execute_restart_ux()
            if not success:
                success = self.execute_process_kill()
            return {"success": success, "method": "restart_ux", "message": "Interface reiniciada com sucesso (Dodge executado)."}

        elif method == "process_kill":
            success = self.execute_process_kill()
            return {"success": success, "method": "process_kill", "message": "Processo LeagueClientUx finalizado (Dodge forçado executado)."}

        elif method == "multi_vector":
            success = self.execute_multi_vector_lcu()
            return {"success": success, "method": "multi_vector", "message": "Comando LCU Multi-Vector enviado."}

        else: # "auto"
            lcu_ok = self.execute_multi_vector_lcu()
            time.sleep(0.3)
            phase = self.lcu.get_gameflow_phase()
            if phase == "ChampSelect":
                ux_ok = self.execute_restart_ux()
                time.sleep(0.5)
                phase2 = self.lcu.get_gameflow_phase()
                if phase2 == "ChampSelect":
                    self.execute_process_kill()
                    return {"success": True, "method": "process_kill", "message": "Dodge executado via Process Kill."}
                return {"success": True, "method": "restart_ux", "message": "Dodge executado via Restart UX."}
            return {"success": True, "method": "lcu_multi_vector", "message": "Dodge executado via LCU API."}
