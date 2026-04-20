'use client';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { questionPool } from '../../practice-tests.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const SERVER_URL = process.env.NEXT_PUBLIC_KAHOOT_SERVER || 'http://localhost:3001';

const OPTION_COLORS = [
  'bg-red-600 hover:bg-red-700',
  'bg-blue-600 hover:bg-blue-700',
  'bg-yellow-600 hover:bg-yellow-700',
  'bg-green-600 hover:bg-green-700',
];

export default function KahootPage() {
  const [screen, setScreen] = useState('menu');
  const [socket, setSocket] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [questionCount, setQuestionCount] = useState(20);
  const timerRef = useRef(null);

  useEffect(() => {
    const s = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('room-created', ({ code }) => {
      setRoomCode(code);
      setScreen('lobby');
      setIsHost(true);
    });

    s.on('joined', ({ roomCode, players }) => {
      setRoomCode(roomCode);
      setPlayers(players);
      setScreen('lobby');
    });

    s.on('player-joined', ({ players }) => {
      setPlayers(players);
    });

    s.on('game-started', () => {
      setScreen('playing');
    });

    s.on('new-question', ({ index, total, question, options, timeLimit }) => {
      setQuestion({ index, total, question, options });
      setTimeLeft(timeLimit);
      setSelected(null);
      setResult(null);
      setCorrectIndex(null);
      setExplanation('');
      setScreen('playing');

      if (timerRef.current) clearInterval(timerRef.current);
      let t = timeLimit;
      timerRef.current = setInterval(() => {
        t--;
        setTimeLeft(t);
        if (t <= 0) clearInterval(timerRef.current);
      }, 1000);
    });

    s.on('answer-result', ({ correct, points, score }) => {
      setResult({ correct, points, score });
    });

    s.on('question-results', ({ correctIndex, explanation, leaderboard }) => {
      setCorrectIndex(correctIndex);
      setExplanation(explanation);
      setLeaderboard(leaderboard);
      setScreen('results');
      if (timerRef.current) clearInterval(timerRef.current);
    });

    s.on('game-over', ({ leaderboard }) => {
      setLeaderboard(leaderboard);
      setGameOver(true);
      setScreen('gameover');
    });

    s.on('game-ended', ({ reason }) => {
      setError(reason);
      setScreen('menu');
    });

    s.on('error', ({ message }) => {
      setError(message);
    });

    return () => s.disconnect();
  }, []);

  function createRoom() {
    const shuffled = [...questionPool.mcq].sort(() => Math.random() - 0.5);
    const sel = shuffled.slice(0, questionCount);
    socket.emit('create-room', { questions: sel, hostName: playerName || 'Host' });
  }

  function joinRoom() {
    if (!joinCode || !playerName) {
      setError('Need code and name');
      return;
    }
    socket.emit('join-room', { code: joinCode.toUpperCase(), name: playerName });
  }

  function startGame() {
    socket.emit('start-game', { code: roomCode });
  }

  function submitAnswer(idx) {
    if (selected !== null) return;
    setSelected(idx);
    socket.emit('submit-answer', { code: roomCode, answerIndex: idx });
  }

  function nextQuestion() {
    socket.emit('next-question', { code: roomCode });
  }

  // Menu Screen
  if (screen === 'menu') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">AmStuds Kahoot!</CardTitle>
            <p className="text-sm text-muted-foreground">Multiplayer History Quiz</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <Input
              placeholder="Your Name"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
            />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Host a Game</h3>
              <label className="block text-sm text-muted-foreground">
                Questions: {questionCount}
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={questionCount}
                  onChange={e => setQuestionCount(Number(e.target.value))}
                  className="mt-1 w-full accent-primary"
                />
              </label>
              <Button className="w-full" onClick={createRoom}>
                Create Room
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">— OR —</div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Join a Game</h3>
              <Input
                placeholder="Room Code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-lg font-mono tracking-widest"
              />
              <Button variant="secondary" className="w-full" onClick={joinRoom}>
                Join
              </Button>
            </div>

            <div className="pt-2 text-center">
              <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                Back to Study Studio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Lobby Screen
  if (screen === 'lobby') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Waiting Room</CardTitle>
            <p className="text-sm text-muted-foreground">Share this code with friends!</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl bg-primary/10 py-4 text-center">
              <span className="font-mono text-5xl font-black tracking-[0.3em] text-primary">
                {roomCode}
              </span>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                Players ({players.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {players.map((p, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm">
                    {p.name}
                  </Badge>
                ))}
                {players.length === 0 && (
                  <p className="w-full text-center text-sm italic text-muted-foreground">
                    Waiting for players...
                  </p>
                )}
              </div>
            </div>

            {isHost ? (
              <Button
                className="w-full"
                onClick={startGame}
                disabled={players.length === 0}
              >
                Start Game ({questionCount} questions)
              </Button>
            ) : (
              <p className="text-center text-sm italic text-muted-foreground">
                Waiting for host to start...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Playing Screen
  if (screen === 'playing' && question) {
    return (
      <div className="flex min-h-screen flex-col bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <Badge variant="outline" className="text-sm">
            Q{question.index + 1}/{question.total}
          </Badge>
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white",
            timeLeft <= 5 ? "bg-destructive animate-pulse" : "bg-primary"
          )}>
            {timeLeft}
          </div>
        </div>

        <Progress value={(timeLeft / 20) * 100} className="mb-4" />

        <Card className="mb-4">
          <CardContent className="p-6">
            <h2 className="text-center text-lg font-semibold leading-relaxed">
              {question.question}
            </h2>
          </CardContent>
        </Card>

        {result && (
          <div className={cn(
            "mb-4 rounded-lg p-3 text-center font-bold text-white",
            result.correct ? "bg-green-600" : "bg-destructive"
          )}>
            {result.correct ? `+${result.points} points!` : 'Wrong!'}
          </div>
        )}

        <div className="grid flex-1 grid-cols-2 gap-3">
          {question.options.map((opt, i) => (
            <button
              key={i}
              className={cn(
                "rounded-xl p-4 text-sm font-semibold text-white transition-all",
                OPTION_COLORS[i],
                selected !== null && selected !== i && "opacity-40",
                selected === i && "ring-4 ring-white ring-offset-2 ring-offset-background",
                selected !== null && "cursor-not-allowed"
              )}
              onClick={() => submitAnswer(i)}
              disabled={selected !== null}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Results Screen
  if (screen === 'results') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {explanation && (
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
                <p className="font-semibold text-green-800 dark:text-green-300">
                  {question?.options[correctIndex]}
                </p>
                <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                  {explanation}
                </p>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Leaderboard</h3>
              <div className="divide-y rounded-lg border">
                {leaderboard.map((p, i) => (
                  <div key={i} className="flex items-center px-4 py-3">
                    <span className="w-8 font-bold text-primary">#{i + 1}</span>
                    <span className="flex-1 font-medium">{p.name}</span>
                    <span className="font-bold text-green-600">{p.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {isHost ? (
              <Button className="w-full" onClick={nextQuestion}>
                Next Question
              </Button>
            ) : (
              <p className="text-center text-sm italic text-muted-foreground">
                Waiting for host...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Game Over Screen
  if (screen === 'gameover') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Game Over!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end justify-center gap-3">
              {leaderboard.slice(0, 3).map((p, i) => {
                const heights = ['h-32', 'h-24', 'h-16'];
                const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
                const order = [1, 0, 2];
                return (
                  <div key={i} className="flex flex-col items-center" style={{ order: order[i] }}>
                    <span className="text-2xl">{medals[i]}</span>
                    <div className={cn(
                      "flex w-24 flex-col items-center justify-center rounded-t-lg text-white",
                      heights[i],
                      i === 0 ? "bg-primary" : i === 1 ? "bg-blue-500" : "bg-yellow-600"
                    )}>
                      <span className="text-xs font-bold">{p.name}</span>
                      <span className="text-sm font-black">{p.score}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="divide-y rounded-lg border">
              {leaderboard.map((p, i) => (
                <div key={i} className="flex items-center px-4 py-3">
                  <span className="w-8 font-bold text-primary">#{i + 1}</span>
                  <span className="flex-1 font-medium">{p.name}</span>
                  <span className="font-bold text-green-600">{p.score}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => { setScreen('menu'); setGameOver(false); }}>
                Play Again
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/">Study Studio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <p className="text-muted-foreground">Connecting...</p>
      </Card>
    </div>
  );
}
