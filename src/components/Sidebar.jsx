import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  BarChart3, 
  CheckSquare, 
  MessageSquare, 
  CalendarCheck, 
  AlertTriangle, 
  FileSpreadsheet, 
  Award,
  Trophy,
  Calendar,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { DEMO_USERS } from '../data/demoUsers';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentRole, activeTab, setActiveTab, onLogout }) {
  const { currentUser: authUser, logout: authLogout } = useAuth();
  const profile = authUser || DEMO_USERS[currentRole] || DEMO_USERS.student;

  // Navigation items specific to roles
  const getNavItems = () => {
    switch (currentRole) {
      case 'student':
        return [
          { id: 'overview', label: 'Overview & CGPA', icon: LayoutDashboard },
          { id: 'leaderboard', label: 'Student Leaderboard', icon: Trophy },
          { id: 'events', label: 'Events & Quests', icon: Calendar },
          { id: 'academics', label: 'Course Marks & Trajectory', icon: BarChart3 },
          { id: 'goals', label: 'Action Goals', icon: CheckSquare },
          { id: 'feedback', label: 'Feedback & Mentorship', icon: MessageSquare },
          { id: 'badges', label: 'Badges & Rank', icon: Award }
        ];
      case 'faculty':
        return [
          { id: 'attendance', label: 'Attendance Logger', icon: CalendarCheck },
          { id: 'grades', label: 'Marks Entry Interface', icon: FileSpreadsheet },
          { id: 'feedback-panel', label: 'Improvement Advice', icon: MessageSquare },
          { id: 'leaderboard', label: 'Student Leaderboard', icon: Trophy }
        ];
      case 'mentor':
        return [
          { id: 'roster', label: 'Mentee Roster & Flags', icon: AlertTriangle },
          { id: 'sessions', label: '1-on-1 Session Logger', icon: CalendarCheck },
          { id: 'leaderboard', label: 'Student Leaderboard', icon: Trophy }
        ];
      case 'parent':
        return [
          { id: 'child-overview', label: 'Academic Report Card', icon: GraduationCap },
          { id: 'attendance-history', label: 'Attendance Breakdown', icon: CalendarCheck },
          { id: 'teacher-notes', label: 'Teacher & Mentor Notes', icon: MessageSquare },
          { id: 'leaderboard', label: 'Student Leaderboard', icon: Trophy }
        ];
      case 'hod':
        return [
          { id: 'hod-overview', label: 'Department Overview', icon: LayoutDashboard },
          { id: 'leaderboard', label: 'Student Leaderboard', icon: Trophy }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else if (authLogout) {
      authLogout();
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      {/* Navigation Links */}
      <div className="p-4 space-y-6">
        <div>
          <div className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>{currentRole.toUpperCase()} PORTAL</span>
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left active:scale-[0.98] ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Authenticated Session Card Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
            <span className="flex items-center gap-1 text-teal-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Session
            </span>
            <span className="font-mono text-slate-500">256-bit</span>
          </div>

          <div className="flex items-center gap-2.5">
            <img 
              src={profile.avatar} 
              alt={profile.name}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-teal-500/40 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-200 truncate">{profile.name}</div>
              <div className="text-[10px] text-teal-400 font-mono truncate">{profile.roleLabel}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3 h-3 text-rose-400" />
            <span>Switch Role / Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
