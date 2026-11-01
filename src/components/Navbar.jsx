import React, { useState } from 'react';
import { 
  GraduationCap, 
  Bell, 
  BookOpen, 
  HeartHandshake, 
  Users, 
  Building2,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../data/demoUsers';

export default function Navbar({ 
  currentRole, 
  currentUser: propUser,
  onLogout,
  notifications = [], 
  onClearNotifications 
}) {
  const { currentUser: authUser, logout: authLogout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Determine active profile from prop or context or fallback
  const user = propUser || authUser || DEMO_USERS[currentRole] || DEMO_USERS.student;
  const activeRole = currentRole || user.role || 'student';

  const roleMeta = {
    student: {
      label: 'Student Portal',
      icon: GraduationCap,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/30'
    },
    faculty: {
      label: 'Faculty Portal',
      icon: BookOpen,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
    },
    mentor: {
      label: 'Mentor Portal',
      icon: HeartHandshake,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    parent: {
      label: 'Parent Portal',
      icon: Users,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    },
    hod: {
      label: 'HOD Portal',
      icon: Building2,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    }
  };

  const meta = roleMeta[activeRole] || roleMeta.student;
  const RoleIcon = meta.icon;
  const unreadCount = notifications.length;

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else if (authLogout) {
      authLogout();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/20 ring-1 ring-white/10">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white">
              Level<span className="text-teal-400">Up</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full tracking-wider uppercase">
              v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Academic Performance & Mentorship Platform
          </p>
        </div>
      </div>

      {/* Center/Right Section: Active Role Badge, Notifications, User Profile & Logout */}
      <div className="flex items-center gap-3">
        {/* Active Role Indicator Badge (replaces direct role switcher dropdown) */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${meta.color}`}>
          <RoleIcon className="w-4 h-4 shrink-0" />
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold tracking-wider leading-none opacity-80">
              Authenticated Role
            </div>
            <div className="text-xs font-bold leading-tight mt-0.5">
              {meta.label}
            </div>
          </div>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-teal-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">System Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={onClearNotifications} 
                    className="text-[11px] text-teal-400 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No new notifications</p>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs">
                      <div className="font-semibold text-slate-200">{n.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{n.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Profile Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <img 
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
            alt={user.name || 'User Avatar'} 
            className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/40 shrink-0"
          />
          <div className="text-left text-xs hidden md:block max-w-[140px] lg:max-w-[180px]">
            <div className="font-semibold text-slate-200 leading-tight truncate">
              {user.name || 'Aarav Sharma'}
            </div>
            <div className="text-[10px] text-teal-400 leading-tight truncate font-mono">
              {user.subtitle || user.roleBadge || user.roleLabel || activeRole}
            </div>
          </div>
        </div>

        {/* Prominent Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition-all duration-150 active:scale-95 shadow-sm group"
          title="Sign out of current role"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
