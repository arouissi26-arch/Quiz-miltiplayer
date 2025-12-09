# 🧪 Guía Completa de Pruebas - Quiz Multiplayer

## 📋 Índice

1. [Preparación Inicial](#preparación-inicial)
2. [Prueba 1: Iniciar el Servidor](#prueba-1-iniciar-el-servidor)
3. [Prueba 2: Conectar el Host](#prueba-2-conectar-el-host)
4. [Prueba 3: Conectar Jugadores (Local)](#prueba-3-conectar-jugadores-local)
5. [Prueba 4: Jugar una Ronda Completa](#prueba-4-jugar-una-ronda-completa)
6. [Prueba 5: Conexión en Red Local (WiFi)](#prueba-5-conexión-en-red-local-wifi)
7. [Prueba 6: Múltiples Jugadores](#prueba-6-múltiples-jugadores)
8. [Checklist Final](#checklist-final)
9. [Solución de Problemas](#solución-de-problemas)

---

## Preparación Inicial

### ✅ Requisitos Previos

Antes de empezar, asegúrate de tener:

- [ ] **Node.js instalado** (versión 14 o superior)
  - Verifica con: `node --version`
  - Si no lo tienes: [Descargar Node.js](https://nodejs.org/)

- [ ] **Dependencias instaladas**
  ```bash
  cd "/Applications/Escaperoom-claude-version-final-clean-011CV5g4Vsth7wFxiRxw7hPx 2/quiz-multiplayer"
  npm install
  ```

- [ ] **Puerto 3000 disponible**
  - Si está ocupado, el servidor te lo indicará

### 📁 Ubicación del Proyecto

```
/Applications/Escaperoom-claude-version-final-clean-011CV5g4Vsth7wFxiRxw7hPx 2/
└── quiz-multiplayer/
    ├── server.js          ← Servidor mejorado
    ├── host.html          ← Interfaz del presentador
    ├── player.html        ← Interfaz de jugadores
    ├── package.json
    └── README.md
```

---

## Prueba 1: Iniciar el Servidor

### 🎯 Objetivo
Verificar que el servidor arranca correctamente y muestra toda la información necesaria.

### 📝 Pasos

1. **Abre una terminal**

2. **Navega a la carpeta del proyecto:**
   ```bash
   cd "/Applications/Escaperoom-claude-version-final-clean-011CV5g4Vsth7wFxiRxw7hPx 2/quiz-multiplayer"
   ```

3. **Inicia el servidor:**
   ```bash
   npm start
   ```
   
   O directamente:
   ```bash
   node server.js
   ```

### ✅ Resultado Esperado

Deberías ver algo como esto:

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

  📖 Para conectar jugadores, usa:
     http://192.168.1.100:3000/quiz-multiplayer/player.html

  🎯 Para abrir el host:
     http://localhost:3000/quiz-multiplayer/host.html

============================================================

[2025-12-02 19:15:30] [INFO] Server started successfully
```

### 📌 Notas Importantes

- **Anota la IP de red** (ej: `192.168.1.100`) - la necesitarás para conectar dispositivos móviles
- **Deja esta terminal ABIERTA** durante todas las pruebas
- Si ves errores, consulta la sección [Solución de Problemas](#solución-de-problemas)

### ❌ Posibles Errores

**Error: `Port 3000 is already in use`**
```bash
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

---

## Prueba 2: Conectar el Host

### 🎯 Objetivo
Verificar que la interfaz del host se carga correctamente y genera un código de sala.

### 📝 Pasos

1. **Abre tu navegador** (Chrome, Firefox, Safari o Edge)

2. **Ve a la URL del host:**
   ```
   http://localhost:3000/quiz-multiplayer/host.html
   ```

3. **Observa la pantalla**

### ✅ Resultado Esperado

Deberías ver:

- 🎮 **Título**: "Quiz Multiplayer - El Transport de Substàncies"
- 🔢 **Código de 6 dígitos** en GRANDE (ej: `742856`)
- 📝 **Texto**: "Codi de la Sala"
- 📱 **URL para jugadores**
- 👥 **Sección de jugadores** (vacía por ahora)
- 🔘 **Botón "Iniciar Quiz"** (deshabilitado, en gris)

### 📊 En la Terminal del Servidor

Deberías ver logs como:

```
[2025-12-02 19:16:15] [INFO] Client connected: abc123xyz
[2025-12-02 19:16:15] [INFO] Room created: 742856 by abc123xyz
[2025-12-02 19:16:15] [INFO] Host abc123xyz created room 742856
```

### 📌 Notas

- El código de sala es **aleatorio** y único
- Cada vez que refresques la página se genera un **nuevo código**
- **Anota el código** para la siguiente prueba

---

## Prueba 3: Conectar Jugadores (Local)

### 🎯 Objetivo
Conectar jugadores desde el mismo ordenador para probar la funcionalidad básica.

### 📝 Pasos

1. **Abre una NUEVA pestaña** en el navegador (mantén la del host abierta)

2. **Ve a la URL de jugador:**
   ```
   http://localhost:3000/quiz-multiplayer/player.html
   ```

3. **Introduce el código de sala** que viste en el host (ej: `742856`)

4. **Introduce un nombre** (ej: `Jugador Test 1`)

5. **Haz clic en "Unir-se al Quiz"**

### ✅ Resultado Esperado

**En la pestaña del jugador:**
- ✅ Mensaje de "Esperant que comenci el quiz..."
- 👤 Tu nombre visible
- ⏳ Icono de espera

**En la pestaña del host:**
- 👥 Aparece una **tarjeta con tu nombre**
- 🎨 Fondo morado/azul con avatar
- 🔘 El botón "Iniciar Quiz" se **activa** (ya no está gris)

**En la terminal del servidor:**
```
[2025-12-02 19:17:30] [INFO] Player "Jugador Test 1" (def456ghi) joined room 742856
```

### 🔄 Prueba Adicional: Conectar Más Jugadores

Repite los pasos 1-5 con diferentes nombres:
- `Jugador Test 2`
- `Jugador Test 3`

Todos deberían aparecer en la lista del host.

### ❌ Posibles Errores

**"Codi de sala no vàlid"**
- Verifica que el código tenga exactamente 6 dígitos
- Asegúrate de que el host sigue abierto

**"Aquest nom ja està en ús"**
- Usa un nombre diferente
- Los nombres son case-insensitive (`Juan` = `juan`)

---

## Prueba 4: Jugar una Ronda Completa

### 🎯 Objetivo
Probar el flujo completo del quiz: pregunta → respuestas → resultados.

### 📝 Preparación

- **Host abierto** con código de sala
- **Al menos 2 jugadores conectados** (puedes usar 2 pestañas)

### 📝 Pasos

#### Paso 1: Iniciar el Quiz

1. En la pestaña del **HOST**, haz clic en **"Iniciar Quiz"**

**Resultado esperado:**
- La pantalla cambia a la primera pregunta
- Los jugadores ven la misma pregunta en sus dispositivos

**En la terminal:**
```
[2025-12-02 19:20:00] [INFO] Game started in room 742856 with 2 players
[2025-12-02 19:20:01] [INFO] Question 1/15 sent to room 742856
```

#### Paso 2: Ver la Pregunta

**En el HOST:**
- 📊 "Pregunta 1/15"
- ⏱️ Temporalizador de 20 segundos (cuenta atrás)
- ❓ Texto de la pregunta en grande
- 🔴🔵🟡🟢 4 opciones de respuesta con colores

**En los JUGADORES:**
- Misma pregunta
- Mismos 4 botones de colores
- Temporalizador sincronizado

#### Paso 3: Responder

1. En cada pestaña de **JUGADOR**, haz clic en una respuesta

**Resultado esperado:**
- ✅ El botón seleccionado se marca
- 💬 Mensaje "Resposta enviada!"
- 🔒 Los demás botones se deshabilitan

**En el HOST:**
- 📈 Contador actualizado: "2/2 han respost" (si hay 2 jugadores)

**En la terminal:**
```
[2025-12-02 19:20:05] [DEBUG] Player Jugador Test 1 answered question 1: correct (+1450 pts)
[2025-12-02 19:20:07] [DEBUG] Player Jugador Test 2 answered question 1: incorrect (+0 pts)
```

#### Paso 4: Ver Resultados

1. Espera a que el **temporalizador llegue a 0** o todos respondan

2. El HOST automáticamente muestra los resultados

**En el HOST:**
- ✅ Respuesta correcta destacada en verde
- 📊 **Clasificación** con nombres y puntuaciones
- 🥇🥈🥉 Top 3 destacados con colores especiales
- 🔘 Botón "Següent Pregunta"

**En los JUGADORES:**
- ✅ o ❌ Icono grande (correcto/incorrecto)
- 💯 Puntos ganados (ej: "+1450 punts!")
- 📊 Clasificación actualizada
- 🎯 Su posición destacada

#### Paso 5: Siguiente Pregunta

1. En el **HOST**, haz clic en **"Següent Pregunta"**

**Resultado esperado:**
- Se muestra la pregunta 2/15
- El proceso se repite

#### Paso 6: Finalizar el Quiz

Después de la última pregunta (15/15):

1. En el **HOST**, haz clic en **"Finalitzar Quiz"**

**Resultado esperado:**

**En el HOST:**
- 🏆 Pantalla de "Classificació Final"
- 🥇 Pódium con los 3 primeros
- 📊 Lista completa de jugadores ordenada por puntuación
- 🔄 Botón "Nova Partida"

**En los JUGADORES:**
- 🎉 Su posición final (ej: "1r Lloc!")
- 💯 Puntuación total
- 📊 Clasificación completa

**En la terminal:**
```
[2025-12-02 19:25:00] [INFO] Game ended in room 742856. Winner: Jugador Test 1 (15000 pts)
```

### ✅ Checklist de Funcionalidades

- [ ] El quiz inicia correctamente
- [ ] Las preguntas se muestran en host y jugadores
- [ ] El temporalizador funciona (20 segundos)
- [ ] Los jugadores pueden responder
- [ ] El contador de respuestas se actualiza en el host
- [ ] Los resultados se muestran correctamente
- [ ] La clasificación se ordena por puntuación
- [ ] El sistema de puntos funciona (1000 base + bonus por velocidad)
- [ ] La pantalla final muestra el pódium
- [ ] Los logs del servidor son claros

---

## Prueba 5: Conexión en Red Local (WiFi)

### 🎯 Objetivo
Probar que dispositivos móviles en la misma red WiFi pueden conectarse.

### 📋 Requisitos

- Servidor corriendo en tu ordenador
- Dispositivo móvil (smartphone o tablet)
- **Ambos dispositivos en la MISMA red WiFi**

### 📝 Pasos

#### Paso 1: Obtener la IP del Servidor

La IP ya aparece cuando inicias el servidor. Si no la anotaste:

**En Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**En Windows:**
```bash
ipconfig
```

Busca algo como: `192.168.1.100` o `192.168.0.50`

#### Paso 2: Verificar el Firewall

**En Mac:**
```bash
# Permitir el puerto 3000
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
```

**En Windows:**
```powershell
# Ejecutar como Administrador
netsh advfirewall firewall add rule name="Quiz Server" dir=in action=allow protocol=TCP localport=3000
```

**En Linux:**
```bash
sudo ufw allow 3000
```

#### Paso 3: Conectar desde el Móvil

1. En tu **smartphone**, abre el navegador (Chrome, Safari, etc.)

2. Ve a la URL (reemplaza con TU IP):
   ```
   http://192.168.1.100:3000/quiz-multiplayer/player.html
   ```

3. Introduce el **código de sala** del host

4. Introduce tu **nombre**

5. Haz clic en **"Unir-se al Quiz"**

### ✅ Resultado Esperado

- El jugador aparece en la lista del host
- Puedes jugar normalmente desde el móvil
- Las respuestas se registran correctamente

### ❌ Solución de Problemas

**No se puede conectar:**

1. **Verifica que ambos están en la misma WiFi**
   - No funciona si uno está en WiFi y otro en datos móviles
   - No funciona entre diferentes redes WiFi

2. **Verifica la IP**
   - Prueba hacer ping desde el móvil: `http://[TU-IP]:3000`
   - Deberías ver la página del servidor

3. **Verifica el firewall**
   - Desactiva temporalmente el firewall para probar
   - Si funciona, añade una excepción para el puerto 3000

4. **Reinicia el servidor**
   - Ctrl+C en la terminal
   - `npm start` de nuevo

---

## Prueba 6: Múltiples Jugadores

### 🎯 Objetivo
Simular una clase real con muchos jugadores conectados simultáneamente.

### 📝 Pasos

1. **Abre 5-10 pestañas de jugador** (o usa dispositivos reales)

2. **Conecta cada uno con nombres diferentes:**
   - Ana
   - Bernat
   - Carla
   - David
   - Emma
   - etc.

3. **Inicia el quiz** desde el host

4. **Haz que algunos respondan rápido y otros lento**

5. **Observa la clasificación** después de cada pregunta

### ✅ Verificaciones

- [ ] Todos los jugadores aparecen en el host
- [ ] No hay lag significativo
- [ ] La clasificación se actualiza correctamente
- [ ] Los puntos se calculan bien (más puntos para respuestas rápidas)
- [ ] El pódium final muestra los 3 primeros

### 📊 Prueba de Estrés

**Límite de jugadores:** El servidor está configurado para máximo **50 jugadores** por sala.

Si intentas conectar el jugador 51, debería recibir el mensaje:
```
"La sala està plena"
```

---

## Checklist Final

Antes de usar el quiz en clase, verifica:

### Servidor
- [ ] El servidor inicia sin errores
- [ ] Los logs son claros y tienen timestamps
- [ ] La IP de red se muestra correctamente
- [ ] El heartbeat detecta desconexiones

### Host
- [ ] Se genera un código de sala único
- [ ] Los jugadores aparecen en la lista
- [ ] El botón "Iniciar Quiz" se activa cuando hay jugadores
- [ ] Las preguntas se muestran correctamente
- [ ] El temporalizador funciona
- [ ] Los resultados se muestran bien
- [ ] La clasificación se ordena correctamente
- [ ] La pantalla final muestra el pódium

### Jugadores
- [ ] Pueden unirse con el código
- [ ] No se permiten nombres duplicados
- [ ] Ven las preguntas correctamente
- [ ] Pueden responder (una sola vez)
- [ ] Reciben feedback inmediato (correcto/incorrecto)
- [ ] Ven su puntuación actualizada
- [ ] Ven la clasificación después de cada pregunta

### Red Local
- [ ] Los dispositivos móviles pueden conectarse
- [ ] La conexión es estable
- [ ] No hay lag significativo
- [ ] Las desconexiones se manejan bien

---

## Solución de Problemas

### 🔴 Problema: El servidor no inicia

**Error:** `Cannot find module 'express'`

**Solución:**
```bash
cd "/Applications/Escaperoom-claude-version-final-clean-011CV5g4Vsth7wFxiRxw7hPx 2/quiz-multiplayer"
npm install
```

---

### 🔴 Problema: Puerto 3000 ocupado

**Error:** `Port 3000 is already in use`

**Solución Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Solución Windows:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**Alternativa:** Usar otro puerto:
```bash
PORT=3001 node server.js
```

---

### 🔴 Problema: Los jugadores no pueden conectarse desde móviles

**Causas posibles:**

1. **Diferentes redes WiFi**
   - ✅ Solución: Conecta todos los dispositivos a la misma red

2. **Firewall bloqueando**
   - ✅ Solución: Permite el puerto 3000 (ver [Prueba 5](#prueba-5-conexión-en-red-local-wifi))

3. **IP incorrecta**
   - ✅ Solución: Verifica la IP con `ifconfig` o `ipconfig`

4. **Servidor no escuchando en 0.0.0.0**
   - ✅ Ya está configurado correctamente en el código

---

### 🔴 Problema: "Aquest nom ja està en ús"

**Causa:** Otro jugador ya tiene ese nombre (case-insensitive)

**Solución:** Usa un nombre diferente

---

### 🔴 Problema: El temporalizador no funciona

**Causa:** Posible problema de sincronización

**Solución:**
1. Refresca la página del jugador (F5)
2. Si persiste, reinicia el servidor

---

### 🔴 Problema: Los jugadores se desconectan aleatoriamente

**Causa:** Conexión WiFi inestable o clientes "zombie"

**Solución:**
- El servidor ahora tiene un sistema de heartbeat que detecta y elimina clientes inactivos
- Verifica la calidad de la señal WiFi
- Acerca los dispositivos al router

---

### 🔴 Problema: La clasificación no se actualiza

**Causa:** Error en el cálculo de puntos

**Solución:**
- Verifica en los logs del servidor que las respuestas se registran
- Busca mensajes de error en la consola del navegador (F12)

---

## 📞 Ayuda Adicional

Si encuentras un problema no listado aquí:

1. **Revisa los logs del servidor** - Busca mensajes `[ERROR]` o `[WARN]`
2. **Abre la consola del navegador** (F12) - Busca errores en rojo
3. **Reinicia todo:**
   - Cierra todas las pestañas
   - Detén el servidor (Ctrl+C)
   - Inicia el servidor de nuevo
   - Abre el host y jugadores de nuevo

---

## 🎉 ¡Listo para la Clase!

Si has completado todas las pruebas exitosamente, estás listo para usar el quiz en clase.

### Consejos para el Día de la Presentación

1. **Llega 15 minutos antes** para configurar todo
2. **Escribe la IP en la pizarra** en grande
3. **Proyecta el host** en la pantalla grande
4. **Da 3-5 minutos** para que todos se conecten
5. **Haz una pregunta de prueba** antes de empezar oficialmente
6. **¡Diviértete!** 🎮

---

**Versión de la guía:** 2.0  
**Última actualización:** 2 de diciembre de 2025  
**Sistema:** Quiz Multiplayer - Versión Mejorada
