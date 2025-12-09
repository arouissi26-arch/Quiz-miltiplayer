# 🎮 Quiz Multiplayer - Sistema Tipus Kahoot

Sistema de quiz multiplayer sobre "El Transport de Substàncies al Cos Humà" amb connexió per WiFi/LAN.

**✨ VERSIÓ 2.0 - COMPLETAMENT RENOVAT I MILLORAT! ✨**

## 🌟 Característiques

### Funcionalitats del Joc
- ✅ **Disseny professional tipus Kahoot** amb colors i animacions
- ✅ **15 preguntes** sobre transport de substàncies, circulació i sang
- ✅ **Temps real** amb Socket.IO (sincronització instantània)
- ✅ **Sistema de puntuació:** 1000 punts base + bonificació per velocitat (fins a 500 punts)
- ✅ **Pregunta visible** tant a la pantalla gran (host) com als dispositius dels jugadors
- ✅ **Classificació en temps real** després de cada pregunta
- ✅ **Podi final** amb posicions 1r, 2n i 3r destacades
- ✅ **Efectes visuals** (animacions, ripple effects, confeti visual)
- ✅ **Responsive** - funciona perfectament en mòbils, tablets i ordinadors

### Millores del Servidor (Nou! 🆕)
- ✅ **Logging millorat** amb timestamps i nivells (INFO, WARN, ERROR, DEBUG)
- ✅ **Sistema de heartbeat** per detectar i eliminar clients inactius
- ✅ **Validació robusta** de noms de jugadors i codis de sala
- ✅ **Gestió automàtica** de sales inactives (neteja cada 30 minuts)
- ✅ **Manejo d'errors** amb try-catch en totes les operacions crítiques
- ✅ **Límit configurable** de jugadors per sala (per defecte: 50)
- ✅ **Detecció automàtica de la IP local** per facilitar la connexió
- ✅ **Configuració flexible** amb variables d'entorn

## 📋 Requisits

- **Node.js** (versió 14 o superior) - [Descarrega aquí](https://nodejs.org/)
- **Navegador web modern** (Chrome, Firefox, Safari, Edge)
- **Tots els dispositius a la mateixa xarxa WiFi/LAN**

## 🚀 Instal·lació

### 1. Navega a la carpeta del projecte:

```bash
cd quiz-multiplayer
```

### 2. Instal·la les dependències (només la primera vegada):

```bash
npm install
```

Veuràs que s'instal·len Express i Socket.IO.

## 🎯 Com Utilitzar (Pas a Pas)

### ▶️ PAS 1: Iniciar el Servidor (MOLT IMPORTANT!)

⚠️ **SENSE EL SERVIDOR NO FUNCIONA RES!** ⚠️

A la carpeta `quiz-multiplayer`, executa:

```bash
node server.js
```

Veuràs aquest missatge:

```
============================================================
  🎮 QUIZ MULTIPLAYER SERVER - VERSIÓN MEJORADA
============================================================
  ✓ Servidor iniciado correctamente
  📅 Fecha: 2025-12-02 19:15:30
  🔌 Puerto: 3000
  🌐 Acceso Local:  http://localhost:3000
  📱 Acceso Red:    http://192.168.1.100:3000
  ────────────────────────────────────────────────────────
  👥 Máx. jugadores por sala: 50
  🧹 Limpieza de salas: cada 30 min
  💓 Heartbeat: cada 5s
  🐛 Modo Debug: DESACTIVADO
============================================================
```

**La IP de xarxa ja es mostra automàticament!** 🎉

**⚠️ IMPORTANT: Deixa aquesta terminal OBERTA durant tot el quiz!**

Si veus errors:
- Executa `npm install` primer
- Comprova que el port 3000 no està ocupat

### 📍 PAS 2: Obtenir la IP del Servidor

**Ja no cal fer res!** La IP es mostra automàticament quan inicies el servidor. 🎉

Si necessites verificar-la manualment:

**A Linux/Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**A Windows:**
```bash
ipconfig
```

Busca l'adreça IPv4, per exemple: `192.168.1.100`

### 🖥️ PAS 3: Obrir el Host (Professor/Presentador)

1. A l'ordinador del professor, obre el navegador
2. Ves a: `http://localhost:3000/quiz-multiplayer/host.html`
3. Apareixerà un **CODI DE 6 DÍGITS** en pantalla gran (ex: `742856`)
4. Projecta aquesta pantalla perquè tots vegin el codi

### 📱 PAS 4: Els Jugadors es Connecten

Cada estudiant amb el seu mòbil/tablet:

1. Obre el navegador
2. Ves a: `http://192.168.1.100:3000/quiz-multiplayer/player.html`
   - ⚠️ Canvia `192.168.1.100` per la IP del servidor!
3. Introdueix el **codi de 6 dígits** que veu a la pantalla
4. Introdueix el seu **nom**
5. Fes clic a **"Unir-se al Quiz"**

El host veurà com apareixen els jugadors a la pantalla gran!

### 🎮 PAS 5: Jugar!

1. **El host** espera que tothom estigui connectat
2. **El host** fa clic al botó **"Iniciar Quiz"**
3. **La pregunta es mostra:**
   - A la **pantalla gran** (projectada)
   - Al **mòbil de cada jugador**
4. **Els jugadors** seleccionen la resposta al seu dispositiu
5. Tenen **20 segons** per respondre
6. Després de 20s, es mostren els **resultats** i la **classificació**
7. **El host** fa clic a **"Següent Pregunta"**
8. Es repeteix fins acabar les 15 preguntes
9. Al final: **Podi amb els 3 primers classificats!** 🏆🥈🥉

## 🎨 Disseny Visual

### 🖥️ Pantalla del Host (Projectada)

- **Codi de sala**: Números gegants (font 8em) ben visibles
- **Llista de jugadors**: Amb avatars i noms
- **Pregunta**: Text gran en negreta (font 3.5em)
- **4 respostes**: Botons de colors (vermell, blau, groc, verd)
- **Temporitzador**: Compte enrere de 20s (es posa vermell als últims 5s)
- **Contador**: "5/8 han respost"
- **Classificació**: Podi amb or, plata i bronze

### 📱 Pantalla del Jugador (Mòbil)

- **Pregunta**: Visible també al jugador
- **4 botons grans**: Colors vius i fàcils de tocar
- **Efecte de clic**: Animació d'ona (ripple effect)
- **Feedback immediat**: ✅ Correcte! o ❌ Incorrecte
- **Punts guanyats**: +1200 punts (amb animació)
- **Classificació**: Veu la seva posició destacada

## 📊 Sistema de Puntuació

```
Resposta CORRECTA:
  Punts base: 1000
  Bonificació per temps: temps_restant × 25

  Exemple:
  - Resposta en 2 segons: 1000 + (18 × 25) = 1450 punts
  - Resposta en 10 segons: 1000 + (10 × 25) = 1250 punts
  - Resposta en 19 segons: 1000 + (1 × 25) = 1025 punts

Resposta INCORRECTA: 0 punts
```

## 📝 Les 15 Preguntes

1. Quin percentatge del pes corporal representa l'aigua?
2. Què és la difusió simple?
3. Quantes cambres té el cor humà?
4. Quina és la funció principal dels eritròcits?
5. Què és la sístole?
6. Quin tipus de vas sanguini té parets més gruixudes?
7. On es produeix l'intercanvi de gasos?
8. Què transporta el sistema limfàtic?
9. Quants litres de sang té un adult?
10. Què és l'osmosi?
11. Quin component de la sang ajuda a coagular?
12. Quina circulació va del cor als pulmons?
13. Què és el plasma sanguini?
14. Quin és l'òrgan principal del sistema limfàtic?
15. Quantes pulsacions per minut té un adult en repòs?

## 🔧 Solució de Problemes

### ❌ El servidor no s'inicia

**Error:** `Port 3000 is already in use`

**Solució:**
```bash
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### ❌ Els jugadors no es poden connectar

**Causes possibles:**

1. **IP incorrecta** - Verifica que la IP és la correcta
2. **Diferents xarxes WiFi** - Tots han d'estar a la mateixa xarxa
3. **Tallafocs bloqueja** - Permet el port 3000

**Solució tallafocs:**

**Linux:**
```bash
sudo ufw allow 3000
```

**Windows:**
```powershell
netsh advfirewall firewall add rule name="Quiz Server" dir=in action=allow protocol=TCP localport=3000
```

### ❌ La pregunta no es veu al jugador

**Problema:** Possible error de JavaScript

**Solució:** Refresca la pàgina (F5) o torna a connectar-te

### ❌ El temporitzador no funciona

**Problema:** La connexió s'ha perdut

**Solució:** Comprova que el servidor està funcionant i refresca les pàgines

## 💡 Consells per a la Presentació

1. **✅ Prova abans:** Fes una prova completa 1 dia abans amb la [Guia de Proves](GUIA_PRUEBAS.md)
2. **✅ IP visible:** Escriu la IP en gran a la pissarra (el servidor ja la mostra!)
3. **✅ Temps de connexió:** Deixa 3-5 minuts perquè tots es connectin
4. **✅ Pantalla gran:** Projecta el host.html perquè tots vegin la pregunta
5. **✅ Anímate!:** Comenta els resultats entre preguntes

## 🧪 Guia de Proves Completa

**🆕 NOU!** Hem creat una guia detallada pas a pas per provar el sistema:

📖 **[GUIA_PRUEBAS.md](GUIA_PRUEBAS.md)** - Guia completa amb:
- Instruccions pas a pas per cada prova
- Resultats esperats per cada pas
- Checklists de verificació
- Solució de problemes detallada
- Consells per al dia de la presentació

## 📂 Estructura del Projecte

```
quiz-multiplayer/
├── server.js          # Servidor Node.js millorat (v2.0)
├── host.html          # Interfície per al presentador (pantalla gran)
├── player.html        # Interfície per als jugadors (mòbils)
├── package.json       # Dependències del projecte
├── README.md          # Aquest arxiu
├── GUIA_PRUEBAS.md    # Guia completa de proves (NOU!)
└── node_modules/      # Llibreries (creat després de npm install)
```

## 🛠️ Tecnologies Utilitzades

- **Backend:** Node.js + Express.js
- **Temps Real:** Socket.IO (WebSockets)
- **Frontend:** HTML5 + CSS3 + JavaScript (vanilla, sense frameworks)
- **Animacions:** CSS animations i keyframes
- **Responsive:** CSS Grid i Flexbox

## 👥 Autors

**Projecte de Biologia - 3r ESO**

- Aissa Rousi
- Ivan Rios
- Roger Omegna
- Unai Jimenez
- Yeremi Suarez

---

## 📞 Suport

Si tens problemes:

1. **Consulta la [Guia de Proves](GUIA_PRUEBAS.md)** - Inclou solució de problemes detallada
2. Comprova que el servidor està funcionant (`npm start`)
3. Verifica que tots els dispositius estan a la mateixa xarxa WiFi
4. Revisa la IP del servidor (es mostra automàticament)
5. Comprova que el tallafocs permet el port 3000
6. Revisa els logs del servidor per errors

---

**Versió 2.0 - Servidor Millorat! 🎉**

*Sistema tipus Kahoot professional per a presentacions educatives*

### Novetats de la Versió 2.0
- ✨ Logging millorat amb timestamps
- 💓 Sistema de heartbeat per detectar desconnexions
- ✅ Validació robusta de dades
- 🧹 Neteja automàtica de sales inactives
- 🔧 Manejo d'errors millorat
- 📍 Detecció automàtica de la IP local
- 📖 Guia de proves completa
