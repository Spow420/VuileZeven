const express = require('express');
const app = express();
const http = require('http').createServer(app);
const fs = require('fs');
const path = require('path');
const io = require('socket.io')(http, {
  cors: {
    origin: [
      'https://quanigma.com',
      'https://www.quanigma.com',
      'https://monumental-cheesecake-c08ffb.netlify.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket']
});

const PORT = process.env.PORT || 3000;

// ========================
// VISITOR TRACKING SYSTEM
// ========================
const visitorStats = {
  totalVisitors: 0,
  currentPlayers: [],
  activeRooms: [],
  visitHistory: [],
  peakConcurrent: 0,
  startTime: new Date()
};

function trackVisitor(socketId, playerName, roomCode) {
  const timestamp = new Date().toISOString();
  
  // Check if new visitor
  const isNewVisitor = !visitorStats.visitHistory.find(v => v.socketId === socketId);
  if (isNewVisitor) {
    visitorStats.totalVisitors++;
  }
  
  // Add to current players
  if (!visitorStats.currentPlayers.find(p => p.socketId === socketId)) {
    visitorStats.currentPlayers.push({
      socketId,
      playerName,
      roomCode,
      joinedAt: timestamp
    });
  }
  
  // Track in history
  visitorStats.visitHistory.push({
    socketId,
    playerName,
    roomCode,
    action: 'joined',
    timestamp
  });
  
  // Update peak concurrent
  if (visitorStats.currentPlayers.length > visitorStats.peakConcurrent) {
    visitorStats.peakConcurrent = visitorStats.currentPlayers.length;
  }
  
  console.log(`[VISITOR] ${playerName} joined @ ${timestamp} | Total: ${visitorStats.totalVisitors} | Active: ${visitorStats.currentPlayers.length}`);
}

function removeVisitor(socketId) {
  const visitor = visitorStats.currentPlayers.find(p => p.socketId === socketId);
  if (visitor) {
    visitorStats.visitHistory.push({
      ...visitor,
      action: 'left',
      timestamp: new Date().toISOString()
    });
    visitorStats.currentPlayers = visitorStats.currentPlayers.filter(p => p.socketId !== socketId);
    console.log(`[VISITOR] ${visitor.playerName} left | Active: ${visitorStats.currentPlayers.length}`);
  }
}

// Save stats to file every 5 minutes
setInterval(() => {
  const statsFile = path.join(__dirname, 'visitor-stats.json');
  fs.writeFileSync(statsFile, JSON.stringify(visitorStats, null, 2));
  console.log('[STATS] Saved visitor statistics to file');
}, 300000);

// Security: Rate limiting & request tracking
const requestLimits = {};
const MAX_REQUESTS_PER_MINUTE = 60;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(socketId) {
  const now = Date.now();
  if (!requestLimits[socketId]) {
    requestLimits[socketId] = { count: 1, startTime: now };
    return true;
  }
  
  const elapsed = now - requestLimits[socketId].startTime;
  if (elapsed > RATE_LIMIT_WINDOW) {
    requestLimits[socketId] = { count: 1, startTime: now };
    return true;
  }
  
  requestLimits[socketId].count++;
  return requestLimits[socketId].count <= MAX_REQUESTS_PER_MINUTE;
}

// Input validation helpers
function validatePlayerName(name) {
  if (!name || typeof name !== 'string') return null;
  const cleaned = name.trim().substring(0, 20);
  if (!/^[a-zA-Z0-9 ]{1,20}$/.test(cleaned)) return null;
  return cleaned;
}

function validateRoomCode(code) {
  if (!code || typeof code !== 'string') return null;
  const cleaned = code.trim().toUpperCase().substring(0, 10);
  if (!/^[A-Z0-9]{1,10}$/.test(cleaned)) return null;
  return cleaned;
}

function validateCardIndex(index, handSize) {
  if (!Number.isInteger(index)) return false;
  return index >= 0 && index < handSize;
}

function validateSuit(suit) {
  const validSuits = ['harten', 'ruiten', 'klaver', 'schoppen'];
  return validSuits.includes(suit);
}

// Serve static files (with security)
app.use(express.static('public', {
  maxAge: '1h',
  etag: false
}));

// HTTPS redirect (if behind proxy like Render)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(301, `https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Security headers (SSL + XSS + Clickjacking protection)
app.use((req, res, next) => {
  // CORS headers for admin dashboard
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin Dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Handle preflight requests
app.options('/api/*', (req, res) => {
  res.send(200);
});

// ========================
// STATS ENDPOINTS
// ========================
app.get('/api/stats', (req, res) => {
  const uptime = Date.now() - new Date(visitorStats.startTime).getTime();
  res.json({
    status: 'online',
    uptime: `${Math.floor(uptime / 1000 / 60)} minuten`,
    totalVisitors: visitorStats.totalVisitors,
    currentActive: visitorStats.currentPlayers.length,
    peakConcurrent: visitorStats.peakConcurrent,
    activeGames: visitorStats.currentPlayers.filter((p, i, arr) => arr.filter(x => x.roomCode === p.roomCode).length > 0).length,
    serverStart: visitorStats.startTime,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/visitors', (req, res) => {
  res.json({
    current: visitorStats.currentPlayers,
    recentHistory: visitorStats.visitHistory.slice(-50),
    totalSessions: visitorStats.totalVisitors
  });
});

// God Mode: Get all rooms data
app.get('/api/rooms', (req, res) => {
  const roomsData = Object.entries(rooms).map(([roomCode, room]) => ({
    roomCode,
    gameStarted: room.gameStarted,
    playerCount: room.players.length,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      cardCount: p.hand.length,
      cards: p.hand,
      cardsToDraw: p.cardsToDraw,
      hasDrawnThisTurn: p.hasDrawnThisTurn
    })),
    discardPile: room.discardPile,
    deckCount: room.deck.length,
    currentPlayer: room.players[room.currentPlayer]?.name || 'N/A',
    direction: room.direction === 1 ? '→' : '←'
  }));

  res.json({
    timestamp: new Date().toISOString(),
    totalRooms: Object.keys(rooms).length,
    rooms: roomsData
  });
});

app.get('/stats', (req, res) => {
  const uptime = Date.now() - new Date(visitorStats.startTime).getTime();
  const uptimeMinutes = Math.floor(uptime / 1000 / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>VuileZeven Stats</title>
      <style>
        body { font-family: Arial; background: #1a1a1a; color: #fff; margin: 20px; }
        h1 { color: #4CAF50; }
        .stat { background: #2a2a2a; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4CAF50; }
        .stat-value { font-size: 24px; font-weight: bold; color: #4CAF50; }
        .players-list { background: #2a2a2a; padding: 15px; margin-top: 20px; border-radius: 5px; }
        .player-item { padding: 10px; background: #1a1a1a; margin: 5px 0; border-radius: 3px; }
        .online { color: #4CAF50; }
      </style>
    </head>
    <body>
      <h1>🎮 VuileZeven Live Stats</h1>
      
      <div class="stat">
        <strong>Status:</strong> <span class="online">● Online</span>
      </div>
      
      <div class="stat">
        <strong>Uptime:</strong>
        <div class="stat-value">${uptimeHours}h ${uptimeMinutes % 60}m</div>
      </div>
      
      <div class="stat">
        <strong>Totale Bezoekers:</strong>
        <div class="stat-value">${visitorStats.totalVisitors}</div>
      </div>
      
      <div class="stat">
        <strong>Actieve Spelers:</strong>
        <div class="stat-value">${visitorStats.currentPlayers.length}</div>
      </div>
      
      <div class="stat">
        <strong>Peak Concurrent:</strong>
        <div class="stat-value">${visitorStats.peakConcurrent}</div>
      </div>
      
      <div class="stat">
        <strong>Server Start:</strong>
        <div>${visitorStats.startTime}</div>
      </div>
      
      <div class="players-list">
        <h3>👥 Actieve Spelers:</h3>
        ${visitorStats.currentPlayers.length > 0 ? 
          visitorStats.currentPlayers.map(p => `
            <div class="player-item">
              <strong>${p.playerName}</strong> in room <code>${p.roomCode}</code> (sinds ${new Date(p.joinedAt).toLocaleTimeString('nl-NL')})
            </div>
          `).join('') 
          : '<p>Geen spelers online</p>'}
      </div>
      
      <div class="players-list">
        <h3>📊 Recente Activiteit:</h3>
        ${visitorStats.visitHistory.slice(-20).reverse().map(event => `
          <div class="player-item">
            <strong>${event.playerName}</strong> ${event.action} (${new Date(event.timestamp).toLocaleTimeString('nl-NL')})
          </div>
        `).join('')}
      </div>
      
      <hr style="opacity: 0.3;">
      <p style="opacity: 0.7; font-size: 12px;">Auto-refresh elke 10s</p>
      <script>setInterval(() => location.reload(), 10000);</script>
    </body>
    </html>
  `;
  res.send(html);
});

// Game state
let rooms = {};

io.on('connection', (socket) => {
  console.log('Speler verbonden:', socket.id);

  socket.on('joinRoom', (data) => {
    // Rate limiting
    if (!checkRateLimit(socket.id)) {
      socket.emit('rateLimited', { message: 'Te veel requests' });
      return;
    }

    // Input validation
    const playerName = validatePlayerName(data?.playerName);
    const roomCode = validateRoomCode(data?.roomCode);
    
    if (!playerName) {
      socket.emit('invalidPlayerName');
      return;
    }
    if (!roomCode) {
      socket.emit('invalidRoomCode');
      return;
    }
    
    // Track visitor
    trackVisitor(socket.id, playerName, roomCode);
    
    // Maak room aan als deze niet bestaat
    if (!rooms[roomCode]) {
      rooms[roomCode] = {
        players: [],
        gameStarted: false,
        currentPlayer: 0,
        deck: [],
        discardPile: [],
        direction: 1,
        firstRound: true,
        firstRoundPlaysRemaining: 0
      };
    }

    const room = rooms[roomCode];

    // Check of room vol is
    if (room.players.length >= 4) {
      socket.emit('roomFull');
      return;
    }

    // Check of naam al bestaat
    if (room.players.some(p => p.name === playerName)) {
      socket.emit('nameTaken');
      return;
    }

    // Voeg speler toe
    const player = {
      id: socket.id,
      name: playerName,
      hand: [],
      cardsToDraw: 0,
      hasDrawnThisTurn: false
    };

    room.players.push(player);
    socket.join(roomCode);
    socket.roomCode = roomCode;

    console.log(`${playerName} heeft room ${roomCode} gejoined`);

    // Stuur update naar alle spelers in de room
    io.to(roomCode).emit('roomUpdate', {
      players: room.players.map(p => ({ name: p.name, cardCount: p.hand.length })),
      gameStarted: room.gameStarted
    });
  });

  socket.on('startGame', () => {
    if (!checkRateLimit(socket.id)) {
      socket.emit('rateLimited');
      return;
    }

    const roomCode = socket.roomCode;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];
    
    // Security: Verify socket is in room
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) {
      socket.emit('notInRoom');
      return;
    }

    // Check of er genoeg spelers zijn (minimaal 3)
    if (room.players.length < 3) {
      socket.emit('notEnoughPlayers', { required: 3, current: room.players.length });
      return;
    }

    room.gameStarted = true;
    room.firstRound = true;
    room.firstRoundPlaysRemaining = room.players.length;
    room.deck = createDeck();
    room.deck = shuffleDeck(room.deck);
    
    // Deel 7 kaarten aan elke speler
    room.players.forEach(player => {
      player.hand = room.deck.splice(0, 7);
      player.cardsToDraw = 0;
      player.hasDrawnThisTurn = false;
      player.firstRoundPlayed = false;
    });

    // Start zonder kaart in het midden
    room.discardPile = [];
    room.currentPlayer = 0;

    console.log(`Spel gestart in room ${roomCode}`);

    // Stuur game state naar alle spelers
    sendGameState(roomCode);
  });

  socket.on('playCard', (data) => {
    if (!checkRateLimit(socket.id)) {
      socket.emit('rateLimited');
      return;
    }

    const roomCode = socket.roomCode;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    
    // Security: Verify player exists and it's their turn
    if (playerIndex === -1) {
      socket.emit('notInRoom');
      return;
    }
    if (playerIndex !== room.currentPlayer) {
      socket.emit('notYourTurn');
      return;
    }

    const player = room.players[playerIndex];

    // Input validation
    const cardIndex = data?.cardIndex;
    if (!validateCardIndex(cardIndex, player.hand.length)) {
      socket.emit('invalidCardIndex');
      return;
    }
    
    const card = player.hand[cardIndex];
    if (!card) {
      socket.emit('cardNotFound');
      return;
    }
    
    // Validate chosen suit if provided
    const chosenSuit = data?.chosenSuit;
    if (chosenSuit && !validateSuit(chosenSuit)) {
      socket.emit('invalidSuit');
      return;
    }
    const topCard = room.discardPile[room.discardPile.length - 1] || null;

    // Check of kaart gespeeld mag worden
    if (!canPlayCard(card, topCard, player.cardsToDraw, room.firstRound, room.penaltyChain)) {
      socket.emit('invalidMove');
      return;
    }

    // Speel de kaart
    const cardToPlay = player.hand.splice(cardIndex, 1)[0];
    
    // Als het een Boer is en er is een kleur gekozen, verander de suit
    if (cardToPlay.value === 'boer' && chosenSuit) {
      // In eerste ronde moet het klaver blijven
      if (room.firstRound) {
        cardToPlay.chosenSuit = 'klaver';
      } else {
        cardToPlay.chosenSuit = chosenSuit;
      }
    }
    
    room.discardPile.push(cardToPlay);
    
    // Eerste ronde: tel wanneer elke speler 1 kaart heeft gedropt
    if (room.firstRound && !player.firstRoundPlayed) {
      player.firstRoundPlayed = true;
      room.firstRoundPlaysRemaining -= 1;
      if (room.firstRoundPlaysRemaining <= 0) {
        room.firstRound = false;
      }
    }

    // Verify: als niemand meer firstRoundPlayed=false heeft, zet firstRound=false
    if (room.firstRound) {
      const allPlayed = room.players.every(p => p.firstRoundPlayed);
      if (allPlayed) {
        room.firstRound = false;
      }
    }

    // Bewaar originele cardsToDraw voor 10 logica
    const hadCardsToDraw = player.cardsToDraw > 0;

    // Reset cardsToDraw als de speler niet een 7, Aas of 10 heeft gespeeld
    // OF als we in de eerste ronde zijn (special cards werken niet)
    if ((cardToPlay.value !== '7' && cardToPlay.value !== 'aas' && cardToPlay.value !== '10') || room.firstRound) {
      player.cardsToDraw = 0;
    }

    // Handle speciale kaarten (NIET in eerste ronde)
    let skipNext = false;
    if (!room.firstRound) {
      skipNext = handleSpecialCard(room, cardToPlay, playerIndex);
    }

    // Check of speler gewonnen heeft
    if (player.hand.length === 0) {
      // Security: Sanitize winner name
      const winnerName = player.name || 'Onbekend';
      io.to(roomCode).emit('gameOver', { winner: winnerName });
      room.gameStarted = false;
      return;
    }

    // Reset hasDrawnThisTurn voor huidige speler
    player.hasDrawnThisTurn = false;

    // Volgende speler (TENZIJ handleSpecialCard al currentPlayer heeft aangepast)
    if (!skipNext) {
      nextPlayer(room);
    }
    // Reset hasDrawnThisTurn voor nieuwe speler
    room.players[room.currentPlayer].hasDrawnThisTurn = false;

    sendGameState(roomCode);
  });

  socket.on('drawCard', () => {
    if (!checkRateLimit(socket.id)) {
      socket.emit('rateLimited');
      return;
    }

    const roomCode = socket.roomCode;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    
    // Security: Verify player exists and it's their turn
    if (playerIndex === -1) {
      socket.emit('notInRoom');
      return;
    }
    if (playerIndex !== room.currentPlayer) {
      socket.emit('notYourTurn');
      return;
    }

    const player = room.players[playerIndex];

    // Als je geen penaltykaarten moet trekken, mag je maar 1x per beurt trekken
    if (player.cardsToDraw === 0 && player.hasDrawnThisTurn) {
      socket.emit('alreadyDrewThisTurn');
      return;
    }

    // Trek ALTIJD 1 kaart (niet meerdere tegelijk)
    if (room.deck.length === 0) {
      // Shuffle discard pile terug in deck (behalve top card)
      const topCard = room.discardPile.pop();
      room.deck = shuffleDeck(room.discardPile);
      room.discardPile = [topCard];
    }
    
    if (room.deck.length > 0) {
      player.hand.push(room.deck.pop());
    }

    // Markeer dat speler heeft getrokken
    player.hasDrawnThisTurn = true;

    // Verlaag cardsToDraw met 1
    if (player.cardsToDraw > 0) {
      player.cardsToDraw -= 1;
      // Volledig getrokken? Reset chain
      if (player.cardsToDraw === 0 && room.penaltyChain && room.penaltyChain.currentTarget === playerIndex) {
        room.penaltyChain = null;
      }
    }

    // NIET automatisch naar volgende speler - laat speler eerst kijken of er iets mee kan
    sendGameState(roomCode);
  });

  socket.on('passTurn', () => {
    if (!checkRateLimit(socket.id)) {
      socket.emit('rateLimited');
      return;
    }

    const roomCode = socket.roomCode;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    
    // Security: Verify player exists and it's their turn
    if (playerIndex === -1) {
      socket.emit('notInRoom');
      return;
    }
    if (playerIndex !== room.currentPlayer) {
      socket.emit('notYourTurn');
      return;
    }

    const player = room.players[playerIndex];
    
    // Je mag NIET passen zolang er penaltykaarten wachten (cardsToDraw > 0)
    // Je MOET alle kaarten trekken voordat je mag passen
    if (player.cardsToDraw > 0) {
      socket.emit('mustDrawOrDefend');
      return;
    }
    
    // Je moet eerst minstens 1 kaart trekken voordat je mag passen
    if (!player.hasDrawnThisTurn) {
      socket.emit('mustDrawFirst');
      return;
    }

    // Reset hasDrawnThisTurn
    player.hasDrawnThisTurn = false;

    // Eerste ronde: als speler past, telt dit ook als "gespeeld"
    if (room.firstRound && !player.firstRoundPlayed) {
      player.firstRoundPlayed = true;
      room.firstRoundPlaysRemaining -= 1;
      if (room.firstRoundPlaysRemaining <= 0) {
        room.firstRound = false;
      }
    }

    // Verify: als niemand meer firstRoundPlayed=false heeft, zet firstRound=false
    if (room.firstRound) {
      const allPlayed = room.players.every(p => p.firstRoundPlayed);
      if (allPlayed) {
        room.firstRound = false;
      }
    }

    // Volgende speler
    nextPlayer(room);
    // Reset voor volgende speler
    room.players[room.currentPlayer].hasDrawnThisTurn = false;
    sendGameState(roomCode);
  });

  socket.on('disconnect', () => {
    console.log('Speler disconnected:', socket.id);
    
    // Track disconnect
    removeVisitor(socket.id);
    
    // Clean up rate limiting
    delete requestLimits[socket.id];
    
    const roomCode = socket.roomCode;
    if (roomCode && rooms[roomCode]) {
      const room = rooms[roomCode];
      room.players = room.players.filter(p => p.id !== socket.id);

      if (room.players.length === 0) {
        delete rooms[roomCode];
      } else {
        io.to(roomCode).emit('roomUpdate', {
          players: room.players.map(p => ({ name: p.name, cardCount: p.hand.length })),
          gameStarted: room.gameStarted
        });
      }
    }
  });
});

function createDeck() {
  const suits = ['harten', 'ruiten', 'klaver', 'schoppen'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'boer', 'vrouw', 'heer', 'aas'];
  const deck = [];

  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({ suit, value });
    });
  });

  return deck;
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function canPlayCard(card, topCard, cardsToDraw, firstRound, penaltyChain) {
  // In de eerste ronde kun je alleen klavers gooien
  if (firstRound) {
    return card.suit === 'klaver';
  }

  // Als er nog geen kaart in het midden ligt, mag je elke kaart spelen (BEHALVE Boer zonder defensie)
  if (!topCard) {
    if (card.value === 'boer' && cardsToDraw > 0) {
      return false;
    }
    return true;
  }

  // DEFENSIE MODE: penalty chain actief (cardsToDraw > 0)
  if (cardsToDraw > 0 && penaltyChain) {
    // Kan ALLEEN 7/10/Aas verdedigen met DEZELFDE SUIT
    if (card.value === '7' || card.value === '10' || card.value === 'aas') {
      return card.suit === penaltyChain.originalSuit;
    }
    return false; // Alles anders mag niet
  }

  // Normale verdediging zonder chain (cardsToDraw > 0 maar geen chain)
  if (cardsToDraw > 0) {
    if (card.value === '7' || card.value === 'aas' || card.value === '10') {
      const effectiveSuit = topCard.chosenSuit || topCard.suit;
      return card.suit === effectiveSuit || card.value === topCard.value;
    }
    return false;
  }

  // Boer kan altijd gespeeld worden (TENZIJ je moet verdedigen)
  if (card.value === 'boer') {
    return true;
  }

  // Als de topCard een Boer is met gekozen kleur, gebruik die kleur
  const effectiveSuit = topCard.chosenSuit || topCard.suit;

  // Anders moet suit of value overeenkomen
  return card.suit === effectiveSuit || card.value === topCard.value;
}

function handleSpecialCard(room, card, playerIndex) {
  const currentPlayer = room.players[playerIndex];
  let skipNextPlayer = false;
  
  switch (card.value) {
    case '7':
      // 7 altijd: penalty gaat naar volgende (forward)
      const nextPlayerIndex = (room.currentPlayer + room.direction + room.players.length) % room.players.length;
      
      if (!room.penaltyChain) {
        // NIEUWE 7: start chain
        room.penaltyChain = {
          totalCards: 2,
          originalSuit: card.suit,
          lastPenaltyPlayerIndex: playerIndex, // wie gooide deze 7
          currentTarget: nextPlayerIndex // wie moet nu trekken
        };
      } else {
        // STACKING 7: voeg toe en shift target forward
        room.penaltyChain.totalCards += 2;
        room.penaltyChain.lastPenaltyPlayerIndex = playerIndex;
        room.penaltyChain.originalSuit = card.suit;
        room.penaltyChain.currentTarget = nextPlayerIndex;
      }
      
      room.players[nextPlayerIndex].cardsToDraw = room.penaltyChain.totalCards;
      currentPlayer.cardsToDraw = 0;
      skipNextPlayer = false; // nextPlayer() gaat naar target
      break;
      
    case 'aas':
    case '10':
      // DEFENSIE tegen penalty (moeten dezelfde suit hebben - checked in canPlayCard)
      if (room.penaltyChain && room.penaltyChain.totalCards > 0) {
        // Defensie: penalty TERUG naar vorige
        const prevPlayer = room.penaltyChain.lastPenaltyPlayerIndex;
        room.players[prevPlayer].cardsToDraw = room.penaltyChain.totalCards;
        currentPlayer.cardsToDraw = 0;
        
        // Update chain: huida wordt nu new "lastPenaltyPlayerIndex" voor volgende verdediger
        room.penaltyChain.lastPenaltyPlayerIndex = playerIndex;
        room.penaltyChain.originalSuit = card.suit;
        room.penaltyChain.currentTarget = prevPlayer;
        
        // Vorige must play next (for draw or re-defend)
        room.currentPlayer = prevPlayer;
        skipNextPlayer = true;
      } else {
        // Normale Aas/10 (geen penalty): skip volgende
        room.currentPlayer = (room.currentPlayer + room.direction + room.players.length) % room.players.length;
        skipNextPlayer = false;
      }
      break;
      
    case 'boer':
      // Boer: kleur kiezen (afgehandeld in playCard)
      break;
  }
  
  return skipNextPlayer;
}

function nextPlayer(room) {
  room.currentPlayer = (room.currentPlayer + room.direction + room.players.length) % room.players.length;
}

function sendGameState(roomCode) {
  const room = rooms[roomCode];
  
  // Security: Verify room exists
  if (!room || !room.players) {
    return;
  }
  
  room.players.forEach((player, index) => {
    // Security: Verify player object
    if (!player || !player.id) {
      return;
    }
    
    // Check of speler een speelbare kaart heeft
    let hasPlayableCard = false;
    if (index === room.currentPlayer) {
      const topCard = room.discardPile[room.discardPile.length - 1];
      hasPlayableCard = player.hand.some(card => 
        canPlayCard(card, topCard, player.cardsToDraw, room.firstRound, room.penaltyChain)
      );
    }
    
    io.to(player.id).emit('gameState', {
      yourHand: player.hand,
      yourTurn: index === room.currentPlayer,
      yourHasDrawnThisTurn: player.hasDrawnThisTurn,
      topCard: room.discardPile[room.discardPile.length - 1] || null,
      players: room.players.map(p => ({
        name: p.name,
        cardCount: p.hand.length,
        cardsToDraw: p.cardsToDraw
      })),
      currentPlayer: room.players[room.currentPlayer].name,
      deckCount: room.deck.length,
      firstRound: room.firstRound,
      mustDraw: !hasPlayableCard && index === room.currentPlayer,
      hasPlayableCard: hasPlayableCard
    });
  });
}

http.listen(PORT, () => {
  console.log(`\n🎮 VuileZeven Server Started`);
  console.log(`✅ Secure (HTTPS/WSS enforced)`);
  console.log(`✅ Port: ${PORT}`);
  console.log(`📊 Stats available at: /stats`);
  console.log(`📊 API available at: /api/stats\n`);
  console.log('━'.repeat(50));
});
