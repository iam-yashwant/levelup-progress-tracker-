import React, { useState } from 'react';
import { 
  TrendingUp, 
  CalendarCheck2, 
  Target, 
  Award, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap, 
  Clock, 
  X, 
  Info,
  CheckCircle2,
  Lock,
  ChevronRight,
  PlusCircle,
  Flame
} from 'lucide-react';

export default function StudentMetricsHUD({ 
  studentData, 
  onShowToast, 
  onClaimAchievement,
  isDataSyncing = false 
}) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Calculations
  const completedGoalsCount = studentData.goals?.filter(g => g.completed).length || 0;
  const totalGoals = studentData.goals?.length || 0;
  const pendingGoalsCount = totalGoals - completedGoalsCount;
  const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoalsCount / totalGoals) * 100) : 0;
  
  const currentXp = Number(studentData.xp) || 0;
  const nextLevelXp = Number(studentData.nextLevelXp) || 4000;
  const xpPercentage = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));
  const xpRemaining = Math.max(0, nextLevelXp - currentXp);

  // Gamification milestone roadmap list
  const unlockedNames = new Set((studentData.badges || []).map(b => b.name));

  const allBadges = [
    ...(studentData.badges || []).map(b => ({ ...b, unlocked: true, unlockedDate: b.unlockedDate || 'Verified' })),
    {
      id: 5,
      name: "Capstone Pioneer",
      icon: "Sparkles",
      color: "from-purple-500 to-indigo-600",
      desc: "Deploy a production-grade fullstack capstone project",
      unlocked: unlockedNames.has("Capstone Pioneer"),
      requirement: "4,000+ XP + Mini-Project Approval",
      points: 150
    },
    {
      id: 6,
      name: "Perfectionist 10.0",
      icon: "Award",
      color: "from-amber-400 to-orange-500",
      desc: "Achieve a perfect 10.0 SGPA in any term",
      unlocked: unlockedNames.has("Perfectionist 10.0"),
      requirement: "SGPA = 10.0 in Sem 6",
      points: 200
    }
  ];

  // Handler for claim click with loading state
  const handleClaim = async (badge) => {
    if (!onClaimAchievement || isClaiming) return;
    setIsClaiming(true);
    try {
      await onClaimAchievement(badge);
    } finally {
      setIsClaiming(false);
    }
  };

  // Attendance health logic
  const isAttendanceSafe = studentData.attendance >= 75;
  const isAttendanceOptimal = studentData.attendance >= 85;

  return (
    <div className="space-y-4">
      {/* 1. GAMIFIED STUDENT HEADER & LEVEL PROGRESS HUD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/80 border border-slate-800 p-5 md:p-7 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Avatar & Identity Details */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img 
                src={studentData.avatar} 
                alt={studentData.name} 
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover ring-2 ring-teal-400/40 shadow-lg shadow-teal-500/10"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Active Student" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">{studentData.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  {studentData.rollNo}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  {studentData.semester}
                </span>
                {isDataSyncing && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 animate-pulse">
                    Syncing API...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>{studentData.program}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">Batch {studentData.batch}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-slate-400">Assigned Mentor:</span>
                <span className="text-[11px] font-medium text-teal-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700/60 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  {studentData.mentorName}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Academic Reward Points HUD */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 lg:w-88 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Academic Reward Points</span>
              </div>
              <span className="font-mono text-teal-400 text-lg font-black">
                {currentXp.toLocaleString()} XP
              </span>
            </div>

            {/* XP Progress Bar (Live Linked) */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
              <div 
                className="bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-700 relative" 
                style={{ width: `${xpPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
              <span className="font-medium">
                Target: <span className="font-mono text-slate-300 font-semibold">{nextLevelXp.toLocaleString()} XP</span>
              </span>
              <div className="flex items-center gap-2">
                {/* Interactive Points Allocation Button */}
                <button
                  onClick={() => handleClaim({
                    id: 'quick-boost',
                    name: 'Academic Sprint Bonus',
                    points: 100,
                    icon: 'Zap',
                    color: 'from-amber-400 to-yellow-500',
                    desc: 'Instant points allocation via Kotlin Data API'
                  })}
                  disabled={isClaiming}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                  title="Claim test points allocation"
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  +100 XP
                </button>
                <button
                  onClick={() => setIsBadgesModalOpen(true)}
                  className="text-indigo-300 hover:text-indigo-200 text-[11px] font-semibold flex items-center gap-0.5 transition-colors"
                >
                  Badges <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE 4 CORE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cumulative CGPA */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 hover:border-teal-500/50 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl shadow-lg group hover:shadow-teal-500/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cumulative CGPA</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-500/20 transition-all">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">{studentData.cgpa}</span>
            <span className="text-xs text-slate-500 font-mono">/ 10.0</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80">
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {studentData.cgpaTrend}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Top 3%
            </span>
          </div>
        </div>

        {/* Card 2: Overall Attendance % */}
        <div className={`rounded-2xl bg-slate-900/90 border p-5 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl shadow-lg group ${
          isAttendanceOptimal 
            ? 'border-slate-800 hover:border-emerald-500/50 hover:shadow-emerald-500/5' 
            : isAttendanceSafe 
              ? 'border-slate-800 hover:border-amber-500/50' 
              : 'border-rose-800/80 hover:border-rose-500'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">{studentData.attendance}%</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isAttendanceOptimal 
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                : isAttendanceSafe 
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse'
            }`}>
              {isAttendanceOptimal ? 'Optimal' : isAttendanceSafe ? 'Caution' : 'Critical'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 truncate">
              {studentData.attendanceStatus}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">140/160 hrs</span>
          </div>
        </div>

        {/* Card 3: Active Goals */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 hover:border-amber-500/50 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl shadow-lg group hover:shadow-amber-500/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Goals</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">{pendingGoalsCount}</span>
            <span className="text-xs text-slate-400">pending ({completedGoalsCount} done)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-amber-400 h-1.5 rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${goalCompletionRate}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>{goalCompletionRate}% completed</span>
              <span className="text-amber-400 font-medium">+50 XP/task</span>
            </div>
          </div>
        </div>

        {/* Card 4: Department Rank & Badges */}
        <div 
          onClick={() => setIsBadgesModalOpen(true)}
          className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 hover:border-rose-500/50 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl shadow-lg group hover:shadow-rose-500/5 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dept Standing</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-white font-mono">{studentData.rank?.split(' ')[0]}</span>
            <span className="text-xs text-rose-300 font-semibold">{studentData.rank?.replace(studentData.rank.split(' ')[0], '').trim()}</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{studentData.badges?.length || 0} Badges Unlocked</span>
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-rose-400 transition-colors flex items-center">
              View All <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* 3. MODAL: BADGES & LEVEL-UP ROADMAP */}
      {isBadgesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
                  <Award className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Academic Badges & Level-Up Roadmap
                  </h3>
                  <p className="text-xs text-slate-400">
                    Earn XP through high CGPA, flawless attendance, and milestone goals.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBadgesModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              {allBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    badge.unlocked
                      ? 'bg-slate-850/90 border-slate-700/80 hover:border-teal-500/40 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${badge.color} flex items-center justify-center text-slate-950 font-bold shadow-md shrink-0 relative`}>
                      {badge.unlocked ? (
                        <Sparkles className="w-6 h-6 text-slate-950" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-950" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-bold text-sm text-white truncate">{badge.name}</div>
                        {badge.unlocked ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{badge.desc}</p>
                      
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="text-[10px] text-slate-400">
                          {badge.unlocked ? (
                            <span className="text-teal-400 font-mono">Unlocked: {badge.unlockedDate}</span>
                          ) : (
                            <span className="text-amber-400/90 font-mono">Req: {badge.requirement}</span>
                          )}
                        </div>

                        {/* Interactive unlock trigger if locked */}
                        {!badge.unlocked && (
                          <button
                            onClick={() => handleClaim(badge)}
                            disabled={isClaiming}
                            className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
                          >
                            <Zap className="w-3 h-3 text-teal-400" />
                            Claim (+{badge.points || 150} XP)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer with Direct Point Allocation Request Button */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Next reward threshold: <strong className="text-white">4,000 XP</strong></span>
                <button
                  onClick={() => handleClaim({
                    id: 5,
                    name: 'Capstone Pioneer',
                    points: 150,
                    icon: 'Sparkles',
                    color: 'from-purple-500 to-indigo-600',
                    desc: 'Deploy a production-grade fullstack capstone project'
                  })}
                  disabled={isClaiming}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Test Badge Unlock (+150 XP)
                </button>
              </div>

              <button
                onClick={() => setIsBadgesModalOpen(false)}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition-colors shadow-md w-full sm:w-auto"
              >
                Close Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
