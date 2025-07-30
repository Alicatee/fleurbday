document.addEventListener('DOMContentLoaded', () => {
    // --- Emote Game Logic ---
    const emoteAnswerInput = document.getElementById('emote-answer-input');
    const checkEmoteAnswerBtn = document.getElementById('check-emote-answer');
    const emoteFeedback = document.getElementById('emote-feedback');

    if (emoteAnswerInput && checkEmoteAnswerBtn && emoteFeedback) {
        const correctAnswer = "happy birthday";

        function checkAnswer() {
            const userAnswer = emoteAnswerInput.value.trim().toLowerCase();
            if (userAnswer === correctAnswer) {
                emoteFeedback.textContent = "You got it! 🎉";
                emoteFeedback.style.color = '#22c55e'; // Green color for correct
            } else {
                emoteFeedback.textContent = "Not quite, try again! 🤔";
                emoteFeedback.style.color = '#ef4444'; // Red color for incorrect
            }
        }

        checkEmoteAnswerBtn.addEventListener('click', checkAnswer);

        // Optional: Allow pressing Enter to check the answer
        emoteAnswerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
    }
});
