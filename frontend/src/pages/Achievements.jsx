import React, { useEffect, useState } from 'react';
import { Award, Lock, ShieldCheck, Flame, Zap, Trophy } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Achievements() {
  const token = localStorage.getItem('token');
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reference checklist of all achievements
  const badgeTemplate = [
    {
      name: "Beginner Badge",
      desc: "Complete your first ever yoga session with FlexFlow AI.",
      icon: Trophy,
      color: "from-amber-400 to-orange-500 text-amber-950 shadow-orange-500/20"
    },
    {
      name: "Intermediate Badge",
      desc: "Reach a milestone of 10 total practice logs.",
      icon: Award,
      color: "from-indigo-400 to-purple-600 text-indigo-950 shadow-purple-600/20"
    },
    {
      name: "Advanced Badge",
      desc: "Complete 50 unique session logs on the portal.",
      icon: Trophy,
      color: "from-purple-500 to-pink-600 text-purple-950 shadow-pink-600/20"
    },
    {
      name: "100 Sessions Badge",
      desc: "Reach the ultimate master level of 100 finished sessions.",
      icon: ShieldCheck,
      color: "from-emerald-400 to-teal-500 text-emerald-950 shadow-teal-500/20"
    },
    {
      name: "3-Day Burn",
      desc: "Establish a consistent streak of 3 consecutive days.",
      icon: Flame,
      color: "from-pink-500 to-rose-600 text-pink-950 shadow-rose-600/20"
    },
    {
      name: "Weekly Warrior",
      desc: "Establish a consistent streak of 7 consecutive days.",
      icon: Zap,
      color: "from-orange-400 to-rose-500 text-orange-950 shadow-rose-500/20"
    }
  ];

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/achievements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setUnlockedBadges(data.map(b => b.badge_name));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070e] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider font-heading">Loading Accomplishments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-200">
      
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-white">
          Achievements & Badges
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Gamify your yoga practice. Complete sessions and build consistent streaks to unlock premium, glowing badges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {badgeTemplate.map((badge, idx) => {
          const isUnlocked = unlockedBadges.includes(badge.name);
          const Icon = badge.icon;
          
          return (
            <div
              key={idx}
              className={`glass-panel p-6 rounded-3xl border transition-all duration-350 relative overflow-hidden flex flex-col items-center text-center justify-between ${
                isUnlocked 
                  ? "border-indigo-500/20 shadow-xl shadow-black/40" 
                  : "border-white/5 opacity-55 hover:opacity-75"
              }`}
            >
              {/* Unlock Indicator Background */}
              {isUnlocked && (
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
              )}

              {/* Badge Icon */}
              <div className="my-6">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl relative ${
                  isUnlocked 
                    ? `bg-gradient-to-tr ${badge.color}` 
                    : "bg-slate-800 text-slate-500 border border-white/5"
                }`}>
                  <Icon className="w-10 h-10 relative z-10" />
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center">
                      <Lock className="w-6 h-6 text-slate-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 flex-1">
                <h3 className={`font-heading font-bold text-lg ${isUnlocked ? "text-white" : "text-slate-500"}`}>
                  {badge.name}
                </h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed max-w-[240px] mx-auto">
                  {badge.desc}
                </p>
              </div>

              {/* Status footer label */}
              <div className="w-full mt-6 pt-4 border-t border-white/5 text-[10px] uppercase tracking-wider font-semibold">
                {isUnlocked ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> Unlocked
                  </span>
                ) : (
                  <span className="text-slate-600 flex items-center justify-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Locked
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
