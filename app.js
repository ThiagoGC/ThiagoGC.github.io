import { bibleData } from './database.js';

let currentTheme = "";
let themeQuestions = [];
let currentQIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 30;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('theme-select');
    Object.keys(bibleData).forEach(theme => {
        let opt = document.createElement('option');
        opt.value = theme;
        opt.innerText = theme;
        themeSelect.appendChild(opt);
    });

    document.getElementById('btn-start').addEventListener('click', startQuiz);
    document.getElementById('btn-next').addEventListener('click', nextQuestion);
});

function startQuiz() {
    const themeSelect = document.getElementById('theme-select');
    currentTheme = themeSelect.value;
    if (!currentTheme) return alert("Escolha um tema!");

    score = 0;
    currentQIndex = 0;
    themeQuestions = [...bibleData[currentTheme]].sort(() => Math.random() - 0.5);

    document.getElementById('setup-area').style.display = 'none';
    document.getElementById('quiz-area').style.display = 'block';
    document.getElementById('theme-display').innerText = currentTheme;
    loadQuestion();
}

function loadQuestion() {
    const qData = themeQuestions[currentQIndex];
    
    // Reset UI
    document.getElementById('feedback-area').style.display = 'none';
    document.getElementById('options-container').innerHTML = '';
    document.getElementById('verse-text').innerText = qData.text;
    document.getElementById('score-display').innerText = score;

    // Barra de Progresso
    const pct = (currentQIndex / themeQuestions.length) * 100;
    document.getElementById('progress-bar').style.width = pct + "%";

    // Opções
    let options = [{ ref: qData.ref, correct: true }];
    let allRefs = [];
    Object.values(bibleData).flat().forEach(i => { if(i.ref !== qData.ref) allRefs.push(i.ref) });
    allRefs.sort(() => Math.random() - 0.5);
    options.push({ ref: allRefs[0], correct: false });
    options.push({ ref: allRefs[1], correct: false });
    options.push({ ref: allRefs[2], correct: false });
    options.sort(() => Math.random() - 0.5);

    const container = document.getElementById('options-container');
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.ref;
        btn.onclick = () => checkAnswer(btn, opt.correct, qData);
        container.appendChild(btn);
    });

    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 30;
    document.getElementById('timer').innerText = timeLeft;
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            checkAnswer(null, false, themeQuestions[currentQIndex]);
        }
    }, 1000);
}

function checkAnswer(btn, isCorrect, qData) {
    clearInterval(timerInterval);
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

    const title = document.getElementById('feedback-title');
    if(isCorrect && btn) {
        btn.classList.add('correct');
        score += 10;
        title.innerText = "Correto! 🎉";
        title.style.color = "var(--success)";
    } else {
        if(btn) btn.classList.add('wrong');
        title.innerText = "Incorreto 📚";
        title.style.color = "var(--error)";
        // Mostrar a correta
        document.querySelectorAll('.option-btn').forEach(b => {
            if(b.innerText === qData.ref) b.classList.add('correct');
        });
    }
    
    document.getElementById('score-display').innerText = score;
    showFeedback(qData);
}

function showFeedback(qData) {
    document.getElementById('feedback-area').style.display = 'block';
    document.getElementById('correct-answer-display').innerText = `Referência: ${qData.ref}`;

    // PREENCHER DADOS RICOS (Se existirem)
    // Se 'details' não existir, usa textos genéricos para não quebrar
    const details = qData.details || {};
    
    document.getElementById('info-context').innerText = details.context || qData.context || "Sem contexto disponível.";
    document.getElementById('info-greek').innerText = details.greek || "---";
    document.getElementById('info-application').innerText = details.application || "---";
    document.getElementById('info-curiosity').innerText = details.curiosity || "---";
    document.getElementById('info-quote').innerText = details.quote || "";

    // Resetar para primeira aba
    window.openTab('ctx');
}

function nextQuestion() {
    currentQIndex++;
    if(currentQIndex < themeQuestions.length) loadQuestion();
    else {
        alert(`Fim do Quiz! Pontuação: ${score}`);
        location.reload();
    }
}

// Função Global para o HTML acessar
window.openTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById('tab-' + tabName).style.display = 'block';
    
    // Adicionar classe active ao botão clicado (logica simplificada)
    // No clique real, o event.target funciona
    if(event && event.currentTarget) event.currentTarget.classList.add('active');
    // Fallback para chamada via código (showFeedback)
    else if(tabName === 'ctx') document.querySelector('.tab-btn').classList.add('active'); 
}