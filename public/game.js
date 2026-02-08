// Verbind met server (lokaal of extern)
const serverURL = window.location.hostname === 'localhost' ? undefined : 'https://vuilezeven.onrender.com';
const socket = serverURL
    ? io(serverURL, {
        transports: ['websocket', 'polling'],
        timeout: 30000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
        pingInterval: 25000,
        pingTimeout: 20000
      })
    : io();

socket.on('connect', () => {
    showMessage('Verbonden met server.');
});

socket.on('connect_error', (err) => {
    console.error('Socket connect_error:', err);
    showMessage('Kan geen verbinding maken met de server. Wacht 30 seconden en refresh.');
});

socket.on('disconnect', () => {
    showMessage('Verbinding met de server verbroken. Probeer te refreshen.');
});

setTimeout(() => {
    if (!socket.connected) {
        showMessage('Server niet bereikbaar. Probeer opnieuw over 30 seconden.');
    }
}, 5000);

// Schermen
const loginScreen = document.getElementById('loginScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const gameScreen = document.getElementById('gameScreen');

// Login elementen
const playerNameInput = document.getElementById('playerName');
const roomCodeInput = document.getElementById('roomCode');
const joinButton = document.getElementById('joinButton');

// Lobby elementen
const currentRoomCodeSpan = document.getElementById('currentRoomCode');
const playersUl = document.getElementById('playersUl');
const startButton = document.getElementById('startButton');

// Game elementen
const deckCount = document.getElementById('deckCount');
const topCard = document.getElementById('topCard');
const playerHand = document.getElementById('playerHand');
const drawButton = document.getElementById('drawButton');
const passButton = document.getElementById('passButton');
const messageBox = document.getElementById('messageBox');

let currentRoomCode = '';
let myName = '';
let isFirstRound = false;

// Suit symbolen
const suitSymbols = {
    'harten': '♥',
    'ruiten': '♦',
    'klaver': '♣',
    'schoppen': '♠'
};

// Kaart waarde mapping
const cardValueMap = {
    '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', 
    '7': '7', '8': '8', '9': '9', '10': '10',
    'boer': 'J',
    'vrouw': 'Q',
    'heer': 'K',
    'aas': 'A'
};

// Join room
joinButton.addEventListener('click', () => {
    if (!socket.connected) {
        socket.connect();
        showMessage('Nog niet verbonden met server. Even wachten en opnieuw proberen.');
        return;
    }

    const playerName = playerNameInput.value.trim();
    const roomCode = roomCodeInput.value.trim().toUpperCase();

    if (!playerName || !roomCode) {
        showMessage('Vul je naam en een room code in!');
        return;
    }

    myName = playerName;
    currentRoomCode = roomCode;

    socket.emit('joinRoom', { roomCode, playerName });
});

// Start game
startButton.addEventListener('click', () => {
    socket.emit('startGame');
});

// Draw card
drawButton.addEventListener('click', () => {
    socket.emit('drawCard');
});

// Pass turn
passButton.addEventListener('click', () => {
    socket.emit('passTurn');
});

// Socket events
socket.on('roomUpdate', (data) => {
    currentRoomCodeSpan.textContent = currentRoomCode;
    
    // Update players list
    playersUl.innerHTML = '';
    data.players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name} ${player.cardCount > 0 ? `(${player.cardCount} kaarten)` : ''}`;
        playersUl.appendChild(li);
    });

    // Switch to lobby screen
    if (!data.gameStarted) {
        showScreen(lobbyScreen);
    }
});

socket.on('gameState', (data) => {
    showScreen(gameScreen);
    
    isFirstRound = data.firstRound;
    
    // Bepaal speler posities op basis van aantal spelers
    let playerPositions = ['bottom', 'top']; // Voor 2 spelers
    if (data.players.length === 3) {
        playerPositions = ['bottom', 'top', 'right'];
    } else if (data.players.length === 4) {
        playerPositions = ['bottom', 'right', 'top', 'left'];
    }
    
    // Update spelers in cirkel
    data.players.forEach((player, index) => {
        const positionId = 'player' + playerPositions[index].charAt(0).toUpperCase() + playerPositions[index].slice(1);
        const positionElement = document.getElementById(positionId);
        
        if (positionElement) {
            positionElement.innerHTML = '';
            positionElement.className = `player-position ${playerPositions[index]}`;
            
            if (player.name === data.currentPlayer) {
                positionElement.classList.add('active');
            }
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'player-name';
            nameDiv.textContent = player.name;
            
            const cardsDiv = document.createElement('div');
            cardsDiv.className = 'player-cards';
            if (player.cardsToDraw > 0) {
                cardsDiv.classList.add('warning');
                cardsDiv.innerHTML = `${player.cardCount} kaarten<br>(${player.cardsToDraw} trekken!)`;
            } else {
                cardsDiv.textContent = `${player.cardCount} kaarten`;
            }
            
            positionElement.appendChild(nameDiv);
            positionElement.appendChild(cardsDiv);
        }
    });
    
    // Update deck count
    deckCount.textContent = data.deckCount;
    
    // Update top card
    displayCard(topCard, data.topCard, false);
    
    // Toon eerste ronde indicator
    if (isFirstRound) {
        showMessage('EERSTE RONDE: Alleen klavers! ♣');
    }
    
    // Update player hand
    playerHand.innerHTML = '';
    data.yourHand.forEach((card, index) => {
        const cardElement = createCard(card, index, data.yourTurn);
        playerHand.appendChild(cardElement);
    });

    // Enable/disable draw button - beperkt tot 1x trekken als er geen penalty is
    if (data.yourTurn) {
        drawButton.style.display = 'block';
        drawButton.disabled = false;
        passButton.style.display = 'block';
        
        const myPlayer = data.players.find(p => p.name === myName);

        // Disable draw als je al getrokken hebt en geen penaltykaarten moet trekken
        if (myPlayer && myPlayer.cardsToDraw === 0 && data.yourHasDrawnThisTurn) {
            drawButton.disabled = true;
            drawButton.title = 'Je hebt al getrokken deze beurt';
        } else {
            drawButton.disabled = false;
            drawButton.title = 'Trek een kaart';
        }

        // Disable pass button als je kaarten moet trekken of nog niet hebt getrokken
        if (myPlayer && myPlayer.cardsToDraw > 0) {
            passButton.disabled = true;
            passButton.title = 'Je moet eerst trekken of verdedigen met 7/10/Aas!';
        } else if (!data.yourHasDrawnThisTurn) {
            passButton.disabled = true;
            passButton.title = 'Trek eerst een kaart voordat je past';
        } else {
            passButton.disabled = false;
            passButton.title = 'Pas deze beurt';
        }
    } else {
        drawButton.style.display = 'none';
        passButton.style.display = 'none';
    }
});

socket.on('gameOver', (data) => {
    showMessage(`🎉 ${data.winner} heeft gewonnen! 🎉`);
    setTimeout(() => {
        showScreen(lobbyScreen);
    }, 3000);
});

socket.on('roomFull', () => {
    showMessage('Deze room is vol!');
});

socket.on('nameTaken', () => {
    showMessage('Deze naam is al in gebruik!');
});

socket.on('notEnoughPlayers', (data) => {
    const required = data?.required || 3;
    const current = data?.current || 0;
    showMessage(`Minimaal ${required} spelers nodig! (nu: ${current})`);
});

socket.on('notYourTurn', () => {
    showMessage('Het is niet jouw beurt!');
});

socket.on('invalidMove', () => {
    showMessage('Deze kaart kun je niet spelen!');
});

socket.on('mustDrawCards', () => {
    showMessage('Je moet eerst kaarten trekken!');
});

socket.on('mustDrawOrDefend', () => {
    showMessage('Je moet trekken of verdedigen (7, 10, Aas)!');
});

socket.on('mustDrawFirst', () => {
    showMessage('Trek eerst een kaart voordat je past!');
});

socket.on('alreadyDrewThisTurn', () => {
    showMessage('Je mag maar 1 kaart trekken deze beurt!');
});

socket.on('cannotPassWithPlayableCard', () => {
    showMessage('Je hebt een speelbare kaart, je moet trekken of spelen!');
});

// Helper functions
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function createCard(card, index, clickable) {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${card.suit}`;
    
    if (!clickable) {
        cardElement.classList.add('disabled');
    }

    const displayValue = cardValueMap[card.value] || card.value.toUpperCase();
    const suitSymbol = suitSymbols[card.suit];

    // Top-left corner
    const topCorner = document.createElement('div');
    topCorner.className = 'card-corner top-left';
    topCorner.innerHTML = `<span class="corner-value">${displayValue}</span><span class="corner-suit">${suitSymbol}</span>`;

    // Bottom-right corner (upside down)
    const bottomCorner = document.createElement('div');
    bottomCorner.className = 'card-corner bottom-right';
    bottomCorner.innerHTML = `<span class="corner-value">${displayValue}</span><span class="corner-suit">${suitSymbol}</span>`;

    // Center symbol(s)
    const centerSymbols = document.createElement('div');
    centerSymbols.className = 'card-center';
    
    // Voor plaatjes (J, Q, K, A) toon één groot symbool met letter
    if (['boer', 'vrouw', 'heer', 'aas'].includes(card.value)) {
        centerSymbols.innerHTML = `
            <div class="card-face">
                <span class="face-value">${displayValue}</span>
                <span class="face-suit">${suitSymbol}</span>
            </div>
        `;
    } else {
        // Voor nummers, toon meerdere symbolen
        const numValue = parseInt(card.value);
        let symbolsHTML = '';
        for (let i = 0; i < Math.min(numValue, 5); i++) {
            symbolsHTML += `<span class="center-suit">${suitSymbol}</span>`;
        }
        centerSymbols.innerHTML = symbolsHTML;
    }

    cardElement.appendChild(topCorner);
    cardElement.appendChild(centerSymbols);
    cardElement.appendChild(bottomCorner);

    if (clickable) {
        cardElement.addEventListener('click', () => {
            // Als het een Boer is, vraag om kleur te kiezen
            if (card.value === 'boer') {
                // In eerste ronde moet het klaver blijven
                if (isFirstRound) {
                    showMessage('In de eerste ronde moet het klaver blijven!');
                    socket.emit('playCard', { cardIndex: index, chosenSuit: 'klaver' });
                } else {
                    showSuitSelector((chosenSuit) => {
                        socket.emit('playCard', { cardIndex: index, chosenSuit });
                    });
                }
            } else {
                socket.emit('playCard', { cardIndex: index });
            }
        });
    }

    return cardElement;
}

function displayCard(element, card, clickable) {
    if (!card) {
        element.innerHTML = '';
        element.className = 'card empty';
        return;
    }
    element.innerHTML = '';
    element.className = `card ${card.suit}`;
    
    if (!clickable) {
        element.classList.add('disabled');
    }

    const displayValue = cardValueMap[card.value] || card.value.toUpperCase();
    const suitSymbol = suitSymbols[card.suit];

    // Top-left corner
    const topCorner = document.createElement('div');
    topCorner.className = 'card-corner top-left';
    topCorner.innerHTML = `<span class="corner-value">${displayValue}</span><span class="corner-suit">${suitSymbol}</span>`;

    // Bottom-right corner (upside down)
    const bottomCorner = document.createElement('div');
    bottomCorner.className = 'card-corner bottom-right';
    bottomCorner.innerHTML = `<span class="corner-value">${displayValue}</span><span class="corner-suit">${suitSymbol}</span>`;

    // Center symbol(s)
    const centerSymbols = document.createElement('div');
    centerSymbols.className = 'card-center';
    
    // Voor plaatjes (J, Q, K, A) toon één groot symbool met letter
    if (['boer', 'vrouw', 'heer', 'aas'].includes(card.value)) {
        centerSymbols.innerHTML = `
            <div class="card-face">
                <span class="face-value">${displayValue}</span>
                <span class="face-suit">${suitSymbol}</span>
            </div>
        `;
    } else {
        // Voor nummers, toon meerdere symbolen
        const numValue = parseInt(card.value);
        let symbolsHTML = '';
        for (let i = 0; i < Math.min(numValue, 5); i++) {
            symbolsHTML += `<span class="center-suit">${suitSymbol}</span>`;
        }
        centerSymbols.innerHTML = symbolsHTML;
    }

    element.appendChild(topCorner);
    element.appendChild(centerSymbols);
    element.appendChild(bottomCorner);
}

function showMessage(message) {
    messageBox.textContent = message;
    messageBox.classList.add('show');
    
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 3000);
}

// Suit selector voor Boer kaart
function showSuitSelector(callback) {
    const overlay = document.createElement('div');
    overlay.className = 'suit-selector-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'suit-selector-modal';
    
    const title = document.createElement('h3');
    title.textContent = 'Kies een kleur:';
    modal.appendChild(title);
    
    const suits = [
        { name: 'harten', symbol: '♥', color: 'harten' },
        { name: 'ruiten', symbol: '♦', color: 'ruiten' },
        { name: 'klaver', symbol: '♣', color: 'klaver' },
        { name: 'schoppen', symbol: '♠', color: 'schoppen' }
    ];
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'suit-buttons';
    
    suits.forEach(suit => {
        const button = document.createElement('button');
        button.className = `suit-button ${suit.color}`;
        button.innerHTML = `<span class="suit-symbol">${suit.symbol}</span><br>${suit.name}`;
        button.addEventListener('click', () => {
            overlay.remove();
            callback(suit.name);
        });
        buttonsContainer.appendChild(button);
    });
    
    modal.appendChild(buttonsContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}
