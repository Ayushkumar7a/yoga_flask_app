import React, { useRef, useEffect, useState } from 'react';
import { checkWarriorII, checkTree, checkPlank, checkChair, checkGoddess, checkSquat } from '../utils/poseMath';
import { Play, Square, Volume2, VolumeX, Camera, AlertCircle } from 'lucide-react';

export default function PoseCanvas({ yogaType, onSessionComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive] = useState(false);
  const [feedback, setFeedback] = useState("Click 'Start Session' to begin");
  const [accuracy, setAccuracy] = useState(0);
  const [accuracyList, setAccuracyList] = useState([]);
  const [reps, setReps] = useState(0);
  const [checklist, setChecklist] = useState([]);
  const [duration, setDuration] = useState(0);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const activeRef = useRef(active);
  const lastFeedbackRef = useRef("");
  const speakTimeoutRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const cameraInstanceRef = useRef(null);
  const poseInstanceRef = useRef(null);

  // Sync active ref
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Voice Assistant function
  const speakText = (text) => {
    if (isVoiceMuted || !text) return;
    
    // Prevent talking over the same feedback too fast
    if (text === lastFeedbackRef.current) return;
    lastFeedbackRef.current = text;
    
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }

    // Debounce speak to avoid continuous spam
    speakTimeoutRef.current = setTimeout(() => {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[✅⬇️🧍👐🦵🏋️‍♂️🎗️🤸🪑👑⚡]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }, 400);
  };

  // Trigger speech on feedback changes
  useEffect(() => {
    if (active) {
      speakText(feedback);
    }
  }, [feedback, active, isVoiceMuted]);

  // Guidelines mapped to pose selection
  const GUIDELINES = {
    "Squats": [
      "Maintain core balance",
      "Sit back until thighs are parallel",
      "Stand completely to finish rep"
    ],
    "Hatha": [
      "Arms straight & horizontal",
      "Bend front knee (90-130°)",
      "Keep back leg straight"
    ],
    "Vinyasa": [
      "Raise hands overhead",
      "Bring palms close together",
      "Place foot on opposite inner thigh"
    ],
    "Ashtanga": [
      "Straight line alignment",
      "Keep knees straight",
      "Engage core (no sagging hips)"
    ],
    "Chair": [
      "Bend knees as if sitting",
      "Raise arms overhead",
      "Keep back straight"
    ],
    "Goddess": [
      "Step feet wide apart",
      "Bend both knees deeply",
      "Raise hands, elbows bent"
    ]
  };

  // Initialize checklist guidelines
  useEffect(() => {
    const list = GUIDELINES[yogaType] || [];
    setChecklist(list.map(item => ({ text: item, met: false })));
    setReps(0);
    setAccuracy(0);
    setAccuracyList([]);
    setDuration(0);
    setFeedback("Click 'Start Session' to begin");
  }, [yogaType]);

  // Active workout timer
  useEffect(() => {
    if (active) {
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [active]);

  const startSession = async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setActive(true);
        speakText(`Starting ${yogaType} session. Step into the camera frame.`);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(true);
      setFeedback("Webcam access denied. Please enable camera permissions.");
    }
  };

  const stopSession = () => {
    setActive(false);
    speakText("Session completed. Saving your practice log.");
    
    // Stop camera streams
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Calculate overall average accuracy
    const avgAccuracy = accuracyList.length > 0
      ? Math.round(accuracyList.reduce((a, b) => a + b, 0) / accuracyList.length)
      : 80;
      
    // Callback to parent
    onSessionComplete({
      pose_name: yogaType,
      reps: reps,
      duration_seconds: duration,
      accuracy: Math.max(50, Math.min(100, avgAccuracy))
    });
  };

  // MediaPipe core processing loop
  useEffect(() => {
    if (!active) return;
    if (!window.Pose || !window.Camera) {
      setFeedback("Loading AI models. Please wait...");
      return;
    }

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');

    // Local variables to track state across frames safely without stale closures
    let currentStage = "up"; 
    let lastHoldSec = Date.now();

    // 1. Create MediaPipe Pose Instance
    const pose = new window.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });
    
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    poseInstanceRef.current = pose;

    // 2. Define drawing logic
    const onResults = (results) => {
      if (!activeRef.current) return;
      
      const width = canvasElement.width;
      const height = canvasElement.height;
      
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, width, height);
      
      // Draw mirror-flipped camera frame
      canvasCtx.translate(width, 0);
      canvasCtx.scale(-1, 1);
      canvasCtx.drawImage(results.image, 0, 0, width, height);
      canvasCtx.restore();

      if (results.poseLandmarks) {
        const landmarks = results.poseLandmarks;
        
        // Run specific pose validator based on selection
        let checkResult = null;
        
        if (yogaType === "Squats") {
          checkResult = checkSquat(landmarks, currentStage);
          if (checkResult.repCounted) {
            setReps(prev => prev + 1);
          }
          currentStage = checkResult.stage;
        } else {
          // Hold poses (Warrior II, Tree, Plank, Chair, Goddess)
          if (yogaType === "Hatha") checkResult = checkWarriorII(landmarks);
          else if (yogaType === "Vinyasa") checkResult = checkTree(landmarks);
          else if (yogaType === "Ashtanga") checkResult = checkPlank(landmarks);
          else if (yogaType === "Chair") checkResult = checkChair(landmarks);
          else if (yogaType === "Goddess") checkResult = checkGoddess(landmarks);
          
          if (checkResult && checkResult.poseComplete) {
            const now = Date.now();
            if (now - lastHoldSec >= 1000) {
              setReps(prev => prev + 1); // For hold poses, reps acts as hold time in seconds
              lastHoldSec = now;
            }
          }
        }

        if (checkResult) {
          setFeedback(checkResult.feedback);
          setAccuracy(checkResult.accuracy);
          setAccuracyList(prev => [...prev, checkResult.accuracy]);
          
          // Map satisfaction matrix to checklist UI
          const currentGuidelines = GUIDELINES[yogaType] || [];
          setChecklist(currentGuidelines.map((text, idx) => ({
            text,
            met: !!checkResult.met[idx]
          })));
        }

        // Draw Custom Neon Skeleton on Canvas
        drawNeonSkeleton(canvasCtx, landmarks, checkResult?.met || [false, false, false]);
      } else {
        setFeedback("Step into the camera frame 🧘");
        setAccuracy(0);
      }
    };

    pose.onResults(onResults);

    // 3. Initialize Camera Utilities
    const camera = new window.Camera(videoElement, {
      onFrame: async () => {
        if (activeRef.current) {
          await pose.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480
    });

    cameraInstanceRef.current = camera;
    camera.start();

    return () => {
      // Cleanup camera and pose instances on stop
      if (cameraInstanceRef.current) {
        try {
          cameraInstanceRef.current.stop();
        } catch(e) {}
      }
      if (poseInstanceRef.current) {
        try {
          poseInstanceRef.current.close();
        } catch(e) {}
      }
    };
  }, [active, yogaType]);

  // Custom Neon Skeleton Drawing helper
  const drawNeonSkeleton = (ctx, landmarks, metMatrix) => {
    // MediaPipe key connections
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Upper body
      [11, 23], [12, 24], [23, 24],                    // Torso
      [23, 25], [25, 27], [24, 26], [26, 28]             // Legs
    ];

    const allMet = metMatrix.every(v => v === true);
    const lineColor = allMet ? "rgba(16, 185, 129, 0.85)" : "rgba(99, 102, 241, 0.75)"; // Emerald vs Indigo
    const pointColor = allMet ? "#34d399" : "#818cf8";

    // Draw lines
    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
        ctx.beginPath();
        // Flip x coordinate because canvas displays mirrored video
        ctx.moveTo((1 - p1.x) * 640, p1.y * 480);
        ctx.lineTo((1 - p2.x) * 640, p2.y * 480);
        ctx.lineWidth = 4;
        ctx.strokeStyle = lineColor;
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = 8;
        ctx.stroke();
      }
    });

    // Draw joint dots
    landmarks.forEach((p, idx) => {
      // Draw key joints only (shoulders, elbows, wrists, hips, knees, ankles)
      const keyJoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
      if (keyJoints.includes(idx) && p.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc((1 - p.x) * 640, p.y * 480, 6, 0, 2 * Math.PI);
        ctx.fillStyle = pointColor;
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 6;
        ctx.fill();
      }
    });
    
    // Clear shadow blur for next frame
    ctx.shadowBlur = 0;
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Video & AI Canvas Panel */}
      <div className="xl:col-span-2 flex flex-col gap-4">
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl bg-black/60">
          
          {/* Hidden HTML Video element to feed frames into MediaPipe */}
          <video
            ref={videoRef}
            className="hidden"
            playsInline
            muted
            width="640"
            height="480"
          />

          {/* Core Skeleton Drawing Canvas */}
          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            className="w-full h-full object-cover"
          />

          {/* Active Overlay Statistics */}
          {active && (
            <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
              <div className="px-4 py-2 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs uppercase tracking-widest text-slate-300 font-semibold">
                  LIVE AI FEEDBACK
                </span>
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10 text-right">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest">Accuracy</div>
                  <div className="text-sm font-bold text-indigo-400">{accuracy}%</div>
                </div>
                <div className="px-4 py-2 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10 text-right">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {yogaType === "Squats" ? "Reps" : "Hold Time"}
                  </div>
                  <div className="text-sm font-bold text-purple-400">
                    {reps}{yogaType === "Squats" ? "" : "s"}
                  </div>
                </div>
                <div className="px-4 py-2 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10 text-right">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest">Time</div>
                  <div className="text-sm font-bold text-slate-200">{formatTime(duration)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Pre-start overlay */}
          {!active && (
            <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 animate-bounce">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-white font-heading font-semibold text-xl">Webcam Preparation</h3>
              <p className="text-slate-400 text-sm max-w-sm mt-2 mb-6">
                Ensure you are in a well-lit room and your full body will be visible in the camera frame.
              </p>
              {cameraError ? (
                <div className="flex items-center gap-2 p-3 bg-red-500/15 border border-red-500/25 rounded-2xl text-red-400 text-xs mb-4">
                  <AlertCircle className="w-4 h-4" />
                  Please grant webcam permissions to start practice.
                </div>
              ) : null}
              <button
                onClick={startSession}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-102 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" /> Start Practice Session
              </button>
            </div>
          )}
        </div>

        {/* Real-time coaching message card */}
        {active && (
          <div className="glass-panel border border-white/10 p-5 rounded-3xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Pose Assistant Coach
              </span>
              <span className="text-lg text-white font-semibold mt-1">
                {feedback}
              </span>
            </div>
            <button
              onClick={() => setIsVoiceMuted(!isVoiceMuted)}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-slate-300 hover:text-white transition-all cursor-pointer"
              title={isVoiceMuted ? "Unmute Voice Guidance" : "Mute Voice Guidance"}
            >
              {isVoiceMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {/* Checklist Side Panel */}
      <div className="flex flex-col gap-6">
        <div className="glass-panel border border-white/10 p-6 rounded-3xl flex-1 flex flex-col">
          <h3 className="text-white font-heading font-semibold text-lg border-b border-white/5 pb-4 mb-4">
            Posture Checklist
          </h3>
          <p className="text-slate-400 text-xs mb-6">
            Match the checklist items below in real time to secure the pose and lock in accuracy.
          </p>

          <div className="flex flex-col gap-4 flex-1">
            {checklist.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl border transition-all duration-350 flex items-center justify-between ${
                  item.met
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                    : "bg-slate-900/35 border-white/5 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      item.met
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-500"
                    }`}
                  >
                    {item.met && <i className="fa-solid fa-check text-[10px]"></i>}
                  </div>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              </div>
            ))}
          </div>

          {active && (
            <div className="mt-8 pt-6 border-t border-white/5">
              <button
                onClick={stopSession}
                className="w-full py-4 bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-950/10"
              >
                <Square className="w-4 h-4 fill-current" /> Stop and Save Log
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
