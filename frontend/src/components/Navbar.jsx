import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, BookOpen, Compass, Award, ShieldAlert, LogOut, User, Menu, X, Wind, Calculator, Video } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const isAdmin = username === 'admin';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity, authRequired: true },
    { name: 'Practice AI', path: '/practice', icon: Compass, authRequired: true },
    { name: 'Pose Library', path: '/library', icon: BookOpen, authRequired: false },
    { name: 'Tutorials', path: '/tutorials', icon: Video, authRequired: false },
    { name: 'Meditation', path: '/meditation', icon: Wind, authRequired: false },
    { name: 'BMI Calculator', path: '/bmi', icon: Calculator, authRequired: false },
    { name: 'Achievements', path: '/achievements', icon: Award, authRequired: true },
    { name: 'Admin', path: '/admin', icon: ShieldAlert, authRequired: true, adminOnly: true }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-md shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-all">
                <Compass className="w-6 h-6 text-white animate-pulse" />
              </div>
              <span className="font-heading font-bold text-xl tracking-wide bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                FlexFlow <span className="text-indigo-400 font-extrabold text-sm align-super">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-2 xl:gap-3.5">
            {navItems.map((item) => {
              if (item.authRequired && !token) return null;
              if (item.adminOnly && !isAdmin) return null;
              
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User Section (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 xl:gap-3">
            {token ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5">
                  <User className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-indigo-400" />
                  <span className="text-xs xl:text-sm font-medium text-slate-200">{username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs xl:text-sm font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 xl:gap-3">
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white text-xs xl:text-sm font-medium px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs xl:text-sm font-medium px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger button */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="xl:hidden glass-panel border-b border-white/5">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              if (item.authRequired && !token) return null;
              if (item.adminOnly && !isAdmin) return null;
              
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* User details / logout or login buttons in mobile view */}
            <div className="pt-4 pb-2 border-t border-white/5 px-3">
              {token ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
                    <User className="w-5 h-5 text-indigo-400" />
                    <span className="text-base font-medium text-slate-200">{username}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-base font-medium cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-slate-300 hover:text-white text-base font-medium py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white text-base font-medium py-2.5 rounded-xl"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
