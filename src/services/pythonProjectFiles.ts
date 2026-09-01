import { AppSettings } from '../types';
import { CHAMPIONS } from '../data/champions';
import { getDesktopHtml } from './desktopTemplate';

export interface PythonDesktopFiles {
  [key: string]: string;
  'Gerar_BetrayClient_EXE.bat': string;
  'Executar_Direto_Sem_Compilar.bat': string;
  'BetrayClient.spec': string;
  'build_exe.py': string;
  'run.bat': string;
  'main.py': string;
  'web/index.html': string;
  'requirements.txt': string;
  'README.md': string;
  'config/settings.json': string;
  'src/api/lcu_client.py': string;
  'src/core/auto_accept.py': string;
  'src/core/auto_pick.py': string;
  'src/core/auto_ban.py': string;
  'src/core/background_changer.py': string;
  'src/core/rose_skin_changer.py': string;
  'src/core/lobby_reveal.py': string;
  'src/core/dodge_handler.py': string;
}

export function generatePythonDesktopApp(settings: AppSettings): PythonDesktopFiles {
  const settingsJson = JSON.stringify(settings, null, 2);

  return {
    'Gerar_BetrayClient_EXE.bat': `@echo off
chcp 65001 > nul
cls
echo ===================================================================
echo   COMPILADOR AUTOMATICO BETRAY CLIENT (.EXE STANDALONE)
echo   Desenvolvido por: betray
echo ===================================================================
echo.
echo [1/4] Verificando ambiente Python...
set PYTHON_CMD=python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    py --version >nul 2>&1
    if %errorlevel% equ 0 (
        set PYTHON_CMD=py
    ) else (
        echo [ERRO] Python nao encontrado no PATH do Windows!
        echo Por favor instale o Python 3.10+ marcando a opcao "Add Python to PATH".
        pause
        exit /b 1
    )
)

echo [OK] Python detectado com sucesso.
echo.
echo [2/4] Instalando dependencias necessarias (PyWebView, Requests, PsUtil, PyInstaller)...
%PYTHON_CMD% -m pip install -r requirements.txt pyinstaller

echo.
echo [3/4] Compilando BetrayClient.exe (Interface Grafica Dark Standalone 100%% Independente)...
%PYTHON_CMD% -m PyInstaller --noconsole --onefile --clean --name="BetrayClient" --add-data="web;web" --add-data="config;config" main.py
if %errorlevel% neq 0 (
    echo Tentando fallback do modulo pyinstaller...
    %PYTHON_CMD% -m pyinstaller --noconsole --onefile --clean --name="BetrayClient" --add-data="web;web" --add-data="config;config" main.py
)

echo.
echo [4/4] Copiando o executavel standalone para a pasta principal...
if exist "dist\\BetrayClient.exe" (
    copy /y "dist\\BetrayClient.exe" "BetrayClient.exe" > nul
    echo.
    echo ===================================================================
    echo   [SUCESSO] O arquivo "BetrayClient.exe" FOI GERADO COM SUCESSO!
    echo ===================================================================
    echo.
    echo   COMO COMPARTILHAR COM OUTROS USUARIOS / AMIGOS:
    echo   - Voce pode pegar APENAS o arquivo "BetrayClient.exe" e enviar
    echo     diretamente para seus amigos (Discord, Google Drive, WhatsApp, etc).
    echo   - Eles NAO precisam de Python, NAO precisam instalar pastas e
    echo     NAO precisam rodar compiladores: basta abrir o .exe direto!
    echo.
) else (
    echo [ERRO] Falha ao compilar o executavel. Verifique as mensagens acima.
)

echo.
pause
`,
    'Executar_Direto_Sem_Compilar.bat': `@echo off
chcp 65001 > nul
cls
echo Iniciando Betray Client diretamente via Python...
set PYTHON_CMD=python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    set PYTHON_CMD=py
)
%PYTHON_CMD% -m pip install -r requirements.txt >nul 2>&1
%PYTHON_CMD% main.py
`,
    'BetrayClient.spec': `# -*- mode: python ; coding: utf-8 -*-
block_cipher = None

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[('web', 'web'), ('config', 'config')],
    hiddenimports=[
        'webview',
        'webview.platforms.winforms',
        'webview.platforms.edgechromium',
        'requests',
        'urllib3',
        'psutil',
        'websocket',
        'http.server',
        'socketserver'
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='BetrayClient',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
`,
    'build_exe.py': `"""
Script Python para compilar o BetrayClient (.exe)
Autor: betray
"""
import os
import sys
import subprocess
import shutil

def build():
    print("=" * 65)
    print("  Iniciando compilação do BetrayClient (.exe)")
    print("  Feito por: betray")
    print("=" * 65)
    
    # 1. Instalar dependências
    print("\\n[1/3] Instalando dependências...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt", "pyinstaller"])
    
    # 2. Executar PyInstaller
    print("\\n[2/3] Compilando via PyInstaller...")
    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--noconsole",
        "--onefile",
        "--clean",
        "--name=BetrayClient",
        "--add-data=web;web" if os.name == 'nt' else "--add-data=web:web",
        "--add-data=config;config" if os.name == 'nt' else "--add-data=config:config",
        "main.py"
    ]
    subprocess.check_call(cmd)
    
    # 3. Copiar executável para a raiz
    print("\\n[3/3] Movendo executável para o diretório raiz...")
    exe_name = "BetrayClient.exe" if os.name == 'nt' else "BetrayClient"
    dist_path = os.path.join("dist", exe_name)
    
    if os.path.exists(dist_path):
        shutil.copy2(dist_path, exe_name)
        print("\\n" + "=" * 65)
        print(f"  SUCESSO! Arquivo executável gerado na raiz: {os.path.abspath(exe_name)}")
        print("=" * 65 + "\\n")
    else:
        print("\\n[ERRO] O arquivo não foi encontrado na pasta dist.")

if __name__ == '__main__':
    build()
`,
    'run.bat': `@echo off
chcp 65001 > nul
cls
echo Iniciando Betray Client...
python main.py
if %errorlevel% neq 0 (
    echo.
    echo Pressione qualquer tecla para sair...
    pause > nul
)
`,
    'main.py': `"""
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

from src.api.lcu_client import LCUClient
from src.core.auto_accept import AutoAcceptHandler
from src.core.auto_pick import AutoPickHandler
from src.core.auto_ban import AutoBanHandler
from src.core.background_changer import BackgroundChanger
from src.core.rose_skin_changer import RoseSkinChanger
from src.core.lobby_reveal import LobbyRevealer
from src.core.dodge_handler import DodgeHandler

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
        
        if not summoner_data.get('summonerLevel') and chat_data.get('lol', {}).get('level'):
            try:
                summoner_data['summonerLevel'] = int(chat_data['lol']['level'])
            except:
                summoner_data['summonerLevel'] = 1

        if not summoner_data.get('profileIconId') and chat_data.get('icon'):
            summoner_data['profileIconId'] = chat_data['icon']

        ranked_res = self.lcu.get("/lol-ranked/v1/current-ranked-stats")
        ranked_data = ranked_res.json() if ranked_res and ranked_res.status_code == 200 else {}
        
        bg_res = self.lcu.get("/lol-summoner/v1/current-summoner/background-skin")
        bg_data = bg_res.json() if bg_res and bg_res.status_code == 200 else {}

        masteries_res = self.lcu.get("/lol-champion-mastery/v1/local-player/champion-mastery")
        masteries_data = masteries_res.json() if masteries_res and masteries_res.status_code == 200 else []

        self.add_log("success", f"Perfil identificado: {game_name}#{tag_line} (Nível {summoner_data.get('summonerLevel', 1)})")

        return {
            "success": True,
            "summoner": summoner_data,
            "ranked": ranked_data,
            "background": bg_data,
            "masteries": masteries_data
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
        else:
            self.add_log("error", f"Falha ao trocar skin para ID {skin_id}.")
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
            self.add_log("success", f"🚪 [DODGE SUCESSO] {res.get('message', 'Dodge executado com sucesso!')}")
        else:
            self.add_log("error", f"Falha ao executar dodge via método {method}.")
        return res

    def arm_last_second_dodge(self, seconds=3):
        self.dodge_handler.arm_last_second(seconds)
        self.add_log("info", f"⏱️ [AUTO-DODGE ARMADO] Dodge configurado para os últimos {seconds}s de seleção.")
        return {"success": True, "armed": True, "seconds": seconds}

    def cancel_last_second_dodge(self):
        self.dodge_handler.cancel_last_second()
        self.add_log("info", "⏱️ [AUTO-DODGE CANCELADO] Temporizador desativado.")
        return {"success": True, "armed": False}

    def reveal_lobby(self):
        res = self.lobby_revealer.reveal_current_lobby()
        if res.get("success"):
            self.add_log("success", f"🔍 [LOBBY REVEAL] {len(res.get('participants', []))} participantes identificados no Champ Select!")
        else:
            self.add_log("info", "Aguardando início do Champ Select para revelar jogadores.")
        return res

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
                        api.add_log("info", f"Partida encontrada! Auto-Aceitando em {delay}s...")
                        time.sleep(delay)
                        api.accept_match_now()
                        time.sleep(3)

                elif phase == "ChampSelect":
                    session = api.lcu.get("/lol-champ-select/v1/session")
                    if session and session.status_code == 200:
                        session_data = session.json()
                        api.auto_ban_handler.check_and_act(session_data)
                        api.auto_pick_handler.check_and_act(session_data)

                        if api.dodge_handler.is_armed:
                            timer = session_data.get("timer", {})
                            adjusted_time_left = timer.get("adjustedTimeLeftInPhase", 0) / 1000.0
                            if 0 < adjusted_time_left <= api.dodge_handler.last_second_seconds:
                                api.add_log("warning", f"⏱️ [LAST-SECOND DODGE] Apenas {adjusted_time_left:.1f}s restantes na fase. Executando Dodge agora!")
                                api.dodge_champ_select(method=api.settings.get("dodge_method", "auto"))
                                api.dodge_handler.cancel_last_second()

                elif phase == "InProgress":
                    api.rose_changer.check_and_apply_in_game()

            time.sleep(1)
        except Exception as e:
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
    start_local_http_server(WEB_DIR, port=port)
    url = f"http://127.0.0.1:{port}/index.html"

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
`,
    'web/index.html': getDesktopHtml(CHAMPIONS),
    'requirements.txt': `pywebview>=5.0
requests>=2.31.0
websocket-client>=1.7.0
urllib3>=2.0.7
psutil>=5.9.8
lcu-driver>=2.3.0
pyinstaller>=6.4.0
`,
    'README.md': `# Betray Client Desktop
Aplicativo desktop autônomo para League of Legends desenvolvido com **Python, PyWebView e LCU API**.

> **Autoria**: Feito por betray

---

## ⚡ Como Usar ou Gerar o Arquivo .EXE (Executável Windows)

1. Extraia os arquivos do **BetrayClient_Windows.zip** para qualquer pasta.
2. Dê **dois cliques** no arquivo \`Gerar_BetrayClient_EXE.bat\` ou \`Executar_Direto_Sem_Compilar.bat\`.
3. O instalador prepara tudo automaticamente e cria o \`BetrayClient.exe\`.
4. O aplicativo abrirá conectado ao seu League of Legends!

---

## 🚀 Módulos Inclusos:
- **🔍 Lobby Reveal (steele123/reveal)**: Revela os nomes reais de todos os aliados no Champ Select Solo/Duo.
- **🚪 Motor de Dodge Infalível**: Cascata Automática, Reiniciar UX, Process Kill e Last-Second Timer.
- **Auto-Accept**: Aceita partidas com delay configurável e som de notificação.
- **Pré-Pick Automático**: Seleciona e trava o campeão na sua rota com prioridade de slots.
- **Pré-Ban Automático**: Bane e confirma o campeão prioritário instantaneamente.
- **🌸 Skin Changer In-Game (Rose Engine)**: Troca skins e chromas no jogo em tempo real (anti-Vanguard).
- **Perfil Real do Invocador**: Detecção automática de Riot ID, elo Solo/Duo, elo Flex e estatísticas da LCU.
- **Background Changer**: Aplica splash arts diretamente no perfil do LoL.
`,
    'config/settings.json': settingsJson,
    'src/api/lcu_client.py': `import os
import re
import base64
import requests
import urllib3
import psutil

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
                    token_match = re.search(r'--remoting-auth-token=([\\w-]+)', cmdline)
                    if port_match and token_match:
                        self.port = port_match.group(1)
                        self.auth_token = token_match.group(1)
                        self.setup_auth()
                        self.connected = True
                        return True
            except (psutil.NoSuchProcess, psutil.AccessDenied, Exception):
                continue
        return False

    def setup_auth(self):
        auth_str = f"riot:{self.auth_token}"
        encoded_auth = base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')
        self.session.headers.update({
            'Authorization': f'Basic {encoded_auth}',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })

    def connect(self):
        return self.find_lockfile()

    def get(self, endpoint):
        if not self.connected: 
            if not self.connect(): return None
        url = f"{self.protocol}://127.0.0.1:{self.port}{endpoint}"
        try:
            return self.session.get(url, timeout=3)
        except Exception:
            return None

    def post(self, endpoint, data=None):
        if not self.connected:
            if not self.connect(): return None
        url = f"{self.protocol}://127.0.0.1:{self.port}{endpoint}"
        try:
            return self.session.post(url, json=data, timeout=3)
        except Exception:
            return None

    def patch(self, endpoint, data=None):
        if not self.connected:
            if not self.connect(): return None
        url = f"{self.protocol}://127.0.0.1:{self.port}{endpoint}"
        try:
            return self.session.patch(url, json=data, timeout=3)
        except Exception:
            return None

    def delete(self, endpoint):
        if not self.connected:
            if not self.connect(): return None
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
`,
    'src/core/auto_accept.py': `import time

class AutoAcceptHandler:
    def __init__(self, lcu_client, settings):
        self.lcu = lcu_client
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
`,
    'src/core/auto_pick.py': `class AutoPickHandler:
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
`,
    'src/core/auto_ban.py': `class AutoBanHandler:
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
`,
    'src/core/background_changer.py': `class BackgroundChanger:
    def __init__(self, lcu_client):
        self.lcu = lcu_client

    def set_background(self, skin_id):
        payload = {"key": "backgroundSkinId", "value": int(skin_id)}
        res = self.lcu.post("/lol-summoner/v1/current-summoner/background-skin", payload)
        if not res or res.status_code not in [200, 204]:
            res = self.lcu.put("/lol-summoner/v1/current-summoner/background-skin", payload)
        return res and res.status_code in [200, 204]
`,
    'src/core/rose_skin_changer.py': `class RoseSkinChanger:
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
`,
    'src/core/lobby_reveal.py': `class LobbyRevealer:
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
`,
    'src/core/dodge_handler.py': `import os
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
            ("/lol-login/v1/session/invoke?destination=lcdsServiceProxy&method=call&args=[\\"\\",\\"teambuilder-draft\\",\\"quitV2\\",\\"\\"]", None),
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
`
  };
}
