import React, { useState, useEffect } from 'react';
import { Search, Info, X, Compass, AlertTriangle, Lightbulb } from 'lucide-react';

export default function PoseLibrary() {
  const [poses, setPoses] = useState([]);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedPose, setSelectedPose] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoses = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/poses');
        const data = await res.json();
        if (res.ok) {
          setPoses(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPoses();
  }, []);

  const categories = ['All', ...new Set(poses.map((p) => p.category))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredPoses = poses.filter((pose) => {
    const matchesSearch = pose.name.toLowerCase().includes(search.toLowerCase()) || 
                          pose.sanskrit_name.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || pose.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === 'All' || pose.category === categoryFilter;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const getDifficultyColor = (diff) => {
    if (diff === 'Beginner') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (diff === 'Intermediate') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070e] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider font-heading">Loading Pose Library...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-200">
      
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-white">
          Asana Pose Library
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Explore over 30 detailed yoga poses with step-by-step instructions, alignments, common errors, and precautions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by English or Sanskrit name..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex flex-col w-1/2 md:w-36">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-2xl text-slate-300 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>{diff} Level</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col w-1/2 md:w-44">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-2xl text-slate-300 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Poses Grid */}
      {filteredPoses.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          No poses found matching your query filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPoses.map((pose) => (
            <div
              key={pose.id}
              onClick={() => setSelectedPose(pose)}
              className="glass-panel p-5 rounded-3xl border border-white/5 relative overflow-hidden group cursor-pointer hover:border-indigo-500/30 hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${getDifficultyColor(pose.difficulty)}`}>
                    {pose.difficulty}
                  </span>
                  <span className="text-[10px] text-slate-500 tracking-wider font-semibold uppercase">
                    {pose.category}
                  </span>
                </div>
                
                <h3 className="text-white font-heading font-bold text-lg group-hover:text-indigo-400 transition-colors">
                  {pose.name}
                </h3>
                <span className="text-xs text-slate-400 italic block mt-1">
                  {pose.sanskrit_name}
                </span>
                
                <p className="text-slate-400 text-xs mt-3 leading-relaxed line-clamp-2">
                  {pose.steps[0]}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Duration: {pose.duration}
                </span>
                <span className="text-xs text-indigo-400 font-semibold group-hover:underline flex items-center gap-1">
                  View Details <Info className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedPose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl glass-panel border border-white/10 rounded-3xl p-6 md:p-8 my-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedPose(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="mb-6">
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${getDifficultyColor(selectedPose.difficulty)}`}>
                {selectedPose.difficulty}
              </span>
              <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-white mt-3">
                {selectedPose.name}
              </h2>
              <span className="text-sm text-indigo-400 italic mt-1 block">
                {selectedPose.sanskrit_name} | {selectedPose.category}
              </span>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              
              {/* Left Column: Steps */}
              <div>
                <h3 className="text-white font-heading font-semibold mb-3 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" /> Step-by-Step Instructions
                </h3>
                <ol className="flex flex-col gap-2.5 pl-4 list-decimal text-slate-300 text-sm leading-relaxed">
                  {selectedPose.steps.map((step, idx) => (
                    <li key={idx} className="pl-1">{step}</li>
                  ))}
                </ol>
              </div>

              {/* Right Column: Benefits & Cautions */}
              <div className="flex flex-col gap-6">
                
                {/* Benefits */}
                <div>
                  <h3 className="text-white font-heading font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-emerald-400" /> Key Benefits
                  </h3>
                  <ul className="flex flex-col gap-2 pl-4 list-disc text-slate-300 text-sm leading-relaxed">
                    {selectedPose.benefits.map((b, idx) => (
                      <li key={idx} className="pl-1">{b}</li>
                    ))}
                  </ul>
                </div>

                {/* Common Mistakes */}
                <div>
                  <h3 className="text-white font-heading font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Common Alignment Errors
                  </h3>
                  <ul className="flex flex-col gap-2 pl-4 list-disc text-slate-400 text-xs leading-relaxed">
                    {selectedPose.common_mistakes.map((m, idx) => (
                      <li key={idx} className="pl-1">{m}</li>
                    ))}
                  </ul>
                </div>

                {/* Precautions */}
                <div>
                  <h3 className="text-white font-heading font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" /> Precautions / Contraindications
                  </h3>
                  <ul className="flex flex-col gap-2 pl-4 list-disc text-rose-300/80 text-xs leading-relaxed">
                    {selectedPose.precautions.map((p, idx) => (
                      <li key={idx} className="pl-1">{p}</li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
