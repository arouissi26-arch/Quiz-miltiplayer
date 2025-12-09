const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
    PORT: process.env.PORT || 3000,
    MAX_PLAYERS_PER_ROOM: parseInt(process.env.MAX_PLAYERS) || 50,
    ROOM_CLEANUP_INTERVAL: 30 * 60 * 1000, // 30 minutos
    MAX_NAME_LENGTH: 20,
    MIN_NAME_LENGTH: 2,
    DEBUG: process.env.DEBUG === 'true'
};

// ============================================
// UTILIDADES DE LOGGING
// ============================================
function getTimestamp() {
    return new Date().toISOString().replace('T', ' ').substr(0, 19);
}

function log(level, message, data = '') {
    const timestamp = getTimestamp();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    console.log(`[${timestamp}] [${level}] ${message}${dataStr}`);
}

const logger = {
    info: (msg, data) => log('INFO', msg, data),
    warn: (msg, data) => log('WARN', msg, data),
    error: (msg, data) => log('ERROR', msg, data),
    debug: (msg, data) => CONFIG.DEBUG && log('DEBUG', msg, data)
};

// ============================================
// VALIDACIÓN DE DATOS
// ============================================
function validatePlayerName(name) {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: 'El nom és obligatori' };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < CONFIG.MIN_NAME_LENGTH) {
        return { valid: false, error: `El nom ha de tenir almenys ${CONFIG.MIN_NAME_LENGTH} caràcters` };
    }

    if (trimmedName.length > CONFIG.MAX_NAME_LENGTH) {
        return { valid: false, error: `El nom no pot superar ${CONFIG.MAX_NAME_LENGTH} caràcters` };
    }

    // Sanitizar: solo letras, números, espacios y algunos caracteres especiales
    const sanitized = trimmedName.replace(/[^a-zA-Z0-9\sáéíóúàèìòùäëïöüñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ_-]/g, '');

    if (sanitized.length === 0) {
        return { valid: false, error: 'El nom conté caràcters no vàlids' };
    }

    return { valid: true, sanitized };
}

function validateRoomCode(code) {
    if (!code || typeof code !== 'string') {
        return false;
    }
    return /^\d{6}$/.test(code);
}

// ============================================
// GESTIÓN DE SALAS
// ============================================
const rooms = new Map();

function generateRoomCode() {
    let code;
    let attempts = 0;
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        attempts++;
        if (attempts > 100) {
            logger.error('No se pudo generar código de sala único');
            return null;
        }
    } while (rooms.has(code));
    return code;
}

function createRoom(hostSocketId) {
    const roomCode = generateRoomCode();
    if (!roomCode) return null;

    const room = {
        code: roomCode,
        host: hostSocketId,
        players: new Map(),
        currentQuestion: 0,
        currentCorrectAnswer: null, // Store correct answer here
        questionStartTime: null,
        gameState: 'waiting',
        answers: new Map(),
        createdAt: Date.now(),
        lastActivity: Date.now()
    };

    rooms.set(roomCode, room);
    logger.info(`Room created: ${roomCode} by ${hostSocketId}`);
    return room;
}

function cleanupInactiveRooms() {
    const now = Date.now();
    let cleaned = 0;

    for (const [code, room] of rooms.entries()) {
        const inactiveTime = now - room.lastActivity;
        if (inactiveTime > CONFIG.ROOM_CLEANUP_INTERVAL) {
            rooms.delete(code);
            cleaned++;
            logger.info(`Room ${code} cleaned up (inactive for ${Math.round(inactiveTime / 60000)} minutes)`);
        }
    }

    if (cleaned > 0) {
        logger.info(`Cleanup completed: ${cleaned} rooms removed`);
    }
}

// Limpieza periódica de salas inactivas
setInterval(cleanupInactiveRooms, CONFIG.ROOM_CLEANUP_INTERVAL);

// ============================================
// OBTENER IP LOCAL
// ============================================
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// ============================================
// SOCKET.IO - MANEJO DE CONEXIONES
// ============================================

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, '..')));

io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Host crea una nueva sala
    socket.on('create-room', (callback) => {
        try {
            const room = createRoom(socket.id);

            if (!room) {
                callback({ success: false, message: 'Error al crear la sala' });
                return;
            }

            socket.join(room.code);
            socket.roomCode = room.code;
            socket.isHost = true;

            callback({ success: true, code: room.code });
            logger.info(`Host ${socket.id} created room ${room.code}`);
        } catch (error) {
            logger.error('Error creating room:', error.message);
            callback({ success: false, message: 'Error del servidor' });
        }
    });

    // Jugador se une a una sala
    socket.on('join-room', (data, callback) => {
        try {
            const { code, name } = data;

            // Validar código de sala
            if (!validateRoomCode(code)) {
                callback({ success: false, message: 'Codi de sala no vàlid' });
                return;
            }

            const room = rooms.get(code);
            if (!room) {
                callback({ success: false, message: 'Sala no trobada' });
                return;
            }

            if (room.gameState !== 'waiting') {
                callback({ success: false, message: 'La partida ja ha començat' });
                return;
            }

            // Validar nombre
            const nameValidation = validatePlayerName(name);
            if (!nameValidation.valid) {
                callback({ success: false, message: nameValidation.error });
                return;
            }

            const sanitizedName = nameValidation.sanitized;

            // Verificar límite de jugadores
            if (room.players.size >= CONFIG.MAX_PLAYERS_PER_ROOM) {
                callback({ success: false, message: 'La sala està plena' });
                return;
            }

            // Verificar nombre duplicado
            const nameTaken = Array.from(room.players.values()).some(p =>
                p.name.toLowerCase() === sanitizedName.toLowerCase()
            );
            if (nameTaken) {
                callback({ success: false, message: 'Aquest nom ja està en ús' });
                return;
            }

            socket.join(code);
            socket.roomCode = code;
            socket.playerName = sanitizedName;

            room.players.set(socket.id, {
                id: socket.id,
                name: sanitizedName,
                score: 0,
                correctAnswers: 0,
                joinedAt: Date.now()
            });

            room.lastActivity = Date.now();

            logger.info(`Player "${sanitizedName}" (${socket.id}) joined room ${code}`);

            // Notificar a todos
            const playersList = Array.from(room.players.values()).map(p => ({
                name: p.name,
                score: p.score
            }));

            io.to(code).emit('players-updated', { players: playersList });
            callback({ success: true });

        } catch (error) {
            logger.error('Error joining room:', error.message);
            callback({ success: false, message: 'Error del servidor' });
        }
    });

    // Host inicia el juego
    socket.on('start-game', () => {
        try {
            const room = rooms.get(socket.roomCode);
            if (!room || room.host !== socket.id) {
                logger.warn(`Unauthorized start-game attempt by ${socket.id}`);
                return;
            }

            if (room.players.size === 0) {
                socket.emit('error-message', 'No hi ha jugadors connectats');
                return;
            }

            room.gameState = 'playing';
            room.lastActivity = Date.now();
            io.to(socket.roomCode).emit('game-started');
            logger.info(`Game started in room ${socket.roomCode} with ${room.players.size} players`);
        } catch (error) {
            logger.error('Error starting game:', error.message);
        }
    });

    // Host envía pregunta a todos los jugadores
    socket.on('show-question', (questionData) => {
        try {
            const room = rooms.get(socket.roomCode);
            if (!room || room.host !== socket.id) {
                logger.warn(`Unauthorized show-question attempt by ${socket.id}`);
                return;
            }

            room.gameState = 'question';
            room.answers = new Map();
            room.questionStartTime = Date.now();
            room.currentQuestion = questionData.questionNumber;
            room.currentCorrectAnswer = questionData.correctAnswer; // Store correct answer
            room.lastActivity = Date.now();

            // Enviar a todos los jugadores (sin respuesta correcta)
            io.to(socket.roomCode).emit('question', {
                questionNumber: questionData.questionNumber,
                totalQuestions: questionData.totalQuestions,
                question: questionData.question,
                answers: questionData.answers
            });

            logger.info(`Question ${questionData.questionNumber}/${questionData.totalQuestions} sent to room ${socket.roomCode}`);
        } catch (error) {
            logger.error('Error showing question:', error.message);
        }
    });

    // Jugador envía respuesta
    socket.on('submit-answer', (data, callback) => {
        try {
            const room = rooms.get(socket.roomCode);
            if (!room || room.gameState !== 'question') {
                callback({ success: false });
                return;
            }

            const player = room.players.get(socket.id);
            if (!player || room.answers.has(socket.id)) {
                callback({ success: false });
                return;
            }

            const { answerIndex, timeLeft } = data;
            const correctAnswer = room.currentCorrectAnswer;

            // Validar datos
            if (typeof answerIndex !== 'number' || answerIndex < 0 || answerIndex > 3) {
                logger.warn(`Invalid answer index from ${socket.id}: ${answerIndex}`);
                callback({ success: false });
                return;
            }

            const isCorrect = answerIndex === correctAnswer;

            // Calcular puntos
            let points = 0;
            if (isCorrect) {
                const timeBonus = Math.max(0, Math.min(20, timeLeft)) * 25;
                points = Math.round(1000 + timeBonus);
                player.correctAnswers++;
            }
            player.score += points;

            // Guardar respuesta
            room.answers.set(socket.id, {
                answerIndex,
                isCorrect,
                points,
                timeLeft,
                timestamp: Date.now()
            });

            room.lastActivity = Date.now();

            // Notificar al host
            io.to(room.host).emit('player-answered', {
                playerName: player.name,
                answeredCount: room.answers.size,
                totalPlayers: room.players.size
            });

            callback({ success: true, isCorrect, points });
            logger.debug(`Player ${player.name} answered question ${room.currentQuestion}: ${isCorrect ? 'correct' : 'incorrect'} (+${points} pts)`);

        } catch (error) {
            logger.error('Error submitting answer:', error.message);
            callback({ success: false });
        }
    });

    // Host muestra resultados
    socket.on('show-results', (correctAnswer) => {
        try {
            const room = rooms.get(socket.roomCode);
            if (!room || room.host !== socket.id) {
                logger.warn(`Unauthorized show-results attempt by ${socket.id}`);
                return;
            }

            room.gameState = 'results';
            room.lastActivity = Date.now();

            // Calcular clasificación
            const leaderboard = Array.from(room.players.values())
                .map(p => ({
                    name: p.name,
                    score: p.score,
                    correctAnswers: p.correctAnswers
                }))
                .sort((a, b) => b.score - a.score);

            // Enviar resultados a todos
            io.to(socket.roomCode).emit('results', {
                correctAnswer,
                leaderboard
            });

            logger.info(`Results shown in room ${socket.roomCode} (${room.answers.size}/${room.players.size} answered)`);
        } catch (error) {
            logger.error('Error showing results:', error.message);
        }
    });

    // Finalizar juego
    socket.on('end-game', () => {
        try {
            const room = rooms.get(socket.roomCode);
            if (!room || room.host !== socket.id) {
                logger.warn(`Unauthorized end-game attempt by ${socket.id}`);
                return;
            }

            room.gameState = 'finished';
            room.lastActivity = Date.now();

            const finalLeaderboard = Array.from(room.players.values())
                .map(p => ({
                    name: p.name,
                    score: p.score,
                    correctAnswers: p.correctAnswers
                }))
                .sort((a, b) => b.score - a.score);

            io.to(socket.roomCode).emit('game-ended', {
                leaderboard: finalLeaderboard
            });

            logger.info(`Game ended in room ${socket.roomCode}. Winner: ${finalLeaderboard[0]?.name || 'N/A'} (${finalLeaderboard[0]?.score || 0} pts)`);
        } catch (error) {
            logger.error('Error ending game:', error.message);
        }
    });

    // Manejo de desconexión
    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);

        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        try {
            if (socket.isHost) {
                // Host desconectado
                io.to(roomCode).emit('host-disconnected');
                rooms.delete(roomCode);
                logger.info(`Room ${roomCode} deleted (host disconnected)`);
            } else {
                // Jugador desconectado
                const player = room.players.get(socket.id);
                if (player) {
                    room.players.delete(socket.id);
                    room.lastActivity = Date.now();

                    const playersList = Array.from(room.players.values()).map(p => ({
                        name: p.name,
                        score: p.score
                    }));

                    io.to(roomCode).emit('players-updated', { players: playersList });
                    logger.info(`Player "${player.name}" left room ${roomCode}`);
                }
            }
        } catch (error) {
            logger.error('Error handling disconnect:', error.message);
        }
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
httpServer.listen(CONFIG.PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();

    console.log('\n' + '='.repeat(60));
    console.log('  🎮 QUIZ MULTIPLAYER SERVER - VERSIÓN MEJORADA');
    console.log('='.repeat(60));
    console.log(`  ✓ Servidor iniciado correctamente`);
    console.log(`  📅 Fecha: ${getTimestamp()}`);
    console.log(`  🔌 Puerto: ${CONFIG.PORT}`);
    console.log(`  🌐 Acceso Local:  http://localhost:${CONFIG.PORT}`);
    console.log(`  📱 Acceso Red:    http://${localIP}:${CONFIG.PORT}`);
    console.log('  ─'.repeat(60));
    console.log(`  👥 Máx. jugadores por sala: ${CONFIG.MAX_PLAYERS_PER_ROOM}`);
    console.log(`  🧹 Limpieza de salas: cada ${CONFIG.ROOM_CLEANUP_INTERVAL / 60000} min`);
    console.log(`  🐛 Modo Debug: ${CONFIG.DEBUG ? 'ACTIVADO' : 'DESACTIVADO'}`);
    console.log('='.repeat(60));
    console.log('\n  📖 Para conectar jugadores, usa:');
    console.log(`     http://${localIP}:${CONFIG.PORT}/quiz-multiplayer/player.html`);
    console.log('\n  🎯 Para abrir el host:');
    console.log(`     http://localhost:${CONFIG.PORT}/quiz-multiplayer/host.html`);
    console.log('\n' + '='.repeat(60) + '\n');

    logger.info('Server started successfully');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, closing server...');
    httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, closing server...');
    httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});
