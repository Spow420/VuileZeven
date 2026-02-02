// i18n - Internationalisatie
const translations = {
    nl: {
        // Login screen
        title: 'Vuile Zeven',
        yourName: 'Jouw naam',
        roomCode: 'Room code (bijv. ABCD)',
        joinButton: 'Join Room',
        createInfo: 'Maak een room code aan en deel deze met je vrienden!',
        
        // Lobby screen
        roomLabel: 'Room',
        playersInLobby: 'Spelers in de lobby:',
        startButton: 'Start Spel',
        waitInfo: 'Wacht tot iedereen er is (minimaal 2 spelers)',
        
        // Game screen
        topCard: 'Bovenste kaart:',
        deck: 'Deck',
        drawCard: 'Trek Kaart',
        pass: 'Pas',
        yourCards: 'Jouw kaarten:',
        cardsLabel: 'kaarten',
        
        // Game messages
        firstRound: 'EERSTE RONDE: Alleen klavers! ♣',
        yourTurn: 'Jouw beurt!',
        waitingFor: 'Wachten op',
        invalidMove: 'Ongeldige zet!',
        mustDrawCards: 'Je moet trekken',
        cards: 'kaarten',
        mustDrawOrDefend: 'Je moet kaarten trekken of een verdedigingskaart (7, 10, Aas) spelen!',
        mustDrawFirst: 'Trek eerst een kaart voordat je past!',
        alreadyDrew: 'Je mag maar 1 kaart trekken per beurt (tenzij je strafkaarten moet trekken)!',
        cannotPass: 'Je hebt een speelbare kaart! Speel deze of trek een kaart.',
        gameOver: 'Spel Afgelopen!',
        wins: 'heeft gewonnen!',
        fillNameAndCode: 'Vul je naam en room code in!',
        roomFull: 'Deze room is vol!',
        nameTaken: 'Deze naam is al in gebruik!',
        notEnoughPlayers: 'Er zijn minimaal 2 spelers nodig!',
        notYourTurn: 'Het is niet jouw beurt!',
        invalidCard: 'Je kunt deze kaart niet spelen!',
        mustDrawCardsFirst: 'Je moet eerst kaarten trekken!',
        firstRoundClubsOnly: 'In de eerste ronde moet het klaver blijven!',
        alreadyDrawnTitle: 'Je hebt al getrokken deze beurt',
        drawCardTitle: 'Trek een kaart',
        mustDefendTitle: 'Je moet trekken of verdedigen met 7/10/Aas!',
        drawFirstTitle: 'Trek eerst een kaart voordat je past',
        passThisTurnTitle: 'Pas deze beurt',
        toDraw: 'trekken!',
        
        // Special cards
        sevenPlayed: 'speelde een 7! Trek 2 kaarten of speel een 7/10/Aas!',
        tenPlayed: 'speelde een 10! Straf teruggekaatst!',
        acePlayed: 'speelde een Aas! Volgende speler overgeslagen!',
        jackPlayed: 'speelde een Boer! Kies een kleur:',
        hearts: 'Harten',
        diamonds: 'Ruiten',
        clubs: 'Klaver',
        spades: 'Schoppen'
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

// Huidige taal (standaard Nederlands)
let currentLang = localStorage.getItem('lang') || 'nl';

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
    document.querySelector('#loginScreen .subtitle').textContent = '';
    playerNameInput.placeholder = t('yourName');
    roomCodeInput.placeholder = t('roomCode');
    joinButton.textContent = t('joinButton');
    document.querySelector('#loginScreen .info').textContent = t('createInfo');
    
    // Lobby screen
    document.querySelector('#lobbyScreen h1').textContent = t('title');
    document.querySelector('#lobbyScreen .subtitle').textContent = '';
    document.querySelector('#playersList h3').textContent = t('playersInLobby');
    startButton.textContent = t('startButton');
    document.querySelector('#lobbyScreen .info').textContent = t('waitInfo');
    
    // Game screen
    document.querySelector('.discard-pile p').textContent = t('topCard');
    drawButton.textContent = t('drawCard');
    passButton.textContent = t('pass');
    document.querySelector('.bottom-section h3').textContent = t('yourCards');
    
    // Update taalknop (alleen zichtbaar op login screen)
    const langButton = document.getElementById('langButton');
    if (langButton) {
        langButton.textContent = currentLang === 'nl' ? '🇹🇷 TR' : '🇳🇱 NL';
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
        switchLanguage(currentLang === 'nl' ? 'tr' : 'nl');
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
