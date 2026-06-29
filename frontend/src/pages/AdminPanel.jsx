import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, Users, Dumbbell, Percent, Clock, UserMinus, ShieldAlert, 
  Video, MessageSquare, Plus, Trash2, BookOpen, Star, HelpCircle
} from 'lucide-react';

export default function AdminPanel() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const isAdmin = username === 'admin';

  const [activeTab, setActiveTab] = useState('users');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [poses, setPoses] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form States
  const [poseForm, setPoseForm] = useState({
    id: '',
    name: '',
    difficulty: 'Beginner',
    category: 'Standing',
    description: '',
    benefits: '',
    precautions: '',
    steps: '',
    common_mistakes: ''
  });

  const [tutorialForm, setTutorialForm] = useState({
    title: '',
    description: '',
    url: '',
    duration: '',
    difficulty: 'Beginner'
  });

  const fetchAdminData = async () => {
    if (!isAdmin) return;
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // 1. Fetch Analytics
      const aRes = await fetch('http://127.0.0.1:5000/api/admin/analytics', { headers });
      const aData = await aRes.json();
      if (aRes.ok) setAnalytics(aData);
      
      // 2. Fetch Users
      const uRes = await fetch('http://127.0.0.1:5000/api/admin/users', { headers });
      const uData = await uRes.json();
      if (uRes.ok) setUsers(uData);

      // 3. Fetch Poses
      const pRes = await fetch('http://127.0.0.1:5000/api/poses');
      const pData = await pRes.json();
      if (pRes.ok) setPoses(pData);

      // 4. Fetch Tutorials
      const tRes = await fetch('http://127.0.0.1:5000/api/tutorials');
      const tData = await tRes.json();
      if (tRes.ok) setTutorials(tData);

      // 5. Fetch Feedback
      const fRes = await fetch('http://127.0.0.1:5000/api/admin/feedback', { headers });
      const fData = await fRes.json();
      if (fRes.ok) setFeedbacks(fData);

    } catch (err) {
      console.error(err);
      setError('Failed to sync administration panel resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [isAdmin, token]);

  const handleDeleteUser = async (userId, targetUsername) => {
    if (targetUsername === 'admin') {
      alert("Cannot delete primary admin account!");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user "${targetUsername}"?`)) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert("User deleted successfully!");
        fetchAdminData();
      } else {
        alert("Deletion failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pose CRUD
  const handleAddPose = async (e) => {
    e.preventDefault();
    if (!poseForm.id || !poseForm.name) {
      alert("Pose ID and Name are required!");
      return;
    }

    const payload = {
      ...poseForm,
      benefits: poseForm.benefits.split('\n').filter(x => x.trim()),
      precautions: poseForm.precautions.split('\n').filter(x => x.trim()),
      steps: poseForm.steps.split('\n').filter(x => x.trim()),
      common_mistakes: poseForm.common_mistakes.split('\n').filter(x => x.trim())
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/poses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        alert("Yoga pose added successfully!");
        setPoseForm({
          id: '', name: '', difficulty: 'Beginner', category: 'Standing',
          description: '', benefits: '', precautions: '', steps: '', common_mistakes: ''
        });
        fetchAdminData();
      } else {
        alert(data.message || "Failed to add pose.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePose = async (poseId) => {
    if (!window.confirm("Are you sure you want to delete this pose?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/admin/poses/${poseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert("Pose deleted successfully!");
        fetchAdminData();
      } else {
        alert("Failed to delete pose.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tutorial CRUD
  const handleAddTutorial = async (e) => {
    e.preventDefault();
    if (!tutorialForm.title || !tutorialForm.url) {
      alert("Title and video URL are required!");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/tutorials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tutorialForm)
      });
      const data = await response.json();
      if (response.ok) {
        alert("Tutorial added successfully!");
        setTutorialForm({ title: '', description: '', url: '', duration: '', difficulty: 'Beginner' });
        fetchAdminData();
      } else {
        alert(data.message || "Failed to add tutorial.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTutorial = async (tutId) => {
    if (!window.confirm("Delete this tutorial session?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/admin/tutorials/${tutId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert("Tutorial deleted successfully!");
        fetchAdminData();
      } else {
        alert("Failed to delete tutorial.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Feedback CRUD
  const handleDeleteFeedback = async (fbId) => {
    if (!window.confirm("Remove this feedback message from logs?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/admin/feedback/${fbId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert("Feedback deleted successfully!");
        fetchAdminData();
      } else {
        alert("Failed to delete feedback.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#07070e] text-slate-400 p-4">
        <div className="max-w-md glass-panel p-8 rounded-3xl border border-red-500/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-red-500/5 to-transparent -z-10" />
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4 animate-bounce">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-white">Access Denied</h2>
          <p className="text-slate-400 text-sm mt-2 mb-6">
            Only authenticated administrators are permitted to view and manage user directories or system analytics.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070e] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider font-heading">Loading Admin Panel...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: analytics?.totalUsers || 0, icon: Users, color: "text-indigo-400" },
    { title: "Total Workouts", value: analytics?.totalWorkouts || 0, icon: Dumbbell, color: "text-purple-400" },
    { title: "Avg. Accuracy", value: `${analytics?.averageAccuracy || 0}%`, icon: Percent, color: "text-emerald-400" },
    { title: "Workout Time", value: `${analytics?.totalWorkoutMinutes || 0} min`, icon: Clock, color: "text-pink-400" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-200">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white">
            System Administration Panel
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Monitor system-wide metrics and manage poses, tutorials, feedback, and user directories.
          </p>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-3xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                {card.title}
              </span>
              <span className="text-2xl font-heading font-extrabold text-white block mt-2">
                {card.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold font-heading rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Manage Users
        </button>
        <button
          onClick={() => setActiveTab('poses')}
          className={`px-4 py-2 text-xs font-bold font-heading rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'poses' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" /> Manage Poses
        </button>
        <button
          onClick={() => setActiveTab('tutorials')}
          className={`px-4 py-2 text-xs font-bold font-heading rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'tutorials' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <Video className="w-3.5 h-3.5" /> Video Tutorials
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 text-xs font-bold font-heading rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'feedback' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> User Feedback ({feedbacks.length})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl mb-6">
          {error}
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/5">
          <h3 className="text-white font-heading font-semibold text-lg mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Platform User Directory
          </h3>
          {users.length === 0 ? (
            <div className="text-center text-slate-500 py-10">No users registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-medium">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Age</th>
                    <th className="py-3 px-4">Height / Weight</th>
                    <th className="py-3 px-4">Fitness Focus</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 font-medium text-slate-300">
                      <td className="py-3 px-4 text-slate-500">#{u.id}</td>
                      <td className="py-3 px-4 font-bold text-white">{u.username}</td>
                      <td className="py-3 px-4">{u.age || 'N/A'} yrs</td>
                      <td className="py-3 px-4">
                        {u.height ? `${u.height}cm` : 'N/A'} / {u.weight ? `${u.weight}kg` : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-indigo-300 font-semibold">{u.goal}</span>
                        <span className="text-[10px] text-slate-500 block">{u.fitness_level}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.username !== 'admin' ? (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold cursor-pointer flex items-center gap-1.5 ml-auto"
                          >
                            <UserMinus className="w-3.5 h-3.5" /> Delete User
                          </button>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                            Primary Admin
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'poses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Pose Form */}
          <div className="lg:col-span-1 glass-panel p-6 rounded-3xl border border-white/5 h-fit">
            <h3 className="text-white font-heading font-semibold text-lg mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" /> Add New Yoga Pose
            </h3>
            <form onSubmit={handleAddPose} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Pose ID (lowercase no spaces)</label>
                <input
                  type="text"
                  placeholder="e.g. virabhadrasana_iii"
                  value={poseForm.id}
                  onChange={(e) => setPoseForm({...poseForm, id: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Pose Name</label>
                <input
                  type="text"
                  placeholder="e.g. Warrior III"
                  value={poseForm.name}
                  onChange={(e) => setPoseForm({...poseForm, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Difficulty</label>
                  <select
                    value={poseForm.difficulty}
                    onChange={(e) => setPoseForm({...poseForm, difficulty: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs cursor-pointer"
                  >
                    <option value="Beginner" className="bg-[#0f0f1e]">Beginner</option>
                    <option value="Intermediate" className="bg-[#0f0f1e]">Intermediate</option>
                    <option value="Advanced" className="bg-[#0f0f1e]">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
                  <select
                    value={poseForm.category}
                    onChange={(e) => setPoseForm({...poseForm, category: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs cursor-pointer"
                  >
                    <option value="Standing" className="bg-[#0f0f1e]">Standing</option>
                    <option value="Seated" className="bg-[#0f0f1e]">Seated</option>
                    <option value="Core" className="bg-[#0f0f1e]">Core</option>
                    <option value="Chest Opener" className="bg-[#0f0f1e]">Chest Opener</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Explain the pose details..."
                  value={poseForm.description}
                  onChange={(e) => setPoseForm({...poseForm, description: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Benefits (one per line)</label>
                <textarea
                  placeholder="Improves leg strength&#10;Increases balance"
                  value={poseForm.benefits}
                  onChange={(e) => setPoseForm({...poseForm, benefits: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Precautions (one per line)</label>
                <textarea
                  placeholder="Avoid if ankle injury"
                  value={poseForm.precautions}
                  onChange={(e) => setPoseForm({...poseForm, precautions: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Steps (one per line)</label>
                <textarea
                  placeholder="Stand tall&#10;Extend one leg backward"
                  value={poseForm.steps}
                  onChange={(e) => setPoseForm({...poseForm, steps: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Save Pose to Database
              </button>
            </form>
          </div>

          {/* Poses List */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/5">
            <h3 className="text-white font-heading font-semibold text-lg mb-6 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-indigo-400" /> Active Pose Library ({poses.length})
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {poses.map((p) => (
                <div key={p.id} className="p-4 bg-white/3 border border-white/5 rounded-2xl flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{p.name}</h4>
                      <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                        {p.difficulty}
                      </span>
                      <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">
                      {p.description || "No description provided."}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePose(p.id)}
                    className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'tutorials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Tutorial Form */}
          <div className="lg:col-span-1 glass-panel p-6 rounded-3xl border border-white/5 h-fit">
            <h3 className="text-white font-heading font-semibold text-lg mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" /> Add Video Lesson
            </h3>
            <form onSubmit={handleAddTutorial} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Lesson Title</label>
                <input
                  type="text"
                  placeholder="e.g. Vinyasa Flow for Beginners"
                  value={tutorialForm.title}
                  onChange={(e) => setTutorialForm({...tutorialForm, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Video URL / Embed Link</label>
                <input
                  type="text"
                  placeholder="e.g. https://www.youtube.com/embed/example"
                  value={tutorialForm.url}
                  onChange={(e) => setTutorialForm({...tutorialForm, url: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 mins"
                    value={tutorialForm.duration}
                    onChange={(e) => setTutorialForm({...tutorialForm, duration: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Difficulty Level</label>
                  <select
                    value={tutorialForm.difficulty}
                    onChange={(e) => setTutorialForm({...tutorialForm, difficulty: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs cursor-pointer"
                  >
                    <option value="Beginner" className="bg-[#0f0f1e]">Beginner</option>
                    <option value="Intermediate" className="bg-[#0f0f1e]">Intermediate</option>
                    <option value="Advanced" className="bg-[#0f0f1e]">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Short description about this flow..."
                  value={tutorialForm.description}
                  onChange={(e) => setTutorialForm({...tutorialForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Save Tutorial Lesson
              </button>
            </form>
          </div>

          {/* Tutorials List */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/5">
            <h3 className="text-white font-heading font-semibold text-lg mb-6 flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-400" /> Active Video Lessons ({tutorials.length})
            </h3>
            {tutorials.length === 0 ? (
              <div className="text-center text-slate-500 py-10">No lessons uploaded yet.</div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {tutorials.map((t) => (
                  <div key={t.id} className="p-4 bg-white/3 border border-white/5 rounded-2xl flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{t.title}</h4>
                        <span className="text-[10px] bg-slate-500/10 border border-white/5 text-slate-300 font-bold px-2 py-0.5 rounded-full">
                          {t.duration || 'N/A'}
                        </span>
                        <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                          {t.difficulty}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1.5">
                        {t.description || "No description provided."}
                      </p>
                      <a 
                        href={t.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-indigo-400 hover:underline mt-2 inline-block font-semibold"
                      >
                        Video URL: {t.url}
                      </a>
                    </div>
                    <button
                      onClick={() => handleDeleteTutorial(t.id)}
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/5">
          <h3 className="text-white font-heading font-semibold text-lg mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" /> Platform Feedback Log ({feedbacks.length})
          </h3>
          {feedbacks.length === 0 ? (
            <div className="text-center text-slate-500 py-10">No feedback submitted by users yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map((f) => (
                <div key={f.id} className="p-5 bg-white/3 border border-white/5 rounded-2xl flex flex-col justify-between gap-4 relative overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{f.username}</h4>
                        <span className="text-[10px] text-slate-500">{f.email || 'No email shared'}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < f.rating ? 'fill-amber-400' : 'text-slate-600'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 text-xs italic mt-3 bg-white/5 p-3 rounded-xl border border-white/5">
                      "{f.message}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                    <span>Submitted: {f.timestamp}</span>
                    <button
                      onClick={() => handleDeleteFeedback(f.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center gap-1 font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Log
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
