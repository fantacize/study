'use client';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { questionPool } from '../../practice-tests.js';

const SERVER_URL = process.env.NEXT_PUBLIC_KAHOOT_SERVER || 'http://localhost:3001';

const COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
const SHAPES = ['triangle', 'diamond', 'circle', 'square'];

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
    const selected = shuffled.slice(0, questionCount);
    socket.emit('create-room', { questions: selected, hostName: playerName || 'Host' });
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

  if (screen === 'menu') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>AmStuds Kahoot!</h1>
          <p style={styles.subtitle}>Multiplayer History Quiz</p>

          {error && <div style={styles.error}>{error}</div>}

          <input
            style={styles.input}
            placeholder="Your Name"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
          />

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Host a Game</h3>
            <label style={styles.label}>
              Questions: {questionCount}
              <input
                type="range"
                min="5"
                max="50"
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
                style={styles.slider}
              />
            </label>
            <button style={styles.btnHost} onClick={createRoom}>
              Create Room
            </button>
          </div>

          <div style={styles.divider}>— OR —</div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Join a Game</h3>
            <input
              style={styles.input}
              placeholder="Room Code"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button style={styles.btnJoin} onClick={joinRoom}>
              Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'lobby') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Room: {roomCode}</h2>
          <p style={styles.subtitle}>Share this code with friends!</p>
          <div style={styles.codeDisplay}>{roomCode}</div>

          <h3 style={styles.sectionTitle}>Players ({players.length})</h3>
          <div style={styles.playerList}>
            {players.map((p, i) => (
              <div key={i} style={styles.playerChip}>{p.name}</div>
            ))}
            {players.length === 0 && <p style={styles.muted}>Waiting for players...</p>}
          </div>

          {isHost && (
            <button
              style={{ ...styles.btnHost, opacity: players.length === 0 ? 0.5 : 1 }}
              onClick={startGame}
              disabled={players.length === 0}
            >
              Start Game ({questionCount} questions)
            </button>
          )}
          {!isHost && <p style={styles.muted}>Waiting for host to start...</p>}
        </div>
      </div>
    );
  }

  if (screen === 'playing' && question) {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.header}>
          <span style={styles.questionNum}>Q{question.index + 1}/{question.total}</span>
          <span style={styles.timer}>{timeLeft}s</span>
        </div>

        <div style={styles.questionBox}>
          <h2 style={styles.questionText}>{question.question}</h2>
        </div>

        {result && (
          <div style={{ ...styles.resultBanner, background: result.correct ? '#26890c' : '#e21b3c' }}>
            {result.correct ? `+${result.points} points!` : 'Wrong!'}
          </div>
        )}

        <div style={styles.optionsGrid}>
          {question.options.map((opt, i) => (
            <button
              key={i}
              style={{
                ...styles.optionBtn,
                background: COLORS[i],
                opacity: selected !== null && selected !== i ? 0.5 : 1,
                border: selected === i ? '4px solid white' : 'none',
              }}
              onClick={() => submitAnswer(i)}
              disabled={selected !== null}
            >
              <span style={styles.shape}>{SHAPES[i]}</span>
              <span style={styles.optionText}>{opt}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'results') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Results</h2>

          {explanation && (
            <div style={styles.explanationBox}>
              <strong>Answer: {question?.options[correctIndex]}</strong>
              <p>{explanation}</p>
            </div>
          )}

          <h3 style={styles.sectionTitle}>Leaderboard</h3>
          <div style={styles.leaderboard}>
            {leaderboard.map((p, i) => (
              <div key={i} style={styles.leaderRow}>
                <span style={styles.rank}>#{i + 1}</span>
                <span style={styles.playerName}>{p.name}</span>
                <span style={styles.score}>{p.score}</span>
              </div>
            ))}
          </div>

          {isHost && (
            <button style={styles.btnHost} onClick={nextQuestion}>
              Next Question
            </button>
          )}
          {!isHost && <p style={styles.muted}>Waiting for host...</p>}
        </div>
      </div>
    );
  }

  if (screen === 'gameover') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Game Over!</h1>

          <div style={styles.podium}>
            {leaderboard.slice(0, 3).map((p, i) => (
              <div key={i} style={{ ...styles.podiumItem, order: i === 0 ? 1 : i === 1 ? 0 : 2 }}>
                <div style={{ ...styles.podiumBar, height: i === 0 ? 160 : i === 1 ? 120 : 80, background: COLORS[i] }}>
                  <span style={styles.podiumRank}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <span style={styles.podiumName}>{p.name}</span>
                  <span style={styles.podiumScore}>{p.score}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.leaderboard}>
            {leaderboard.map((p, i) => (
              <div key={i} style={styles.leaderRow}>
                <span style={styles.rank}>#{i + 1}</span>
                <span style={styles.playerName}>{p.name}</span>
                <span style={styles.score}>{p.score}</span>
              </div>
            ))}
          </div>

          <button style={styles.btnHost} onClick={() => { setScreen('menu'); setGameOver(false); }}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <p>Connecting...</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#46178f',
    padding: 20,
    fontFamily: 'system-ui, sans-serif',
  },
  gameContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#46178f',
    padding: 20,
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: 32,
    maxWidth: 500,
    width: '100%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  title: {
    margin: 0,
    fontSize: 28,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    margin: '8px 0 24px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: 16,
    border: '2px solid #ddd',
    borderRadius: 8,
    marginBottom: 12,
    boxSizing: 'border-box',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#555',
    marginBottom: 8,
  },
  label: {
    display: 'block',
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    marginTop: 4,
  },
  btnHost: {
    width: '100%',
    padding: '14px',
    fontSize: 16,
    fontWeight: 700,
    color: 'white',
    background: '#26890c',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    marginTop: 12,
  },
  btnJoin: {
    width: '100%',
    padding: '14px',
    fontSize: 16,
    fontWeight: 700,
    color: 'white',
    background: '#1368ce',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  divider: {
    textAlign: 'center',
    color: '#999',
    margin: '20px 0',
    fontSize: 14,
  },
  codeDisplay: {
    fontSize: 48,
    fontWeight: 900,
    textAlign: 'center',
    letterSpacing: 8,
    color: '#46178f',
    background: '#f0e6ff',
    borderRadius: 12,
    padding: '16px 0',
    margin: '16px 0',
  },
  playerList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  playerChip: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '8px 16px',
    borderRadius: 20,
    fontWeight: 600,
  },
  muted: {
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  questionNum: {
    color: 'white',
    fontSize: 18,
    fontWeight: 600,
  },
  timer: {
    color: 'white',
    fontSize: 24,
    fontWeight: 900,
    background: '#e21b3c',
    borderRadius: '50%',
    width: 50,
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionBox: {
    background: 'white',
    borderRadius: 12,
    padding: 24,
    margin: '16px 0',
    textAlign: 'center',
  },
  questionText: {
    fontSize: 20,
    color: '#333',
    margin: 0,
  },
  resultBanner: {
    color: 'white',
    textAlign: 'center',
    padding: 12,
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 18,
    marginBottom: 12,
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    flex: 1,
  },
  optionBtn: {
    padding: 20,
    borderRadius: 8,
    color: 'white',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: 100,
  },
  shape: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionText: {
    lineHeight: 1.3,
  },
  explanationBox: {
    background: '#e8f5e9',
    borderRadius: 8,
    padding: 16,
    margin: '16px 0',
    fontSize: 14,
  },
  leaderboard: {
    marginTop: 12,
  },
  leaderRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    borderBottom: '1px solid #eee',
  },
  rank: {
    fontWeight: 700,
    color: '#46178f',
    width: 40,
  },
  playerName: {
    flex: 1,
    fontWeight: 600,
  },
  score: {
    fontWeight: 700,
    color: '#26890c',
  },
  error: {
    background: '#fce4ec',
    color: '#c62828',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  podium: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 12,
    margin: '24px 0',
  },
  podiumItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  podiumBar: {
    width: 100,
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  podiumRank: {
    fontSize: 32,
  },
  podiumName: {
    fontWeight: 700,
    fontSize: 14,
  },
  podiumScore: {
    fontSize: 12,
    opacity: 0.9,
  },
};
