import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Award, Activity, ShieldCheck, Heart, Moon, Sun, ArrowRight, HelpCircle, Mail, MessageSquare } from 'lucide-react';

export default function LandingPage() {
  const token = localStorage.getItem('token');

  const features = [
    {
      icon: Compass,
      title: "Real-time AI Pose Coaching",
      desc: "Instantly trace skeletal landmarks at 60fps and correct posture imbalances via voice cues."
    },
    {
      icon: Activity,
      title: "Detailed Analytics Dashboard",
      desc: "Monitor your hold duration, reps count, average alignment accuracy, and calories burned."
    },
    {
      icon: Award,
      title: "Gamified Accomplishments",
      desc: "Unlock Beginner, Intermediate, and Advanced badges as you build streaks and complete challenges."
    },
    {
      icon: ShieldCheck,
      title: "Admin Panel & PDF Reporting",
      desc: "Download printable PDF summaries of your workout charts and manage portal operations directly."
    }
  ];

  const benefits = [
    "Reduces anxiety, stress levels, and daily mental fatigue",
    "Improves joint flexibility, muscle strength, and core stability",
    "Alleviates chronic back pain and enhances spinal alignment",
    "Increases blood circulation and boosts metabolic rates",
    "Promotes deep restorative sleep and strengthens immunity"
  ];

  const testimonials = [
    {
      quote: "FlexFlow completely fixed my back posture during planks. The real-time voice feedback feels like having a private instructor right in my room.",
      name: "Sarah Jenkins",
      role: "Corporate Executive & Runner"
    },
    {
      quote: "The interactive dashboard and downloadable reports helped me present my progress logs for my final-year health studies with ease.",
      name: "David Chen",
      role: "Kinematics Student"
    }
  ];

  const faqs = [
    {
      q: "Do I need any specialized cameras or sensors?",
      a: "No. FlexFlow AI works entirely through your laptop or phone's standard webcam. All skeleton tracking calculations happen inside your browser."
    },
    {
      q: "Is my camera video stream uploaded to a server?",
      a: "Absolutely not. For maximum privacy, your camera video is processed locally inside your web browser. Only workout aggregate logs are saved."
    },
    {
      q: "How does the posture correction mechanism work?",
      a: "Our AI engine uses MediaPipe to extract coordinates of key joints, calculates their angles, and compares them with ideal yoga poses to deliver immediate guidance."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#07070e] text-slate-100 overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse-slow -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse-slow -z-10" style={{ animationDelay: '2s' }} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-sm font-semibold mb-6 animate-bounce">
          <Activity className="w-4 h-4" /> Portfolio Final-Year Showcase
        </div>
        <h1 className="font-heading font-extrabold text-5xl md:text-7xl tracking-tight leading-tight">
          Master Your Posture With <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            AI-Powered Yoga Coach
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mt-6">
          Real-time skeletal validation, dynamic accuracy analysis, and ambient meditation rooms packaged into a state-of-the-art commercial fitness application.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {token ? (
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-xl shadow-indigo-600/30 flex items-center gap-2 hover:scale-103 transition-all"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-xl shadow-indigo-600/30 flex items-center gap-2 hover:scale-103 transition-all"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/library"
                className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-semibold flex items-center gap-2 transition-all"
              >
                Explore Pose Library
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white">
            Built with Cutting-Edge Technology
          </h2>
          <p className="text-slate-400 mt-4">
            Combining browser-based computer vision with a rich analytics interface for an optimal client experience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div key={index} className="glass-panel p-6 rounded-3xl relative group hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold text-lg">{feat.title}</h3>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-white leading-tight">
              Unlock the Deep Transformative <br />
              Benefits of Regular Yoga
            </h2>
            <p className="text-slate-400 mt-4 mb-8">
              Yoga is not just about poses; it's a balance of mind, body, and breath. Our AI assistant helps you maintain alignment safety so you reap maximum results.
            </p>
            <div className="flex flex-col gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <i className="fa-solid fa-check text-[10px]" />
                  </div>
                  <span className="text-slate-300 text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
            <div className="text-center relative">
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-6 animate-pulse">
                <Heart className="w-10 h-10" />
              </div>
              <h3 className="text-white font-heading font-bold text-xl">Align Mind & Body</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                Maintain consistency and practice correctly to unlock deep structural safety and strength.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white">
            What Practitioners Say
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test, idx) => (
            <div key={idx} className="glass-panel p-8 rounded-3xl relative">
              <i className="fa-solid fa-quote-left text-3xl text-indigo-500/20 absolute top-6 left-6" />
              <p className="text-slate-300 italic relative z-10 leading-relaxed mb-6">
                "{test.quote}"
              </p>
              <div>
                <h4 className="text-white font-semibold">{test.name}</h4>
                <p className="text-indigo-400 text-xs mt-1">{test.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 py-20 border-t border-white/5">
        <h2 className="font-heading font-bold text-3xl text-center text-white mb-12">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                {faq.q}
              </h3>
              <p className="text-slate-400 text-sm mt-3 pl-7 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5 text-center">
        <h2 className="font-heading font-bold text-3xl text-white">Contact & Feedback</h2>
        <p className="text-slate-400 text-sm mt-2 mb-8 max-w-sm mx-auto">
          Have queries about final-year deployment integrations? Reach out anytime!
        </p>
        <div className="flex justify-center gap-6">
          <a
            href="mailto:support@flexflow.ai"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-slate-300 font-medium"
          >
            <Mail className="w-4 h-4" /> support@flexflow.ai
          </a>
          <a
            href="https://github.com/ayushkumar"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-slate-300 font-medium"
          >
            <MessageSquare className="w-4 h-4" /> Developer GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-slate-600 text-xs">
        <p>&copy; {new Date().getFullYear()} FlexFlow AI. Built as a portfolio project demonstration.</p>
      </footer>
    </div>
  );
}
