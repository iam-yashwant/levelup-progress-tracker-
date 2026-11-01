import React, { useState, useEffect } from 'react';
import { achievementsApi } from '../services/dataApi';
import { leaderboardData } from '../data/mockData';
import { 
  Trophy, 
  Award, 
  Zap, 
  Search, 
  ArrowLeft, 
  Sparkles,
  Users
} from 'lucide-react';

// Crisp inline SVGs for GitHub, LinkedIn, and LeetCode
function GithubIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46V10.9M7.86 6.3a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
    </svg>
  );
}

function LeetcodeIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 4.818 3.558 5.61 5.61 0 0 0 1.258-.088 5.487 5.487 0 0 0 2.247-.96l7.85-7.794a1.404 1.404 0 0 0-.008-1.986 1.408 1.408 0 0 0-1.985-.008L9.08 16.421a3.02 3.02 0 0 1-2.298.775 3.042 3.042 0 0 1-2.483-1.85 3.09 3.09 0 0 1-.168-1.082 3.1 3.1 0 0 1 .632-1.815l3.874-4.148 4.793-4.996a1.372 1.372 0 0 0-.947-2.28zM15.485 10.422a1.407 1.407 0 0 0-1.987.008 1.407 1.407 0 0 0 .008 1.986l2.916 2.898H9.866a1.407 1.407 0 1 0 0 2.814h6.543l-2.916 2.898a1.407 1.407 0 0 0-.008 1.986 1.407 1.407 0 0 0 1.986.008l5.342-5.309a1.407 1.407 0 0 0 0-1.986l-5.328-5.295z" />
    </svg>
  );
}

export default function LeaderboardView({ 
  studentData, 
  currentRole = 'student', 
  onShowToast, 
  onBack 
}) {
  const [leaderboard, setLeaderboard] = useState(leaderboardData);
  const [isDataSyncing, setIsDataSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Data Binding: Fetch Leaderboard from 3-Tier Backend
  useEffect(() => {
    let isMounted = true;
    async function fetchLeaderboard() {
      try {
        setIsDataSyncing(true);
        const res = await achievementsApi.getLeaderboard();
        if (!isMounted) return;

        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          // If studentData has live points, update Aarav's entry dynamically
          let data = res.data;
          if (studentData && studentData.xp) {
            data = data.map(s => {
              if (s.id === studentData.id || s.rollNo === studentData.rollNo || s.isCurrentUser) {
                return { ...s, xp: Number(studentData.xp) || s.xp };
              }
              return s;
            }).sort((a, b) => b.xp - a.xp).map((s, idx) => ({ ...s, rank: idx + 1 }));
          }
          setLeaderboard(data);
        }
      } catch (err) {
        console.warn('[LeaderboardView] Data fetch error:', err.message);
      } finally {
        if (isMounted) setIsDataSyncing(false);
      }
    }

    fetchLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [studentData]);

  // Filter leaderboard based on search query
  const filteredLeaderboard = leaderboard.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q);
  });

  const sortedLeaderboard = [...filteredLeaderboard].sort((a, b) => (a.rank || 0) - (b.rank || 0));
  const top1 = sortedLeaderboard.find(s => s.rank === 1) || sortedLeaderboard[0];
  const top2 = sortedLeaderboard.find(s => s.rank === 2) || sortedLeaderboard[1];
  const top3 = sortedLeaderboard.find(s => s.rank === 3) || sortedLeaderboard[2];
  const remainingRanks = sortedLeaderboard.filter(s => s.rank > 3);

  const currentUserEntry = leaderboard.find(
    s => s.id === studentData?.id || s.rollNo === studentData?.rollNo || s.isCurrentUser
  );
  const isCurrentUserInTop10 = sortedLeaderboard.slice(0, 10).some(
    s => s.id === studentData?.id || s.rollNo === studentData?.rollNo || s.isCurrentUser
  );

  const roleLabel = {
    student: 'Student View',
    faculty: 'Faculty Oversight',
    mentor: 'Mentorship Dashboard',
    parent: 'Guardian Digest',
    hod: 'HOD Executive Portal',
  }[currentRole] || 'Global Portal';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER BANNER */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-teal-400" />
              Global Cohort Standings
            </span>
            <span className="text-xs text-slate-400">
              Accessed via: <strong className="text-teal-300 font-semibold">{roleLabel}</strong>
            </span>
            {isDataSyncing && (
              <span className="text-[10px] text-teal-400 animate-pulse font-mono">
                (Syncing live scores...)
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Student Points Leaderboard</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Strictly ranked by cumulative academic evaluation points, lab assessments, and curricular milestones. No gamified tiers or medals.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 w-56 transition-all"
            />
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-teal-400" />
              Back to Portal
            </button>
          )}
        </div>
      </div>

      {/* MINIMAL TOP 3 ELEVATED NUMERICAL CARDS */}
      {!searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Top 3 Cohort Standings
            </h2>
            <span className="text-xs text-slate-500 font-mono">Ranked strictly by Points (XP)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { item: top1, label: 'Top 1', accent: 'border-teal-500/40 bg-teal-500/5', numColor: 'text-teal-400', badge: 'bg-teal-500/10 text-teal-300 border-teal-500/30' },
              { item: top2, label: 'Top 2', accent: 'border-indigo-500/40 bg-indigo-500/5', numColor: 'text-indigo-400', badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
              { item: top3, label: 'Top 3', accent: 'border-slate-700 bg-slate-900/60', numColor: 'text-slate-400', badge: 'bg-slate-800 text-slate-300 border-slate-700' },
            ].map(({ item, label, accent, numColor, badge }) => {
              if (!item) return null;
              const isCurrentUser = item.isCurrentUser || item.id === studentData?.id || item.rollNo === studentData?.rollNo;

              return (
                <div 
                  key={item.id || item.rank}
                  className={`rounded-2xl border p-5 shadow-lg relative flex flex-col justify-between transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:border-slate-600 ${accent} ${
                    isCurrentUser ? 'ring-2 ring-teal-400' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono uppercase tracking-wider border ${badge}`}>
                        {label}
                      </span>
                      <span className={`text-2xl font-black font-mono tracking-tight ${numColor}`}>
                        #{item.rank < 10 ? `0${item.rank}` : item.rank}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <img 
                        src={item.avatar} 
                        alt={item.name} 
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700 shrink-0" 
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-sm truncate">{item.name}</h3>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-400 text-slate-950 uppercase tracking-wider">
                              {currentRole === 'parent' ? 'Ward' : 'You'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                          {item.rollNo} • {item.batch || '2021-25'}
                        </p>
                      </div>
                    </div>

                    {/* Social Profiles: GitHub, LinkedIn, LeetCode */}
                    <div className="mt-3.5 flex items-center gap-2">
                      <a
                        href={item.github || "https://github.com"}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all duration-150 hover:scale-110 active:scale-95 shadow-sm"
                        title="GitHub Profile"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={item.linkedin || "https://linkedin.com"}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700 transition-all duration-150 hover:scale-110 active:scale-95 shadow-sm"
                        title="LinkedIn Profile"
                      >
                        <LinkedinIcon className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={item.leetcode || "https://leetcode.com"}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 transition-all duration-150 hover:scale-110 active:scale-95 shadow-sm"
                        title="LeetCode Profile"
                      >
                        <LeetcodeIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Academic Points</div>
                      <div className="text-lg font-black font-mono text-white mt-0.5">
                        {item.xp.toLocaleString()} <span className="text-xs font-normal text-slate-400">XP</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Badges / CGPA</div>
                      <div className="text-xs font-mono font-medium text-slate-300 mt-0.5">
                        <span className="text-amber-400 font-bold">{item.badgeCount} Badges</span> • <span className="text-emerald-400">{item.cgpa}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* COHORT RANKED TABLE: RANKS 4 ONWARDS (OR ALL IF SEARCHING) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-400" />
              {searchQuery ? 'Search Results' : 'Cohort Ranked Standings (Ranks 4+)'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative evaluation scores, laboratory performance, and co-curricular milestones.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
            Cohort Total: {leaderboard.length} Students
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">Student Name &amp; Department</th>
                <th className="py-3 px-4 text-center">Social Profiles</th>
                <th className="py-3 px-4 text-center">Badges Count</th>
                <th className="py-3 px-4 text-right">Total Points (XP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {(searchQuery ? sortedLeaderboard : remainingRanks).map((student) => {
                const isCurrent = student.isCurrentUser || student.id === studentData?.id || student.rollNo === studentData?.rollNo;
                return (
                  <tr
                    key={student.id || student.rank}
                    className={`transition-all duration-150 ${
                      isCurrent
                        ? 'bg-teal-500/10 border-l-4 border-l-teal-400 hover:bg-teal-500/20'
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs transition-transform duration-150 group-hover:scale-105 ${
                        isCurrent
                          ? 'bg-teal-500 text-slate-950 font-black shadow-sm shadow-teal-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{student.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className={`w-9 h-9 rounded-xl object-cover shrink-0 transition-transform duration-150 hover:scale-105 ${
                            isCurrent ? 'ring-2 ring-teal-400' : 'ring-1 ring-slate-700'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isCurrent ? 'text-teal-300' : 'text-white'}`}>
                              {student.name}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-400 text-slate-950 uppercase tracking-wider">
                                {currentRole === 'parent' ? 'Your Ward' : 'You'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {student.rollNo} • {student.department || 'Computer Science & Eng.'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={student.github || "https://github.com"}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all duration-150 hover:scale-110 active:scale-95 shadow-sm"
                          title={`${student.name}'s GitHub`}
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={student.linkedin || "https://linkedin.com"}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700 transition-all duration-150 hover:scale-110 active:scale-95 shadow-sm"
                          title={`${student.name}'s LinkedIn`}
                        >
                          <LinkedinIcon className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={student.leetcode || "https://leetcode.com"}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 transition-all duration-150 hover:scale-110 active:scale-95 shadow-sm"
                          title={`${student.name}'s LeetCode`}
                        >
                          <LeetcodeIcon className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-slate-300 font-bold font-mono">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        {student.badgeCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-sm text-white flex items-center justify-end gap-1">
                        <Zap className="w-3.5 h-3.5 text-teal-400" />
                        {student.xp.toLocaleString()} <span className="text-xs text-slate-400 font-normal">XP</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PINNED STANDING CARD IF CURRENT USER IS OUTSIDE TOP 10 */}
        {!isCurrentUserInTop10 && currentUserEntry && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-teal-500/15 via-indigo-500/10 to-slate-900 border-2 border-teal-500/40 shadow-xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-mono font-black text-sm">
                #{currentUserEntry.rank}
              </div>
              <img
                src={currentUserEntry.avatar}
                alt={currentUserEntry.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-teal-400"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{currentUserEntry.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-400 text-slate-950 uppercase tracking-wider">
                    {currentRole === 'parent' ? 'Your Ward' : 'You'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">({currentUserEntry.rollNo})</span>
                </div>
                <div className="text-xs text-slate-400">
                  {currentUserEntry.department || 'Computer Science & Engineering'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <a
                  href={currentUserEntry.github || "https://github.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-all duration-150 hover:scale-110 active:scale-95 shadow-sm"
                  title="GitHub Profile"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href={currentUserEntry.linkedin || "https://linkedin.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-blue-400 hover:text-blue-300 border border-slate-700 transition-all duration-150 hover:scale-110 active:scale-95 shadow-sm"
                  title="LinkedIn Profile"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href={currentUserEntry.leetcode || "https://leetcode.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 border border-slate-700 transition-all duration-150 hover:scale-110 active:scale-95 shadow-sm"
                  title="LeetCode Profile"
                >
                  <LeetcodeIcon className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Points</div>
                <div className="font-mono text-base font-black text-teal-400">
                  {currentUserEntry.xp.toLocaleString()} XP
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Badges</div>
                <div className="font-mono text-sm font-bold text-amber-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> {currentUserEntry.badgeCount}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}