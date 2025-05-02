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
    case 'easy': return 60;
    case 'medium': return 45;
    case 'hard': return 30;
    default: return 45;
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
      players: [{ playerId, score: 0, timer: getInitialTimer(difficulty) }],
      gameState: 'waiting',
      timerInterval: null,
      theme,
      difficulty,
      currentQuestion: 0,
      totalQuestions: 6,
      answers: [], // Store answers for each question
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
    room.players.push({ playerId, score: 0, timer: room.players[0].timer });
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
    room.currentQuestion = 0;
    room.answers = [];
    const timeLeft = getInitialTimer(room.difficulty);
    room.players.forEach(player => {
      player.score = 0;
      player.timer = timeLeft;
    });
    io.to(roomId).emit('startGame', { scores: room.players.map(p => ({ playerId: p.playerId, score: p.score })), timer: timeLeft, currentQuestion: room.currentQuestion });
    console.log(`Game started in room ${roomId} with theme ${room.theme}, difficulty ${room.difficulty}`);

    room.timerInterval = setInterval(() => {
      room.players.forEach(player => {
        player.timer -= 1;
      });
      io.to(roomId).emit('timerUpdate', room.players[0].timer);
      if (room.players[0].timer <= 0 && room.currentQuestion < room.totalQuestions) {
        clearInterval(room.timerInterval);
        room.answers.push({
          questionIndex: room.currentQuestion,
          responses: room.players.map(p => ({ playerId: p.playerId, selectedAnswer: 'Time Out', isCorrect: false })),
        });
        io.to(roomId).emit('answerFeedback', {
          questionIndex: room.currentQuestion,
          responses: room.players.map(p => ({ playerId: p.playerId, selectedAnswer: 'Time Out', isCorrect: false })),
          correctAnswer: 'N/A', // Client will fetch the correct answer
        });
        setTimeout(() => {
          if (room.currentQuestion + 1 < room.totalQuestions) {
            room.currentQuestion += 1;
            room.players.forEach(player => {
              player.timer = getInitialTimer(room.difficulty);
            });
            io.to(roomId).emit('nextQuestion', {
              currentQuestion: room.currentQuestion,
              timer: room.players[0].timer,
            });
            room.timerInterval = setInterval(() => {
              room.players.forEach(player => {
                player.timer -= 1;
              });
              io.to(roomId).emit('timerUpdate', room.players[0].timer);
              if (room.players[0].timer <= 0) {
                clearInterval(room.timerInterval);
              }
            }, 1000);
          } else {
            room.gameState = 'finished';
            const results = room.players.map(p => ({ playerId: p.playerId, score: p.score }));
            io.to(roomId).emit('gameOver', { results });
            console.log(`Game over in room ${roomId}: All questions answered`);
          }
        }, 1000);
      }
    }, 1000);
  });

  socket.on('submitAnswer', ({ roomId, playerId, selectedAnswer, correctAnswer }) => {
    const room = rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return;
    const player = room.players.find(p => p.playerId === playerId);
    if (!player) return;
    const isCorrect = selectedAnswer === correctAnswer;
    player.score += isCorrect ? 500 : 0;
    let questionAnswers = room.answers.find(a => a.questionIndex === room.currentQuestion);
    if (!questionAnswers) {
      questionAnswers = { questionIndex: room.currentQuestion, responses: [] };
      room.answers.push(questionAnswers);
    }
    questionAnswers.responses.push({ playerId, selectedAnswer, isCorrect });
    io.to(roomId).emit('answerFeedback', {
      questionIndex: room.currentQuestion,
      responses: questionAnswers.responses,
      correctAnswer,
    });
    clearInterval(room.timerInterval);
    setTimeout(() => {
      if (room.currentQuestion + 1 < room.totalQuestions) {
        room.currentQuestion += 1;
        room.players.forEach(player => {
          player.timer = getInitialTimer(room.difficulty);
        });
        io.to(roomId).emit('nextQuestion', {
          currentQuestion: room.currentQuestion,
          timer: room.players[0].timer,
          scores: room.players.map(p => ({ playerId: p.playerId, score: p.score })),
        });
        room.timerInterval = setInterval(() => {
          room.players.forEach(player => {
            player.timer -= 1;
          });
          io.to(roomId).emit('timerUpdate', room.players[0].timer);
          if (room.players[0].timer <= 0) {
            clearInterval(room.timerInterval);
          }
        }, 1000);
      } else {
        room.gameState = 'finished';
        const results = room.players.map(p => ({ playerId: p.playerId, score: p.score }));
        io.to(roomId).emit('gameOver', { results });
        console.log(`Game over in room ${roomId}: All questions answered`);
      }
    }, 1000);
  });

  socket.on('startNewGame', (roomId) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.gameState = 'playing';
    room.currentQuestion = 0;
    room.answers = [];
    const timeLeft = getInitialTimer(room.difficulty);
    room.players.forEach(player => {
      player.score = 0;
      player.timer = timeLeft;
    });
    io.to(roomId).emit('startGame', { scores: room.players.map(p => ({ playerId: p.playerId, score: p.score })), timer: timeLeft, currentQuestion: room.currentQuestion });
    console.log(`New game started in room ${roomId}`);

    room.timerInterval = setInterval(() => {
      room.players.forEach(player => {
        player.timer -= 1;
      });
      io.to(roomId).emit('timerUpdate', room.players[0].timer);
      if (room.players[0].timer <= 0 && room.currentQuestion < room.totalQuestions) {
        clearInterval(room.timerInterval);
        room.answers.push({
          questionIndex: room.currentQuestion,
          responses: room.players.map(p => ({ playerId: p.playerId, selectedAnswer: 'Time Out', isCorrect: false })),
        });
        io.to(roomId).emit('answerFeedback', {
          questionIndex: room.currentQuestion,
          responses: room.players.map(p => ({ playerId: p.playerId, selectedAnswer: 'Time Out', isCorrect: false })),
          correctAnswer: 'N/A',
        });
        setTimeout(() => {
          if (room.currentQuestion + 1 < room.totalQuestions) {
            room.currentQuestion += 1;
            room.players.forEach(player => {
              player.timer = getInitialTimer(room.difficulty);
            });
            io.to(roomId).emit('nextQuestion', {
              currentQuestion: room.currentQuestion,
              timer: room.players[0].timer,
            });
            room.timerInterval = setInterval(() => {
              room.players.forEach(player => {
                player.timer -= 1;
              });
              io.to(roomId).emit('timerUpdate', room.players[0].timer);
              if (room.players[0].timer <= 0) {
                clearInterval(room.timerInterval);
              }
            }, 1000);
          } else {
            room.gameState = 'finished';
            const results = room.players.map(p => ({ playerId: p.playerId, score: p.score }));
            io.to(roomId).emit('gameOver', { results });
            console.log(`Game over in room ${roomId}: All questions answered`);
          }
        }, 1000);
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
          clearInterval(room.timerInterval);
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