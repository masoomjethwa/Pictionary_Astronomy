/**
 * Interactive Astronomy Pictionary Game Engine
 * 
 * A comprehensive game system for astronomy-themed Pictionary with:
 * - Multi-team support (up to 8 teams)
 * - Card management with 5 astronomy categories
 * - Timer system with visual countdown
 * - Board game mechanics with special spaces
 * - Local storage for game persistence
 * - Responsive design and accessibility features
 * 
 * @author AstroNova Interactive
 * @version 1.0.0
 * @license MIT
 */

// ===========================================
// GAME STATE MANAGEMENT
// ===========================================

/**
 * Global game state object
 * Contains all game data and current state
 */
let gameState = {
    id: null,                    // Database game ID (for future online features)
    teams: [],                   // Array of team objects
    currentTeamIndex: 0,         // Index of currently active team
    currentCard: null,           // Currently displayed card object
    timerInterval: null,         // Timer interval reference
    timerSeconds: 60,           // Timer duration in seconds
    isTimerRunning: false,      // Timer state flag
    cards: [],                  // Shuffled deck of all cards
    usedCards: [],              // Array of used card indices
    gameStarted: false,         // Whether game has begun
    isOnline: false,            // Online vs offline mode flag
    playerName: null,           // Current player name (for online mode)
    gameVersion: '1.0.0'        // Version tracking
};

/**
 * Team color palette for visual distinction
 * Maximum 8 teams supported with unique colors
 */
const teamColors = [
    '#f44336', '#2196f3', '#4caf50', '#ff9800', 
    '#9c27b0', '#00bcd4', '#795548', '#607d8b'
];

// ===========================================
// ASTRONOMY CARDS DATABASE
// ===========================================

/**
 * Comprehensive astronomy terms organized by categories
 * Each category contains educational terms for drawing/guessing
 */
const astronomyCards = {
    'Planets & Solar System': [
        'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
        'Sun', 'Moon', 'Solar System', 'Orbit', 'Ring System', 'Asteroid Belt',
        'Pluto', 'Dwarf Planet', 'Terrestrial Planet', 'Gas Giant', 'Ice Giant',
        'Lunar Eclipse', 'Solar Eclipse', 'Phases of Moon', 'Tidal Force', 'Solar Wind',
        'Spacecraft', 'Satellite', 'Comet Tail', 'Planetary Alignment'
    ],
    'Stars & Constellations': [
        'Big Dipper', 'Orion', 'Polaris', 'North Star', 'Supernova', 'White Dwarf',
        'Red Giant', 'Neutron Star', 'Binary Star', 'Star Cluster', 'Milky Way',
        'Cassiopeia', 'Ursa Major', 'Ursa Minor', 'Leo', 'Scorpius', 'Andromeda',
        'Southern Cross', 'Sirius', 'Betelgeuse', 'Rigel', 'Vega', 'Altair',
        'Constellation', 'Star Formation', 'Stellar Evolution', 'Magnitude'
    ],
    'Space Objects': [
        'Galaxy', 'Nebula', 'Black Hole', 'Comet', 'Asteroid', 'Meteor', 'Meteorite',
        'Shooting Star', 'Quasar', 'Pulsar', 'Supermassive Black Hole', 'Dark Matter',
        'Dark Energy', 'Cosmic Ray', 'Interstellar Medium', 'Planetary Nebula',
        'Globular Cluster', 'Open Cluster', 'Spiral Galaxy', 'Elliptical Galaxy',
        'Galaxy Collision', 'Cosmic Dust', 'Space Debris', 'Wormhole'
    ],
    'Space Exploration': [
        'Rocket', 'Satellite', 'Space Station', 'Astronaut', 'Space Shuttle',
        'Space Suit', 'Mission Control', 'Launch Pad', 'Spacecraft', 'Rover',
        'Telescope', 'Hubble', 'ISS', 'Apollo', 'NASA', 'ESA', 'SpaceX',
        'Lunar Module', 'Command Module', 'Heat Shield', 'Parachute', 'Docking',
        'Space Walk', 'Orbit Insertion', 'Re-entry', 'Rocket Booster'
    ],
    'Phenomena': [
        'Aurora', 'Northern Lights', 'Southern Lights', 'Meteor Shower', 'Solar Flare',
        'Coronal Mass Ejection', 'Sunspot', 'Solar Storm', 'Tide', 'Gravity',
        'Weightlessness', 'Radiation', 'Cosmic Background Radiation', 'Redshift',
        'Blueshift', 'Doppler Effect', 'Parallax', 'Transit', 'Occultation',
        'Time Dilation', 'Event Horizon', 'Gravitational Waves', 'Solar Maximum'
    ]
};

// ===========================================
// API FUNCTIONS (PLACEHOLDER FOR FUTURE FEATURES)
// ===========================================

/**
 * Database API interface for online multiplayer features
 * Currently unused but prepared for future implementation
 */
const API = {
    async createGame(gameName) {
        try {
            const response = await fetch('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: gameName, status: 'active' })
            });
            if (!response.ok) throw new Error('Failed to create game');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getGame(gameId) {
        try {
            const response = await fetch(`/api/games/${gameId}`);
            if (!response.ok) throw new Error('Failed to get game');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async updateGame(gameId, updates) {
        try {
            const response = await fetch(`/api/games/${gameId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) throw new Error('Failed to update game');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

// ===========================================
// INITIALIZATION AND SETUP
// ===========================================

/**
 * Initialize the game when page loads
 * Sets up UI, loads saved state, and prepares card deck
 */
function initializeGame() {
    try {
        setupGameModeSelection();
        loadGameState();
        updateTeamDisplay();
        updateUI();
        createCardDeck();
        setupEventListeners();
        
        // Add keyboard support
        document.addEventListener('keydown', handleKeyboardInput);
        
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showModal('Error initializing game. Please refresh the page.');
    }
}

/**
 * Setup keyboard event listeners for accessibility
 */
function setupEventListeners() {
    // Enter key support for team name input
    const teamNameInput = document.getElementById('teamName');
    if (teamNameInput) {
        teamNameInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                addTeam();
            }
        });
    }
}

/**
 * Handle keyboard shortcuts for game control
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyboardInput(event) {
    // Only handle shortcuts when no input is focused
    if (document.activeElement.tagName === 'INPUT') return;
    
    switch (event.key) {
        case ' ': // Spacebar - toggle timer
            event.preventDefault();
            toggleTimer();
            break;
        case 'c': // C - draw card
        case 'C':
            event.preventDefault();
            drawCard();
            break;
        case 's': // S - success
        case 'S':
            if (gameState.currentCard) {
                event.preventDefault();
                cardSuccess();
            }
            break;
        case 'k': // K - skip
        case 'K':
            if (gameState.currentCard) {
                event.preventDefault();
                skipCard();
            }
            break;
        case 'r': // R - roll dice
        case 'R':
            event.preventDefault();
            rollDice();
            break;
    }
}

/**
 * Setup game mode selection UI (online vs offline)
 * Prepares interface for future online multiplayer features
 */
function setupGameModeSelection() {
    const controls = document.querySelector('.game-controls');
    if (!controls) {
        console.error('Game controls element not found');
        return;
    }
    
    const modeSelector = document.createElement('div');
    modeSelector.className = 'game-mode-selector';
    modeSelector.innerHTML = `
        <div class="mode-buttons">
            <button id="offlineMode" class="mode-btn active" onclick="setGameMode('offline')" aria-label="Play local game">
                <i class="fas fa-user" aria-hidden="true"></i> Local Game
            </button>
            <button id="onlineMode" class="mode-btn" onclick="setGameMode('online')" aria-label="Play online game" disabled>
                <i class="fas fa-globe" aria-hidden="true"></i> Online Game (Coming Soon)
            </button>
        </div>
        <div id="onlineControls" class="online-controls" style="display: none;">
            <input type="text" id="gameNameInput" placeholder="Game Name" class="team-input" aria-label="Online game name">
            <button onclick="createOnlineGame()" class="add-team" aria-label="Create online game">
                <i class="fas fa-plus" aria-hidden="true"></i> Create Game
            </button>
        </div>
    `;
    controls.insertBefore(modeSelector, controls.firstChild);
}

// ===========================================
// GAME MODE MANAGEMENT
// ===========================================

/**
 * Set game mode (online vs offline)
 * @param {string} mode - 'online' or 'offline'
 */
function setGameMode(mode) {
    gameState.isOnline = mode === 'online';
    
    const offlineBtn = document.getElementById('offlineMode');
    const onlineBtn = document.getElementById('onlineMode');
    const onlineControls = document.getElementById('onlineControls');
    const teamControls = document.querySelector('.team-controls');
    
    if (offlineBtn) offlineBtn.className = `mode-btn ${mode === 'offline' ? 'active' : ''}`;
    if (onlineBtn) onlineBtn.className = `mode-btn ${mode === 'online' ? 'active' : ''}`;
    if (onlineControls) onlineControls.style.display = mode === 'online' ? 'block' : 'none';
    
    if (teamControls) {
        teamControls.style.display = mode === 'offline' ? 'flex' : 'none';
    }
    
    saveGameState();
}

/**
 * Create online game (placeholder for future implementation)
 */
async function createOnlineGame() {
    const gameNameInput = document.getElementById('gameNameInput');
    const gameName = gameNameInput?.value?.trim();
    
    if (!gameName) {
        showModal('Please enter a game name!');
        return;
    }
    
    try {
        showModal('Online multiplayer coming soon! For now, enjoy local gameplay.');
        setGameMode('offline');
    } catch (error) {
        console.error('Error creating online game:', error);
        showModal('Failed to create online game. Using local mode.');
        setGameMode('offline');
    }
}

// ===========================================
// CARD MANAGEMENT SYSTEM
// ===========================================

/**
 * Create and shuffle the card deck from all categories
 */
function createCardDeck() {
    gameState.cards = [];
    
    // Combine all cards from all categories
    for (const [category, words] of Object.entries(astronomyCards)) {
        for (const word of words) {
            gameState.cards.push({ 
                category, 
                word,
                id: `${category}-${word}`.replace(/\s+/g, '-').toLowerCase()
            });
        }
    }
    
    // Shuffle the deck
    shuffleArray(gameState.cards);
    
    console.log(`Card deck created with ${gameState.cards.length} cards`);
}

/**
 * Fisher-Yates shuffle algorithm for array randomization
 * @param {Array} array - Array to shuffle in place
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Draw a new card from the deck
 * Handles deck reshuffling when all cards are used
 */
function drawCard() {
    if (gameState.teams.length === 0) {
        showModal('Add teams first before drawing cards!');
        return;
    }
    
    // Initialize deck if empty
    if (gameState.cards.length === 0) {
        createCardDeck();
    }
    
    // Reshuffle if all cards used
    if (gameState.usedCards.length >= gameState.cards.length) {
        showModal('All cards have been used! Reshuffling deck...');
        gameState.usedCards = [];
        shuffleArray(gameState.cards);
    }
    
    // Find unused card
    let cardIndex;
    let attempts = 0;
    do {
        cardIndex = Math.floor(Math.random() * gameState.cards.length);
        attempts++;
        // Prevent infinite loop
        if (attempts > 100) {
            gameState.usedCards = [];
            break;
        }
    } while (gameState.usedCards.includes(cardIndex));
    
    // Set current card
    gameState.currentCard = gameState.cards[cardIndex];
    gameState.usedCards.push(cardIndex);
    
    // Display card
    displayCurrentCard();
    
    // Reset and start timer
    resetTimer();
    startTimer();
    
    saveGameState();
    playSound('cardDraw');
    
    console.log(`Drew card: ${gameState.currentCard.word} (${gameState.currentCard.category})`);
}

/**
 * Display the current card in the UI
 */
function displayCurrentCard() {
    const currentCardDiv = document.getElementById('currentCard');
    const categoryDiv = document.getElementById('currentCategory');
    const wordDiv = document.getElementById('currentWord');
    
    if (!currentCardDiv || !categoryDiv || !wordDiv) {
        console.error('Card display elements not found');
        return;
    }
    
    categoryDiv.textContent = gameState.currentCard.category;
    wordDiv.textContent = gameState.currentCard.word;
    currentCardDiv.style.display = 'block';
    
    // Announce to screen readers
    const announcement = `New card: ${gameState.currentCard.word} from category ${gameState.currentCard.category}`;
    announceToScreenReader(announcement);
}

// ===========================================
// CARD ACTION HANDLERS
// ===========================================

/**
 * Handle successful card guess
 * Awards points and advances team position
 */
function cardSuccess() {
    if (!gameState.currentCard) {
        showModal('No card is currently active!');
        return;
    }
    
    const currentTeam = gameState.teams[gameState.currentTeamIndex];
    if (!currentTeam) {
        console.error('No current team found');
        return;
    }
    
    // Award points and track statistics
    currentTeam.score += 10;
    currentTeam.successfulGuesses = (currentTeam.successfulGuesses || 0) + 1;
    
    // Move team forward
    moveTeam(currentTeam.id, 1);
    
    // Stop timer and hide card
    stopTimer();
    hideCurrentCard();
    
    // Check for win condition
    if (currentTeam.position >= 50) {
        gameWon(currentTeam);
        return;
    }
    
    // Check for special space
    if (isSpecialSpace(currentTeam.position)) {
        showModal(`${currentTeam.name} landed on a special space! Draw another card.`, () => {
            switchToNextTeam();
        });
    } else {
        switchToNextTeam();
    }
    
    updateTeamDisplay();
    saveGameState();
    playSound('success');
    
    console.log(`${currentTeam.name} scored! Position: ${currentTeam.position}, Score: ${currentTeam.score}`);
}

/**
 * Handle card skip
 * No points awarded but team still moves
 */
function skipCard() {
    if (!gameState.currentCard) {
        showModal('No card is currently active!');
        return;
    }
    
    const currentTeam = gameState.teams[gameState.currentTeamIndex];
    if (!currentTeam) {
        console.error('No current team found');
        return;
    }
    
    // Track skip statistics
    currentTeam.skippedCards = (currentTeam.skippedCards || 0) + 1;
    
    // Move team forward (but less than success)
    moveTeam(currentTeam.id, 1);
    
    // Stop timer and hide card
    stopTimer();
    hideCurrentCard();
    
    // Check for special space
    if (isSpecialSpace(currentTeam.position)) {
        showModal(`${currentTeam.name} landed on a special space! Draw another card.`, () => {
            switchToNextTeam();
        });
    } else {
        switchToNextTeam();
    }
    
    updateTeamDisplay();
    saveGameState();
    playSound('skip');
    
    console.log(`${currentTeam.name} skipped card. Position: ${currentTeam.position}`);
}

/**
 * Hide the current card display
 */
function hideCurrentCard() {
    const currentCardDiv = document.getElementById('currentCard');
    if (currentCardDiv) {
        currentCardDiv.style.display = 'none';
    }
    gameState.currentCard = null;
}

// ===========================================
// TEAM MANAGEMENT
// ===========================================

/**
 * Add a new team to the game
 */
function addTeam() {
    const teamNameInput = document.getElementById('teamName');
    if (!teamNameInput) {
        console.error('Team name input not found');
        return;
    }
    
    const teamName = teamNameInput.value.trim();
    
    // Validation
    if (!teamName) {
        showModal('Please enter a team name!');
        teamNameInput.focus();
        return;
    }
    
    if (gameState.teams.length >= 8) {
        showModal('Maximum 8 teams allowed!');
        return;
    }
    
    if (gameState.teams.some(team => team.name.toLowerCase() === teamName.toLowerCase())) {
        showModal('Team name already exists! Please choose a different name.');
        teamNameInput.focus();
        return;
    }
    
    // Create new team object
    const newTeam = {
        name: teamName,
        score: 0,
        position: 0,
        color: teamColors[gameState.teams.length],
        id: Date.now() + Math.random(), // Unique ID
        successfulGuesses: 0,
        skippedCards: 0,
        totalTurns: 0,
        createdAt: new Date().toISOString()
    };
    
    // Add team to game
    gameState.teams.push(newTeam);
    teamNameInput.value = '';
    
    // Update UI
    updateTeamDisplay();
    createTeamMarker(newTeam);
    saveGameState();
    
    // Start game if first team
    if (gameState.teams.length === 1) {
        gameState.gameStarted = true;
        showModal(`Welcome to Astronomy Pictionary! ${newTeam.name} will go first.`);
    }
    
    console.log(`Added team: ${newTeam.name} (${gameState.teams.length} total teams)`);
}

/**
 * Create visual marker for team on game board
 * @param {Object} team - Team object
 */
function createTeamMarker(team) {
    const gameBoard = document.querySelector('.game-board');
    if (!gameBoard) {
        console.error('Game board not found');
        return;
    }
    
    const marker = document.createElement('div');
    marker.className = 'team-marker';
    marker.id = `marker-${team.id}`;
    marker.style.background = team.color;
    marker.textContent = team.name.charAt(0).toUpperCase();
    marker.title = `${team.name} - Position ${team.position}`;
    marker.setAttribute('aria-label', `${team.name} team marker at position ${team.position}`);
    
    // Position at start
    positionTeamMarker(team.id, 0);
    gameBoard.appendChild(marker);
}

/**
 * Position team marker on the board
 * @param {number} teamId - Team identifier
 * @param {number} position - Board position (0-50)
 */
function positionTeamMarker(teamId, position) {
    const marker = document.getElementById(`marker-${teamId}`);
    if (!marker) {
        console.error(`Marker not found for team ${teamId}`);
        return;
    }
    
    let targetElement;
    if (position === 0) {
        targetElement = document.querySelector('.start');
    } else if (position >= 50) {
        targetElement = document.querySelector('.finish');
    } else {
        targetElement = document.querySelector(`.pos${position}`);
    }
    
    if (!targetElement) {
        console.error(`Target position ${position} not found`);
        return;
    }
    
    const rect = targetElement.getBoundingClientRect();
    const boardRect = document.querySelector('.game-board').getBoundingClientRect();
    
    // Calculate offset for multiple teams on same position
    const teamsOnPosition = gameState.teams.filter(t => t.position === position);
    const teamIndex = teamsOnPosition.findIndex(t => t.id === teamId);
    const offsetX = (teamIndex % 2) * 15 - 7;
    const offsetY = Math.floor(teamIndex / 2) * 15 - 7;
    
    marker.style.left = (rect.left - boardRect.left + offsetX) + 'px';
    marker.style.top = (rect.top - boardRect.top + offsetY) + 'px';
    
    // Update marker title and aria-label
    const team = gameState.teams.find(t => t.id === teamId);
    if (team) {
        marker.title = `${team.name} - Position ${position}`;
        marker.setAttribute('aria-label', `${team.name} team marker at position ${position}`);
    }
}

/**
 * Move team to new position on board
 * @param {number} teamId - Team identifier
 * @param {number} spaces - Number of spaces to move
 */
function moveTeam(teamId, spaces) {
    const team = gameState.teams.find(t => t.id === teamId);
    if (!team) {
        console.error(`Team ${teamId} not found`);
        return;
    }
    
    const oldPosition = team.position;
    team.position = Math.min(team.position + spaces, 50);
    
    positionTeamMarker(teamId, team.position);
    
    console.log(`${team.name} moved from ${oldPosition} to ${team.position}`);
}

/**
 * Update team display in UI
 */
function updateTeamDisplay() {
    const teamDisplay = document.getElementById('teamDisplay');
    if (!teamDisplay) {
        console.error('Team display element not found');
        return;
    }
    
    teamDisplay.innerHTML = '';
    
    gameState.teams.forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.className = `team ${index === gameState.currentTeamIndex ? 'active' : ''}`;
        teamDiv.style.borderLeftColor = team.color;
        teamDiv.setAttribute('tabindex', '0');
        teamDiv.setAttribute('role', 'button');
        teamDiv.setAttribute('aria-label', `Select ${team.name}`);
        
        // Calculate success rate
        const totalAttempts = (team.successfulGuesses || 0) + (team.skippedCards || 0);
        const successRate = totalAttempts > 0 
            ? Math.round(((team.successfulGuesses || 0) / totalAttempts) * 100) 
            : 0;
        
        teamDiv.innerHTML = `
            <div style="width: 20px; height: 20px; background: ${team.color}; border-radius: 50%; border: 2px solid white;" aria-hidden="true"></div>
            <div class="team-info">
                <div class="team-name">${escapeHtml(team.name)}</div>
                <div class="team-stats">
                    <small>Pos: ${team.position}/50 | Score: ${team.score} | Success: ${successRate}%</small>
                </div>
            </div>
            <div class="team-score">${team.score}</div>
        `;
        
        // Event listeners
        teamDiv.onclick = () => setActiveTeam(index);
        teamDiv.onkeypress = (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setActiveTeam(index);
            }
        };
        
        teamDisplay.appendChild(teamDiv);
    });
}

/**
 * Set active team
 * @param {number} index - Team index
 */
function setActiveTeam(index) {
    if (index >= 0 && index < gameState.teams.length) {
        const oldTeam = gameState.teams[gameState.currentTeamIndex];
        const newTeam = gameState.teams[index];
        
        gameState.currentTeamIndex = index;
        updateTeamDisplay();
        saveGameState();
        
        console.log(`Active team changed from ${oldTeam?.name || 'none'} to ${newTeam.name}`);
        announceToScreenReader(`${newTeam.name} is now the active team`);
    }
}

/**
 * Switch to next team in rotation
 */
function switchToNextTeam() {
    if (gameState.teams.length === 0) return;
    
    const nextIndex = (gameState.currentTeamIndex + 1) % gameState.teams.length;
    setActiveTeam(nextIndex);
}

// ===========================================
// TIMER SYSTEM
// ===========================================

/**
 * Start the game timer
 */
function startTimer() {
    if (gameState.isTimerRunning) {
        stopTimer();
    }
    
    gameState.isTimerRunning = true;
    updateTimerButton();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timerSeconds--;
        updateTimerDisplay();
        
        if (gameState.timerSeconds <= 0) {
            stopTimer();
            handleTimerExpired();
        }
    }, 1000);
    
    console.log('Timer started');
}

/**
 * Stop the game timer
 */
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    gameState.isTimerRunning = false;
    updateTimerButton();
    
    console.log('Timer stopped');
}

/**
 * Reset timer to initial value
 */
function resetTimer() {
    stopTimer();
    gameState.timerSeconds = 60;
    updateTimerDisplay();
}

/**
 * Toggle timer start/stop
 */
function toggleTimer() {
    if (gameState.isTimerRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

/**
 * Handle timer expiration
 */
function handleTimerExpired() {
    playSound('timerEnd');
    
    if (gameState.currentCard) {
        showModal('Time\'s up! Moving to next team.', () => {
            hideCurrentCard();
            switchToNextTeam();
        });
    } else {
        showModal('Time\'s up!');
    }
    
    announceToScreenReader('Time is up');
}

/**
 * Update timer display in UI
 */
function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;
    
    const minutes = Math.floor(gameState.timerSeconds / 60);
    const seconds = gameState.timerSeconds % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    timerElement.textContent = timeString;
    
    // Visual feedback for low time
    if (gameState.timerSeconds <= 10 && gameState.timerSeconds > 0) {
        timerElement.style.color = '#f44336';
        timerElement.style.animation = 'pulse 0.5s infinite';
    } else {
        timerElement.style.color = '#e91e63';
        timerElement.style.animation = 'none';
    }
}

/**
 * Update timer button appearance
 */
function updateTimerButton() {
    const timerBtn = document.getElementById('timerBtn');
    if (!timerBtn) return;
    
    const icon = timerBtn.querySelector('i');
    if (gameState.isTimerRunning) {
        timerBtn.innerHTML = '<i class="fas fa-pause" aria-hidden="true"></i> Pause';
        timerBtn.setAttribute('aria-label', 'Pause timer');
    } else {
        timerBtn.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i> Start';
        timerBtn.setAttribute('aria-label', 'Start timer');
    }
}

// ===========================================
// DICE SYSTEM
// ===========================================

/**
 * Roll dice for team movement
 */
function rollDice() {
    const diceElement = document.getElementById('dice');
    const resultElement = document.getElementById('diceResult');
    
    if (!diceElement || !resultElement) {
        console.error('Dice elements not found');
        return;
    }
    
    // Animate dice roll
    diceElement.style.animation = 'none';
    setTimeout(() => {
        diceElement.style.animation = 'spin 0.5s ease-out';
    }, 10);
    
    // Generate random result
    const result = Math.floor(Math.random() * 6) + 1;
    
    setTimeout(() => {
        resultElement.textContent = `Rolled: ${result}`;
        resultElement.setAttribute('aria-live', 'polite');
        
        // Move current team
        if (gameState.teams.length > 0) {
            const currentTeam = gameState.teams[gameState.currentTeamIndex];
            moveTeam(currentTeam.id, result);
            updateTeamDisplay();
            saveGameState();
            
            // Check for win condition
            if (currentTeam.position >= 50) {
                gameWon(currentTeam);
                return;
            }
            
            // Check for special space
            if (isSpecialSpace(currentTeam.position)) {
                showModal(`${currentTeam.name} landed on a special space! Draw a bonus card.`);
            }
        }
        
        playSound('diceRoll');
    }, 500);
    
    console.log(`Dice rolled: ${result}`);
}

// ===========================================
// GAME LOGIC HELPERS
// ===========================================

/**
 * Check if position is a special space
 * @param {number} position - Board position
 * @returns {boolean} True if special space
 */
function isSpecialSpace(position) {
    const specialSpaces = [3, 6, 10, 13, 17, 20, 23, 27, 31, 34, 38, 42, 45, 49];
    return specialSpaces.includes(position);
}

/**
 * Handle game win condition
 * @param {Object} team - Winning team object
 */
function gameWon(team) {
    stopTimer();
    playSound('victory');
    
    const winMessage = `
        <h2>🎉 Congratulations! 🎉</h2>
        <p><strong>${escapeHtml(team.name)}</strong> has won the game!</p>
        <p>Final Score: ${team.score} points</p>
        <p>Success Rate: ${calculateSuccessRate(team)}%</p>
        <br>
        <button onclick="resetGame()" class="success-btn">Play Again</button>
    `;
    
    showModal(winMessage, null, false);
    announceToScreenReader(`${team.name} has won the game!`);
    
    console.log(`Game won by ${team.name}`);
}

/**
 * Calculate team success rate
 * @param {Object} team - Team object
 * @returns {number} Success percentage
 */
function calculateSuccessRate(team) {
    const total = (team.successfulGuesses || 0) + (team.skippedCards || 0);
    return total > 0 ? Math.round(((team.successfulGuesses || 0) / total) * 100) : 0;
}

/**
 * Reset game to initial state
 */
function resetGame() {
    // Confirm reset if game in progress
    if (gameState.teams.length > 0 && gameState.gameStarted) {
        if (!confirm('Are you sure you want to start a new game? All progress will be lost.')) {
            return;
        }
    }
    
    // Clear timers
    stopTimer();
    resetTimer();
    
    // Reset game state
    gameState.teams = [];
    gameState.currentTeamIndex = 0;
    gameState.currentCard = null;
    gameState.usedCards = [];
    gameState.gameStarted = false;
    
    // Clear team markers
    const markers = document.querySelectorAll('.team-marker');
    markers.forEach(marker => marker.remove());
    
    // Hide current card
    hideCurrentCard();
    
    // Reset UI
    updateTeamDisplay();
    updateUI();
    
    // Clear dice result
    const diceResult = document.getElementById('diceResult');
    if (diceResult) diceResult.textContent = '';
    
    // Recreate card deck
    createCardDeck();
    
    // Save state
    saveGameState();
    
    // Close any open modals
    closeModal();
    
    console.log('Game reset');
    showModal('New game started! Add teams to begin playing.');
}

/**
 * Update general UI elements
 */
function updateUI() {
    updateTimerDisplay();
    updateTimerButton();
    updateTeamDisplay();
}

// ===========================================
// PERSISTENCE SYSTEM
// ===========================================

/**
 * Save game state to localStorage
 */
function saveGameState() {
    try {
        const stateToSave = {
            ...gameState,
            timerInterval: null, // Don't save interval
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('astronomyPictionaryGame', JSON.stringify(stateToSave));
    } catch (error) {
        console.error('Failed to save game state:', error);
    }
}

/**
 * Load game state from localStorage
 */
function loadGameState() {
    try {
        const savedState = localStorage.getItem('astronomyPictionaryGame');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            
            // Merge saved state with defaults
            gameState = {
                ...gameState,
                ...parsedState,
                timerInterval: null, // Always reset timer
                isTimerRunning: false
            };
            
            // Recreate team markers
            gameState.teams.forEach(team => {
                createTeamMarker(team);
            });
            
            console.log('Game state loaded successfully');
        }
    } catch (error) {
        console.error('Failed to load game state:', error);
        // Reset to default state if loading fails
        createCardDeck();
    }
}

// ===========================================
// MODAL SYSTEM
// ===========================================

/**
 * Show modal dialog
 * @param {string} message - Message to display
 * @param {function} callback - Optional callback function
 * @param {boolean} autoClose - Whether to auto-close modal
 */
function showModal(message, callback = null, autoClose = true) {
    const modal = document.getElementById('gameModal');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalContent) {
        console.error('Modal elements not found');
        return;
    }
    
    modalContent.innerHTML = message;
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus management for accessibility
    const firstButton = modalContent.querySelector('button');
    if (firstButton) {
        firstButton.focus();
    }
    
    // Auto-close after delay
    if (autoClose && !callback) {
        setTimeout(() => {
            closeModal();
        }, 3000);
    }
    
    // Store callback for close event
    modal.dataset.callback = callback ? 'true' : 'false';
    if (callback) {
        modal._callback = callback;
    }
}

/**
 * Close modal dialog
 */
function closeModal() {
    const modal = document.getElementById('gameModal');
    if (!modal) return;
    
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    
    // Execute callback if exists
    if (modal.dataset.callback === 'true' && modal._callback) {
        modal._callback();
        modal._callback = null;
    }
    
    modal.dataset.callback = 'false';
}

/**
 * Close modal when clicking outside
 */
window.onclick = function(event) {
    const modal = document.getElementById('gameModal');
    if (event.target === modal) {
        closeModal();
    }
};

// ===========================================
// SOUND SYSTEM (PLACEHOLDER)
// ===========================================

/**
 * Play sound effect (placeholder for future implementation)
 * @param {string} soundType - Type of sound to play
 */
function playSound(soundType) {
    // Placeholder for sound effects
    // Could be implemented with Web Audio API or HTML5 audio
    console.log(`Playing sound: ${soundType}`);
}

// ===========================================
// ACCESSIBILITY HELPERS
// ===========================================

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===========================================
// INITIALIZATION
// ===========================================

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeGame);

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden && gameState.isTimerRunning) {
        stopTimer();
        showModal('Timer paused due to page becoming inactive.');
    }
});

// Handle beforeunload to save state
window.addEventListener('beforeunload', function() {
    saveGameState();
});

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Game error:', event.error);
    showModal('An error occurred. The game state has been saved and you can continue playing.');
    saveGameState();
});

console.log('Interactive Astronomy Pictionary loaded successfully');
