import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCcw, Home, Play, Timer as TimerIcon, Zap } from 'lucide-react';

type GameState = 'landing' | 'setup' | 'countdown' | 'playing' | 'result';
type Duration = 10 | 20 | 30;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('landing');
  const [duration, setDuration] = useState<Duration>(10);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [scoreP1, setScoreP1] = useState<number>(0);
  const [scoreP2, setScoreP2] = useState<number>(0);
  const [winner, setWinner] = useState<'P1' | 'P2' | 'DRAW' | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  const timerRef = useRef<number | null>(null);

  // Vibration helper
  const vibrate = (ms: number = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  };

  const startGame = () => {
    setScoreP1(0);
    setScoreP2(0);
    setGameState('countdown');
    setCountdown(3);
  };

  const gameStateRef = useRef<GameState>(gameState);
  const scoresRef = useRef({ p1: 0, p2: 0 });

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    scoresRef.current = { p1: scoreP1, p2: scoreP2 };
  }, [scoreP1, scoreP2]);

  const finishGameAction = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const { p1, p2 } = scoresRef.current;
    let result: 'P1' | 'P2' | 'DRAW';
    if (p1 > p2) result = 'P1';
    else if (p2 > p1) result = 'P2';
    else result = 'DRAW';
    
    setWinner(result);
    setGameState('result');
  }, []);

  // Handle Countdown
  useEffect(() => {
    if (gameState === 'countdown') {
      const id = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            setGameState('playing');
            setTimeLeft(duration);
            return 0;
          }
          return prev - 1;
        });
      }, 700);
      return () => clearInterval(id);
    }
  }, [gameState, duration]);

  // Handle Timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            finishGameAction();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [gameState, finishGameAction]);

  const handleTapP1 = () => {
    if (gameState !== 'playing') return;
    setScoreP1((s) => s + 1);
    vibrate(15);
  };

  const handleTapP2 = () => {
    if (gameState !== 'playing') return;
    setScoreP2((s) => s + 1);
    vibrate(15);
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {/* LANDING SCREEN */}
        {gameState === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-8 p-6 text-center"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <Zap size={80} className="text-p1 fill-p1/20" />
              </motion.div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-p2 rounded-full animate-ping" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-p1 to-p2 bg-clip-text text-transparent">
              TAPCOUNTER<br />BATTLE
            </h1>
            
            <p className="text-off-white/60 text-lg max-w-xs">
              Satu HP berdua. Siapa yang paling cepat tap?
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGameState('setup')}
              className="mt-4 flex items-center gap-3 bg-surface border-2 border-p1/30 px-10 py-5 rounded-3xl text-xl font-bold text-p1 shadow-lg shadow-p1/20"
            >
              <Play fill="currentColor" /> MULAI
            </motion.button>
          </motion.div>
        )}

        {/* SETUP SCREEN */}
        {gameState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center gap-10 p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-semibold text-off-white/80">PILIH DURASI</h2>
            
            <div className="flex gap-4 w-full">
              {[10, 20, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d as Duration)}
                  className={`flex-1 py-6 rounded-2xl text-2xl font-bold transition-all ${
                    duration === d 
                      ? 'bg-p1 text-background shadow-lg shadow-p1/30 scale-105' 
                      : 'bg-surface text-off-white/40 border border-off-white/10'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>

            <div className="bg-surface/50 p-6 rounded-3xl border border-off-white/5 text-center space-y-2">
              <p className="text-off-white/40 text-sm">INSTRUKSI</p>
              <p className="text-off-white/80 leading-relaxed">
                Letakkan HP di antara kalian.<br />
                P1 (Orange) di bawah, P2 (Mint) di atas.
              </p>
            </div>

            <div className="flex w-full gap-4">
               <button
                onClick={() => setGameState('landing')}
                className="p-5 rounded-2xl bg-surface text-off-white/60"
              >
                <Home />
              </button>
              <button
                onClick={startGame}
                className="flex-1 py-5 rounded-2xl bg-p2 text-background text-xl font-bold shadow-lg shadow-p2/20"
              >
                GAS BATTLE!
              </button>
            </div>
          </motion.div>
        )}

        {/* COUNTDOWN SCREEN */}
        {gameState === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            className="flex flex-col items-center"
          >
            <motion.span 
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-9xl font-black text-p2"
            >
              {countdown > 0 ? countdown : 'GO!'}
            </motion.span>
          </motion.div>
        )}

        {/* PLAYING SCREEN */}
        {gameState === 'playing' && (
          <div className="flex flex-col h-full w-full relative">
            {/* Player 2 Area (Top - Rotated) */}
            <div 
              className="h-1/2 w-full bg-p2/5 flex flex-col items-center justify-end p-10 rotate-180"
              onTouchStart={handleTapP2}
            >
              <div className="text-center">
                <p className="text-p2/60 text-sm font-semibold uppercase tracking-widest mb-2">PLAYER 2</p>
                <h2 className="text-8xl font-black text-p2 text-neon-p2">{scoreP2}</h2>
              </div>
            </div>

            {/* Middle Divider & Timer */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-off-white/10 z-10 flex items-center justify-center">
              <div className="bg-background border-2 border-off-white/10 px-6 py-2 rounded-full flex items-center gap-3">
                <TimerIcon size={20} className={timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-p2'} />
                <span className={`text-2xl font-mono font-bold ${timeLeft <= 3 ? 'text-red-500' : 'text-off-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Player 1 Area (Bottom) */}
            <div 
              className="h-1/2 w-full bg-p1/5 flex flex-col items-center justify-end p-10"
              onTouchStart={handleTapP1}
            >
              <div className="text-center">
                <p className="text-p1/60 text-sm font-semibold uppercase tracking-widest mb-2">PLAYER 1</p>
                <h2 className="text-8xl font-black text-p1 text-neon-p1">{scoreP1}</h2>
              </div>
            </div>
          </div>
        )}

        {/* RESULT SCREEN */}
        {gameState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-8 p-6 text-center w-full max-w-md"
          >
            <Trophy size={100} className={winner === 'P1' ? 'text-p1' : winner === 'P2' ? 'text-p2' : 'text-off-white'} />
            
            <div>
              <h2 className="text-xl text-off-white/60 mb-1">PEMENANGNYA ADALAH...</h2>
              <h1 className={`text-5xl font-black ${
                winner === 'P1' ? 'text-p1 text-neon-p1' : 
                winner === 'P2' ? 'text-p2 text-neon-p2' : 
                'text-off-white'
              }`}>
                {winner === 'P1' ? 'PLAYER 1' : winner === 'P2' ? 'PLAYER 2' : 'SERI!'}
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-surface p-4 rounded-2xl border-b-4 border-p1/30">
                <p className="text-p1/60 text-sm font-bold">P1 SCORE</p>
                <p className="text-3xl font-black text-p1">{scoreP1}</p>
              </div>
              <div className="bg-surface p-4 rounded-2xl border-b-4 border-p2/30">
                <p className="text-p2/60 text-sm font-bold">P2 SCORE</p>
                <p className="text-3xl font-black text-p2">{scoreP2}</p>
              </div>
            </div>

            <div className="flex w-full gap-4 mt-4">
              <button
                onClick={() => setGameState('landing')}
                className="flex-1 py-5 rounded-2xl bg-surface text-off-white/60 font-bold flex items-center justify-center gap-2"
              >
                <Home size={20} /> HOME
              </button>
              <button
                onClick={startGame}
                className="flex-[2] py-5 rounded-2xl bg-off-white text-background text-xl font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <RefreshCcw size={20} /> REMATCH
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
