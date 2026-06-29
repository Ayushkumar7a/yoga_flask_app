import React, { useState, useEffect, useRef } from 'react';
import BreathingBubble from '../components/BreathingBubble';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame } from 'lucide-react';

export default function Meditation() {
  const [timerSeconds, setTimerSeconds] = useState(300); // Default 5 mins
  const [isActive, setIsActive] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState('none');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  const musicTracks = {
    nature: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    tibetan: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    ambient: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  };

  useEffect(() => {
    if (isActive && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsActive(false);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timerSeconds]);

  const handleMusicChange = (e) => {
    const track = e.target.value;
    setSelectedMusic(track);
    setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      if (track !== 'none') {
        audioRef.current.src = musicTracks[track];
        audioRef.current.load();
      }
    }
  };

  const toggleMusicPlay = () => {
    if (!audioRef.current || selectedMusic === 'none') return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log("Audio play blocked:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
    if (!isActive && selectedMusic !== 'none' && !isPlaying) {
      toggleMusicPlay();
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTimerSeconds(300);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-200">
      
      {/* Hidden audio element */}
      <audio ref={audioRef} loop />

      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-white">
          Meditation & Breathing Room
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Unwind with custom soundscapes, breathing guides, and quiet meditation timers designed to restore your mental focus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Breathing Bubble */}
        <div className="flex flex-col items-center">
          <BreathingBubble />
        </div>

        {/* Right Column: Timer & Sounds */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col gap-6 max-w-md w-full mx-auto relative overflow-hidden">
          
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 -z-10" />
          
          <h3 className="text-white font-heading font-semibold text-xl mb-2 flex items-center gap-2">
            <Flame className="w-5 h-5 text-indigo-400" /> Meditation Session Timer
          </h3>
          
          {/* Display Timer */}
          <div className="text-center py-6">
            <span className="text-6xl font-heading font-extrabold text-white tracking-widest block">
              {formatTime(timerSeconds)}
            </span>
            <span className="text-slate-400 text-xs tracking-wider uppercase block mt-2">
              Time Remaining
            </span>
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-4 gap-2">
            {[300, 600, 900, 1200].map((presetSecs) => (
              <button
                key={presetSecs}
                disabled={isActive}
                onClick={() => setTimerSeconds(presetSecs)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  timerSeconds === presetSecs
                    ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                    : "bg-white/3 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                {presetSecs / 60} Min
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mt-2">
            <button
              onClick={handleStartPause}
              className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 hover:scale-105 transition-all cursor-pointer"
            >
              {isActive ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>
            <button
              onClick={handleReset}
              className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Music Control selector */}
          <div className="flex flex-col gap-3 mt-4 pt-6 border-t border-white/5">
            <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              Background Ambient Music
            </label>
            <div className="flex gap-3">
              <select
                value={selectedMusic}
                onChange={handleMusicChange}
                className="flex-1 px-4 py-3 bg-slate-900 border border-white/10 rounded-2xl text-slate-300 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
              >
                <option value="none">No Audio (Silence)</option>
                <option value="nature">Forest stream (Helix 1)</option>
                <option value="tibetan">Tibetan Bowls (Helix 2)</option>
                <option value="ambient">Cosmic Pad (Helix 4)</option>
              </select>
              
              {selectedMusic !== 'none' && (
                <button
                  onClick={toggleMusicPlay}
                  className="p-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-2xl text-indigo-400 transition-all cursor-pointer"
                >
                  {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
