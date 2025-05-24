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
    let timeLeft = 60; 
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
        quizHeader.classList.remove('hide'); 
        controlsContainer.classList.remove('hide');
        startButton.classList.remove('hide');
        saveScoreButton.disabled =false;
        playerNameInput.disabled = false;
        playerNameInput.value ='';
        scoreElement.textContent = 0;
        timerElement.textContent="";
        feedbackContainer.textContent='';
        feedbackContainer.className ='feedback';
        loadLeaderboard(); 
    });

    //SAVE SCORE BTN EVENT
    saveScoreButton.addEventListener('click', saveScore);


    //FUNCTIONS
    //FETCH QUESTIONS
    async function fetchQuestions() {
        try {
            const response = await fetch('questions.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data || data.length === 0) {
                throw new Error('No questions found or data is invalid.');
            }
            questions = data;
            return true;
        } catch (error) {
            console.error("Failed to load questions:", error);
            showError(`Error loading questions: ${error.message}. Please try refreshing the page or check the questions file.`);
            return false;
        }
    }

    //START GAME
    async function startGame() {
        showError(''); // Clear previous errors
        const questionsLoaded = await fetchQuestions();
        if (!questionsLoaded) return;

        startButton.classList.add('hide');
        resultsContainer.classList.add('hide');
        feedbackContainer.textContent = '';
        feedbackContainer.className = 'feedback'; 
        questionContainerElement.classList.remove('hide');
        quizHeader.classList.remove('hide'); 
        controlsContainer.classList.remove('hide'); 

        saveScoreButton.disabled = false;
        playerNameInput.disabled = false;
        playerNameInput.value = '';
        
        shuffledQuestions = questions.sort(() => Math.random() - 0.5);
        currentQuestionIndex = 0;
        score = 0;
        updateScoreDisplay();
        setNextQuestion();
        loadLeaderboard(); 
    }

    //SET NEXT QUESTION
    function setNextQuestion() {
        resetState();
        if (currentQuestionIndex < shuffledQuestions.length) {
            showQuestion(shuffledQuestions[currentQuestionIndex]);
            startTimer();
        } else {
            endGame();
        }
    }

    //SHOW QUESTION
    function showQuestion(question) {
        questionTextElement.innerText = question.question;
        if (!question.options || question.options.length === 0) {
            showError("Question format error: No options provided.");
            // Skip to next question or end game if critical
            if (currentQuestionIndex < shuffledQuestions.length - 1) {
                currentQuestionIndex++;
                setNextQuestion();
            } else {
                endGame();
            }
            return;
        }
        question.options.forEach(optionText => {
            const button = document.createElement('button');
            button.innerText = optionText;
            button.classList.add('btn');
            button.addEventListener('click', () => selectAnswer(button, optionText, question.answer));
            answerButtonsElement.appendChild(button);
        });
    }

    //RESET STATE
    function resetState() {
        clearStatusClass(document.body); // Clear status from body if applied
        nextButton.classList.add('hide');
        feedbackContainer.textContent = '';
        feedbackContainer.className = 'feedback';
        while (answerButtonsElement.firstChild) {
            answerButtonsElement.removeChild(answerButtonsElement.firstChild);
        }
        clearInterval(timer); // Clear previous timer
        timeLeft = 60; // Reset timer for the new question
        timerElement.textContent = timeLeft;
    }

    //SELECT ANSWER
    function selectAnswer(selectedButton, selectedOption, correctAnswer) {
        clearInterval(timer); // Stop timer on answer selection
        const correct = selectedOption === correctAnswer;

        Array.from(answerButtonsElement.children).forEach(button => {
            button.disabled = true; // Disable all buttons after an answer
            setStatusClass(button, button.innerText === correctAnswer);
        });

        if (correct) {
            score++;
            updateScoreDisplay();
            feedbackContainer.textContent = "Correct!";
            feedbackContainer.className = 'feedback correct';
        } else {
            feedbackContainer.textContent = `Wrong! The correct answer was: ${correctAnswer}`;
            feedbackContainer.className = 'feedback wrong';
        }

        if (shuffledQuestions.length > currentQuestionIndex + 1) {
            nextButton.classList.remove('hide');
        } else {
            // No "Next" button if it's the last question, go directly to results
            setTimeout(endGame, 1500); // Show feedback for a bit before ending
        }
    }

    //SET STATUS
    function setStatusClass(element, correct) {
        clearStatusClass(element);
        if (correct) {
            element.classList.add('correct');
        } else {
            element.classList.add('wrong');
        }
    }

    //CLEAR STATUS
    function clearStatusClass(element) {
        element.classList.remove('correct');
        element.classList.remove('wrong');
    }

    //UPDATE SCORE
    function updateScoreDisplay() {
        scoreElement.textContent = score;
    }

    //START TIMER
    function startTimer() {
        timerElement.textContent = timeLeft;
        timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                feedbackContainer.textContent = "Time's up!";
                feedbackContainer.className = 'feedback wrong';
                // Automatically move to next question or end game
                Array.from(answerButtonsElement.children).forEach(button => {
                    button.disabled = true; // Disable buttons
                    // Optionally show correct answer when time is up
                    if (button.innerText === shuffledQuestions[currentQuestionIndex].answer) {
                        setStatusClass(button, true);
                    }
                });
                if (shuffledQuestions.length > currentQuestionIndex + 1) {
                    nextButton.classList.remove('hide');
                } else {
                    setTimeout(endGame, 1500);
                }
            }
        }, 1000);
    }

    //END GAME
    function endGame() {
        clearInterval(timer);
        questionContainerElement.classList.add('hide');
        nextButton.classList.add('hide');
        controlsContainer.classList.add('hide'); // Hide next/start buttons container
        resultsContainer.classList.remove('hide');
        finalScoreElement.textContent = score;
        quizHeader.classList.add('hide'); // Hide score/timer during results
        playerNameInput.value = ''; // Clear previous name
        feedbackContainer.textContent='';
        feedbackContainer.className='feedback';
        loadLeaderboard(); // Show updated leaderboard
    }

    // Leaderboard
    function loadLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
        leaderboardList.innerHTML = ''; // Clear existing entries
        if (leaderboard.length === 0) {
            const li = document.createElement('li');
            li.textContent = "No scores yet. Be the first!";
            leaderboardList.appendChild(li);
        } else {
            leaderboard.forEach(entry => {
                const li = document.createElement('li');
                const nameSpan = document.createElement('span');
                nameSpan.textContent = entry.name;
                const scoreSpan = document.createElement('span');
                scoreSpan.textContent = entry.score;
                li.appendChild(nameSpan);
                li.appendChild(scoreSpan);
                leaderboardList.appendChild(li);
            });
        }
    }

    //SAVE SCORE
    function saveScore() {
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert("Please enter your name to save your score.");
            return;
        }

        const leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
        const newScoreEntry = { name: playerName, score: score };

        leaderboard.push(newScoreEntry);
        leaderboard.sort((a, b) => b.score - a.score); // Sort descending by score
        leaderboard.splice(MAX_LEADERBOARD_ENTRIES); // Keep only top N scores

        try {
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
            loadLeaderboard(); // Refresh the displayed leaderboard
            saveScoreButton.disabled = true; // Prevent multiple saves for the same game
            playerNameInput.disabled = true;
            alert("Score saved!");
        } catch (e) {
            console.error("Error saving to localStorage:", e);
            showError("Could not save score. Local storage might be full or disabled.");
        }
    }

    // ERROR HANDLING
    function showError(message) {
        if (message) {
            errorContainer.textContent = message;
            errorContainer.classList.remove('hide');
        } else {
            errorContainer.textContent = '';
            errorContainer.classList.add('hide');
        }
    }

    loadLeaderboard();

}
);