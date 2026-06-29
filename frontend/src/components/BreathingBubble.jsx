import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BreathingBubble() {
  const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale
  const [timeLeft, setTimeLeft] = useState(4); // 4 seconds per phase

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Switch phase
          setPhase((currentPhase) => {
            if (currentPhase === 'inhale') return 'hold';
            if (currentPhase === 'hold') return 'exhale';
            return 'inhale';
          });
          return 4; // Reset phase duration
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getPhaseColor = () => {
    if (phase === 'inhale') return 'from-teal-400 to-indigo-500 shadow-teal-500/20';
    if (phase === 'hold') return 'from-purple-500 to-pink-500 shadow-purple-500/20';
    return 'from-indigo-500 to-blue-500 shadow-blue-500/20';
  };

  const getPhaseText = () => {
    if (phase === 'inhale') return 'Breathe In...';
    if (phase === 'hold') return 'Hold...';
    return 'Breathe Out...';
  };

  const getAnimationScale = () => {
    if (phase === 'inhale') return 1.35;
    if (phase === 'hold') return 1.35;
    return 0.85;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900/35 border border-white/5 rounded-3xl backdrop-blur-md relative overflow-hidden max-w-sm w-full mx-auto">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 -z-10" />

      {/* Bubble Container */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer pulsing ring */}
        <motion.div
          animate={{
            scale: getAnimationScale() + 0.1,
            opacity: phase === 'hold' ? [0.4, 0.7, 0.4] : 0.3
          }}
          transition={{
            duration: phase === 'hold' ? 2 : 4,
            ease: "easeInOut",
            repeat: phase === 'hold' ? Infinity : 0
          }}
          className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl"
        />

        {/* Dynamic Breathing Bubble */}
        <motion.div
          animate={{
            scale: getAnimationScale(),
          }}
          transition={{
            duration: 4,
            ease: "easeInOut"
          }}
          className={`w-44 h-44 rounded-full bg-gradient-to-tr ${getPhaseColor()} flex flex-col items-center justify-center shadow-2xl relative border border-white/10`}
        >
          {/* Internal Glow Effect */}
          <div className="absolute inset-2 bg-black/20 rounded-full blur-md" />
          
          <span className="text-white font-heading font-bold text-5xl relative z-10">
            {timeLeft}
          </span>
          <span className="text-white/70 text-xs tracking-widest uppercase mt-1 relative z-10 font-medium">
            Seconds
          </span>
        </motion.div>
      </div>

      {/* Text Instructions */}
      <div className="mt-8 text-center min-h-[60px]">
        <AnimatePresence mode="wait">
          <motion.h3
            key={phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-white font-heading font-semibold text-2xl tracking-wide"
          >
            {getPhaseText()}
          </motion.h3>
        </AnimatePresence>
        <p className="text-slate-400 text-sm mt-2">
          {phase === 'inhale' && "Feel the oxygen fill your lungs"}
          {phase === 'hold' && "Find stillness and center yourself"}
          {phase === 'exhale' && "Let go of all tension and stress"}
        </p>
      </div>
    </div>
  );
}
