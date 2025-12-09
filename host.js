const socket = io();
let roomCode = null;
let currentLeaderboardData = [];
let timerInterval = null;
let questions = [
    { question: "Quina és la funció principal de l'Aparell Circulatori?", answers: ["Digerir els aliments", "Transportar substàncies i retirar residus", "Filtrar l'aire que respirem", "Controlar els moviments dels músculs"], correct: 1 },
    { question: "De què està format el plasma sanguini principalment?", answers: ["De glòbuls vermells", "D'aigua i substàncies dissoltes", "De greix", "D'oxigen pur"], correct: 1 },
    { question: "Quina cèl·lula sanguínia NO té nucli?", answers: ["El glòbul blanc", "La neurona", "El glòbul vermell (eritròcit)", "La cèl·lula epitelial"], correct: 2 },
    { question: "Quina és la funció dels glòbuls blancs (leucòcits)?", answers: ["Transportar oxigen", "Coagular la sang", "Defensar el cos d'infeccions", "Donar color vermell a la sang"], correct: 2 },
    { question: "Què fan les plaquetes quan ens fem un tall?", answers: ["S'agrupen per fer un tap (coàgul)", "Surten del cos per netejar la ferida", "Es converteixen en pell nova", "Ataquen els bacteris"], correct: 0 },
    { question: "Quin vas sanguini treu la sang del cor a alta pressió?", answers: ["La vena", "L'artèria", "El capil·lar", "La vàlvula"], correct: 1 },
    { question: "Per què les venes tenen vàlvules a l'interior?", answers: ["Per filtrar la sang", "Per impulsar la sang més ràpid", "Per evitar que la sang retrocedeixi", "Per separar l'oxigen del CO₂"], correct: 2 },
    { question: "On es produeix l'intercanvi de gasos i nutrients amb les cèl·lules?", answers: ["A les artèries", "A les venes", "Als capil·lars", "Dins del cor"], correct: 2 },
    { question: "Quantes cambres (cavitats) té el cor humà?", answers: ["Dues", "Tres", "Quatre", "Cinc"], correct: 2 },
    { question: "Quina part del cor rep la sang que arriba del cos?", answers: ["Els ventricles", "Les aurícules", "L'aorta", "Les vàlvules"], correct: 1 },
    { question: "Què és l'envà (septe) del cor?", answers: ["Una vàlvula que s'obre i es tanca", "La paret que separa la part dreta de l'esquerra", "L'artèria més gran del cos", "El múscul que envolta el cor"], correct: 1 },
    { question: "Com es diu la fase del batec en què el cor es contrau i expulsa sang?", answers: ["Diàstole", "Sístole", "Relaxació", "Coagulació"], correct: 1 },
    { question: "Què passa durant la Diàstole?", answers: ["El cor es relaxa i s'omple de sang", "El cor es contrau fortament", "La sang surt cap a les artèries", "Les vàlvules es tanquen de cop"], correct: 0 },
    { question: "En el Circuit Pulmonar, on va la sang que surt del cor?", answers: ["Al cervell", "A tot el cos", "Als pulmons", "Als ronyons"], correct: 2 },
    { question: "De quin color representem la sang rica en oxigen?", answers: ["Blau", "Vermell brillant", "Groc", "Verd"], correct: 1 },
    { question: "Què vol dir que la circulació és \"doble\"?", answers: ["Que tenim dos cors", "Que la sang passa dues vegades pel cor", "Que la sang pot anar en dues direccions", "Que tenim artèries i venes"], correct: 1 },
    { question: "Quina malaltia provoca cansament per falta de ferro o glòbuls vermells?", answers: ["Leucèmia", "Hipertensió", "Anèmia", "Infart"], correct: 2 },
    { question: "Què és l'Aterosclerosi?", answers: ["Tenir el cor massa gran", "Acumulació de colesterol a les artèries", "Una infecció de la sang", "Tenir la pressió baixa"], correct: 1 },
    { question: "Per què és perillosa la Hipertensió?", answers: ["Perquè la sang va massa lenta", "Perquè pot trencar vasos sanguinis", "Perquè provoca falta de gana", "Perquè fa que tinguis massa glòbuls vermells"], correct: 1 },
    { question: "Quin hàbit és bo per al cor?", answers: ["Fumar", "Menjar molta sal i greixos", "El sedentarisme", "Fer exercici físic regularment"], correct: 3 }
];
let currentQuestionIndex = -1;
let leaderboardTimeout = null;
let currentScreen = 'waiting';

// DOM Elements
const screens = {
    waiting: document.getElementById('waitingScreen'),
    question: document.getElementById('questionScreen'),
    roundLeaderboard: document.getElementById('roundLeaderboardScreen'),
    final: document.getElementById('finalScreen')
};

const els = {
    roomCode: document.getElementById('roomCode'),
    playerCount: document.getElementById('playerCount'),
    playersGrid: document.getElementById('playersGrid'),
    startBtn: document.getElementById('startBtn'),
    questionNumber: document.getElementById('questionNumber'),
    questionText: document.getElementById('questionText'),
    answersGrid: document.getElementById('answersGrid'),
    timer: document.getElementById('timer'),
    answeredCount: document.getElementById('answeredCount'),
    nextBtn: document.getElementById('nextBtn'),
    nextQuestionBtn: document.getElementById('nextQuestionBtn'),
    roundLeaderboardList: document.getElementById('roundLeaderboardList'),
    finalLeaderboardList: document.getElementById('finalLeaderboardList'),
    endBtn: document.getElementById('endBtn')
};

// --- Socket Events ---

socket.on('connect', () => {
    console.log('✅ Connected to server');
    if (!roomCode) {
        socket.emit('create-room', (response) => {
            if (response.success) {
                roomCode = response.code;
                els.roomCode.textContent = roomCode;
            }
        });
    }
});

socket.on('players-updated', (data) => {
    updatePlayersList(data.players);
    // Auto-finish if player disconnected during active question
    // and now all remaining players have answered
    const answeredCount = parseInt(els.answeredCount.textContent) || 0;
    const totalPlayers = data.players.length;

    if (isQuestionActive && totalPlayers > 0 && answeredCount >= totalPlayers) {
        finishQuestion();
    }
});

socket.on('player-answered', (data) => {
    els.answeredCount.textContent = data.answeredCount;
    // Auto-finish logic
    if (data.totalPlayers > 0 && data.answeredCount >= data.totalPlayers) {
        finishQuestion();
    }
});

socket.on('results', (data) => {
    currentLeaderboardData = data.leaderboard;
});

socket.on('game-ended', (data) => {
    showScreen('final');
    renderLeaderboard(els.finalLeaderboardList, data.leaderboard);
});

// --- Game Logic ---

function updatePlayersList(players) {
    els.playerCount.textContent = players.length;
    els.playersGrid.innerHTML = players.map(p => `
        <div class="player-chip">
            <div class="avatar-circle">${p.name.charAt(0).toUpperCase()}</div>
            <span>${p.name}</span>
        </div>
    `).join('');
    els.startBtn.disabled = players.length === 0;
}

function startGame() {
    socket.emit('start-game');
    nextQuestion();
}

let isQuestionActive = false;

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    isQuestionActive = true; // Mark question as active
    showScreen('question');

    // Reset UI
    els.nextBtn.textContent = "Finalitzar Pregunta";
    els.nextBtn.onclick = finishQuestion;
    els.nextBtn.style.display = 'block';

    const q = questions[currentQuestionIndex];
    els.questionNumber.textContent = `Pregunta ${currentQuestionIndex + 1} / ${questions.length}`;
    els.questionText.textContent = q.question;
    els.answeredCount.textContent = '0';

    const colors = ['red', 'blue', 'yellow', 'green'];
    els.answersGrid.innerHTML = q.answers.map((ans, i) => `
        <div class="answer-option ${colors[i]}" id="ans-${i}">
            ${ans}
        </div>
    `).join('');

    socket.emit('show-question', {
        questionNumber: currentQuestionIndex + 1,
        totalQuestions: questions.length,
        question: q.question,
        answers: q.answers,
        correctAnswer: q.correct
    });

    startTimer();
}

function startTimer() {
    let timeLeft = 30; // Increased to 30 seconds
    els.timer.textContent = timeLeft;
    els.timer.classList.remove('warning');

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        els.timer.textContent = timeLeft;
        if (timeLeft <= 5) els.timer.classList.add('warning');
        if (timeLeft <= 0) finishQuestion();
    }, 1000);
}

function finishQuestion() {
    // Race condition protection
    if (!isQuestionActive) return;
    isQuestionActive = false;

    clearInterval(timerInterval);
    const correct = questions[currentQuestionIndex].correct;

    // Visual feedback
    for (let i = 0; i < 4; i++) {
        const el = document.getElementById(`ans-${i}`);
        if (i === correct) el.classList.add('highlight');
        else el.classList.add('dimmed');
    }

    socket.emit('show-results', correct);

    // Auto abrir ranking tras breve pausa
    els.nextBtn.style.display = 'none';
    setTimeout(showRoundLeaderboard, 2000); // More time to see result
}

function showRoundLeaderboard() {
    showScreen('roundLeaderboard');
    renderLeaderboard(els.roundLeaderboardList, currentLeaderboardData.slice(0, 5));
    if (leaderboardTimeout) clearTimeout(leaderboardTimeout);
    /* Auto-advance removed so host controls pace manually
    leaderboardTimeout = setTimeout(() => {
        if (leaderboardTimeout) {
            clearTimeout(leaderboardTimeout);
            leaderboardTimeout = null;
        }
        nextQuestion();
    }, 5000);
    */
}

function renderLeaderboard(container, data) {
    container.innerHTML = data.map((p, i) => `
        <div class="lb-row">
            <div class="lb-rank">#${i + 1}</div>
            <div class="lb-name">${p.name}</div>
            <div class="lb-score">${p.score} pts</div>
        </div>
    `).join('');
}

function endGame() {
    clearInterval(timerInterval);
    socket.emit('end-game');
}

function showScreen(name) {
    const prev = screens[currentScreen];
    const next = screens[name];
    if (prev && !prev.classList.contains('hidden')) {
        prev.classList.remove('transition-in');
        prev.classList.add('transition-out');
        setTimeout(() => {
            prev.classList.add('hidden');
            prev.classList.remove('transition-out');
        }, 200);
    }
    next.classList.remove('hidden');
    next.classList.add('transition-in');
    setTimeout(() => next.classList.remove('transition-in'), 350);
    currentScreen = name;
}

// --- Event Listeners ---
els.startBtn.addEventListener('click', startGame);
els.nextQuestionBtn.addEventListener('click', nextQuestion);
els.endBtn.addEventListener('click', endGame);
