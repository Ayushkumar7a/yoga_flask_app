import React, { useEffect, useState } from 'react';
import { Video, Search, Clock, Award, PlayCircle, ExternalLink } from 'lucide-react';

export default function Tutorials() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/tutorials');
        const data = await res.json();
        if (res.ok) {
          setTutorials(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorials();
  }, []);

  const filteredTutorials = tutorials.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || t.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  // Helper to format YouTube link into embed url
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('youtu.be/')) {
      const id = url.split('/').pop().split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      return `https://www.youtube.com/embed/${urlParams.get('v')}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#07070e] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider font-heading">Loading Video Lessons...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-200">

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Guided Practice</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-white">
            Yoga Video Tutorials
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Master alignment and techniques with instructional videos curated by yoga specialists.
          </p>
        </div>

        {/* Search & Filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search video lessons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
            />
          </div>
          {/* Difficulty Dropdown */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs cursor-pointer font-bold"
          >
            <option value="All" className="bg-[#0f0f1e]">All Difficulties</option>
            <option value="Beginner" className="bg-[#0f0f1e]">Beginner</option>
            <option value="Intermediate" className="bg-[#0f0f1e]">Intermediate</option>
            <option value="Advanced" className="bg-[#0f0f1e]">Advanced</option>
          </select>
        </div>
      </div>

      {/* Tutorials Grid */}
      {filteredTutorials.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl border border-white/5 max-w-lg mx-auto">
          <PlayCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-bold text-white text-lg">No video lessons found</h3>
          <p className="text-slate-500 text-xs mt-1">Try resetting your search query or difficulty filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTutorials.map((t) => {
            const embedUrl = getEmbedUrl(t.url);
            const isEmbed = embedUrl.includes('embed');

            return (
              <div key={t.id} className="glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-300">
                <div>
                  {/* Video Player / Thumbnail Preview */}
                  <div className="relative aspect-video bg-black/40 border-b border-white/5 flex items-center justify-center">
                    {isEmbed ? (
                      <iframe
                        src={embedUrl}
                        title={t.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="text-center p-4">
                        <PlayCircle className="w-12 h-12 text-indigo-500/80 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] text-slate-500">External player only</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" /> {t.difficulty}
                      </span>
                      {t.duration && (
                        <span className="text-[10px] bg-slate-500/10 border border-white/5 text-slate-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {t.duration}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-white text-base leading-tight mb-2 group-hover:text-indigo-400 transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-3">
                      {t.description || 'Watch and follow along to learn the flow details, correct alignment postures, and breathing cycles.'}
                    </p>
                  </div>
                </div>

                {/* External link button if not embeddable */}
                {!isEmbed && (
                  <div className="px-6 pb-6 pt-0">
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      Watch Tutorial <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
