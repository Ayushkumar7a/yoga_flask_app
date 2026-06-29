import React, { useState } from 'react';
import PoseCanvas from '../components/PoseCanvas';
import { Compass, Sparkles, Award, ArrowRight, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PoseDetection() {
  const token = localStorage.getItem('token');
  const [selectedPose, setSelectedPose] = useState('');
  const [sessionSummary, setSessionSummary] = useState(null);
  const [savingLog, setSavingLog] = useState(false);

  const poses = [
    { id: 'Squats', name: 'Squats Tracker', desc: 'Track reps, speed, and depth of squat', icon: '🏋️‍♂️' },
    { id: 'Hatha', name: 'Warrior II (Hatha)', desc: 'Focus on arm span and knee bend stability', icon: '🧘' },
    { id: 'Vinyasa', name: 'Tree Pose (Vinyasa)', desc: 'Balance on one leg with hands raised', icon: '⚡' },
    { id: 'Ashtanga', name: 'Plank Pose (Ashtanga)', desc: 'Hold straight alignment of spine and hips', icon: '🤸' },
    { id: 'Chair', name: 'Chair Pose (Utkatasana)', desc: 'Squat pose with arms raised overhead', icon: '🪑' },
    { id: 'Goddess', name: 'Goddess Pose (Utkata Konasana)', desc: 'Wide-squat stance with cactus arms', icon: '👑' }
  ];

  const handleSessionComplete = async (logData) => {
    setSavingLog(true);
    setSessionSummary(logData);
    
    // Save to backend REST API
    try {
      await fetch('http://127.0.0.1:5000/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(logData)
      });
    } catch (err) {
      console.error("Error saving session log:", err);
    } finally {
      setSavingLog(false);
    }
  };

  const resetSession = () => {
    setSelectedPose('');
    setSessionSummary(null);
  };

  const getAccuracyFeedback = (acc) => {
    if (acc >= 90) return { title: "Superb Alignment!", color: "text-emerald-400" };
    if (acc >= 75) return { title: "Good Job!", color: "text-indigo-400" };
    return { title: "Keep Practicing!", color: "text-amber-400" };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-200">
      
      {!selectedPose && !sessionSummary && (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-white">
              Launch Pose Detection Chamber
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Select one of the validated yoga poses or trackers below to initialise real-time skeleton coaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poses.map((pose) => (
              <div
                key={pose.id}
                onClick={() => setSelectedPose(pose.id)}
                className="glass-panel p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-indigo-500/30 hover:-translate-y-1 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform w-fit">
                    {pose.icon}
                  </div>
                  <h3 className="text-white font-heading font-bold text-lg group-hover:text-indigo-400 transition-colors">
                    {pose.name}
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    {pose.desc}
                  </p>
                </div>
                <div className="mt-6 flex justify-end">
                  <span className="text-xs text-indigo-400 font-semibold group-hover:underline flex items-center gap-1">
                    Start Pose <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPose && !sessionSummary && (
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading font-bold text-2xl text-white">
                Active Session: <span className="text-indigo-400">{selectedPose}</span>
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Align yourself and listen to the voice assistant coaching prompts.
              </p>
            </div>
            <button
              onClick={() => setSelectedPose('')}
              className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer"
            >
              Change Pose
            </button>
          </div>

          <PoseCanvas
            yogaType={selectedPose}
            onSessionComplete={handleSessionComplete}
          />
        </div>
      )}

      {sessionSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 relative shadow-2xl text-center">
            
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4 animate-bounce">
              <Award className="w-8 h-8" />
            </div>

            <span className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
              Practice Completed!
            </span>
            
            <h2 className="font-heading font-extrabold text-2xl text-white mt-2">
              {sessionSummary.pose_name} Session Summary
            </h2>
            
            <p className={`text-sm font-semibold mt-1 ${getAccuracyFeedback(sessionSummary.accuracy).color}`}>
              {getAccuracyFeedback(sessionSummary.accuracy).title}
            </p>

            <div className="grid grid-cols-3 gap-3 my-8 bg-white/3 border border-white/5 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Duration</span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {sessionSummary.duration_seconds}s
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  {sessionSummary.pose_name === "Squats" ? "Reps" : "Hold"}
                </span>
                <span className="text-lg font-bold text-purple-400 mt-1 block">
                  {sessionSummary.reps}{sessionSummary.pose_name === "Squats" ? "" : "s"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Accuracy</span>
                <span className="text-lg font-bold text-emerald-400 mt-1 block">
                  {sessionSummary.accuracy}%
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={resetSession}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/15"
              >
                <RefreshCw className="w-4 h-4" /> Practice Another Pose
              </button>
              
              <Link
                to="/dashboard"
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" /> Return to Dashboard
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
