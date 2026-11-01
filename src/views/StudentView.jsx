import React, { useState, useEffect } from 'react';
import StudentMetricsHUD from '../components/student/StudentMetricsHUD';
import LeaderboardView from './LeaderboardView';
import { studentsApi, achievementsApi, eventsApi } from '../services/dataApi';
import { leaderboardData, campusEventsData } from '../data/mockData';
import { 
  TrendingUp, 
  CalendarCheck2, 
  Target, 
  Award, 
  CheckCircle2, 
  Circle, 
  Plus, 
  MessageSquare, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap, 
  Clock,
  Trophy,
  Flame,
  LayoutDashboard,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Area, 
  ComposedChart 
} from 'recharts';

export default function StudentView({ 
  studentData, 
  setStudentData, 
  onShowToast, 
  activeTab: propActiveTab, 
  setActiveTab: propSetActiveTab 
}) {
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Assignment');
  const [newGoalPriority, setNewGoalPriority] = useState('Medium');
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [isDataSyncing, setIsDataSyncing] = useState(false);
  const [leaderboard, setLeaderboard] = useState(leaderboardData);
  const [events, setEvents] = useState(campusEventsData);
  const [registeringEventId, setRegisteringEventId] = useState(null);
  const [localTab, setLocalTab] = useState(
    propActiveTab === 'leaderboard' ? 'leaderboard' : propActiveTab === 'events' ? 'events' : 'overview'
  );

  // Synchronize internal tab state when prop changes from Sidebar
  useEffect(() => {
    if (propActiveTab) {
      if (propActiveTab === 'leaderboard') {
        setLocalTab('leaderboard');
      } else if (propActiveTab === 'events') {
        setLocalTab('events');
      } else {
        setLocalTab('overview');
      }
    }
  }, [propActiveTab]);

  const handleTabChange = (tab) => {
    setLocalTab(tab);
    if (propSetActiveTab) {
      propSetActiveTab(tab);
    }
  };

  // Dynamic Data Binding: Fetch metrics, CGPA, attendance, XP, Leaderboard, and Campus Events
  useEffect(() => {
    let isMounted = true;
    async function loadStudentPerformanceData() {
      try {
        setIsDataSyncing(true);
        const [studentRes, achievementsRes, leaderboardRes, eventsRes] = await Promise.allSettled([
          studentsApi.getStudents(studentData?.id),
          achievementsApi.getAchievements(studentData?.id),
          achievementsApi.getLeaderboard(),
          eventsApi.getEvents()
        ]);

        if (!isMounted) return;

        let merged = { ...studentData };

        if (studentRes.status === 'fulfilled' && studentRes.value?.data) {
          const fetchedData = studentRes.value.data;
          merged = {
            ...merged,
            ...fetchedData,
            cgpaHistory: fetchedData.cgpaHistory || merged.cgpaHistory,
            subjectMarks: fetchedData.subjectMarks || merged.subjectMarks,
            goals: fetchedData.goals || merged.goals,
            feedbackTimeline: fetchedData.feedbackTimeline || merged.feedbackTimeline,
          };
        }

        if (achievementsRes.status === 'fulfilled' && achievementsRes.value?.data) {
          const badgesData = achievementsRes.value.data;
          if (Array.isArray(badgesData) && badgesData.length > 0) {
            merged.badges = badgesData;
          }
        }

        if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value?.data) {
          const lbData = leaderboardRes.value.data;
          if (Array.isArray(lbData) && lbData.length > 0) {
            setLeaderboard(lbData);
          }
        }

        if (eventsRes.status === 'fulfilled' && eventsRes.value?.data) {
          const evData = eventsRes.value.data;
          if (Array.isArray(evData) && evData.length > 0) {
            setEvents(evData);
          }
        }

        setStudentData(merged);
      } catch (err) {
        console.warn('[StudentView] Dynamic data fetch fallback triggered:', err.message);
      } finally {
        if (isMounted) setIsDataSyncing(false);
      }
    }

    loadStudentPerformanceData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Interactive XP & Points System: Claim badge or point request via achievementsApi.claim()
  const handleClaimPointsOrBadge = async (badgeOrReward) => {
    try {
      const pointsToAward = badgeOrReward.points || 150;
      const claimPayload = {
        studentId: studentData.id,
        badgeId: badgeOrReward.id,
        name: badgeOrReward.name,
        points: pointsToAward,
        desc: badgeOrReward.desc,
        claimedAt: new Date().toISOString()
      };

      // Dispatch claim to Kotlin Backend / Firestore
      const claimResult = await achievementsApi.claim(claimPayload);

      // Dynamically calculate new XP and Level
      const currentXp = Number(studentData.xp) || 0;
      const newXp = currentXp + pointsToAward;
      let nextLevelXp = Number(studentData.nextLevelXp) || 4000;
      let currentLevel = studentData.level;
      let leveledUp = false;

      if (newXp >= nextLevelXp) {
        leveledUp = true;
        currentLevel = 'Vanguard Scholar';
        nextLevelXp = 5000;
      }

      // Append badge to unlocked list if not already present
      const alreadyHasBadge = (studentData.badges || []).some(b => b.name === badgeOrReward.name);
      const updatedBadges = alreadyHasBadge
        ? studentData.badges
        : [
            ...(studentData.badges || []),
            {
              id: badgeOrReward.id || Date.now(),
              name: badgeOrReward.name,
              icon: badgeOrReward.icon || 'Sparkles',
              color: badgeOrReward.color || 'from-teal-400 to-cyan-500',
              desc: badgeOrReward.desc || 'Unlocked via point allocation request',
              unlocked: true,
              unlockedDate: 'Just now'
            }
          ];

      const updatedStudent = {
        ...studentData,
        xp: newXp,
        level: currentLevel,
        nextLevelXp,
        badges: updatedBadges
      };

      setStudentData(updatedStudent);
      await studentsApi.updateStudent(updatedStudent);

      // Also update leaderboard state dynamically so user sees their rank/XP update
      setLeaderboard(prevLb => {
        const updated = prevLb.map(item => {
          if (item.id === studentData.id || item.isCurrentUser || item.name === studentData.name) {
            return {
              ...item,
              xp: newXp,
              level: leveledUp ? 15 : item.level,
              levelTitle: leveledUp ? 'Vanguard Scholar' : item.levelTitle,
              badgeCount: updatedBadges.length,
            };
          }
          return item;
        });
        return updated
          .sort((a, b) => b.xp - a.xp)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));
      });

      onShowToast({
        type: 'success',
        title: leveledUp ? '🎉 MILESTONE REACHED!' : 'XP & Points Awarded!',
        message: leveledUp
          ? `You reached ${currentLevel} with +${pointsToAward} XP! (${claimResult?.source || 'synced'})`
          : `+${pointsToAward} XP allocated for "${badgeOrReward.name}". (${claimResult?.source || 'synced'})`
      });
    } catch (err) {
      console.warn('[StudentView] Error claiming points/badge:', err);
      onShowToast({
        type: 'info',
        title: 'Achievement Updated (Local)',
        message: `+150 XP credited locally for ${badgeOrReward.name}.`
      });
    }
  };

  // Event Registration Handler: Updates state, increments live XP, updates Level HUD, and updates Leaderboard
  const handleRegisterEvent = async (event) => {
    if (event.registered) return;
    setRegisteringEventId(event.id);

    try {
      const xpToAdd = Number(event.xpReward) || 350;
      const currentXp = Number(studentData.xp) || 0;
      const newXp = currentXp + xpToAdd;
      let nextLevelXp = Number(studentData.nextLevelXp) || 4000;
      let currentLevel = studentData.level;
      let leveledUp = false;

      if (newXp >= nextLevelXp) {
        leveledUp = true;
        currentLevel = 'Vanguard Scholar';
        nextLevelXp = 5000;
      }

      // Check if event has a badge to unlock
      let updatedBadges = studentData.badges || [];
      if (event.badgeReward && !updatedBadges.some(b => b.name === event.badgeReward)) {
        updatedBadges = [
          ...updatedBadges,
          {
            id: `badge-${event.id}`,
            name: event.badgeReward,
            icon: 'Sparkles',
            color: 'from-amber-400 to-rose-500',
            desc: `Unlocked by registering for ${event.title}`,
            unlocked: true,
            unlockedDate: 'Just now'
          }
        ];
      }

      const updatedStudent = {
        ...studentData,
        xp: newXp,
        level: currentLevel,
        nextLevelXp,
        badges: updatedBadges
      };

      // 1. Immediately update Student State (Level HUD updates live)
      setStudentData(updatedStudent);

      // 2. Mark event as registered and decrement seat
      setEvents(prev => prev.map(ev => {
        if (ev.id === event.id) {
          return {
            ...ev,
            registered: true,
            seatsLeft: Math.max(0, (ev.seatsLeft || 1) - 1)
          };
        }
        return ev;
      }));

      // 3. Dynamically re-rank Aarav Sharma on the live Leaderboard
      setLeaderboard(prevLb => {
        const updated = prevLb.map(item => {
          if (item.id === studentData.id || item.isCurrentUser || item.name === studentData.name) {
            return {
              ...item,
              xp: newXp,
              level: leveledUp ? 15 : item.level,
              levelTitle: leveledUp ? 'Vanguard Scholar' : item.levelTitle,
              badgeCount: updatedBadges.length
            };
          }
          return item;
        });
        return updated
          .sort((a, b) => b.xp - a.xp)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));
      });

      // 4. Persist to API / Firestore with fallback
      await Promise.allSettled([
        studentsApi.updateStudent(updatedStudent),
        eventsApi.registerEvent(event.id, {
          studentId: studentData.id,
          studentName: studentData.name,
          rollNo: studentData.rollNo,
          eventTitle: event.title,
          xpAwarded: xpToAdd,
          registeredAt: new Date().toISOString()
        })
      ]);

      onShowToast({
        type: 'success',
        title: leveledUp ? '🎉 MILESTONE REACHED!' : 'Event Registered!',
        message: `+${xpToAdd} XP awarded for registering in "${event.title}". Seat confirmed!`
      });
    } catch (err) {
      console.warn('[StudentView] Event registration error:', err);
      onShowToast({
        type: 'info',
        title: 'Registration Saved (Local)',
        message: `+${event.xpReward} XP credited for ${event.title}.`
      });
    } finally {
      setRegisteringEventId(null);
    }
  };

  // Toggle goal completion
  const handleToggleGoal = (id) => {
    const updatedGoals = studentData.goals.map(g => {
      if (g.id === id) {
        const nextState = !g.completed;
        onShowToast({
          type: 'success',
          title: nextState ? 'Goal Completed!' : 'Goal Reopened',
          message: nextState ? `"${g.title}" marked as finished.` : `"${g.title}" marked as pending.`
        });
        return { ...g, completed: nextState };
      }
      return g;
    });

    setStudentData({
      ...studentData,
      goals: updatedGoals
    });
  };

  // Add new goal
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const newGoal = {
      id: `g-${Date.now()}`,
      title: newGoalTitle.trim(),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: newGoalPriority,
      completed: false,
      category: newGoalCategory
    };

    setStudentData({
      ...studentData,
      goals: [newGoal, ...studentData.goals]
    });

    setNewGoalTitle('');
    setShowAddGoalModal(false);
    onShowToast({
      type: 'success',
      title: 'Goal Created',
      message: 'New academic action-item has been added to your dashboard.'
    });
  };

  const completedGoalsCount = studentData.goals.filter(g => g.completed).length;

  // Custom Chart Tooltips
  const CustomCgpaTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-bold text-slate-200">{label}</div>
          <div className="text-teal-400 flex items-center justify-between gap-4">
            <span>Your CGPA:</span>
            <span className="font-mono font-bold text-sm">{payload[0].value}</span>
          </div>
          {payload[1] && (
            <div className="text-slate-400 flex items-center justify-between gap-4">
              <span>Dept Average:</span>
              <span className="font-mono">{payload[1].value}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomMarksTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-bold text-white mb-1">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span className="font-mono font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Leaderboard active user standing
  const currentUserEntry = leaderboard.find(
    s => s.id === studentData.id || s.isCurrentUser || s.name === studentData.name
  );

  const registeredEventsCount = events.filter(e => e.registered).length;
  const availableEventsCount = events.length - registeredEventsCount;

  return (
    <div className="space-y-6">
      {/* 1. Student Metrics & Gamified Level HUD */}
      <StudentMetricsHUD 
        studentData={studentData} 
        onShowToast={onShowToast} 
        onClaimAchievement={handleClaimPointsOrBadge}
        isDataSyncing={isDataSyncing}
      />

      {/* 2. Navigation Tab Switcher */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${
              localTab === 'overview'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-850'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Academic Overview
          </button>
          <button
            onClick={() => handleTabChange('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${
              localTab === 'leaderboard'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-850'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Student Leaderboard
            {currentUserEntry && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                localTab === 'leaderboard'
                  ? 'bg-slate-950/30 text-slate-950'
                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              }`}>
                Rank #{currentUserEntry.rank}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${
              localTab === 'events'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-850'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Events &amp; Quests
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              localTab === 'events'
                ? 'bg-slate-950/30 text-slate-950'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {availableEventsCount} Open
            </span>
          </button>
        </div>

        {localTab === 'leaderboard' && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-amber-300">
              <Flame className="w-4 h-4 text-amber-400" />
              Season 6 Academic Sprint
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              CSE Dept Cohort (140 Students)
            </span>
          </div>
        )}

        {localTab === 'events' && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {registeredEventsCount} Registered
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-teal-300 font-bold">
              Up to +1,600 XP Available
            </span>
          </div>
        )}
      </div>

      {/* 3. CONDITIONAL VIEW: EVENTS & QUESTS TAB */}
      {localTab === 'events' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Upcoming Campus Quests
                </span>
                <span className="text-xs text-slate-400">Semester 6 Co-Curricular Track</span>
              </div>
              <h2 className="text-xl font-black text-white">Hackathons, Competitions &amp; XP Quests</h2>
              <p className="text-xs text-slate-400 mt-1">
                Register for accredited campus tech sprints to earn direct XP boosts, advance your academic standing, and unlock rare badges.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-850 p-4 rounded-2xl border border-slate-800 shrink-0">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your Live XP</div>
                <div className="font-mono text-xl font-black text-teal-400">{studentData.xp.toLocaleString()} XP</div>
              </div>
              <div className="w-px h-8 bg-slate-750" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Standing</div>
                <div className="font-mono text-sm font-bold text-white">{studentData.level}</div>
              </div>
            </div>
          </div>

          {/* EVENTS CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.map((event) => {
              const isRegistering = registeringEventId === event.id;
              const categoryColor = {
                Hackathon: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
                Workshop: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
                'Tech Quiz': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                Masterclass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
              }[event.category] || 'bg-teal-500/15 text-teal-300 border-teal-500/30';

              return (
                <div
                  key={event.id}
                  className={`rounded-3xl border p-6 shadow-xl flex flex-col justify-between transition-all duration-200 ease-in-out hover:-translate-y-1 ${
                    event.registered
                      ? 'bg-slate-900/90 border-emerald-500/30 ring-1 ring-emerald-500/20'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-2xl'
                  }`}
                >
                  <div>
                    {/* Header: Category, Tag, and XP Pill */}
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${categoryColor}`}>
                          {event.category}
                        </span>
                        {event.tag && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {event.tag}
                          </span>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/30 font-mono font-black text-xs flex items-center gap-1 shadow-sm">
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        +{event.xpReward} XP
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-bold text-white mb-2 leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {event.description}
                    </p>

                    {/* Event Logistics Metadata */}
                    <div className="space-y-2 py-3 border-y border-slate-800/80 mb-4 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-teal-400" />
                          Date &amp; Time:
                        </span>
                        <span className="font-mono text-slate-200">
                          {event.date} • {event.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          Venue:
                        </span>
                        <span className="text-slate-200">{event.venue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-rose-400" />
                          Capacity:
                        </span>
                        <span className={`font-mono font-semibold ${event.seatsLeft < 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {event.seatsLeft} seats remaining
                        </span>
                      </div>
                    </div>

                    {/* Badge Reward Pill */}
                    {event.badgeReward && (
                      <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-slate-850 border border-slate-800">
                        <Award className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-[11px] text-slate-300">
                          Achievement Badge Reward: <strong className="text-amber-300">{event.badgeReward}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Register Button */}
                  <div>
                    {event.registered ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 cursor-default"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Registered • +{event.xpReward} XP Claimed
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegisterEvent(event)}
                        disabled={isRegistering || event.seatsLeft === 0}
                        className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-500/25 transition-all duration-150 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                        {isRegistering ? 'Registering & Syncing...' : `Register & Claim +${event.xpReward} XP`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. CONDITIONAL VIEW: LEADERBOARD VIEW */}
      {localTab === 'leaderboard' && (
        <LeaderboardView 
          studentData={studentData} 
          currentRole="student" 
          onShowToast={onShowToast} 
        />
      )}

      {/* 5. CONDITIONAL VIEW: ACADEMIC OVERVIEW DASHBOARD */}
      {localTab === 'overview' && (
        <div className="space-y-6">
          {/* RECHARTS SECTION: LINE GRAPH & BAR CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* CGPA Trajectory Line Graph */}
            <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                    Semester-wise CGPA Trajectory
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Historical trend vs Department Cohort Average</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 font-mono border border-teal-500/20">
                  Current: {studentData.cgpa}
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={studentData.cgpaHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cgpaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="semester" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={[6.0, 10.0]} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomCgpaTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Area type="monotone" dataKey="studentCgpa" fill="url(#cgpaGrad)" stroke="#14b8a6" strokeWidth={2.5} name="Student CGPA" />
                    <Line type="monotone" dataKey="deptAvg" stroke="#6366f1" strokeDasharray="4 4" strokeWidth={2} name="Dept Average" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject Marks Breakdown Bar Chart */}
            <div className="lg:col-span-5 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    Subject Marks Breakdown
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Component-wise scores out of 100</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">Sem 6</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentData.subjectMarks} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="code" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomMarksTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="internal" stackId="a" fill="#3b82f6" name="Internal (30)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="midterm" stackId="a" fill="#8b5cf6" name="Midterm (30)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="practical" stackId="a" fill="#14b8a6" name="Practical (40)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ACTION-ITEM GOAL CHECKLIST & FACULTY FEEDBACK TIMELINE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Action-Item Goal Checklist */}
            <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-400" />
                      Action-Item Goal Checklist
                    </h3>
                    <p className="text-xs text-slate-400">Micro-milestones for continuous semester progress</p>
                  </div>
                  <button
                    onClick={() => setShowAddGoalModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Goal
                  </button>
                </div>

                {/* Goals List */}
                <div className="space-y-2.5 mt-3">
                  {studentData.goals.map((goal) => {
                    const priorityColors = {
                      Urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                      High: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                      Medium: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
                      Low: 'bg-slate-700/50 text-slate-400 border-slate-600'
                    };

                    return (
                      <div
                        key={goal.id}
                        onClick={() => handleToggleGoal(goal.id)}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          goal.completed
                            ? 'bg-slate-900/40 border-slate-800/80 text-slate-500 opacity-70'
                            : 'bg-slate-850/80 border-slate-700/70 hover:border-teal-500/40 text-slate-200'
                        }`}
                      >
                        <button className="mt-0.5 text-teal-400 hover:scale-110 transition-transform">
                          {goal.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-teal-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-500" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-medium ${goal.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                            {goal.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${priorityColors[goal.priority] || priorityColors.Medium}`}>
                              {goal.priority}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              Due: {goal.dueDate}
                            </span>
                            <span className="text-[10px] text-slate-400 px-1.5 py-0.2 bg-slate-800 rounded">
                              {goal.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Completed: <strong className="text-teal-400">{completedGoalsCount}</strong> / {studentData.goals.length}</span>
                <span className="text-teal-400 font-medium">Earn +50 XP per completed goal</span>
              </div>
            </div>

            {/* Faculty Feedback Timeline */}
            <div className="lg:col-span-5 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    Faculty Feedback Timeline
                  </h3>
                  <p className="text-xs text-slate-400">Subject-wise teacher observations & recommendations</p>
                </div>
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded text-[10px] font-mono">
                  Live Feed
                </span>
              </div>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {studentData.feedbackTimeline.map((item) => (
                  <div key={item.id} className="relative pl-7 text-xs">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-teal-400 ring-4 ring-slate-900" />
                    <div className="p-3.5 rounded-2xl bg-slate-850/90 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold text-slate-200">{item.facultyName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
                      </div>
                      <div className="text-[11px] font-medium text-teal-400">{item.course}</div>
                      <p className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                        "{item.comment}"
                      </p>
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${item.badgeColor}`}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BADGES SHOWCASE */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Unlocked Academic Badges</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {studentData.badges?.length || 4} / 12 Badges Earned
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {studentData.badges.map((b) => (
                <div 
                  key={b.id} 
                  className="p-4 rounded-2xl bg-slate-850/90 border border-slate-800 hover:border-teal-500/30 transition-all flex items-center gap-3.5 group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${b.color} flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-black/40 group-hover:scale-105 transition-transform shrink-0`}>
                    <Sparkles className="w-6 h-6 text-slate-950" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white truncate">{b.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create Action Goal</h3>
            <p className="text-xs text-slate-400 mb-4">Commit to a study milestone or submission.</p>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master dynamic programming graphs"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Exam">Exam Prep</option>
                    <option value="Certification">Certification</option>
                    <option value="Project">Project Milestone</option>
                    <option value="Revision">Revision</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newGoalPriority}
                    onChange={(e) => setNewGoalPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 transition-colors"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
