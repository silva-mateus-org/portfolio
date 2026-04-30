/**
 * COFFEE MACHINE DEBUG - Interactive Terminal Game
 * A technical investigation game where players debug a coffee machine service
 */

(function(window) {
    'use strict';

    const API_BASE = window.location.port === '80' || window.location.port === ''
        ? '' : `http://${window.location.hostname}:5000`;

    // ==================== GAME STATE ====================
    const gameState = {
        active: false,
        timerStarted: false,
        startTime: null,
        currentPath: '/',
        filesRead: new Set(),
        commandsExecuted: [],
        exploredProc: false,
        completed: false,
        currentLang: 'en',
        streaming: false
    };

    // ==================== MULTILINGUAL CONTENT ====================
    const content = {
        pt: {
            title: "COFFEE MACHINE DEBUGGER",
            incident: "INCIDENTE: Serviço de café offline",
            priority: "Prioridade: CRÍTICA",
            status: "STATUS: O coffee-daemon parou após atualização",
            objective: "OBJETIVO: Localizar e executar o script de reinicialização",
        sshConnecting: "Conectando em coffee-machine...",
        sshConnected: "Conectado como dev@coffee-machine",
        sshLastLogin: "Last login: Wed Jan 14 09:42:11 2026 from 192.168.1.10",
            availableCommands: "COMANDOS DISPONÍVEIS:",
            navCommands: "  ls, cd, cat, pwd           - Navegação",
            processCommands: "  ps, ps -ef, ps aux         - Processos",
            searchCommands: "  grep, find                 - Busca",
            envCommands: "  env, printenv              - Variáveis",
            memCommands: "  free, top                  - Memória",
            serviceCommands: "  systemctl status [service] - Services",
            execCommands: "  ./[script]                 - Executar script",
        exitCommand: "  exit                       - Sair (desconectar)",
            startPrompt: "Digite 'ls' para começar a investigação...",
            timerStarted: "TIMER INICIADO!",
            discovery: "DESCOBERTA:",
            clue: "PISTA:",
            scriptFound: "SCRIPT ENCONTRADO!",
            toComplete: "Para completar a missão, execute:",
            missionComplete: "MISSÃO CUMPRIDA!",
            congratulations: "Você debugou o sistema e reiniciou o serviço de café!",
            teamThanks: "A equipe de desenvolvimento agradece.",
            finalStats: "ESTATÍSTICAS FINAIS:",
            totalTime: "Tempo Total:",
            filesInvestigated: "Arquivos Investigados:",
            commandsExecuted: "Comandos Executados:",
            efficiency: "Eficiência:",
            calculating: "CALCULANDO SCORE...",
            baseScore: "Score Base:",
            speedBonus: "Bônus Velocidade:",
            efficiencyBonus: "Bônus Eficiência:",
            investigationBonus: "Bônus Investigação:",
            technicalBonus: "Bônus Técnico:",
            finalScore: "SCORE FINAL:",
            enterName: "Digite seu nome para o Hall of Fame:",
            savingRank: "Salvando no ranking...",
            position: "POSIÇÃO NO RANKING:",
            topHunters: "TOP 10 COFFEE DEBUGGERS",
            you: "<- VOCÊ",
            backToTerminal: "Digite 'menu' para voltar ao terminal normal",
            playAgain: "ou 'play' para jogar novamente!",
            commandNotFound: "Comando não encontrado:",
            typeHelp: "Digite 'help' para ver comandos disponíveis.",
            processDefunct: "Processo foi terminado mas deixou rastros.",
            binaryMoved: "Binário foi movido para",
            mainScriptAt: "O script principal está em",
            serviceUses: "O serviço usa",
            thisIsInitScript: "Esse deve ser o script de inicialização!",
            pathPointsTo: "aponta para",
            memoryOk: "Memória parece OK agora. O problema era temporário.",
            excellent: "EXCELENTE",
            veryGood: "MUITO BOM",
            good: "BOM",
            needsImprovement: "PRECISA MELHORAR"
        },
        en: {
            title: "COFFEE MACHINE DEBUGGER",
            incident: "INCIDENT: Coffee service offline",
            priority: "Priority: CRITICAL",
            status: "STATUS: coffee-daemon stopped after update",
            objective: "OBJECTIVE: Locate and execute the restart script",
        sshConnecting: "Connecting to coffee-machine...",
        sshConnected: "Connected as dev@coffee-machine",
        sshLastLogin: "Last login: Wed Jan 14 09:42:11 2026 from 192.168.1.10",
            availableCommands: "AVAILABLE COMMANDS:",
            navCommands: "  ls, cd, cat, pwd           - Navigation",
            processCommands: "  ps, ps -ef, ps aux         - Processes",
            searchCommands: "  grep, find                 - Search",
            envCommands: "  env, printenv              - Variables",
            memCommands: "  free, top                  - Memory",
            serviceCommands: "  systemctl status [service] - Services",
            execCommands: "  ./[script]                 - Execute script",
        exitCommand: "  exit                       - Exit (disconnect)",
            startPrompt: "Type 'ls' to start investigation...",
            timerStarted: "TIMER STARTED!",
            discovery: "DISCOVERY:",
            clue: "CLUE:",
            scriptFound: "SCRIPT FOUND!",
            toComplete: "To complete the mission, execute:",
            missionComplete: "MISSION ACCOMPLISHED!",
            congratulations: "You debugged the system and restarted the coffee service!",
            teamThanks: "The development team thanks you.",
            finalStats: "FINAL STATISTICS:",
            totalTime: "Total Time:",
            filesInvestigated: "Files Investigated:",
            commandsExecuted: "Commands Executed:",
            efficiency: "Efficiency:",
            calculating: "CALCULATING SCORE...",
            baseScore: "Base Score:",
            speedBonus: "Speed Bonus:",
            efficiencyBonus: "Efficiency Bonus:",
            investigationBonus: "Investigation Bonus:",
            technicalBonus: "Technical Bonus:",
            finalScore: "FINAL SCORE:",
            enterName: "Enter your name for the Hall of Fame:",
            savingRank: "Saving to ranking...",
            position: "RANKING POSITION:",
            topHunters: "TOP 10 COFFEE DEBUGGERS",
            you: "<- YOU",
            backToTerminal: "Type 'menu' to return to normal terminal",
            playAgain: "or 'play' to play again!",
            commandNotFound: "Command not found:",
            typeHelp: "Type 'help' to see available commands.",
            processDefunct: "Process was terminated but left traces.",
            binaryMoved: "Binary was moved to",
            mainScriptAt: "The main script is at",
            serviceUses: "The service uses",
            thisIsInitScript: "This must be the initialization script!",
            pathPointsTo: "points to",
            memoryOk: "Memory looks OK now. The problem was temporary.",
            excellent: "EXCELLENT",
            veryGood: "VERY GOOD",
            good: "GOOD",
            needsImprovement: "NEEDS IMPROVEMENT"
        },
        es: {
            title: "COFFEE MACHINE DEBUGGER",
            incident: "INCIDENTE: Servicio de café offline",
            priority: "Prioridad: CRÍTICA",
            status: "ESTADO: coffee-daemon paró después de actualización",
            objective: "OBJETIVO: Localizar y ejecutar el script de reinicio",
        sshConnecting: "Conectando a coffee-machine...",
        sshConnected: "Conectado como dev@coffee-machine",
        sshLastLogin: "Last login: Wed Jan 14 09:42:11 2026 from 192.168.1.10",
            availableCommands: "COMANDOS DISPONIBLES:",
            navCommands: "  ls, cd, cat, pwd           - Navegación",
            processCommands: "  ps, ps -ef, ps aux         - Procesos",
            searchCommands: "  grep, find                 - Búsqueda",
            envCommands: "  env, printenv              - Variables",
            memCommands: "  free, top                  - Memoria",
            serviceCommands: "  systemctl status [service] - Servicios",
            execCommands: "  ./[script]                 - Ejecutar script",
        exitCommand: "  exit                       - Salir (desconectar)",
            startPrompt: "Escribe 'ls' para comenzar la investigación...",
            timerStarted: "TEMPORIZADOR INICIADO!",
            discovery: "DESCUBRIMIENTO:",
            clue: "PISTA:",
            scriptFound: "SCRIPT ENCONTRADO!",
            toComplete: "Para completar la misión, ejecuta:",
            missionComplete: "MISIÓN CUMPLIDA!",
            congratulations: "¡Debugeaste el sistema y reiniciaste el servicio de café!",
            teamThanks: "El equipo de desarrollo te agradece.",
            finalStats: "ESTADÍSTICAS FINALES:",
            totalTime: "Tiempo Total:",
            filesInvestigated: "Archivos Investigados:",
            commandsExecuted: "Comandos Ejecutados:",
            efficiency: "Eficiencia:",
            calculating: "CALCULANDO PUNTAJE...",
            baseScore: "Puntaje Base:",
            speedBonus: "Bonus Velocidad:",
            efficiencyBonus: "Bonus Eficiencia:",
            investigationBonus: "Bonus Investigación:",
            technicalBonus: "Bonus Técnico:",
            finalScore: "PUNTAJE FINAL:",
            enterName: "Escribe tu nombre para el Hall of Fame:",
            savingRank: "Guardando en el ranking...",
            position: "POSICIÓN EN EL RANKING:",
            topHunters: "TOP 10 COFFEE DEBUGGERS",
            you: "<- TÚ",
            backToTerminal: "Escribe 'menu' para volver al terminal normal",
            playAgain: "o 'play' para jugar de nuevo!",
            commandNotFound: "Comando no encontrado:",
            typeHelp: "Escribe 'help' para ver comandos disponibles.",
            processDefunct: "El proceso fue terminado pero dejó rastros.",
            binaryMoved: "El binario fue movido a",
            mainScriptAt: "El script principal está en",
            serviceUses: "El servicio usa",
            thisIsInitScript: "¡Este debe ser el script de inicialización!",
            pathPointsTo: "apunta a",
            memoryOk: "La memoria parece OK ahora. El problema era temporal.",
            excellent: "EXCELENTE",
            veryGood: "MUY BUENO",
            good: "BUENO",
            needsImprovement: "NECESITA MEJORAR"
        }
    };

    // ==================== VIRTUAL FILESYSTEM ====================
    const virtualFS = {
        '/': { type: 'dir', items: ['home', 'var', 'opt', 'tmp', 'usr', 'etc', 'proc'] },
        '/home': { type: 'dir', items: ['dev'] },
        '/home/dev': { type: 'dir', items: ['.bash_history', 'notes.txt', 'projects'] },
        '/home/dev/.bash_history': { 
            type: 'file', 
            content: {
                pt: `cd /opt/coffee
ls -la
cat README.md
sudo systemctl stop coffee
cd /tmp/.cache
ps -ef | grep coffee
grep -r "script" /etc/
cat /var/log/coffee.log`,
                en: `cd /opt/coffee
ls -la
cat README.md
sudo systemctl stop coffee
cd /tmp/.cache
ps -ef | grep coffee
grep -r "script" /etc/
cat /var/log/coffee.log`,
                es: `cd /opt/coffee
ls -la
cat README.md
sudo systemctl stop coffee
cd /tmp/.cache
ps -ef | grep coffee
grep -r "script" /etc/
cat /var/log/coffee.log`
            }
        },
        '/home/dev/notes.txt': { 
            type: 'file', 
            content: {
                pt: `Notas Pessoais - Dev Sênior
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TODO para segunda-feira:
- Checar logs em /var/log/ depois da atualização
- Fazer backup do banco de dados
- Revisar configurações de rede
- Investigar aquele memory leak no coffee service

LEMBRETE: A equipe de DevOps moveu alguns
serviços para diretórios temporários durante
o security patch. Checar /tmp/ se algo quebrar.`,
                en: `Personal Notes - Senior Dev
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TODO for Monday:
- Check logs in /var/log/ after the update
- Backup the database
- Review network configurations
- Investigate that memory leak in coffee service

REMINDER: DevOps team moved some services
to temporary directories during the security
patch. Check /tmp/ if something breaks.`,
                es: `Notas Personales - Dev Senior
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TODO para el lunes:
- Revisar logs en /var/log/ después de la actualización
- Hacer backup de la base de datos
- Revisar configuraciones de red
- Investigar ese memory leak en el coffee service

RECORDATORIO: El equipo de DevOps movió algunos
servicios a directorios temporales durante el
security patch. Revisar /tmp/ si algo se rompe.`
            }
        },
        '/home/dev/projects': { type: 'dir', items: ['coffee-app'] },
        '/home/dev/projects/coffee-app': { type: 'dir', items: ['README.md', 'config.yaml'] },
        '/home/dev/projects/coffee-app/README.md': { 
            type: 'file',
            content: {
                pt: `# Coffee Automation App

Sistema de automação para máquinas de café.

## Instalação
O serviço principal roda em /opt/coffee/
Configurações em /etc/systemd/system/coffee.service

## Logs
Checar /var/log/coffee.log para erros`,
                en: `# Coffee Automation App

Automation system for coffee machines.

## Installation
Main service runs at /opt/coffee/
Configuration at /etc/systemd/system/coffee.service

## Logs
Check /var/log/coffee.log for errors`,
                es: `# Coffee Automation App

Sistema de automatización para máquinas de café.

## Instalación
El servicio principal corre en /opt/coffee/
Configuración en /etc/systemd/system/coffee.service

## Logs
Revisar /var/log/coffee.log para errores`
            }
        },
        '/home/dev/projects/coffee-app/config.yaml': { 
            type: 'file',
            content: {
                pt: `# Configuração Coffee App
port: 8080
host: localhost
coffee_machine_ip: 192.168.1.50
old_path: /opt/coffee/
new_path: /usr/local/bin/`,
                en: `# Coffee App Configuration
port: 8080
host: localhost
coffee_machine_ip: 192.168.1.50
old_path: /opt/coffee/
new_path: /usr/local/bin/`,
                es: `# Configuración Coffee App
port: 8080
host: localhost
coffee_machine_ip: 192.168.1.50
old_path: /opt/coffee/
new_path: /usr/local/bin/`
            }
        },
        
        // /var directory
        '/var': { type: 'dir', items: ['log', 'run', 'tmp'] },
        '/var/log': { type: 'dir', items: ['syslog', 'coffee.log', 'system.log'] },
        '/var/log/syslog': { 
            type: 'file',
            content: {
                pt: `[2026-01-13 09:31:15] kernel: Out of memory: Kill process 1337 (coffee-daemon)
[2026-01-13 10:00:00] systemd: Starting security update...
[2026-01-13 10:00:01] update-script: Moving coffee binaries to /tmp/.cache/
[2026-01-13 10:00:02] systemd: Security update completed`,
                en: `[2026-01-13 09:31:15] kernel: Out of memory: Kill process 1337 (coffee-daemon)
[2026-01-13 10:00:00] systemd: Starting security update...
[2026-01-13 10:00:01] update-script: Moving coffee binaries to /tmp/.cache/
[2026-01-13 10:00:02] systemd: Security update completed`,
                es: `[2026-01-13 09:31:15] kernel: Out of memory: Kill process 1337 (coffee-daemon)
[2026-01-13 10:00:00] systemd: Iniciando actualización de seguridad...
[2026-01-13 10:00:01] update-script: Moviendo binarios de coffee a /tmp/.cache/
[2026-01-13 10:00:02] systemd: Actualización de seguridad completada`
            }
        },
        '/var/log/coffee.log': { 
            type: 'file',
            content: {
                pt: `Coffee Service Log
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2026-01-13 08:45:12] INFO: Service started
[2026-01-13 08:45:13] INFO: Connected to machine at 192.168.1.50
[2026-01-13 09:30:45] WARN: High memory usage detected (85%)
[2026-01-13 09:31:02] ERROR: Memory leak in brew_module.c
[2026-01-13 09:31:15] FATAL: Process killed by OOM killer (PID 1337)
[2026-01-13 10:00:00] INFO: Update script executed
[2026-01-13 10:00:01] INFO: Binary relocated to /tmp/.cache/
[2026-01-13 10:00:02] WARN: Service not restarted automatically`,
                en: `Coffee Service Log
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2026-01-13 08:45:12] INFO: Service started
[2026-01-13 08:45:13] INFO: Connected to machine at 192.168.1.50
[2026-01-13 09:30:45] WARN: High memory usage detected (85%)
[2026-01-13 09:31:02] ERROR: Memory leak in brew_module.c
[2026-01-13 09:31:15] FATAL: Process killed by OOM killer (PID 1337)
[2026-01-13 10:00:00] INFO: Update script executed
[2026-01-13 10:00:01] INFO: Binary relocated to /tmp/.cache/
[2026-01-13 10:00:02] WARN: Service not restarted automatically`,
                es: `Coffee Service Log
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2026-01-13 08:45:12] INFO: Servicio iniciado
[2026-01-13 08:45:13] INFO: Conectado a máquina en 192.168.1.50
[2026-01-13 09:30:45] WARN: Uso alto de memoria detectado (85%)
[2026-01-13 09:31:02] ERROR: Memory leak en brew_module.c
[2026-01-13 09:31:15] FATAL: Proceso terminado por OOM killer (PID 1337)
[2026-01-13 10:00:00] INFO: Script de actualización ejecutado
[2026-01-13 10:00:01] INFO: Binario reubicado en /tmp/.cache/
[2026-01-13 10:00:02] WARN: Servicio no reiniciado automáticamente`
            }
        },
        '/var/log/system.log': { 
            type: 'file',
            content: {
                pt: `[2026-01-13 09:31:02] coffee-daemon: Memory leak detected in module
[2026-01-13 09:31:15] system: Process coffee-daemon (PID 1337) killed
[2026-01-13 10:00:01] update: Relocated binaries for security patch`,
                en: `[2026-01-13 09:31:02] coffee-daemon: Memory leak detected in module
[2026-01-13 09:31:15] system: Process coffee-daemon (PID 1337) killed
[2026-01-13 10:00:01] update: Relocated binaries for security patch`,
                es: `[2026-01-13 09:31:02] coffee-daemon: Memory leak detectado en módulo
[2026-01-13 09:31:15] system: Proceso coffee-daemon (PID 1337) terminado
[2026-01-13 10:00:01] update: Binarios reubicados por patch de seguridad`
            }
        },
        '/var/run': { type: 'dir', items: [] },
        '/var/tmp': { type: 'dir', items: ['backup'] },
        '/var/tmp/backup': { type: 'dir', items: ['old-config.json'] },
        '/var/tmp/backup/old-config.json': { 
            type: 'file',
            content: {
                pt: `{
  "service": "coffee-daemon",
  "old_location": "/opt/coffee/",
  "backup_location": "/opt/coffee-backup/",
  "note": "Checar /opt/coffee-backup/ para arquivos movidos"
}`,
                en: `{
  "service": "coffee-daemon",
  "old_location": "/opt/coffee/",
  "backup_location": "/opt/coffee-backup/",
  "note": "Check /opt/coffee-backup/ for moved files"
}`,
                es: `{
  "service": "coffee-daemon",
  "old_location": "/opt/coffee/",
  "backup_location": "/opt/coffee-backup/",
  "note": "Revisar /opt/coffee-backup/ para archivos movidos"
}`
            }
        },
        
        // /opt directory
        '/opt': { type: 'dir', items: ['coffee', 'coffee-backup'] },
        '/opt/coffee': { type: 'dir', items: ['MOVED.txt'] },
        '/opt/coffee/MOVED.txt': { 
            type: 'file',
            content: {
                pt: `⚠️ ARQUIVOS MOVIDOS ⚠️

Os arquivos deste diretório foram realocados para:
/opt/coffee-backup/

Motivo: Atualização de segurança
Data: 2026-01-13 10:00:00`,
                en: `⚠️ FILES MOVED ⚠️

Files from this directory were relocated to:
/opt/coffee-backup/

Reason: Security update
Date: 2026-01-13 10:00:00`,
                es: `⚠️ ARCHIVOS MOVIDOS ⚠️

Los archivos de este directorio fueron reubicados en:
/opt/coffee-backup/

Razón: Actualización de seguridad
Fecha: 2026-01-13 10:00:00`
            }
        },
        '/opt/coffee-backup': { type: 'dir', items: ['bin', 'data'] },
        '/opt/coffee-backup/bin': { type: 'dir', items: ['start-coffee.sh'] },
        '/opt/coffee-backup/bin/start-coffee.sh': { 
            type: 'file',
            content: {
                pt: `#!/bin/bash
# Script antigo de inicialização
# DEPRECADO - Use /usr/local/bin/brew-coffee.sh

echo "Este script está deprecado!"
echo "Use: /usr/local/bin/brew-coffee.sh"
exit 1`,
                en: `#!/bin/bash
# Old initialization script
# DEPRECATED - Use /usr/local/bin/brew-coffee.sh

echo "This script is deprecated!"
echo "Use: /usr/local/bin/brew-coffee.sh"
exit 1`,
                es: `#!/bin/bash
# Script antiguo de inicialización
# DEPRECADO - Usa /usr/local/bin/brew-coffee.sh

echo "Este script está deprecado!"
echo "Usa: /usr/local/bin/brew-coffee.sh"
exit 1`
            }
        },
        '/opt/coffee-backup/data': { type: 'dir', items: ['machines.db'] },
        '/opt/coffee-backup/data/machines.db': { 
            type: 'file',
            content: {
                pt: `# Database de Máquinas de Café
192.168.1.50:8080  - Máquina Principal (Cozinha)
192.168.1.51:8080  - Máquina Backup (Sala de Reuniões)`,
                en: `# Coffee Machines Database
192.168.1.50:8080  - Main Machine (Kitchen)
192.168.1.51:8080  - Backup Machine (Meeting Room)`,
                es: `# Base de Datos de Máquinas de Café
192.168.1.50:8080  - Máquina Principal (Cocina)
192.168.1.51:8080  - Máquina Backup (Sala de Reuniones)`
            }
        },
        
        // /tmp directory
        '/tmp': { type: 'dir', items: ['.cache', 'install'] },
        '/tmp/.cache': { type: 'dir', items: ['.coffee-daemon', 'env.conf'] },
        '/tmp/.cache/.coffee-daemon': { 
            type: 'file',
            content: {
                pt: `# Coffee Daemon (Processo oculto temporário)
# PID: 1337 (defunct)
# Status: Killed by OOM
# Nova localização: /usr/local/bin/coffee-daemon`,
                en: `# Coffee Daemon (Temporary hidden process)
# PID: 1337 (defunct)
# Status: Killed by OOM
# New location: /usr/local/bin/coffee-daemon`,
                es: `# Coffee Daemon (Proceso oculto temporal)
# PID: 1337 (defunct)
# Estado: Terminado por OOM
# Nueva ubicación: /usr/local/bin/coffee-daemon`
            }
        },
        '/tmp/.cache/env.conf': { 
            type: 'file',
            content: {
                pt: `🔧 Environment Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COFFEE_PORT=8080
COFFEE_HOST=localhost
COFFEE_MACHINE_IP=192.168.1.50
SCRIPT_BACKUP_PATH=/opt/coffee-backup/bin/
MAIN_SCRIPT_PATH=/usr/local/bin/brew-coffee.sh`,
                en: `🔧 Environment Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COFFEE_PORT=8080
COFFEE_HOST=localhost
COFFEE_MACHINE_IP=192.168.1.50
SCRIPT_BACKUP_PATH=/opt/coffee-backup/bin/
MAIN_SCRIPT_PATH=/usr/local/bin/brew-coffee.sh`,
                es: `🔧 Configuración de Entorno
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COFFEE_PORT=8080
COFFEE_HOST=localhost
COFFEE_MACHINE_IP=192.168.1.50
SCRIPT_BACKUP_PATH=/opt/coffee-backup/bin/
MAIN_SCRIPT_PATH=/usr/local/bin/brew-coffee.sh`
            }
        },
        '/tmp/install': { type: 'dir', items: ['post-update.log'] },
        '/tmp/install/post-update.log': { 
            type: 'file',
            content: {
                pt: `Post-Update Log
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[10:00:00] Iniciando atualização de segurança...
[10:00:01] Movendo binários para /tmp/.cache/
[10:00:02] Instalando nova versão em /usr/local/bin/
[10:00:03] Script principal: brew-coffee.sh
[10:00:04] Daemon instalado: coffee-daemon
[10:00:05] Atualização completa. Reinicialização manual necessária.`,
                en: `Post-Update Log
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[10:00:00] Starting security update...
[10:00:01] Moving binaries to /tmp/.cache/
[10:00:02] Installing new version at /usr/local/bin/
[10:00:03] Main script: brew-coffee.sh
[10:00:04] Daemon installed: coffee-daemon
[10:00:05] Update complete. Manual restart required.`,
                es: `Log Post-Actualización
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[10:00:00] Iniciando actualización de seguridad...
[10:00:01] Moviendo binarios a /tmp/.cache/
[10:00:02] Instalando nueva versión en /usr/local/bin/
[10:00:03] Script principal: brew-coffee.sh
[10:00:04] Daemon instalado: coffee-daemon
[10:00:05] Actualización completa. Reinicio manual requerido.`
            }
        },
        
        // /usr directory
        '/usr': { type: 'dir', items: ['local'] },
        '/usr/local': { type: 'dir', items: ['bin', 'share'] },
        '/usr/local/bin': { type: 'dir', items: ['coffee-daemon', 'brew-coffee.sh'] },
        '/usr/local/bin/coffee-daemon': { 
            type: 'file',
            content: {
                pt: `#!/bin/bash
# Coffee Daemon - Processo principal
# NÃO EXECUTAR DIRETAMENTE
# Use brew-coffee.sh para inicialização

echo "⚠️ Daemon deve ser iniciado via systemd"
echo "Use: systemctl start coffee"
exit 1`,
                en: `#!/bin/bash
# Coffee Daemon - Main process
# DO NOT RUN DIRECTLY
# Use brew-coffee.sh for initialization

echo "⚠️ Daemon must be started via systemd"
echo "Use: systemctl start coffee"
exit 1`,
                es: `#!/bin/bash
# Coffee Daemon - Proceso principal
# NO EJECUTAR DIRECTAMENTE
# Usa brew-coffee.sh para inicialización

echo "⚠️ Daemon debe iniciarse vía systemd"
echo "Usa: systemctl start coffee"
exit 1`
            }
        },
        '/usr/local/bin/brew-coffee.sh': { 
            type: 'file',
            executable: true,
            content: {
                pt: `#!/bin/bash
# Coffee Machine Initialization Script
# Location: /usr/local/bin/brew-coffee.sh
# Version: 2.1.0

echo "Inicializando Coffee Machine..."
echo "Conectando em 192.168.1.50:8080..."
echo "Aquecendo água a 93°C..."
echo "Moendo grãos..."
echo "Pressurizando (9 bars)..."

sleep 2

echo "Máquina de café pronta!"
echo "Service: coffee-daemon started (PID: 2048)"`,
                en: `#!/bin/bash
# Coffee Machine Initialization Script
# Location: /usr/local/bin/brew-coffee.sh
# Version: 2.1.0

echo "Initializing Coffee Machine..."
echo "Connecting to 192.168.1.50:8080..."
echo "Heating water to 93°C..."
echo "Grinding beans..."
echo "Pressurizing (9 bars)..."

sleep 2

echo "Coffee machine ready!"
echo "Service: coffee-daemon started (PID: 2048)"`,
                es: `#!/bin/bash
# Coffee Machine Initialization Script
# Location: /usr/local/bin/brew-coffee.sh
# Version: 2.1.0

echo "Inicializando Coffee Machine..."
echo "Conectando a 192.168.1.50:8080..."
echo "Calentando agua a 93°C..."
echo "Moliendo granos..."
echo "Presurizando (9 bars)..."

sleep 2

echo "Máquina de café lista!"
echo "Service: coffee-daemon started (PID: 2048)"`
            }
        },
        '/usr/local/share': { type: 'dir', items: ['coffee'] },
        '/usr/local/share/coffee': { type: 'dir', items: ['README.txt'] },
        '/usr/local/share/coffee/README.txt': { 
            type: 'file',
            content: {
                pt: `# Coffee Automation System
Versão: 2.1.0

## Componentes
- brew-coffee.sh: Script de inicialização
- coffee-daemon: Daemon principal do serviço

## Uso
Execute: /usr/local/bin/brew-coffee.sh

## Service
systemctl status coffee`,
                en: `# Coffee Automation System
Version: 2.1.0

## Components
- brew-coffee.sh: Initialization script
- coffee-daemon: Main service daemon

## Usage
Execute: /usr/local/bin/brew-coffee.sh

## Service
systemctl status coffee`,
                es: `# Coffee Automation System
Versión: 2.1.0

## Componentes
- brew-coffee.sh: Script de inicialización
- coffee-daemon: Daemon principal del servicio

## Uso
Ejecutar: /usr/local/bin/brew-coffee.sh

## Servicio
systemctl status coffee`
            }
        },
        
        // /etc directory
        '/etc': { type: 'dir', items: ['systemd', 'environment'] },
        '/etc/systemd': { type: 'dir', items: ['system'] },
        '/etc/systemd/system': { type: 'dir', items: ['coffee.service'] },
        '/etc/systemd/system/coffee.service': { 
            type: 'file',
            content: {
                pt: `[Unit]
Description=Coffee Machine Automation Service
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/bin/coffee-daemon
ExecStartPre=/usr/local/bin/brew-coffee.sh --init
Restart=on-failure
User=root

[Install]
WantedBy=multi-user.target`,
                en: `[Unit]
Description=Coffee Machine Automation Service
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/bin/coffee-daemon
ExecStartPre=/usr/local/bin/brew-coffee.sh --init
Restart=on-failure
User=root

[Install]
WantedBy=multi-user.target`,
                es: `[Unit]
Description=Coffee Machine Automation Service
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/bin/coffee-daemon
ExecStartPre=/usr/local/bin/brew-coffee.sh --init
Restart=on-failure
User=root

[Install]
WantedBy=multi-user.target`
            }
        },
        '/etc/environment': { 
            type: 'file',
            content: {
                pt: `PATH=/usr/local/bin:/usr/bin:/bin
COFFEE_SCRIPT_PATH=/usr/local/bin/
COFFEE_CONFIG=/opt/coffee-backup/data/machines.db
LANG=pt_BR.UTF-8`,
                en: `PATH=/usr/local/bin:/usr/bin:/bin
COFFEE_SCRIPT_PATH=/usr/local/bin/
COFFEE_CONFIG=/opt/coffee-backup/data/machines.db
LANG=en_US.UTF-8`,
                es: `PATH=/usr/local/bin:/usr/bin:/bin
COFFEE_SCRIPT_PATH=/usr/local/bin/
COFFEE_CONFIG=/opt/coffee-backup/data/machines.db
LANG=es_ES.UTF-8`
            }
        },
        
        // /proc directory
        '/proc': { type: 'dir', items: ['meminfo', '1337'] },
        '/proc/meminfo': { 
            type: 'file',
            content: {
                pt: `MemTotal:       16384000 kB
MemFree:         2150000 kB
MemAvailable:    5650000 kB
Buffers:          480000 kB
Cached:          4820000 kB
SwapTotal:       2048000 kB
SwapFree:        1536000 kB`,
                en: `MemTotal:       16384000 kB
MemFree:         2150000 kB
MemAvailable:    5650000 kB
Buffers:          480000 kB
Cached:          4820000 kB
SwapTotal:       2048000 kB
SwapFree:        1536000 kB`,
                es: `MemTotal:       16384000 kB
MemFree:         2150000 kB
MemAvailable:    5650000 kB
Buffers:          480000 kB
Cached:          4820000 kB
SwapTotal:       2048000 kB
SwapFree:        1536000 kB`
            }
        },
        '/proc/1337': { type: 'dir', items: ['cmdline', 'environ'] },
        '/proc/1337/cmdline': { 
            type: 'file',
            content: {
                pt: `/opt/coffee/coffee-daemon --port 8080`,
                en: `/opt/coffee/coffee-daemon --port 8080`,
                es: `/opt/coffee/coffee-daemon --port 8080`
            }
        },
        '/proc/1337/environ': { 
            type: 'file',
            content: {
                pt: `PATH=/usr/local/bin:/usr/bin
COFFEE_CONFIG=/opt/coffee/config.yaml
OLD_LOCATION=/opt/coffee/`,
                en: `PATH=/usr/local/bin:/usr/bin
COFFEE_CONFIG=/opt/coffee/config.yaml
OLD_LOCATION=/opt/coffee/`,
                es: `PATH=/usr/local/bin:/usr/bin
COFFEE_CONFIG=/opt/coffee/config.yaml
OLD_LOCATION=/opt/coffee/`
            }
        }
    };

    // ==================== HELPER FUNCTIONS ====================
    function getText(key) {
        return content[gameState.currentLang][key] || key;
    }

    function getFileContent(path) {
        const file = virtualFS[path];
        if (!file || file.type !== 'file') return null;
        
        const contentData = file.content;
        if (typeof contentData === 'string') {
            return contentData;
        } else if (typeof contentData === 'object') {
            return contentData[gameState.currentLang] || contentData.pt;
        }
        return null;
    }

    function normalizePath(path) {
        if (path.startsWith('/')) {
            return path;
        }
        
        let fullPath = gameState.currentPath;
        if (!fullPath.endsWith('/')) fullPath += '/';
        fullPath += path;
        
        // Normalize .. and .
        const parts = fullPath.split('/').filter(p => p && p !== '.');
        const normalized = [];
        
        for (const part of parts) {
            if (part === '..') {
                normalized.pop();
            } else {
                normalized.push(part);
            }
        }
        
        return '/' + normalized.join('/');
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function getEfficiencyRating(filesRead) {
        if (filesRead <= 6) return getText('excellent');
        if (filesRead <= 10) return getText('veryGood');
        if (filesRead <= 15) return getText('good');
        return getText('needsImprovement');
    }

    function calculateScore(timeInSeconds, filesRead, commandsUsed) {
        let score = 10000;
        
        // Speed bonus
        if (timeInSeconds < 120) score += 2000;
        else if (timeInSeconds < 180) score += 1100;
        else if (timeInSeconds < 240) score += 500;
        
        // Efficiency bonus
        if (filesRead <= 6) score += 2000;
        else if (filesRead <= 10) score += 1500;
        else if (filesRead <= 15) score += 800;
        
        // Technical commands bonus
        const technicalCmds = ['ps', 'free', 'top', 'env', 'systemctl'];
        const usedTechnical = gameState.commandsExecuted.filter(cmd => 
            technicalCmds.some(tech => cmd.startsWith(tech))
        );
        score += usedTechnical.length * 300;
        
        // /proc/ exploration bonus
        if (gameState.exploredProc) {
            score += 600;
        }
        
        // Penalty for too many files
        if (filesRead > 12) {
            score -= (filesRead - 12) * 100;
        }
        
        return Math.max(score, 5000);
    }

    function getRankBadge(score) {
        if (score >= 15000) return { icon: 'S', title: 'Elite DevOps', tier: 'S' };
        if (score >= 13000) return { icon: 'A', title: 'Senior Debugger', tier: 'A' };
        if (score >= 11000) return { icon: 'B', title: 'System Detective', tier: 'B' };
        if (score >= 9000) return { icon: 'C', title: 'Coffee Hunter', tier: 'C' };
        return { icon: 'D', title: 'Bug Tracker', tier: 'D' };
    }

    // ==================== COMMAND IMPLEMENTATIONS ====================
    
    function cmd_ls(args, output) {
        const showHidden = args.includes('-la') || args.includes('-a');
        const path = args.find(a => !a.startsWith('-')) || gameState.currentPath;
        const fullPath = normalizePath(path);
        
        const dir = virtualFS[fullPath];
        if (!dir || dir.type !== 'dir') {
            output.push(`ls: cannot access '${path}': No such file or directory`);
            return;
        }
        
        const items = dir.items.filter(item => showHidden || !item.startsWith('.'));
        const formatted = items.map(item => {
            const itemPath = (fullPath === '/' ? '/' : fullPath + '/') + item;
            const itemData = virtualFS[itemPath];
            if (itemData && itemData.type === 'dir') {
                return `${item}/`;
            }
            return `${item}`;
        });
        
        output.push(formatted.join('  '));
    }

    function cmd_cd(args, output) {
        if (args.length === 0) {
            gameState.currentPath = '/home/dev';
            return;
        }
        
        const path = args[0];
        const fullPath = normalizePath(path);
        
        const dir = virtualFS[fullPath];
        if (!dir) {
            output.push(`cd: no such file or directory: ${path}`);
            return;
        }
        
        if (dir.type !== 'dir') {
            output.push(`cd: not a directory: ${path}`);
            return;
        }
        
        gameState.currentPath = fullPath;
    }

    function cmd_pwd(args, output) {
        output.push(gameState.currentPath);
    }

    function cmd_cat(args, output) {
        if (args.length === 0) {
            output.push('cat: missing file operand');
            return;
        }
        
        const path = args[0];
        const fullPath = normalizePath(path);
        
        const content = getFileContent(fullPath);
        if (content === null) {
            output.push(`cat: ${path}: No such file or directory`);
            return;
        }
        
        gameState.filesRead.add(fullPath);
        output.push('');
        output.push(content);
    }

    function cmd_ps(args, output) {
        if (args.includes('-ef') || args.includes('aux')) {
            output.push('');
            output.push('USER       PID  PPID  CMD');
            output.push('root         1     0  /sbin/init');
            output.push('root       234     1  /usr/sbin/sshd');
            output.push('www        456     1  /usr/bin/nginx');
            output.push('dev        789     1  /bin/bash');
            output.push('root      1337     1  [coffee-daemon] <defunct>');
        } else {
            output.push('  PID TTY          TIME CMD');
            output.push('  789 pts/0    00:00:01 bash');
            output.push(' 1337 ?        00:00:00 coffee-daemon <defunct>');
        }
    }

    function cmd_free(args, output) {
        const human = args.includes('-h');
        
        if (human) {
            output.push('');
            output.push('              total    used    free    shared  buff/cache  available');
            output.push('Mem:          15Gi    8.2Gi   2.1Gi   1.2Gi       4.7Gi      5.5Gi');
            output.push('Swap:         2Gi     512Mi   1.5Gi');
        } else {
            output.push('');
            output.push('              total        used        free      shared  buff/cache   available');
            output.push('Mem:       16384000     8400000     2150000     1250000     4820000     5650000');
            output.push('Swap:       2048000      512000     1536000');
        }
        
        output.push('');
        output.push(`💭 ${getText('memoryOk')}`);
    }

    function cmd_top(args, output) {
        output.push('');
        output.push('top - 14:32:15 up 3 days,  5:23,  2 users,  load average: 0.52, 0.58, 0.59');
        output.push('Tasks: 156 total,   1 running, 155 sleeping,   0 stopped,   1 zombie');
        output.push('');
        output.push('  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND');
        output.push('    1 root      20   0  169856   9584   6720 S   0.0   0.1   0:02.43 systemd');
        output.push('  234 root      20   0  107984   7284   6284 S   0.0   0.0   0:00.21 sshd');
        output.push(' 1337 root      20   0       0      0      0 Z   0.0   0.0   0:00.00 coffee-daemon');
    }

    function cmd_env(args, output) {
        output.push('');
        output.push('PATH=/usr/local/bin:/usr/bin:/bin');
        output.push('COFFEE_SCRIPT_PATH=/usr/local/bin/');
        output.push('COFFEE_CONFIG=/opt/coffee-backup/data/machines.db');
        output.push('LANG=' + (gameState.currentLang === 'pt' ? 'pt_BR.UTF-8' : gameState.currentLang === 'en' ? 'en_US.UTF-8' : 'es_ES.UTF-8'));
        output.push('HOME=/home/dev');
        output.push('USER=dev');
    }

    function cmd_grep(args, output) {
        if (args.length < 2) {
            output.push('grep: missing pattern or file');
            return;
        }
        
        const pattern = args[0];
        const file = args[1];
        const fullPath = normalizePath(file);
        
        const content = getFileContent(fullPath);
        if (content === null) {
            output.push(`grep: ${file}: No such file or directory`);
            return;
        }
        
        const lines = content.split('\n');
        const matches = lines.filter(line => 
            line.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (matches.length > 0) {
            output.push('');
            matches.forEach(line => output.push(line));
        } else {
            // No output if no matches (like real grep)
        }
    }

    function cmd_find(args, output) {
        // Simple find implementation
        if (args.length === 0) {
            output.push('find: missing operand');
            return;
        }
        
        const searchPath = args[0];
        const nameFlag = args.indexOf('-name');
        
        if (nameFlag !== -1 && args[nameFlag + 1]) {
            const pattern = args[nameFlag + 1].replace(/"/g, '');
            const results = [];
            
            // Search in all paths
            for (const path in virtualFS) {
                const fileName = path.split('/').pop();
                if (fileName && fileName.includes(pattern.replace('*', ''))) {
                    results.push(path);
                }
            }
            
            if (results.length > 0) {
                output.push('');
                results.forEach(r => output.push(r));
            }
        } else {
            output.push('find: missing -name argument');
        }
    }

    function cmd_systemctl(args, output) {
        if (args[0] === 'status' && args[1] === 'coffee') {
            output.push('');
            output.push('● coffee.service - Coffee Machine Automation Service');
            output.push('   Loaded: loaded (/etc/systemd/system/coffee.service; enabled)');
            output.push('   Active: inactive (dead)');
            output.push('');
            output.push('Main PID: 1337 (code=killed, signal=KILL)');
        } else {
            output.push('systemctl: invalid command or service');
        }
    }

    function cmd_execute(script, output) {
        // Execute script
        if (script === './brew-coffee.sh' || script === 'brew-coffee.sh') {
            if (gameState.currentPath === '/usr/local/bin' || script.startsWith('/usr/local/bin/')) {
                return completeGame(output);
            } else {
                output.push(`bash: ${script}: No such file or directory`);
                return false;
            }
        } else if (script === './start-coffee.sh' || script.includes('start-coffee.sh')) {
            const content = getFileContent('/opt/coffee-backup/bin/start-coffee.sh');
            output.push('');
            const lines = content.split('\n').filter(l => l.startsWith('echo'));
            lines.forEach(line => {
                const text = line.match(/echo "(.+)"/);
                if (text) output.push(text[1]);
            });
            return false;
        }
        
        output.push(`bash: ${script}: command not found`);
        return false;
    }

    function completeGame(output) {
        gameState.completed = true;
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const filesRead = gameState.filesRead.size;
        const commandsUsed = gameState.commandsExecuted.length;

        const scriptLines = gameState.currentLang === 'pt'
            ? [
                '',
                'Inicializando Coffee Machine...',
                'Conectando em 192.168.1.50:8080...',
                'Aquecendo água a 93°C...',
                'Moendo grãos...',
                'Pressurizando (9 bars)...',
                '',
                'Máquina de café pronta!',
                'Service: coffee-daemon started (PID: 2048)',
                ''
            ]
            : gameState.currentLang === 'en'
            ? [
                '',
                'Initializing Coffee Machine...',
                'Connecting to 192.168.1.50:8080...',
                'Heating water to 93°C...',
                'Grinding beans...',
                'Pressurizing (9 bars)...',
                '',
                'Coffee machine ready!',
                'Service: coffee-daemon started (PID: 2048)',
                ''
            ]
            : [
                '',
                'Inicializando Coffee Machine...',
                'Conectando a 192.168.1.50:8080...',
                'Calentando agua a 93°C...',
                'Moliendo granos...',
                'Presurizando (9 bars)...',
                '',
                'Máquina de café lista!',
                'Service: coffee-daemon started (PID: 2048)',
                ''
            ];

        const summaryLines = [
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            getText('missionComplete'),
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            '',
            getText('congratulations'),
            getText('teamThanks'),
            '',
            getText('finalStats'),
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            `${getText('totalTime')} ${formatTime(elapsed)} (${elapsed} ${gameState.currentLang === 'pt' ? 'segundos' : gameState.currentLang === 'en' ? 'seconds' : 'segundos'})`,
            `${getText('filesInvestigated')} ${filesRead}`,
            `${getText('commandsExecuted')} ${commandsUsed}`,
            `${getText('efficiency')} ${getEfficiencyRating(filesRead)}`,
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            '',
            getText('calculating'),
            ''
        ];
        
        const score = calculateScore(elapsed, filesRead, commandsUsed);
        const badge = getRankBadge(score);
        
        // Calculate bonuses
        let speedBonus = 0;
        if (elapsed < 120) speedBonus = 2000;
        else if (elapsed < 180) speedBonus = 1100;
        else if (elapsed < 240) speedBonus = 500;
        
        let efficiencyBonus = 0;
        if (filesRead <= 6) efficiencyBonus = 2000;
        else if (filesRead <= 10) efficiencyBonus = 1500;
        else if (filesRead <= 15) efficiencyBonus = 800;
        
        const technicalCmds = ['ps', 'free', 'top', 'env', 'systemctl'];
        const usedTechnical = gameState.commandsExecuted.filter(cmd => 
            technicalCmds.some(tech => cmd.startsWith(tech))
        );
        const investigationBonus = usedTechnical.length * 300;
        const technicalBonus = gameState.exploredProc ? 600 : 0;
        
        output.push(`${getText('baseScore')} 10,000`);
        output.push(`${getText('speedBonus')} +${speedBonus.toLocaleString()}   (${elapsed < 120 ? '< 2min' : elapsed < 180 ? '< 3min' : elapsed < 240 ? '< 4min' : '> 4min'})`);
        output.push(`${getText('efficiencyBonus')} +${efficiencyBonus.toLocaleString()}   (${filesRead <= 6 ? '≤ 6' : filesRead <= 10 ? '≤ 10' : filesRead <= 15 ? '≤ 15' : '> 15'} ${gameState.currentLang === 'pt' ? 'arquivos' : gameState.currentLang === 'en' ? 'files' : 'archivos'})`);
        output.push(`${getText('investigationBonus')} +${investigationBonus.toLocaleString()}   (${gameState.currentLang === 'pt' ? 'usou' : gameState.currentLang === 'en' ? 'used' : 'usó'} ${usedTechnical.length} ${gameState.currentLang === 'pt' ? 'cmd técnicos' : gameState.currentLang === 'en' ? 'technical cmds' : 'cmd técnicos'})`);
        output.push(`${getText('technicalBonus')} +${technicalBonus.toLocaleString()}   (${gameState.exploredProc ? (gameState.currentLang === 'pt' ? 'explorou /proc/' : gameState.currentLang === 'en' ? 'explored /proc/' : 'exploró /proc/') : ''})`);
        output.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        output.push(`${getText('finalScore')} ${score.toLocaleString()} ${gameState.currentLang === 'pt' ? 'pontos' : gameState.currentLang === 'en' ? 'points' : 'puntos'}   ${badge.icon} ${badge.title}`);
        output.push('');
        output.push(getText('enterName'));

        const streamLines = [...scriptLines, ...summaryLines, ...output];

        const technicalCmdsUsed = ['ps', 'free', 'top', 'env', 'systemctl'];
        const usedTechCmds = gameState.commandsExecuted.filter(cmd =>
            technicalCmdsUsed.some(tech => cmd.startsWith(tech))
        );

        window.coffeeMachineGameData = {
            time: elapsed,
            filesRead: filesRead,
            commandsUsed: commandsUsed,
            exploredProc: gameState.exploredProc,
            technicalCommands: usedTechCmds
        };

        gameState.streaming = true;

        return {
            stream: true,
            lines: streamLines,
            onDone: () => {
                gameState.streaming = false;
                window.coffeeMachineAwaitingName = true;
            }
        };
    }

    async function submitScore(name) {
        const data = window.coffeeMachineGameData;
        
        try {
            const response = await fetch(`${API_BASE}/api/coffeemachine/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    time: data.time,
                    filesRead: data.filesRead,
                    commandsUsed: data.commandsUsed,
                    exploredProc: data.exploredProc,
                    technicalCommands: data.technicalCommands
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                return { success: true, rank: result.rank };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error submitting score:', error);
            return { success: false, error: 'Failed to connect to server' };
        }
    }

    async function getLeaderboard() {
        try {
            const response = await fetch(`${API_BASE}/api/coffeemachine/leaderboard`);
            const result = await response.json();
            
            if (result.success) {
                return result.leaderboard;
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
        return [];
    }

    async function displayLeaderboard(output, playerName) {
        const leaderboard = await getLeaderboard();

        output.push('');
        output.push('+=============================================+');
        output.push('|        TOP 10 COFFEE DEBUGGERS              |');
        output.push('+----+----------------+-------+------+--------+');
        output.push('| ## | PLAYER         | SCORE | TIME | RANK   |');
        output.push('+----+----------------+-------+------+--------+');

        if (leaderboard.length === 0) {
            output.push('|          No records yet.                    |');
        } else {
            leaderboard.forEach((entry, idx) => {
                const badge = getRankBadge(entry.score);
                const isPlayer = entry.name.toLowerCase() === playerName.toLowerCase();
                const num = (idx + 1).toString().padStart(2, ' ');
                const name = entry.name.padEnd(14).substring(0, 14);
                const score = entry.score.toLocaleString('en-US').padStart(5);
                const time = formatTime(entry.time).padStart(4);
                const rank = badge.icon.padEnd(6);
                const marker = isPlayer ? ' ' + getText('you') : '';
                output.push(`| ${num} | ${name} | ${score} | ${time} | ${rank} |${marker}`);
            });
        }

        output.push('+----+----------------+-------+------+--------+');
        output.push('');
        output.push(getText('backToTerminal'));
        output.push(getText('playAgain'));
    }

    // ==================== MAIN COMMAND EXECUTOR ====================
    function executeCommand(command, output) {
        const trimmed = command.trim();
        if (!trimmed) return;
        
        gameState.commandsExecuted.push(trimmed);
        
        // Check for /proc/ exploration
        if (trimmed.includes('/proc/')) {
            gameState.exploredProc = true;
        }
        
        const parts = trimmed.split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);
        
        // Handle script execution
        if (cmd.startsWith('./') || cmd.includes('.sh')) {
            const completed = cmd_execute(cmd, output);
            return completed;
        }
        
        // Handle commands
        switch (cmd) {
            case 'ls':
                cmd_ls(args, output);
                break;
            case 'cd':
                cmd_cd(args, output);
                break;
            case 'pwd':
                cmd_pwd(args, output);
                break;
            case 'cat':
                cmd_cat(args, output);
                break;
            case 'ps':
                cmd_ps(args, output);
                break;
            case 'free':
                cmd_free(args, output);
                break;
            case 'top':
                cmd_top(args, output);
                break;
            case 'env':
            case 'printenv':
                cmd_env(args, output);
                break;
            case 'grep':
                cmd_grep(args, output);
                break;
            case 'find':
                cmd_find(args, output);
                break;
            case 'systemctl':
                cmd_systemctl(args, output);
                break;
            case 'help':
                output.push('');
                output.push(getText('availableCommands'));
                output.push(getText('navCommands'));
                output.push(getText('processCommands'));
                output.push(getText('searchCommands'));
                output.push(getText('envCommands'));
                output.push(getText('memCommands'));
                output.push(getText('serviceCommands'));
                output.push(getText('execCommands'));
                output.push(getText('exitCommand'));
                break;
            case 'menu':
                resetGame();
                return 'menu';
            case 'exit':
                resetGame();
                return 'menu';
            default:
                output.push(`${getText('commandNotFound')} ${cmd}`);
                output.push(getText('typeHelp'));
                break;
        }
        
        return false;
    }

    // ==================== GAME CONTROL ====================
    function startGame(lang) {
        resetGame();
        gameState.active = true;
        gameState.currentLang = lang;
        gameState.currentPath = '/home/dev';
        gameState.timerStarted = true;
        gameState.startTime = Date.now();
        
        const output = [];
        output.push('');
        output.push(getText('sshConnecting'));
        output.push(getText('sshConnected'));
        output.push(getText('sshLastLogin'));
        output.push('');
        output.push(getText('title'));
        output.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        output.push(getText('incident'));
        output.push(getText('priority'));
        output.push('');
        output.push(getText('status'));
        output.push(getText('objective'));
        output.push('');
        output.push(getText('timerStarted'));
        output.push('');
        output.push(getText('availableCommands'));
        output.push(getText('navCommands'));
        output.push(getText('processCommands'));
        output.push(getText('searchCommands'));
        output.push(getText('envCommands'));
        output.push(getText('memCommands'));
        output.push(getText('serviceCommands'));
        output.push(getText('execCommands'));
        output.push('');
        output.push(getText('startPrompt'));
        output.push('');
        
        return output.join('\n');
    }

    function resetGame() {
        gameState.active = false;
        gameState.timerStarted = false;
        gameState.startTime = null;
        gameState.currentPath = '/';
        gameState.filesRead = new Set();
        gameState.commandsExecuted = [];
        gameState.exploredProc = false;
        gameState.completed = false;
        
        window.coffeeMachineGameData = null;
        window.coffeeMachineAwaitingName = false;
    }

    // ==================== PUBLIC API ====================
    window.CoffeeMachineDebug = {
        isActive: () => gameState.active,
        isStreaming: () => gameState.streaming,
        isAwaitingName: () => window.coffeeMachineAwaitingName,
        start: startGame,
        execute: executeCommand,
        submitScore: submitScore,
        displayLeaderboard: displayLeaderboard,
        reset: resetGame,
        getCurrentPath: () => gameState.currentPath
    };

})(window);

