import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  Activity, Calendar, Flame, Timer, CheckCircle, Download, 
  Sparkles, ShieldCheck, ChevronRight, UserCheck, MessageSquare, Star 
} from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Legend, Filler
);

export default function Dashboard() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  
  const [stats, setStats] = useState({
    totalSessions: 0,
    todayPractice: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
    accuracy: 0,
    calories: 0,
    streak: 0,
    totalTime: 0
  });
  
  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ email: '', message: '', rating: 5 });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.message) return;
    setSubmittingFeedback(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(feedbackForm)
      });
      if (response.ok) {
        alert("Thank you! Your feedback has been sent to the admin.");
        setFeedbackForm({ email: '', message: '', rating: 5 });
      } else {
        alert("Failed to submit feedback.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback. Backend server offline.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // 1. Fetch dashboard stats
        const statsRes = await fetch('http://127.0.0.1:5000/api/dashboard/stats', { headers });
        const statsData = await statsRes.json();
        
        // 2. Fetch history logs
        const logsRes = await fetch('http://127.0.0.1:5000/api/logs', { headers });
        const logsData = await logsRes.json();
        
        // 3. Fetch personalized recommendations
        const recsRes = await fetch('http://127.0.0.1:5000/api/recommendations', { headers });
        const recsData = await recsRes.json();
        
        // 4. Fetch profile details
        const profRes = await fetch('http://127.0.0.1:5000/api/auth/profile', { headers });
        const profData = await profRes.json();

        if (statsRes.ok) setStats(statsData);
        if (logsRes.ok) setHistory(logsData);
        if (recsRes.ok) setRecommendations(recsData.poses || []);
        if (profRes.ok) setProfile(profData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);



  const chartData = {
    labels: ['6 Days Ago', '5 Days Ago', '4 Days Ago', '3 Days Ago', '2 Days Ago', 'Yesterday', 'Today'],
    datasets: [
      {
        fill: true,
        label: 'Sessions Practiced',
        data: stats.weeklyProgress || [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(99, 102, 241, 1)', // Indigo
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(129, 140, 248, 1)',
        pointBorderColor: '#ffffff',
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Outfit', size: 13 },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        padding: 12,
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } },
      y: { 
        grid: { color: 'rgba(255,255,255,0.03)' }, 
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 }, stepSize: 1 } 
      }
    }
  };

  const metricCards = [
    { title: "Total Sessions", value: stats.totalSessions, desc: "Completed flows", icon: Calendar, color: "text-indigo-400" },
    { title: "Today's Practice", value: `${stats.todayPractice}m`, desc: "Active minutes", icon: Timer, color: "text-purple-400" },
    { title: "Burn Streak", value: `${stats.streak} Days`, desc: "Active daily streak", icon: Flame, color: "text-pink-400" },
    { title: "Avg. Accuracy", value: `${stats.accuracy}%`, desc: "Pose alignment metric", icon: CheckCircle, color: "text-emerald-400" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070e] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider font-heading">Lacing AI Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-200">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-white">
            Hello, {username}!
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Goal: <span className="text-indigo-400 font-semibold">{profile?.goal || 'Flexibility'}</span> | Level: <span className="text-purple-400 font-semibold">{profile?.fitness_level || 'Beginner'}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <a
            href={`http://127.0.0.1:5000/api/reports/pdf?token=${token}`}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-medium flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 text-slate-200"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            Download PDF Report
          </a>
          
          <Link
            to="/practice"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all"
          >
            <Activity className="w-4 h-4" /> Start Workout
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block">
                {card.title}
              </span>
              <span className="text-3xl font-heading font-extrabold text-white block mt-3 mb-1">
                {card.value}
              </span>
              <span className="text-slate-500 text-xs font-medium block">
                {card.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Analytics Charts Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col h-[380px]">
            <h3 className="text-white font-heading font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" /> Weekly Practice Volume
            </h3>
            <div className="flex-1 relative">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* History table */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-heading font-semibold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" /> Workout History Logs
              </h3>
            </div>
            
            {history.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                No yoga flows practiced yet. Click 'Start Workout' above to begin!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-medium">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Pose</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-right">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 5).map((log, index) => {
                      const d_sec = log.duration_seconds;
                      const d_str = d_sec >= 60 ? `${Math.floor(d_sec / 60)}m ${d_sec % 60}s` : `${d_sec}s`;
                      return (
                        <tr key={index} className="border-b border-white/5 hover:bg-white/3 font-medium text-slate-300">
                          <td className="py-3.5 px-4 text-xs">{log.timestamp}</td>
                          <td className="py-3.5 px-4 text-indigo-300">{log.pose_name}</td>
                          <td className="py-3.5 px-4">{d_str}</td>
                          <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">{log.accuracy}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Personalized Recommendations Panel */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col flex-1">
            <h3 className="text-white font-heading font-semibold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" /> AI Recommendations
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Tailored poses to strengthen alignment based on your focus: <span className="text-indigo-300 font-semibold">{profile?.goal}</span>.
            </p>

            <div className="flex flex-col gap-4 flex-1">
              {recommendations.length === 0 ? (
                <div className="text-center text-slate-500 py-10">
                  Update your goal parameters to view customized poses.
                </div>
              ) : (
                recommendations.map((pose) => (
                  <div 
                    key={pose.id}
                    className="p-4 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        {pose.name}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                        {pose.sanskrit_name} | {pose.difficulty}
                      </span>
                    </div>
                    <Link
                      to="/practice"
                      className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl transition-all cursor-pointer"
                      title="Practice this pose"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Share Your Feedback Form */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 mt-8 max-w-xl">
        <h3 className="text-white font-heading font-semibold text-lg mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" /> Share Your Feedback
        </h3>
        <p className="text-slate-400 text-xs mb-4">
          Help us improve FlexFlow AI! Rate your experience and send your suggestions directly to the admin.
        </p>
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                  className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star className={`w-5 h-5 ${star <= feedbackForm.rating ? 'fill-amber-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email (Optional)</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={feedbackForm.email}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Message</label>
            <textarea
              placeholder="Your feedback, suggestions, or bug reports..."
              value={feedbackForm.message}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs resize-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submittingFeedback}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {submittingFeedback ? 'Sending...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

    </div>
  );
}
