import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Award, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    if (!weight || !height) {
      setError('Please provide weight and height.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/bmi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: parseFloat(weight),
          height: parseFloat(height)
        })
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'Failed to calculate BMI.');
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (cat) => {
    if (cat === 'Normal Weight') return 'text-emerald-400';
    if (cat === 'Underweight') return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-200">
      
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-white">
          BMI & Pose Planner
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Calculate your Body Mass Index (BMI) to understand your weight category and lock in tailored yoga pose sequences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-4xl mx-auto">
        
        {/* Left Column: Input Form */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 -z-10" />
          
          <h3 className="text-white font-heading font-semibold text-xl mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" /> BMI Calculator
          </h3>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCalculate} className="space-y-6">
            <div className="flex flex-col">
              <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 70"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                step="1"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 175"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Calculating...' : 'Calculate BMI'}
            </button>
          </form>
        </div>

        {/* Right Column: Result & Poses */}
        <div className="w-full">
          {result ? (
            <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col gap-6">
              
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-indigo-500/5 -z-10" />

              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  Calculation Results
                </span>
                <div className="flex items-baseline gap-4 mt-2">
                  <span className="text-5xl font-heading font-extrabold text-white">
                    {result.bmi}
                  </span>
                  <span className={`text-lg font-bold ${getCategoryColor(result.category)}`}>
                    {result.category}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6">
                <h4 className="text-white font-heading font-semibold mb-4 flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> Recommended Yoga Poses
                </h4>
                
                <div className="flex flex-col gap-3">
                  {result.recommendedPoses?.map((pose) => (
                    <div 
                      key={pose.id}
                      className="p-4 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between group hover:border-indigo-500/20 transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {pose.name}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">
                          {pose.sanskrit_name} | {pose.difficulty}
                        </span>
                      </div>
                      <Link
                        to="/practice"
                        className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center py-20 text-slate-500">
              Submit the form to compute your BMI score and load personalized pose recommendations.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
