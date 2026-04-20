import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const rooms = new Map();

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('create-room', ({ questions, hostName }) => {
    const code = generateCode();
    const room = {
      code,
      hostId: socket.id,
      hostName: hostName || 'Host',
      players: [],
      questions,
      currentQuestion: -1,
      state: 'lobby',
      answers: new Map(),
      timer: null
    };
    rooms.set(code, room);
    socket.join(code);
    socket.emit('room-created', { code });
    console.log(`Room ${code} created by ${hostName}`);
  });

  socket.on('join-room', ({ code, name }) => {
    const room = rooms.get(code);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    if (room.state !== 'lobby') {
      socket.emit('error', { message: 'Game already started' });
      return;
    }
    const player = { id: socket.id, name, score: 0, streak: 0 };
    room.players.push(player);
    socket.join(code);
    socket.emit('joined', { roomCode: code, players: room.players.map(p => ({ name: p.name, score: p.score })) });
    io.to(code).emit('player-joined', { players: room.players.map(p => ({ name: p.name, score: p.score })) });
    console.log(`${name} joined room ${code}`);
  });

  socket.on('start-game', ({ code }) => {
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) return;
    room.state = 'playing';
    io.to(code).emit('game-started');
    nextQuestion(code);
  });

  socket.on('submit-answer', ({ code, answerIndex }) => {
    const room = rooms.get(code);
    if (!room || room.state !== 'question') return;
    if (room.answers.has(socket.id)) return;

    const timeLeft = room.timeLeft || 0;
    const correct = answerIndex === room.questions[room.currentQuestion].answerIndex;
    let points = 0;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    if (correct) {
      points = Math.round(1000 * (timeLeft / 20));
      player.score += points;
      player.streak += 1;
      if (player.streak >= 3) points += 200;
    } else {
      player.streak = 0;
    }

    room.answers.set(socket.id, { answerIndex, correct, points });
    socket.emit('answer-result', { correct, points, score: player.score });

    if (room.answers.size === room.players.length) {
      clearTimeout(room.timer);
      showResults(code);
    }
  });

  socket.on('next-question', ({ code }) => {
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) return;
    nextQuestion(code);
  });

  socket.on('disconnect', () => {
    for (const [code, room] of rooms) {
      if (room.hostId === socket.id) {
        io.to(code).emit('game-ended', { reason: 'Host disconnected' });
        clearTimeout(room.timer);
        rooms.delete(code);
      } else {
        const idx = room.players.findIndex(p => p.id === socket.id);
        if (idx !== -1) {
          room.players.splice(idx, 1);
          io.to(code).emit('player-joined', { players: room.players.map(p => ({ name: p.name, score: p.score })) });
        }
      }
    }
  });
});

function nextQuestion(code) {
  const room = rooms.get(code);
  if (!room) return;

  room.currentQuestion++;
  if (room.currentQuestion >= room.questions.length) {
    room.state = 'finished';
    const leaderboard = room.players
      .sort((a, b) => b.score - a.score)
      .map(p => ({ name: p.name, score: p.score }));
    io.to(code).emit('game-over', { leaderboard });
    return;
  }

  room.answers = new Map();
  room.state = 'question';
  room.timeLeft = 20;

  const q = room.questions[room.currentQuestion];
  io.to(code).emit('new-question', {
    index: room.currentQuestion,
    total: room.questions.length,
    question: q.question,
    options: q.options,
    timeLimit: 20
  });

  const countdown = setInterval(() => {
    room.timeLeft--;
    if (room.timeLeft <= 0) {
      clearInterval(countdown);
      showResults(code);
    }
  }, 1000);

  room.timer = setTimeout(() => {
    clearInterval(countdown);
    showResults(code);
  }, 20000);
}

function showResults(code) {
  const room = rooms.get(code);
  if (!room) return;
  room.state = 'results';

  const q = room.questions[room.currentQuestion];
  const leaderboard = room.players
    .sort((a, b) => b.score - a.score)
    .map(p => ({ name: p.name, score: p.score }));

  io.to(code).emit('question-results', {
    correctIndex: q.answerIndex,
    explanation: q.explanation,
    leaderboard
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Kahoot server running on port ${PORT}`);
});
