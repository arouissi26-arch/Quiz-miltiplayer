const socket = io();
let playerName = '';
let hasAnswered = false;

// Elements
const els = {
    joinScreen: document.getElementById('joinScreen'),
    waitingScreen: document.getElementById('waitingScreen'),
    questionScreen: document.getElementById('questionScreen'),
    waitingResultScreen: document.getElementById('waitingResultScreen'),
    resultScreen: document.getElementById('resultScreen'),
    finalScreen: document.getElementById('finalScreen'),

    roomCodeInput: document.getElementById('roomCodeInput'),
    nameInput: document.getElementById('nameInput'),
    joinBtn: document.getElementById('joinBtn'),
    errorMsg: document.getElementById('errorMsg'),

    playerNameDisplay: document.getElementById('playerNameDisplay'),
    qIndicator: document.getElementById('qIndicator'),
    qText: document.getElementById('qText'),
    mobileAnswers: document.getElementById('mobileAnswers'),

    resultIcon: document.getElementById('resultIcon'),
    resultTitle: document.getElementById('resultTitle'),
    pointsEarned: document.getElementById('pointsEarned'),

    finalRank: document.getElementById('finalRank'),
    finalScore: document.getElementById('finalScore')
};

// --- Core Logic ---

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
}

function showError(msg) {
    els.errorMsg.textContent = msg;
    els.errorMsg.classList.remove('hidden');
    setTimeout(() => els.errorMsg.classList.add('hidden'), 3000);
}

function joinGame() {
    const code = els.roomCodeInput.value.trim();
    const name = els.nameInput.value.trim();

    if (code.length !== 6) return showError('El codi ha de tenir 6 dígits');
    if (name.length < 2) return showError('El nom és massa curt');

    els.joinBtn.disabled = true;
    els.joinBtn.textContent = 'Connectant...';

    socket.emit('join-room', { code, name }, (res) => {
        els.joinBtn.disabled = false;
        els.joinBtn.textContent = 'Entrar';

        if (res.success) {
            playerName = name;
            els.playerNameDisplay.textContent = name;
            showScreen('waitingScreen');
        } else {
            showError(res.message);
        }
    });
}

let currentAnswerIndex = null;

function submitAnswer(index) {
    if (hasAnswered) return;
    hasAnswered = true;
    currentAnswerIndex = index; // Store for later comparison

    showScreen('waitingResultScreen');

    socket.emit('submit-answer', {
        answerIndex: index,
        timeLeft: 15 // Simplified
    }, (res) => {
        // Just handle error, result logic moved to 'results' event
        if (!res.success) {
            showError('Error enviant resposta');
        }
    });
}

function showResult(isCorrect, points) {
    showScreen('resultScreen');
    if (isCorrect) {
        els.resultIcon.textContent = '✨';
        els.resultTitle.textContent = 'Correcte!';
        els.resultTitle.style.color = '#10B981';
        els.pointsEarned.textContent = `+${points}`;
    } else {
        els.resultIcon.textContent = '❌';
        els.resultTitle.textContent = 'Incorrecte';
        els.resultTitle.style.color = '#EF4444';
        els.pointsEarned.textContent = '0';
    }
}

// --- Socket Events ---

socket.on('game-started', () => {
    showScreen('waitingScreen');
});

socket.on('question', (data) => {
    hasAnswered = false;
    currentAnswerIndex = null;
    showScreen('questionScreen');
    document.querySelector('.player-container').classList.add('full');
    els.questionScreen.classList.add('fullscreen');
    els.qIndicator.textContent = `${data.questionNumber}/${data.totalQuestions}`;
    els.qText.textContent = data.question;

    const colors = ['opt-red', 'opt-blue', 'opt-yellow', 'opt-green'];
    els.mobileAnswers.classList.add('full');
    els.mobileAnswers.innerHTML = data.answers.map((ans, i) => `
        <button class="answer-card full ${colors[i]}" onclick="submitAnswer(${i})">
            ${ans}
        </button>
    `).join('');
});

socket.on('results', (data) => {
    const isCorrect = currentAnswerIndex === data.correctAnswer;
    // Note: Points calculation here is simplified/client-side estimate or 0, 
    // ideally server sends points earned in this event for this specific player, 
    // but for now we follow the requirement: show if it was correct.
    // If we want exact points, we'd need to look up in leaderboard or modify server to send it individually.
    // For now, we'll show "Correcte!" without specific points or assume standard points if we want.
    // Let's keep it simple: Correct/Incorrect.

    // We can iterate leaderboard to find our points if needed, but let's just show Correct/Incorrect first.
    let points = isCorrect ? 'OK' : 0;

    // Attempt to find points in leaderboard if available
    if (data.leaderboard) {
        const myData = data.leaderboard.find(p => p.name === playerName);
        // This is total score, not round points. 
        // We'll stick to just showing Correct/Incorrect state.
    }

    showResult(isCorrect, isCorrect ? "Ben fet!" : 0);

    document.querySelector('.player-container').classList.remove('full');
    els.questionScreen.classList.remove('fullscreen');
    els.mobileAnswers.classList.remove('full');
});

socket.on('game-ended', (data) => {
    showScreen('finalScreen');
    const myData = data.leaderboard.find(p => p.name === playerName);
    const rank = data.leaderboard.findIndex(p => p.name === playerName) + 1;
    els.finalRank.textContent = `Posició #${rank}`;
    els.finalScore.textContent = `${myData ? myData.score : 0} pts`;
});

socket.on('host-disconnected', () => {
    alert('Host desconnectat');
    location.reload();
});

// --- Keyboard Support ---
els.roomCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') els.nameInput.focus();
});
els.nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinGame();
});

function initFXPlayer() {
    const overlay = document.createElement('div');
    overlay.id = 'fxOverlayPlayer';
    const canvas = document.createElement('canvas');
    canvas.id = 'starsPlayer';
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);
    startStars(canvas);
}

function startStars(canvas) {
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let stars = [];
    let shooters = [];
    const starCount = 120;
    for (let i = 0; i < starCount; i++) stars.push(newStar());
    function newStar() {
        return { x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.5 + 0.2, tw: Math.random() * 0.02 + 0.005, a: Math.random() * Math.PI * 2 };
    }
    function newShooter() {
        const y = Math.random() * h * 0.7;
        const x = Math.random() * w * 0.3;
        const ang = Math.random() * Math.PI / 5 + Math.PI / 6;
        const sp = Math.random() * 9 + 7;
        return { x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0, max: 50 };
    }
    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (let s of stars) {
            s.a += s.tw;
            const glow = (Math.sin(s.a) + 1) * 0.5;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r + glow, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fill();
        }
        if (Math.random() < 0.02 && shooters.length < 2) shooters.push(newShooter());
        for (let sh of shooters) {
            sh.life++;
            ctx.strokeStyle = 'rgba(255,255,255,' + (1 - sh.life / sh.max) + ')';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sh.x, sh.y);
            ctx.lineTo(sh.x - sh.vx * 2, sh.y - sh.vy * 2);
            ctx.stroke();
            sh.x += sh.vx;
            sh.y += sh.vy;
        }
        shooters = shooters.filter(s => s.life < s.max);
        requestAnimationFrame(draw);
    }
    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    draw();
}

function startBrandTypewriter() {
    const el = document.getElementById('brandTyper');
    if (!el) return;
    const words = ['Uneix-te', 'Aprèn', 'Respon', 'Guanya'];
    typeCycle(el, words, 90, 1000);
}

function typeCycle(el, words, speed, pause) {
    let wi = 0;
    let idx = 0;
    let del = false;
    function step() {
        const w = words[wi];
        if (!del) {
            idx++;
            el.textContent = w.slice(0, idx);
            if (idx >= w.length) {
                del = true;
                setTimeout(step, pause);
                return;
            }
        } else {
            idx--;
            el.textContent = w.slice(0, Math.max(0, idx));
            if (idx <= 0) {
                del = false;
                wi = (wi + 1) % words.length;
            }
        }
        setTimeout(step, speed);
    }
    step();
}
