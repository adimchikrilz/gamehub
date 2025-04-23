const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('createRoom', () => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms.set(roomCode, {
      players: new Map([[socket.id, { ready: false, score: 0, timer: 60 }]]), // 60s for Card Game
    });
    socket.join(roomCode);
    socket.emit('roomCreated', roomCode);
    io.to(roomCode).emit('playerCount', rooms.get(roomCode).players.size);
  });

  socket.on('joinRoom', (roomCode) => {
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      if (room.players.size < 10) {
        room.players.set(socket.id, { ready: false, score: 0, timer: 60 });
        socket.join(roomCode);
        socket.emit('joinedRoom', roomCode);
        io.to(roomCode).emit('playerCount', room.players.size);
      } else {
        socket.emit('error', 'Room is full');
      }
    } else {
      socket.emit('error', 'Room does not exist');
    }
  });

  socket.on('ready', (roomCode) => {
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      room.players.get(socket.id).ready = true;

      const allReady = Array.from(room.players.values()).every((p) => p.ready);
      if (room.players.size > 0 && allReady) {
        io.to(roomCode).emit('startGame', { score: 0, timer: 60 });

        const interval = setInterval(() => {
          room.players.forEach((player, playerId) => {
            if (player.timer > 0) {
              player.timer -= 1;
              io.to(playerId).emit('updatePlayerState', {
                score: player.score,
                timer: player.timer,
              });
            }
            if (player.timer === 0) {
              console.log(`Game over for player ${playerId}`);
              io.to(playerId).emit('gameOver', {
                score: player.score,
                results: Array.from(room.players.entries()).map(([id, p]) => ({
                  id,
                  score: p.score,
                })),
              });
            }
          });

          if (Array.from(room.players.values()).every((p) => p.timer === 0)) {
            clearInterval(interval);
          }
        }, 1000);
      }
    }
  });

  socket.on('selectCard', ({ roomCode, points }) => {
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      if (room.players.has(socket.id)) {
        room.players.get(socket.id).score += points;
        io.to(socket.id).emit('updatePlayerState', {
          score: room.players.get(socket.id).score,
          timer: room.players.get(socket.id).timer,
        });
      }
    }
  });

  socket.on('submitAnswer', ({ roomCode, answerIndex, questionIndex }) => {
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      if (room.players.has(socket.id)) {
        const player = room.players.get(socket.id);
        const questions = [
          { correct: 2 },
          { correct: 1 },
          { correct: 2 },
          { correct: 0 },
          { correct: 1 },
          { correct: 1 },
          { correct: 2 },
          { correct: 0 },
          { correct: 2 },
          { correct: 1 },
        ];
        if (answerIndex === questions[questionIndex].correct) {
          player.score += 10;
        }
        io.to(socket.id).emit('updatePlayerState', {
          score: player.score,
          timer: player.timer,
        });
      }
    }
  });

  socket.on('endGame', ({ roomCode }) => {
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      room.players.forEach((player, playerId) => {
        player.timer = 0;
        io.to(playerId).emit('gameOver', {
          score: player.score,
          results: Array.from(room.players.entries()).map(([id, p]) => ({
            id,
            score: p.score,
          })),
        });
      });
    }
  });

  socket.on('buyTime', (roomCode) => {
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      if (room.players.has(socket.id)) {
        const player = room.players.get(socket.id);
        if (player.timer === 0) {
          console.log(`Player ${socket.id} bought time`);
          player.timer = 30;
          player.score = 0; // Reset score for fairness
          io.to(socket.id).emit('updatePlayerState', {
            score: player.score,
            timer: player.timer,
          });
        }
      }
    }
  });

  socket.on('startNewGame', (roomCode) => {
    if (rooms.has(roomCode)) {
      console.log(`Starting new game for room: ${roomCode}`);
      const room = rooms.get(roomCode);
      room.players.forEach((player) => {
        player.score = 0;
        player.timer = 60;
        player.ready = true; // Auto-ready for simplicity
      });
      io.to(roomCode).emit('startGame', { score: 0, timer: 60 });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    rooms.forEach((room, roomCode) => {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        io.to(roomCode).emit('playerCount', room.players.size);
        if (room.players.size === 0) {
          rooms.delete(roomCode);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});