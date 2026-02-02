// i18n - Internationalisatie
const translations = {
    en: {
        // Login screen
        title: 'Dirty Seven',
        yourName: 'Your name',
        roomCode: 'Room code (e.g. ABCD)',
        joinButton: 'Join Room',
        createInfo: 'Create a room code and share it with your friends!',
        
        // Lobby screen
        roomLabel: 'Room',
        playersInLobby: 'Players in lobby:',
        startButton: 'Start Game',
        waitInfo: 'Wait for everyone (minimum 2 players)',
        
        // Game screen
        topCard: 'Top card:',
        deck: 'Deck',
        drawCard: 'Draw Card',
        pass: 'Pass',
        yourCards: 'Your cards:',
        cardsLabel: 'cards',
        
        // Game messages
        firstRound: 'FIRST ROUND: Only clubs! ♣',
        yourTurn: 'Your turn!',
        waitingFor: 'Waiting for',
        invalidMove: 'Invalid move!',
        mustDrawCards: 'You must draw',
        cards: 'cards',
        mustDrawOrDefend: 'You must draw cards or play a defense card (7, 10, Ace)!',
        mustDrawFirst: 'You must draw a card first before passing!',
        alreadyDrew: 'You can only draw 1 card per turn (unless penalty cards are due)!',
        cannotPass: 'You have a playable card! Play it or draw a card.',
        gameOver: 'Game Over!',
        wins: 'wins!',
        fillNameAndCode: 'Fill in your name and room code!',
        roomFull: 'This room is full!',
        nameTaken: 'This name is already taken!',
        notEnoughPlayers: 'At least 2 players are needed!',
        notYourTurn: 'It\'s not your turn!',
        invalidCard: 'You can\'t play this card!',
        mustDrawCardsFirst: 'You must draw cards first!',
        firstRoundClubsOnly: 'In the first round, it must stay clubs!',
        alreadyDrawnTitle: 'You already drew this turn',
        drawCardTitle: 'Draw a card',
        mustDefendTitle: 'You must draw or defend with 7/10/Ace!',
        drawFirstTitle: 'Draw a card first before passing',
        passThisTurnTitle: 'Pass this turn',
        toDraw: 'to draw!',
        
        // Special cards
        sevenPlayed: 'played a 7! Draw 2 cards or play a 7/10/Ace!',
        tenPlayed: 'played a 10! Penalty reflected!',
        acePlayed: 'played an Ace! Next player skipped!',
        jackPlayed: 'played a Jack! Choose a color:',
        hearts: 'Hearts',
        diamonds: 'Diamonds',
        clubs: 'Clubs',
        spades: 'Spades'
    },
    tr: {
        // Login screen
        title: 'Pis Yedili',
        yourName: 'Adın',
        roomCode: 'Oda kodu (örn. ABCD)',
        joinButton: 'Odaya Katıl',
        createInfo: 'Bir oda kodu oluştur ve arkadaşlarınla paylaş!',
        
        // Lobby screen
        roomLabel: 'Oda',
        playersInLobby: 'Lobideki Oyuncular:',
        startButton: 'Oyunu Başlat',
        waitInfo: 'Herkesin gelmesini bekleyin (en az 2 oyuncu)',
        
        // Game screen
        topCard: 'Üstteki kart:',
        deck: 'Deste',
        drawCard: 'Kart Çek',
        pass: 'Pas',
        yourCards: 'Kartların:',
        cardsLabel: 'kart',
        
        // Game messages
        firstRound: 'İLK ROUND: Sadece Çoğul! ♣',
        yourTurn: 'Senin sıran!',
        waitingFor: 'Bekleniyor',
        invalidMove: 'Geçersiz hamle!',
        mustDrawCards: 'Çekmelisin',
        cards: 'kart',
        mustDrawOrDefend: 'Kart çekmelisin veya savunma kartı (7, 10, As) oynamalısın!',
        mustDrawFirst: 'Pas geçmeden önce bir kart çekmelisin!',
        alreadyDrew: 'Tur başına sadece 1 kart çekebilirsin (ceza kartları hariç)!',
        cannotPass: 'Oynayabileceğin bir kartın var! Oyna veya kart çek.',
        gameOver: 'Oyun Bitti!',
        wins: 'kazandı!',
        fillNameAndCode: 'Adını ve oda kodunu gir!',
        roomFull: 'Bu oda dolu!',
        nameTaken: 'Bu isim zaten kullanımda!',
        notEnoughPlayers: 'En az 2 oyuncu gerekli!',
        notYourTurn: 'Senin sıran değil!',
        invalidCard: 'Bu kartı oynayamazsın!',
        mustDrawCardsFirst: 'Önce kart çekmelisin!',
        firstRoundClubsOnly: 'İlk roundda Çoğul kalmalı!',
        alreadyDrawnTitle: 'Bu turda zaten çektin',
        drawCardTitle: 'Kart çek',
        mustDefendTitle: 'Çek veya 7/10/As ile savun!',
        drawFirstTitle: 'Pas geçmeden önce kart çek',
        passThisTurnTitle: 'Bu turu pas geç',
        toDraw: 'çekilecek!',
        
        // Special cards
        sevenPlayed: '7 oynadı! 2 kart çek veya 7/10/As oyna!',
        tenPlayed: '10 oynadı! Ceza yansıtıldı!',
        acePlayed: 'As oynadı! Sonraki oyuncu atlandı!',
        jackPlayed: 'Vale oynadı! Renk seç:',
        hearts: 'Kupa',
        diamonds: 'Karo',
        clubs: 'Çoğul',
        spades: 'Maça'
    }
};

// Huidige taal (standaard Engels)
let currentLang = localStorage.getItem('lang') || 'en';

// Vertaal functie
function t(key) {
    return translations[currentLang][key] || key;
}

// Wissel taal
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updateAllTexts();
}

// Update alle teksten op de pagina
function updateAllTexts() {
    // Login screen
    document.querySelector('#loginScreen h1').textContent = t('title');
    document.querySelector('#loginScreen .subtitle').textContent = currentLang === 'tr' ? 'Pis Yedili' : '';
    playerNameInput.placeholder = t('yourName');
    roomCodeInput.placeholder = t('roomCode');
    joinButton.textContent = t('joinButton');
    document.querySelector('#loginScreen .info').textContent = t('createInfo');
    
    // Lobby screen
    document.querySelector('#lobbyScreen h1').textContent = t('title');
    document.querySelector('#lobbyScreen .subtitle').textContent = currentLang === 'tr' ? 'Pis Yedili' : '';
    document.querySelector('#playersList h3').textContent = t('playersInLobby');
    startButton.textContent = t('startButton');
    document.querySelector('#lobbyScreen .info').textContent = t('waitInfo');
    
    // Game screen
    document.querySelector('.discard-pile p').textContent = t('topCard');
    drawButton.textContent = t('drawCard');
    passButton.textContent = t('pass');
    document.querySelector('.bottom-section h3').textContent = t('yourCards');
    
    // Update taalknop
    const langButton = document.getElementById('langButton');
    if (langButton) {
        langButton.textContent = currentLang === 'en' ? '🇹🇷 TR' : '🇬🇧 EN';
    }
}

// Verbind met server (lokaal of extern)
const serverURL = window.location.hostname === 'localhost' ? undefined : 'https://vuilezeven.onrender.com';
const socket = serverURL ? io(serverURL) : io();

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

// Initialiseer i18n bij laden
document.addEventListener('DOMContentLoaded', () => {
    updateAllTexts();
    
    // Taalknop event listener
    const langButton = document.getElementById('langButton');
    langButton.addEventListener('click', () => {
        switchLanguage(currentLang === 'en' ? 'tr' : 'en');
    });
});

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
    const playerName = playerNameInput.value.trim();
    const roomCode = roomCodeInput.value.trim().toUpperCase();

    if (!playerName || !roomCode) {
        showMessage(t('fillNameAndCode'));
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
                cardsDiv.innerHTML = `${player.cardCount} ${t('cardsLabel')}<br>(${player.cardsToDraw} ${t('toDraw')})`;
            } else {
                cardsDiv.textContent = `${player.cardCount} ${t('cardsLabel')}`;
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
        showMessage(t('firstRound'));
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
            drawButton.title = t('alreadyDrawnTitle');
        } else {
            drawButton.disabled = false;
            drawButton.title = t('drawCardTitle');
        }

        // Disable pass button als je kaarten moet trekken of nog niet hebt getrokken
        if (myPlayer && myPlayer.cardsToDraw > 0) {
            passButton.disabled = true;
            passButton.title = t('mustDefendTitle');
        } else if (!data.yourHasDrawnThisTurn) {
            passButton.disabled = true;
            passButton.title = t('drawFirstTitle');
        } else {
            passButton.disabled = false;
            passButton.title = t('passThisTurnTitle');
        }
    } else {
        drawButton.style.display = 'none';
        passButton.style.display = 'none';
    }
});

socket.on('gameOver', (data) => {
    showMessage(`🎉 ${data.winner} ${t('wins')} 🎉`);
    setTimeout(() => {
        showScreen(lobbyScreen);
    }, 3000);
});

socket.on('roomFull', () => {
    showMessage(t('roomFull'));
});

socket.on('nameTaken', () => {
    showMessage(t('nameTaken'));
});

socket.on('notEnoughPlayers', () => {
    showMessage(t('notEnoughPlayers'));
});

socket.on('notYourTurn', () => {
    showMessage(t('notYourTurn'));
});

socket.on('invalidMove', () => {
    showMessage(t('invalidCard'));
});

socket.on('mustDrawCards', () => {
    showMessage(t('mustDrawCardsFirst'));
});

socket.on('mustDrawOrDefend', () => {
    showMessage(t('mustDrawOrDefend'));
});

socket.on('mustDrawFirst', () => {
    showMessage(t('mustDrawFirst'));
});

socket.on('alreadyDrewThisTurn', () => {
    showMessage(t('alreadyDrew'));
});

socket.on('cannotPassWithPlayableCard', () => {
    showMessage(t('cannotPass'));
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
                    showMessage(t('firstRoundClubsOnly'));
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
    title.textContent = t('jackPlayed').split('!')[0] + '!';
    modal.appendChild(title);
    
    const suits = [
        { name: 'harten', symbol: '♥', color: 'harten', label: t('hearts') },
        { name: 'ruiten', symbol: '♦', color: 'ruiten', label: t('diamonds') },
        { name: 'klaver', symbol: '♣', color: 'klaver', label: t('clubs') },
        { name: 'schoppen', symbol: '♠', color: 'schoppen', label: t('spades') }
    ];
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'suit-buttons';
    
    suits.forEach(suit => {
        const button = document.createElement('button');
        button.className = `suit-button ${suit.color}`;
        button.innerHTML = `<span class="suit-symbol">${suit.symbol}</span><br>${suit.label}`;
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
