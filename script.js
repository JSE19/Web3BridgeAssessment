document.addEventListener('DOMContentLoaded', () => {
    //DECLARING VARIABLES
    const startButton = document.getElementById('start-btn');
    const nextButton = document.getElementById('next-btn');
    const questionContainerElement = document.getElementById('question-container');
    const questionTextElement = document.getElementById('question-text');
    const answerButtonsElement = document.getElementById('answer-buttons');
    const feedbackContainer = document.getElementById('feedback-container');
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('time');
    const resultsContainer = document.getElementById('results-container');
    const finalScoreElement = document.getElementById('final-score');
    const playAgainButton = document.getElementById('play-again-btn');
    const errorContainer = document.getElementById('error-container');
    const playerNameInput = document.getElementById('player-name');
    const saveScoreButton = document.getElementById('save-score-btn');
    const leaderboardList = document.getElementById('leaderboard-list');
    const quizHeader = document.getElementById('quiz-header');
    const controlsContainer = document.getElementById('controls-container');

    let questions = [];
    let shuffledQuestions, currentQuestionIndex;
    let score = 0;
    let timer;
    let timeLeft = 60; // Default time per question
    const LEADERBOARD_KEY = 'quizLeaderboard';
    const MAX_LEADERBOARD_ENTRIES = 5;

    // EVENTS LISTENERS
    //START BTN EVENT
    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        setNextQuestion();
    });

    //PLAY BTN EVENT
    playAgainButton.addEventListener('click', () => {
        resultsContainer.classList.add('hide');
        quizHeader.classList.remove('hide'); // Show header again
        controlsContainer.classList.remove('hide'); // Show start button container
        startButton.classList.remove('hide');
        loadLeaderboard(); // Refresh leaderboard in case it was updated
    });

    //SAVE SCORE BTN EVENT
    saveScoreButton.addEventListener('click', saveScore);
}
);