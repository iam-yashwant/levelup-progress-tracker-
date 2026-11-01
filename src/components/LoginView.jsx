import React, { useState } from 'react';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  HeartHandshake, 
  Users, 
  Building2,
  LogIn
} from 'lucide-react';
import { DEMO_USERS, ROLE_PILLS, findUserByEmailOrRole } from '../data/demoUsers';

export default function LoginView({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState(DEMO_USERS.student.email);
  const [password, setPassword] = useState(DEMO_USERS.student.password);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle clicking on one of the 5 demo role pills
  const handleSelectRole = (roleId) => {
    const profile = DEMO_USERS[roleId];
    if (profile) {
      setSelectedRole(roleId);
      setEmail(profile.email);
      setPassword(profile.password);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your institutional email');
      return;
    }

    setIsLoading(true);
    setError('');

    // Determine target profile based on email & selected role
    const matchedProfile = findUserByEmailOrRole(email, selectedRole);

    setTimeout(() => {
      setIsLoading(false);
      onLogin(matchedProfile);
    }, 350);
  };

  const activeProfile = DEMO_USERS[selectedRole] || DEMO_USERS.student;

  const roleIcons = {
    student: GraduationCap,
    faculty: BookOpen,
    mentor: HeartHandshake,
    parent: Users,
    hod: Building2
  };

  const ActiveIcon = roleIcons[selectedRole] || GraduationCap;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Dynamic Background Glow Ambient Elements */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-900/50 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Login Card Container */}
      <div className="w-full max-w-lg relative z-10 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 shadow-xl shadow-teal-500/25 ring-1 ring-white/20 mb-3 transform hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-3xl font-black tracking-tight text-white">
              Level<span className="text-teal-400">Up</span>
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 rounded-full tracking-wider uppercase">
              v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Unified Academic Performance & Mentorship Platform
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-8 relative">
          
          {/* Quick-Fill Presentation Demo Role Pills */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Quick-Select Demo Role
              </span>
              <span className="text-[10px] text-teal-400/90 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 font-medium">
                Presentation Mode
              </span>
            </div>

            {/* 5 Role Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROLE_PILLS.map((pill) => {
                const isSelected = selectedRole === pill.id;
                const roleUser = DEMO_USERS[pill.id];
                
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => handleSelectRole(pill.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-150 active:scale-95 ${
                      pill.id === 'hod' ? 'col-span-2 sm:col-span-1' : ''
                    } ${
                      isSelected
                        ? roleUser.colorClasses.pillActive
                        : roleUser.colorClasses.pillInactive
                    }`}
                  >
                    <span className="text-base leading-none select-none">{pill.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold leading-tight flex items-center justify-between">
                        <span>{pill.label}</span>
                        {isSelected && <CheckCircle2 className="w-3 h-3 ml-1 shrink-0" />}
                      </div>
                      <div className={`text-[10px] truncate ${isSelected ? 'opacity-90' : 'text-slate-500'}`}>
                        {pill.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Preview Callout */}
          <div className="mb-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
            <img 
              src={activeProfile.avatar} 
              alt={activeProfile.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-teal-500/30 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">{activeProfile.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${activeProfile.colorClasses.bg} ${activeProfile.colorClasses.text} ${activeProfile.colorClasses.border}`}>
                  {activeProfile.roleLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{activeProfile.subtitle}</p>
            </div>
            <div className="shrink-0 text-slate-500">
              <ActiveIcon className="w-4 h-4 text-teal-400" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="name@university.edu"
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-teal-400/80 hover:text-teal-300 cursor-pointer transition-colors">
                  Demo: password123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-teal-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                Remember role session
              </label>
              <span className="text-slate-500 text-[11px] font-mono">
                RBAC Level 3
              </span>
            </div>

            {/* Sign In CTA Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-teal-500 via-teal-600 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating as {activeProfile.roleLabel}...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as {activeProfile.roleLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Auto-Enter Hint */}
          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500">
              Select any role pill above to auto-populate credentials and launch the dashboard.
            </p>
          </div>
        </div>

        {/* Security & RBAC Footer */}
        <div className="mt-5 text-center flex items-center justify-center gap-2 text-slate-500 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400/70" />
          <span>Role-Based Access Control Active • Institutional Demo Environment</span>
        </div>
      </div>
    </div>
  );
}
