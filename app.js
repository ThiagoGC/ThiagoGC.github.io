import { bibleData } from './database.js';

let currentTheme = "";
let themeQuestions = [];
let currentQIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 30;
let currentLevel = 1;

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
    currentLevel = parseInt(document.getElementById('level-select').value);

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
    document.getElementById('score-display').innerText = score;

    // Barra de Progresso
    const pct = (currentQIndex / themeQuestions.length) * 100;
    document.getElementById('progress-bar').style.width = pct + "%";

    // Configuração baseada no Nível
    let questionText = "";
    let options = [];
    let correctLabel = "";

    if (currentLevel === 1) {
        // Nível 1: Mostra Texto -> Adivinha Referência
        document.querySelector('.verse-hint').innerText = "Onde está escrito?";
        questionText = qData.text;
        correctLabel = qData.ref;
        
        // Gerar opções de Referência
        options.push({ label: qData.ref, correct: true });
        let allRefs = Object.values(bibleData).flat().map(i => i.ref).filter(r => r !== qData.ref);
        allRefs.sort(() => Math.random() - 0.5);
        options.push({ label: allRefs[0], correct: false });
        options.push({ label: allRefs[1], correct: false });
        options.push({ label: allRefs[2], correct: false });
    } else {
        // Nível 2: Mostra Referência -> Adivinha Texto
        document.querySelector('.verse-hint').innerText = "O que diz em " + qData.ref + "?";
        questionText = "..."; // Oculta o texto principal pois ele é a resposta
        correctLabel = qData.text;

        // Gerar opções de Texto
        options.push({ label: qData.text, correct: true });
        let allTexts = Object.values(bibleData).flat().map(i => i.text).filter(t => t !== qData.text);
        allTexts.sort(() => Math.random() - 0.5);
        options.push({ label: allTexts[0], correct: false });
        options.push({ label: allTexts[1], correct: false });
        options.push({ label: allTexts[2], correct: false });
    }

    document.getElementById('verse-text').innerText = questionText;
    options.sort(() => Math.random() - 0.5);

    const container = document.getElementById('options-container');
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.label;
        // Ajuste de fonte para textos longos (Nível 2)
        if(opt.label.length > 50) btn.style.fontSize = "0.9rem";
        
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
        const correctText = (currentLevel === 1) ? qData.ref : qData.text;
        document.querySelectorAll('.option-btn').forEach(b => {
            if(b.innerText === correctText) b.classList.add('correct');
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
