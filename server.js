const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: [
      'https://vuilezeven.netlify.app',
      'https://willowy-malabi-cbe9c3.netlify.app',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST']
  }
});
const path = require('path');

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Game state
let rooms = {};

io.on('connection', (socket) => {
  console.log('Speler verbonden:', socket.id);

  socket.on('joinRoom', (data) => {
    const { roomCode, playerName } = data;
    
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
    const roomCode = socket.roomCode;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];

    // Check of er genoeg spelers zijn (minimaal 2)
    if (room.players.length < 2) {
      socket.emit('notEnoughPlayers');
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
    const roomCode = socket.roomCode;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    
    if (playerIndex !== room.currentPlayer) {
      socket.emit('notYourTurn');
      return;
    }

    const player = room.players[playerIndex];

    const { cardIndex, chosenSuit } = data;
    const card = player.hand[cardIndex];
    const topCard = room.discardPile[room.discardPile.length - 1] || null;

    // Check of kaart gespeeld mag worden
    if (!canPlayCard(card, topCard, player.cardsToDraw, room.firstRound)) {
      socket.emit('invalidMove');
      return;
    }

    // Speel de kaart
    player.hand.splice(cardIndex, 1);
    
    // Als het een Boer is en er is een kleur gekozen, verander de suit
    if (card.value === 'boer' && chosenSuit) {
      // In eerste ronde moet het klaver blijven
      if (room.firstRound) {
        card.chosenSuit = 'klaver';
      } else {
        card.chosenSuit = chosenSuit;
      }
    }
    
    room.discardPile.push(card);
    
    // Eerste ronde: tel wanneer elke speler 1 kaart heeft gedropt
    if (room.firstRound && !player.firstRoundPlayed) {
      player.firstRoundPlayed = true;
      room.firstRoundPlaysRemaining -= 1;
      if (room.firstRoundPlaysRemaining <= 0) {
        room.firstRound = false;
      }
    }

    // Bewaar originele cardsToDraw voor 10 logica
    const hadCardsToDraw = player.cardsToDraw > 0;

    // Reset cardsToDraw als de speler niet een 7, Aas of 10 heeft gespeeld
    // OF als we in de eerste ronde zijn (special cards werken niet)
    if ((card.value !== '7' && card.value !== 'aas' && card.value !== '10') || room.firstRound) {
      player.cardsToDraw = 0;
    }

    // Handle speciale kaarten (NIET in eerste ronde)
    if (!room.firstRound) {
      handleSpecialCard(room, card, playerIndex);
    }

    // Check of speler gewonnen heeft
    if (player.hand.length === 0) {
      io.to(roomCode).emit('gameOver', { winner: player.name });
      room.gameStarted = false;
      return;
    }

    // Reset hasDrawnThisTurn voor huidige speler
    player.hasDrawnThisTurn = false;

    // Volgende speler
    // Als het een 10 was met cardsToDraw, dan is de currentPlayer al aangepast
    // Als het een 10 was zonder cardsToDraw, dan blijft de beurt bij deze speler
    if (card.value === '10' && !hadCardsToDraw) {
      // 10 zonder 7: blijf bij huidige speler (gaat 1 achteruit en dan terug)
      // Dus skip de nextPlayer() call
    } else {
      nextPlayer(room);
      // Reset hasDrawnThisTurn voor nieuwe speler
      room.players[room.currentPlayer].hasDrawnThisTurn = false;
    }
    sendGameState(roomCode);
  });

  socket.on('drawCard', () => {
    const roomCode = socket.roomCode;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    
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
    }

    // NIET automatisch naar volgende speler - laat speler eerst kijken of er iets mee kan
    sendGameState(roomCode);
  });

  socket.on('passTurn', () => {
    const roomCode = socket.roomCode;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    
    if (playerIndex !== room.currentPlayer) {
      socket.emit('notYourTurn');
      return;
    }

    const player = room.players[playerIndex];
    
    // Je mag alleen niet passen als je kaarten moet trekken van een 7
    if (player.cardsToDraw > 0) {
      socket.emit('mustDrawOrDefend');
      return;
    }
    
    // Je moet eerst een kaart trekken voordat je mag passen
    if (!player.hasDrawnThisTurn) {
      socket.emit('mustDrawFirst');
      return;
    }

    // Reset hasDrawnThisTurn
    player.hasDrawnThisTurn = false;

    // Volgende speler
    nextPlayer(room);
    // Reset voor volgende speler
    room.players[room.currentPlayer].hasDrawnThisTurn = false;
    sendGameState(roomCode);
  });

  socket.on('disconnect', () => {
    console.log('Speler disconnected:', socket.id);
    
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

function canPlayCard(card, topCard, cardsToDraw, firstRound) {
  // In de eerste ronde kun je alleen klavers gooien (specials mogen wel, maar zijn niet actief)
  if (firstRound) {
    return card.suit === 'klaver';
  }

  // Als er nog geen kaart in het midden ligt, mag je elke kaart spelen
  if (!topCard) {
    return true;
  }

  // Boer kan altijd gespeeld worden
  if (card.value === 'boer') {
    return true;
  }

  // Als de topCard een Boer is met gekozen kleur, gebruik die kleur
  const effectiveSuit = topCard.chosenSuit || topCard.suit;

  // Als je kaarten moet trekken, kun je alleen een 7, Aas of 10 spelen (om te verdedigen)
  // MAAR het moet wel de juiste kleur of waarde zijn!
  if (cardsToDraw > 0) {
    if (card.value === '7' || card.value === 'aas' || card.value === '10') {
      return card.suit === effectiveSuit || card.value === topCard.value;
    }
    return false;
  }

  // Anders moet suit of value overeenkomen
  return card.suit === effectiveSuit || card.value === topCard.value;
}

function handleSpecialCard(room, card, playerIndex) {
  const currentPlayer = room.players[playerIndex];
  
  switch (card.value) {
    case '7':
      // Volgende speler moet 2 kaarten trekken (kan gestapeld worden)
      const nextPlayerIndex = (room.currentPlayer + room.direction + room.players.length) % room.players.length;
      room.players[nextPlayerIndex].cardsToDraw += 2;
      // Huidige speler verdedigt met 7, dus eigen penalty vervalt
      currentPlayer.cardsToDraw = 0;
      // Track penalty chain
      if (!room.penaltyChain) {
        room.penaltyChain = {
          totalCards: 2,
          originalSuit: card.suit,
          lastPenaltyPlayerIndex: playerIndex,
          penaltyTarget: nextPlayerIndex
        };
      } else {
        room.penaltyChain.totalCards += 2;
        room.penaltyChain.lastPenaltyPlayerIndex = playerIndex;
        room.penaltyChain.originalSuit = card.suit;
      }
      break;
    case 'aas':
      // Skip volgende speler
      const skipPlayerIndex = (room.currentPlayer + room.direction + room.players.length) % room.players.length;
      // Als er pending kaarten zijn, gaan ze naar speler erna
      if (room.penaltyChain && room.penaltyChain.totalCards > 0) {
        const targetPlayerIndex = (skipPlayerIndex + room.direction + room.players.length) % room.players.length;
        room.players[targetPlayerIndex].cardsToDraw = room.penaltyChain.totalCards;
        currentPlayer.cardsToDraw = 0;
        room.penaltyChain.penaltyTarget = targetPlayerIndex;
        // Zet currentPlayer naar speler die kaarten krijgt (skip 2 spelers dus)
        room.currentPlayer = targetPlayerIndex;
      } else {
        // Zonder penalty chain: skip gewoon 1 speler
        room.currentPlayer = skipPlayerIndex;
      }
      break;
    case '10':
      // Reflecteer penalty terug naar originele speler
      if (room.penaltyChain && room.penaltyChain.totalCards > 0) {
        // Check of kaart dezelfde suit als originele 7
        if (card.suit === room.penaltyChain.originalSuit) {
          // Kaats terug naar wie de penalty gooide
          const originalPlayerIndex = room.penaltyChain.lastPenaltyPlayerIndex;
          room.players[originalPlayerIndex].cardsToDraw = room.penaltyChain.totalCards;
          currentPlayer.cardsToDraw = 0;
          
          // Zet huidige speler naar degene vóór die (zodat beurt weer naar huidi gaat)
          room.currentPlayer = (originalPlayerIndex - room.direction + room.players.length) % room.players.length;
          
          // Reset penalty chain
          room.penaltyChain = null;
        }
      }
      break;
    case 'boer':
      // Boer: speler kan kleur kiezen (wordt apart afgehandeld in playCard)
      break;
  }
}

function nextPlayer(room) {
  room.currentPlayer = (room.currentPlayer + room.direction + room.players.length) % room.players.length;
}

function sendGameState(roomCode) {
  const room = rooms[roomCode];
  
  room.players.forEach((player, index) => {
    // Check of speler een speelbare kaart heeft
    let hasPlayableCard = false;
    if (index === room.currentPlayer) {
      const topCard = room.discardPile[room.discardPile.length - 1];
      hasPlayableCard = player.hand.some(card => 
        canPlayCard(card, topCard, player.cardsToDraw, room.firstRound)
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
  console.log(`Server draait op http://localhost:${PORT}`);
});
