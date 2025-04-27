const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://gamehub.vercel.app'],
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function getInitialTimer(difficulty) {
  switch (difficulty) {
    case 'easy': return 120;
    case 'medium': return 90;
    case 'hard': return 60;
    default: return 90;
  }
}

function getPairCount(difficulty) {
  switch (difficulty) {
    case 'easy': return 8;
    case 'medium': return 12;
    case 'hard': return 16;
    default: return 12;
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('createRoom', ({ playerId, theme, difficulty }) => {
    if (!playerId) {
      socket.emit('error', { message: 'Player ID required' });
      console.error('createRoom failed: No playerId');
      return;
    }
    if (!theme || !difficulty) {
      socket.emit('error', { message: 'Theme and difficulty required' });
      console.error('createRoom failed: No theme or difficulty');
      return;
    }
    const roomId = generateRoomCode();
    rooms.set(roomId, {
      players: [{ playerId, score: 0 }],
      gameState: 'waiting',
      timer: null,
      theme,
      difficulty,
      matchedPairs: 0,
      totalPairs: getPairCount(difficulty),
    });
    socket.join(roomId);
    socket.emit('roomCreated', roomId);
    console.log(`Room ${roomId} created by ${playerId} with theme ${theme}, difficulty ${difficulty}`);
  });

  socket.on('joinRoom', ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      console.error(`joinRoom failed: Room ${roomId} not found`);
      return;
    }
    if (room.gameState !== 'waiting') {
      socket.emit('error', { message: 'Game already started' });
      console.error(`joinRoom failed: Game started in ${roomId}`);
      return;
    }
    if (room.players.some(p => p.playerId === playerId)) {
      socket.emit('error', { message: 'Player already in room' });
      console.error(`joinRoom failed: ${playerId} already in ${roomId}`);
      return;
    }
    room.players.push({ playerId, score: 0 });
    socket.join(roomId);
    io.to(roomId).emit('playerCount', room.players.length);
    socket.emit('joinedRoom', roomId);
    console.log(`${playerId} joined room ${roomId} with theme ${room.theme}, difficulty ${room.difficulty}`);
  });

  socket.on('requestGameSettings', (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      socket.emit('gameSettings', { theme: room.theme, difficulty: room.difficulty });
    }
  });

  socket.on('startGame', ({ roomId, settings }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      console.error(`startGame failed: Room ${roomId} not found`);
      return;
    }
    if (room.gameState !== 'waiting') return;
    room.gameState = 'playing';
    room.theme = settings.theme || room.theme;
    room.difficulty = settings.difficulty || room.difficulty;
    room.matchedPairs = 0;
    const timeLeft = getInitialTimer(room.difficulty);
    room.players.forEach(player => {
      player.score = 0;
      player.timer = timeLeft;
    });
    io.to(roomId).emit('startGame', { score: 0, timer: timeLeft });
    console.log(`Game started in room ${roomId} with theme ${room.theme}, difficulty ${room.difficulty}`);

    room.timer = setInterval(() => {
      room.players.forEach(player => {
        player.timer -= 1;
      });
      io.to(roomId).emit('updatePlayerState', { score: 0, timer: room.players[0].timer });
      if (room.players[0].timer <= 0 && room.matchedPairs < room.totalPairs) {
        clearInterval(room.timer);
        room.gameState = 'finished';
        const results = room.players.map(p => ({ id: p.playerId, score: p.score }));
        io.to(roomId).emit('gameOver', { score: 0, results, gameResult: 'loss' });
        console.log(`Game over in room ${roomId}: Time expired`);
      }
    }, 1000);
  });

  socket.on('flipCard', ({ roomId, index }) => {
    const room = rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return;
    io.to(roomId).emit('cardFlipped', { index, matched: false });
  });

  socket.on('scorePoints', ({ roomId, points }) => {
    const room = rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return;
    const player = room.players.find(p => p.playerId === socket.id);
    if (player) {
      player.score += points;
      room.matchedPairs += 1;
      io.to(roomId).emit('cardFlipped', { index: -1, matched: true });
      io.to(roomId).emit('updatePlayerState', { score: player.score, timer: player.timer });
      if (room.matchedPairs >= room.totalPairs) {
        clearInterval(room.timer);
        room.gameState = 'finished';
        const results = room.players.map(p => ({ id: p.playerId, score: p.score }));
        io.to(roomId).emit('gameOver', { score: player.score, results, gameResult: 'win' });
        console.log(`Game over in room ${roomId}: All pairs matched`);
      }
    }
  });

  socket.on('activateSpecialCard', ({ roomId, effect }) => {
    const room = rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return;
    io.to(roomId).emit('specialCardActivated', { effect });
  });

  socket.on('buyTime', (roomId) => {
    const room = rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return;
    const player = room.players.find(p => p.playerId === socket.id);
    if (player) {
      player.timer += 30;
      io.to(roomId).emit('updatePlayerState', { score: player.score, timer: player.timer });
    }
  });

  socket.on('completeGame', ({ roomId, timeBonus, gameResult }) => {
    const room = rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return;
    const player = room.players.find(p => p.playerId === socket.id);
    if (player) {
      player.score += timeBonus;
      clearInterval(room.timer);
      room.gameState = 'finished';
      const results = room.players.map(p => ({ id: p.playerId, score: p.score }));
      io.to(roomId).emit('gameOver', { score: player.score, results, gameResult });
      console.log(`Game completed in room ${roomId}: ${gameResult}`);
    }
  });

  socket.on('startNewGame', (roomId) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.gameState = 'playing';
    room.matchedPairs = 0;
    const timeLeft = getInitialTimer(room.difficulty);
    room.players.forEach(player => {
      player.score = 0;
      player.timer = timeLeft;
    });
    io.to(roomId).emit('startGame', { score: 0, timer: timeLeft });
    console.log(`New game started in room ${roomId}`);

    room.timer = setInterval(() => {
      room.players.forEach(player => {
        player.timer -= 1;
      });
      io.to(roomId).emit('updatePlayerState', { score: 0, timer: room.players[0].timer });
      if (room.players[0].timer <= 0 && room.matchedPairs < room.totalPairs) {
        clearInterval(room.timer);
        room.gameState = 'finished';
        const results = room.players.map(p => ({ id: p.playerId, score: p.score }));
        io.to(roomId).emit('gameOver', { score: 0, results, gameResult: 'loss' });
        console.log(`Game over in room ${roomId}: Time expired`);
      }
    }, 1000);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    for (const [roomId, room] of rooms) {
      const playerIndex = room.players.findIndex(p => p.playerId === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        io.to(roomId).emit('playerCount', room.players.length);
        if (room.players.length === 0) {
          clearInterval(room.timer);
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted: No players`);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});