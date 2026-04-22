import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, RefreshCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const TRACKS = [
  { id: 1, title: "DATA_CORRUPTION.WAV", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "NULL_POINTER.MP3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "SYSTEM_PANIC.FLAC", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 10 };
const GAME_SPEED = 100;

const MusicPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(e => console.error(e));
    setIsPlaying(!isPlaying);
  };
  const nextTrack = () => { setCurrentTrack(prev => (prev + 1) % TRACKS.length); setIsPlaying(true); };
  const prevTrack = () => { setCurrentTrack(prev => (prev - 1 + TRACKS.length) % TRACKS.length); setIsPlaying(true); };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(e => console.error(e));
      else audioRef.current.pause();
    }
  }, [currentTrack, isPlaying]);

  return (
    <div className="bg-[#0a0a0a] border-4 border-fuchsia-600 p-6 flex flex-col items-start w-full max-w-sm aspect-square justify-between relative shadow-[8px_8px_0px_#00ffff]">
      <div className="absolute top-0 right-0 bg-fuchsia-600 text-black px-2 py-1 text-xs font-bold uppercase">MOD_AUDIO_V1</div>
      <div className="flex flex-col items-start w-full">
        <div className="text-cyan-400 text-sm mb-2">&gt; STATUS: {isPlaying ? 'ACTIVE' : 'IDLE'}</div>
        <div className="w-full bg-[#111] border-2 border-cyan-400 p-4 relative overflow-hidden">
          <h3 className="text-fuchsia-500 text-2xl truncate uppercase glitch-text-static">{TRACKS[currentTrack].title}</h3>
          <p className="text-slate-400 text-xs mt-2">&gt; INDEX: {currentTrack + 1}/{TRACKS.length}</p>
        </div>
      </div>
      <div className="flex gap-4 items-center w-full justify-between">
         <button onClick={prevTrack} className="p-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-none active:translate-y-1 shadow-[4px_4px_0px_#00ffff]"><SkipBack className="w-6 h-6" /></button>
         <button onClick={togglePlay} className="p-4 border-2 border-fuchsia-600 bg-fuchsia-600 text-black hover:bg-black hover:text-fuchsia-600 transition-none active:translate-y-1 shadow-[4px_4px_0px_#00ffff]">{isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}</button>
         <button onClick={nextTrack} className="p-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-none active:translate-y-1 shadow-[4px_4px_0px_#00ffff]"><SkipForward className="w-6 h-6" /></button>
      </div>
      <audio ref={audioRef} src={TRACKS[currentTrack].url} onEnded={nextTrack} />
    </div>
  );
};

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const directionRef = useRef({ x: 1, y: 0 });
  const nextDirectionRef = useRef({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const generateFood = useCallback((currentSnake: {x:number, y:number}[]) => {
    const possible = [];
    for(let x = 0; x < GRID_SIZE; x++){
      for(let y = 0; y < GRID_SIZE; y++){
        if(!currentSnake.some(s => s.x === x && s.y === y)) possible.push({x, y});
      }
    }
    if (possible.length === 0) return {x: 0, y: 0};
    return possible[Math.floor(Math.random() * possible.length)];
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE); setFood(INITIAL_FOOD);
    directionRef.current = { x: 1, y: 0 }; nextDirectionRef.current = { x: 1, y: 0 };
    setGameOver(false); setScore(0);
  };

  const handleInput = useCallback((key: string) => {
    if (gameOver) return;
    const currentDir = directionRef.current;
    switch (key) {
      case 'ArrowUp': case 'w': case 'W': if (currentDir.y === 0) nextDirectionRef.current = { x: 0, y: -1 }; break;
      case 'ArrowDown': case 's': case 'S': if (currentDir.y === 0) nextDirectionRef.current = { x: 0, y: 1 }; break;
      case 'ArrowLeft': case 'a': case 'A': if (currentDir.x === 0) nextDirectionRef.current = { x: -1, y: 0 }; break;
      case 'ArrowRight': case 'd': case 'D': if (currentDir.x === 0) nextDirectionRef.current = { x: 1, y: 0 }; break;
    }
  }, [gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      handleInput(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  useEffect(() => {
    if (gameOver) return;
    const moveSnake = () => {
      setSnake(prev => {
        directionRef.current = nextDirectionRef.current;
        const newHead = { x: prev[0].x + directionRef.current.x, y: prev[0].y + directionRef.current.y };
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) { setGameOver(true); return prev; }
        if (prev.some(seg => seg.x === newHead.x && seg.y === newHead.y)) { setGameOver(true); return prev; }
        const newSnake = [newHead, ...prev];
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => { const ns = s + 10; setHighScore(h => Math.max(h, ns)); return ns; });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    };
    const intervalId = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(intervalId);
  }, [food, gameOver, generateFood]);

  return (
    <div className="flex flex-col items-center z-10 w-full max-w-md bg-[#0a0a0a] border-4 border-cyan-400 p-6 shadow-[8px_8px_0px_#ff00ff] relative">
      <div className="absolute top-0 left-0 bg-cyan-400 text-black px-2 py-1 text-xs font-bold uppercase">MOD_SNAKE_EXE</div>
      
      <div className="flex justify-between items-end w-full mb-6 mt-4 font-bold select-none">
        <div className="text-cyan-400">
          <span className="text-[10px] tracking-widest text-slate-400 block">&gt; RUN_SCORE</span>
          <span className="text-4xl glitch-text-static">{String(score).padStart(4, '0')}</span>
        </div>
        <div className="text-fuchsia-500 text-right">
          <span className="text-[10px] tracking-widest text-slate-400 block">&gt; SYS_HIGH</span>
          <span className="text-4xl glitch-text-static">{String(highScore).padStart(4, '0')}</span>
        </div>
      </div>

      <div className="relative w-full aspect-square border-2 border-slate-700 bg-black/80 overflow-hidden">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%`
        }}/>
        
        <div 
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE; const y = Math.floor(i / GRID_SIZE);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isSnake = snake.some(s => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div key={i} className={`w-full h-full ${isHead ? 'bg-cyan-400 border border-cyan-200 z-10' : isSnake ? 'bg-cyan-600/80' : isFood ? 'bg-fuchsia-600 border-2 border-fuchsia-400 animate-pulse' : 'bg-transparent'}`} />
            );
          })}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center border-4 border-fuchsia-600 z-20">
            <h2 className="text-5xl font-black text-fuchsia-600 mb-2 glitch-layer">FATAL_ERROR</h2>
            <p className="text-cyan-400 mb-6">&gt; Mem dumped: {score}b</p>
            <button onClick={resetGame} className="flex items-center gap-2 px-6 py-3 border-2 border-cyan-400 bg-cyan-400 text-black font-bold uppercase transition-none hover:bg-black hover:text-cyan-400 active:translate-y-1 shadow-[4px_4px_0px_#ff00ff]">
              <RefreshCcw className="w-5 h-5" /> REBOOT.EXE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen crt flex flex-col items-center p-4 sm:p-8 relative">
      <div className="scanline" />
      <header className="mb-12 text-center mt-4 w-full max-w-4xl border-b-2 border-slate-800 pb-8 relative z-10">
        <div className="absolute -top-4 left-0 text-[10px] text-fuchsia-600">&gt; SYS_BOOT v9.8.1</div>
         <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-600 uppercase glitch-fx" data-text="NEON_SERPENT">
           NEON_SERPENT
         </h1>
         <p className="text-cyan-400 mt-4 text-sm font-bold flex items-center justify-center gap-4">
           <span>//</span>
           <span className="bg-cyan-400 text-black px-2 py-0.5">SYNC_RHYTHM_MODULE</span>
           <span>//</span>
         </p>
      </header>

      <main className="flex flex-col xl:flex-row items-center xl:items-start gap-12 sm:gap-16 z-10 w-full max-w-5xl justify-center">
         <MusicPlayer />
         <SnakeGame />
      </main>
      
      <footer className="mt-16 text-[10px] text-slate-600 z-10 flex gap-4 font-bold">
        <span>&gt; GLITCH_ART_OVERRIDE: ENABLED</span>
        <span>&gt; NO_ROUNDED_CORNERS: TRUE</span>
      </footer>
    </div>
  );
}
