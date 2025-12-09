const analyzeBtn = document.getElementById('analyze-btn');
const messageInput = document.getElementById('message-input');
const resultSection = document.getElementById('result-section');
const errorMessage = document.getElementById('error-message');
const moodLabel = document.getElementById('mood-label');
const moodEmoji = document.getElementById('mood-emoji');
const confidenceText = document.getElementById('confidence-text');
const confidenceFill = document.getElementById('confidence-fill');
const moodAdvice = document.getElementById('mood-advice');
const bgGradient = document.getElementById('bg-gradient');
const bubblesContainer = document.getElementById('bubbles-container');

// Mood Configurations
const moods = {
  '1 star': { label: 'Very Negative', emoji: '😡', gradient: 'var(--bg-purple-dark)', advice: "It seems things are tough. Maybe give them some space?" },
  'Very Negative': { label: 'Very Negative', emoji: '😡', gradient: 'var(--bg-purple-dark)', advice: "It seems things are tough. Maybe give them some space?" },
  '2 stars': { label: 'Negative', emoji: '😟', gradient: 'var(--bg-blue-gray)', advice: "Sounds a bit upset. Try to listen calmly." },
  'Negative': { label: 'Negative', emoji: '😟', gradient: 'var(--bg-blue-gray)', advice: "Sounds a bit upset. Try to listen calmly." },
  '3 stars': { label: 'Neutral', emoji: '😐', gradient: 'var(--bg-lavender-blue)', advice: "Hard to say... maybe ask for clarification?" },
  'Neutral': { label: 'Neutral', emoji: '😐', gradient: 'var(--bg-lavender-blue)', advice: "Hard to say... maybe ask for clarification?" },
  '4 stars': { label: 'Positive', emoji: '🙂', gradient: 'var(--bg-yellow-mint)', advice: "Looks good! Keep the vibes going." },
  'Positive': { label: 'Positive', emoji: '🙂', gradient: 'var(--bg-yellow-mint)', advice: "Looks good! Keep the vibes going." },
  '5 stars': { label: 'Very Positive', emoji: '❤️', gradient: 'var(--bg-pink-orange)', advice: "Love is in the air! bold!" },
  'Very Positive': { label: 'Very Positive', emoji: '❤️', gradient: 'var(--bg-pink-orange)', advice: "Love is in the air! bold!" }
};

analyzeBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();

  // Clear previous errors and results
  errorMessage.classList.add('hidden');
  resultSection.classList.add('hidden');
  bubblesContainer.innerHTML = ''; // Clear floating bubbles

  if (!text) {
    showError("Please type a message first!");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('http://localhost:8000/analyse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    const data = await response.json();

    displayResult(data);

  } catch (error) {
    console.error(error);
    showError("Failed to analyze.");
  } finally {
    setLoading(false);
  }
});

function displayResult(data) {
  // Assuming backend returns { label: "5 stars", score: 0.9 }
  // Ideally we map the label to our mood config.
  // The model provided in instructions returns labels like "1 star", "5 stars" etc.

  const moodConfig = moods[data.label] || moods['3 stars']; // Fallback to Neutral

  moodLabel.textContent = moodConfig.label; // Or data.label if you prefer
  moodEmoji.textContent = moodConfig.emoji;
  moodAdvice.textContent = moodConfig.advice;

  // Update background
  bgGradient.style.backgroundImage = moodConfig.gradient;

  // Confidence
  const percentage = Math.round(data.score * 100);
  confidenceText.textContent = `Confidence: ${percentage}%`;
  confidenceFill.style.width = `${percentage}%`;

  // Show Result
  resultSection.classList.remove('hidden');

  // Create Bubbles
  createBubbles(moodConfig.emoji);
}

function createBubbles(emoji) {
  const bubbleCount = 15;
  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('mood-bubble');
    bubble.textContent = emoji;

    // Randomize position and size
    const size = Math.random() * 1.5 + 2; // 2rem to 3.5rem
    const left = Math.random() * 100; // 0% to 100%
    const delay = Math.random() * 5; // 0s to 5s
    const duration = Math.random() * 5 + 5; // 5s to 10s

    bubble.style.width = `${size}rem`;
    bubble.style.height = `${size}rem`;
    bubble.style.left = `${left}%`;
    bubble.style.animationDelay = `${delay}s`;
    bubble.style.animationDuration = `${duration}s`;

    bubblesContainer.appendChild(bubble);
  }
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.remove('hidden');
}

function setLoading(isLoading) {
  if (isLoading) {
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    analyzeBtn.disabled = true;
  } else {
    analyzeBtn.innerHTML = '<i class="fas fa-search-heart"></i> Analyze';
    analyzeBtn.disabled = false;
  }
}
