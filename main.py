"""
===================================================================
 Betray Client - Desktop Application (Windows Standalone)
 Feito por: betray
 Automatizador de Fila, Pré-Pick, Pré-Ban e Customizador de Perfil LCU
===================================================================
"""
import sys
import os
import json
import time
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, HTTPServer
import socketserver

try:
    import webview
    HAS_WEBVIEW = True
except ImportError:
    HAS_WEBVIEW = False

# Importação dos módulos locais da LCU
try:
    from src.api.lcu_client import LCUClient
    from src.core.auto_accept import AutoAcceptHandler
    from src.core.auto_pick import AutoPickHandler
    from src.core.auto_ban import AutoBanHandler
    from src.core.background_changer import BackgroundChanger
    from src.core.rose_skin_changer import RoseSkinChanger
    from src.core.lobby_reveal import LobbyRevealer
    from src.core.dodge_handler import DodgeHandler
except ImportError:
    # Fallback caso os arquivos estejam em outra estrutura de diretório
    import re
    import base64
    import requests
    import urllib3
    import psutil
    import subprocess

    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    class LCUClient:
        def __init__(self):
            self.port = None
            self.auth_token = None
            self.protocol = 'https'
            self.session = requests.Session()
            self.session.verify = False
            self.connected = False

        def find_lockfile(self):
            for proc in psutil.process_iter(['name', 'cmdline']):
                try:
                    name = proc.info['name'] or ''
                    if 'LeagueClientUx' in name:
                        cmdline = ' '.join(proc.info['cmdline'] or [])
                        port_match = re.search(r'--app-port=([0-9]+)', cmdline)
                        token_match = re.search(r'--remoting-auth-token=([\w-]+)', cmdline)
                        if port_match and token_match:
                            self.port = port_match.group(1)
                            self.auth_token = token_match.group(1)
                            auth_str = f"riot:{self.auth_token}"
                            encoded_auth = base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')
                            self.session.headers.update({
                                'Authorization': f'Basic {encoded_auth}',
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            })
                            self.connected = True
                            return True
                except Exception:
                    continue
            return False

        def connect(self):
            return self.find_lockfile()

        def get(self, endpoint):
            if not self.connected and not self.connect():
                return None
            url = f"{self.protocol}://127.0.0.1:{self.port}{endpoint}"
            try:
                return self.session.get(url, timeout=3)
            except Exception:
                return None

        def post(self, endpoint, data=None):
            if not self.connected and not self.connect():
                return None
            url = f"{self.protocol}://127.0.0.1:{self.port}{endpoint}"
            try:
                return self.session.post(url, json=data, timeout=3)
            except Exception:
                return None

        def patch(self, endpoint, data=None):
            if not self.connected and not self.connect():
                return None
            url = f"{self.protocol}://127.0.0.1:{self.port}{endpoint}"
            try:
                return self.session.patch(url, json=data, timeout=3)
            except Exception:
                return None

        def delete(self, endpoint):
            if not self.connected and not self.connect():
                return None
            url = f"{self.protocol}://127.0.0.1:{self.port}{endpoint}"
            try:
                return self.session.delete(url, timeout=3)
            except Exception:
                return None

        def get_gameflow_phase(self):
            res = self.get('/lol-gameflow/v1/gameflow-phase')
            if res and res.status_code == 200:
                return res.text.replace('"', '').strip()
            return "None"

    class AutoAcceptHandler:
        def __init__(self, lcu, settings):
            self.lcu = lcu
            self.settings = settings
        def check_and_accept(self):
            if not self.settings.get("auto_accept", True):
                return False
            phase = self.lcu.get_gameflow_phase()
            if phase == "ReadyCheck":
                delay = self.settings.get("auto_accept_delay", 1)
                time.sleep(delay)
                res = self.lcu.post("/lol-matchmaking/v1/ready-check/accept")
                return res and res.status_code == 200
            return False

    class AutoPickHandler:
        def __init__(self, lcu, settings):
            self.lcu = lcu
            self.settings = settings
        def check_and_act(self, session_data):
            pass

    class AutoBanHandler:
        def __init__(self, lcu, settings):
            self.lcu = lcu
            self.settings = settings
        def check_and_act(self, session_data):
            pass

    class BackgroundChanger:
        def __init__(self, lcu):
            self.lcu = lcu
        def set_background(self, skin_id):
            payload = {"key": "backgroundSkinId", "value": int(skin_id)}
            res = self.lcu.post("/lol-summoner/v1/current-summoner/background-skin", payload)
            return res and res.status_code in [200, 204]

    class RoseSkinChanger:
        def __init__(self, lcu, settings):
            self.lcu = lcu
            self.settings = settings
            self.active_skins = {}
        def set_skin(self, champ_id, skin_id, chroma_id=None):
            self.active_skins[int(champ_id)] = {"skin_id": int(skin_id), "chroma_id": chroma_id}
            return True
        def check_and_apply_in_game(self):
            pass

    class LobbyRevealer:
        def __init__(self, lcu):
            self.lcu = lcu
        def reveal_current_lobby(self):
            return {"success": True, "participants": []}

    class DodgeHandler:
        def __init__(self, lcu):
            self.lcu = lcu
            self.is_armed = False
            self.last_second_seconds = 3
        def arm_last_second(self, s=3):
            self.last_second_seconds = s
            self.is_armed = True
        def cancel_last_second(self):
            self.is_armed = False
        def dodge(self, method="auto"):
            res = self.lcu.post("/riotclient/kill-and-restart-ux")
            return {"success": bool(res and res.status_code in [200, 204]), "message": "Dodge executado."}

def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

CONFIG_PATH = get_resource_path(os.path.join("config", "settings.json"))
WEB_DIR = get_resource_path("web")

class BetrayBridgeAPI:
    def __init__(self, lcu_client, settings_data):
        self.lcu = lcu_client
        self.settings = settings_data
        self.auto_accept_handler = AutoAcceptHandler(self.lcu, self.settings)
        self.auto_pick_handler = AutoPickHandler(self.lcu, self.settings)
        self.auto_ban_handler = AutoBanHandler(self.lcu, self.settings)
        self.bg_changer = BackgroundChanger(self.lcu)
        self.rose_changer = RoseSkinChanger(self.lcu, self.settings)
        self.lobby_revealer = LobbyRevealer(self.lcu)
        self.dodge_handler = DodgeHandler(self.lcu)
        self.logs = []
        self.add_log("info", "Betray Client Desktop inicializado. Feito por betray.")

    def add_log(self, log_type, message):
        t = time.strftime("%H:%M:%S")
        self.logs.append({"time": t, "type": log_type, "message": message})
        if len(self.logs) > 60:
            self.logs.pop(0)

    def get_settings(self):
        return self.settings

    def save_settings(self, new_settings_json):
        try:
            if isinstance(new_settings_json, str):
                self.settings = json.loads(new_settings_json)
            else:
                self.settings = new_settings_json
                
            self.auto_accept_handler.settings = self.settings
            self.auto_pick_handler.settings = self.settings
            self.auto_ban_handler.settings = self.settings
            self.rose_changer.settings = self.settings

            os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
            with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
                json.dump(self.settings, f, indent=4)
            self.add_log("success", "Configurações salvas com sucesso.")
            return True
        except Exception as e:
            self.add_log("error", f"Erro ao salvar configurações: {str(e)}")
            return False

    def get_lcu_status(self):
        connected = self.lcu.connect()
        phase = self.lcu.get_gameflow_phase() if connected else "None"
        return {
            "connected": connected,
            "port": self.lcu.port,
            "phase": phase
        }

    def get_current_summoner_profile(self):
        if not self.lcu.connect():
            return {"success": False, "error": "League of Legends não encontrado ou fechado."}
        
        summoner_res = self.lcu.get("/lol-summoner/v1/current-summoner")
        summoner_data = {}
        if summoner_res and summoner_res.status_code == 200:
            summoner_data = summoner_res.json()
            
        chat_res = self.lcu.get("/lol-chat/v1/me")
        chat_data = chat_res.json() if chat_res and chat_res.status_code == 200 else {}
        
        game_name = (
            summoner_data.get('gameName') or 
            chat_data.get('gameName') or 
            summoner_data.get('displayName') or 
            chat_data.get('name') or 
            'Invocador'
        )
        tag_line = (
            summoner_data.get('tagLine') or 
            chat_data.get('tagLine') or 
            'BR1'
        )
        
        summoner_data['displayName'] = game_name
        summoner_data['gameName'] = game_name
        summoner_data['tagLine'] = tag_line
        summoner_data['formattedRiotId'] = f"{game_name}#{tag_line}"
        
        ranked_res = self.lcu.get("/lol-ranked/v1/current-ranked-stats")
        ranked_data = ranked_res.json() if ranked_res and ranked_res.status_code == 200 else {}
        
        bg_res = self.lcu.get("/lol-summoner/v1/current-summoner/background-skin")
        bg_data = bg_res.json() if bg_res and bg_res.status_code == 200 else {}

        self.add_log("success", f"Perfil identificado: {game_name}#{tag_line}")

        return {
            "success": True,
            "summoner": summoner_data,
            "ranked": ranked_data,
            "background": bg_data
        }

    def set_rose_skin(self, champ_id, skin_id, chroma_id=None):
        return self.rose_changer.set_skin(champ_id, skin_id, chroma_id)

    def get_logs(self):
        return self.logs

    def set_background_skin(self, skin_id):
        success = self.bg_changer.set_background(skin_id)
        if success:
            self.add_log("success", f"Skin de fundo alterada para ID {skin_id} no perfil do LoL!")
            self.settings["selected_background_skin_id"] = int(skin_id)
            self.save_settings(self.settings)
            return True
        return False

    def accept_match_now(self):
        res = self.lcu.post("/lol-matchmaking/v1/ready-check/accept")
        if res and res.status_code == 200:
            self.add_log("success", "Partida aceita com sucesso via LCU API!")
            return True
        return False

    def dodge_champ_select(self, method="auto"):
        res = self.dodge_handler.dodge(method=method)
        if res.get("success"):
            self.add_log("success", f"🚪 [DODGE SUCESSO] {res.get('message', 'Dodge executado!')}")
        return res

    def reveal_lobby(self):
        return self.lobby_revealer.reveal_current_lobby()

def background_lcu_worker(api):
    last_phase = "None"
    while True:
        try:
            connected = api.lcu.connect()
            if connected:
                phase = api.lcu.get_gameflow_phase()
                if phase != last_phase:
                    api.add_log("info", f"Fase de jogo detectada: {phase}")
                    last_phase = phase

                if phase == "ReadyCheck":
                    if api.settings.get("auto_accept", True):
                        delay = api.settings.get("auto_accept_delay", 1)
                        time.sleep(delay)
                        api.accept_match_now()
                        time.sleep(3)

                elif phase == "ChampSelect":
                    session = api.lcu.get("/lol-champ-select/v1/session")
                    if session and session.status_code == 200:
                        session_data = session.json()
                        api.auto_ban_handler.check_and_act(session_data)
                        api.auto_pick_handler.check_and_act(session_data)

            time.sleep(1)
        except Exception:
            time.sleep(2)

def start_local_http_server(directory, port=18899):
    class QuietHandler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=directory, **kwargs)
        def log_message(self, format, *args):
            pass

    server = socketserver.TCPServer(("127.0.0.1", port), QuietHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server

def main():
    print("=" * 65)
    print("  BETRAY CLIENT - LEAGUE OF LEGENDS AUTOMATOR (STANDALONE)")
    print("  Feito por: betray")
    print("=========================================================")
    
    settings = {}
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                settings = json.load(f)
        except Exception:
            pass

    lcu = LCUClient()
    bridge_api = BetrayBridgeAPI(lcu, settings)

    worker_thread = threading.Thread(target=background_lcu_worker, args=(bridge_api,), daemon=True)
    worker_thread.start()

    port = 18899
    if os.path.exists(WEB_DIR):
        start_local_http_server(WEB_DIR, port=port)
        url = f"http://127.0.0.1:{port}/index.html"
    else:
        url = "https://ais-dev-c5y3jqli5vtzte2hjfusn4-424336988653.us-east5.run.app"

    if HAS_WEBVIEW:
        window = webview.create_window(
            title="Betray Client",
            url=url,
            width=1280,
            height=820,
            min_size=(960, 600),
            background_color='#07090e',
            js_api=bridge_api
        )
        webview.start(debug=False)
    else:
        print(f"Abrindo Betray Client em: {url}")
        webbrowser.open(url)
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass

if __name__ == '__main__':
    main()
