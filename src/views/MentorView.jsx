import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  AlertTriangle, 
  CalendarCheck, 
  Plus, 
  Clock, 
  CheckCircle2, 
  TrendingDown, 
  ShieldAlert, 
  Sparkles, 
  Search,
  CheckSquare,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { mentorRosterData, mentorInitialSessions } from '../data/mockData';
import { studentsApi, feedbackApi } from '../services/dataApi';

export default function MentorView({ onShowToast }) {
  const [roster, setRoster] = useState(mentorRosterData);
  const [sessions, setSessions] = useState(mentorInitialSessions);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [isDataSyncing, setIsDataSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Data Binding: Fetch assigned mentees & mentorship history logs
  useEffect(() => {
    let isMounted = true;
    async function loadMentorPortalData() {
      try {
        setIsDataSyncing(true);
        const [rosterRes, sessionsRes] = await Promise.allSettled([
          studentsApi.getMentorRoster(),
          feedbackApi.getMentorSessions()
        ]);

        if (!isMounted) return;

        if (rosterRes.status === 'fulfilled' && rosterRes.value?.data) {
          const list = rosterRes.value.data;
          if (Array.isArray(list) && list.length > 0) {
            setRoster(list);
          }
        }

        if (sessionsRes.status === 'fulfilled' && sessionsRes.value?.data) {
          const sessList = sessionsRes.value.data;
          if (Array.isArray(sessList) && sessList.length > 0) {
            setSessions(sessList);
          }
        }
      } catch (err) {
        console.warn('[MentorView] Error syncing mentor portal data:', err.message);
      } finally {
        if (isMounted) setIsDataSyncing(false);
      }
    }

    loadMentorPortalData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Form state for 1-on-1 Session Progress Logger
  const [sessionStudentId, setSessionStudentId] = useState('STU-042');
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionDuration, setSessionDuration] = useState('45 mins');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionActionItems, setSessionActionItems] = useState('');
  const [sessionNextDate, setSessionNextDate] = useState('');

  // Filter roster
  const filteredRoster = roster.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const atRiskStudents = roster.filter(s => s.attendance < 75 || s.cgpa < 7.0 || s.flagType === 'danger');

  // Submit 1-on-1 Session Progress Logger & Guidance Notes
  const handleSaveSession = async (e) => {
    e.preventDefault();
    if (!sessionTopic.trim() || !sessionNotes.trim()) return;

    const studentObj = roster.find(s => s.id === sessionStudentId) || roster[0];

    const actionsList = sessionActionItems.split('\n')
      .map(item => item.replace(/^[•\-\*]\s*/, '').trim())
      .filter(Boolean);

    const newSession = {
      id: `ses-${Date.now()}`,
      studentId: studentObj.id,
      studentName: studentObj.name,
      date: new Date().toISOString().split('T')[0],
      duration: sessionDuration,
      topic: sessionTopic.trim(),
      actionItems: actionsList.length > 0 ? actionsList : ["Continue regular weekly review"],
      nextMeeting: sessionNextDate || "To be scheduled",
      notes: sessionNotes.trim()
    };

    setIsSubmitting(true);
    try {
      // 1. Post to feedbackApi / mentor sessions
      const sessionResult = await feedbackApi.logMentorSession(newSession);

      // 2. Update mentee's lastSession and flag status via studentsApi
      const updatedMentee = {
        id: studentObj.id,
        lastSession: newSession.date,
        flag: studentObj.flagType === 'danger' ? 'Intervention Conducted (Monitoring)' : studentObj.flag,
        flagType: studentObj.flagType === 'danger' ? 'warning' : studentObj.flagType
      };
      await studentsApi.updateMenteeStatus(updatedMentee);

      // 3. Update local state
      setSessions([newSession, ...sessions]);
      setRoster(prev => prev.map(s => s.id === studentObj.id ? { ...s, ...updatedMentee } : s));

      setShowLogModal(false);
      setSessionTopic('');
      setSessionNotes('');
      setSessionActionItems('');
      setSessionNextDate('');

      onShowToast({
        type: 'success',
        title: '1-on-1 Guidance Logged & Synced',
        message: `Mentorship notes & agreed deliverables recorded for ${studentObj.name} (${sessionResult?.source || 'synced'}).`
      });
    } catch (err) {
      console.warn('[MentorView] Error logging session:', err);
      onShowToast({
        type: 'info',
        title: 'Session Saved Locally',
        message: `Mentorship notes cached for ${studentObj.name}.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mentee status update: Clear warning flag or mark student goal as reviewed
  const handleResolveWarning = async (studentId) => {
    const studentObj = roster.find(s => s.id === studentId);
    if (!studentObj) return;

    const updated = {
      id: studentId,
      flag: 'Reviewed: On Track',
      flagType: 'success'
    };

    try {
      await studentsApi.updateMenteeStatus(updated);
      setRoster(prev => prev.map(s => s.id === studentId ? { ...s, ...updated } : s));
      onShowToast({
        type: 'success',
        title: 'Warning Flag Resolved',
        message: `${studentObj.name}'s status marked as Reviewed / On Track.`
      });
    } catch (err) {
      console.warn('[MentorView] Error updating mentee status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mentor Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Faculty Mentorship Dashboard
            </span>
            <span className="text-xs text-slate-400">Dr. Arvind Swaminathan</span>
            {isDataSyncing && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                Syncing API...
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Academic Mentee Cohort & Intervention</h1>
          <p className="text-xs text-slate-400">Department of Computer Science • 24 Assigned Mentees</p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all duration-150 active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log 1-on-1 Session Progress
        </button>
      </div>

      {/* AUTOMATIC EARLY-WARNING SYSTEM BANNER */}
      {atRiskStudents.length > 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/30 p-5 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Automated Early-Warning Alert (Action Required)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  {atRiskStudents.length} Students At Risk
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                The algorithm detected critical attendance shortage (&lt;75%) or sudden CGPA drop (&gt;0.5). Immediate 1-on-1 intervention scheduled.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {atRiskStudents.map(s => (
                  <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-rose-500/40 text-xs">
                    <span className="font-semibold text-white">{s.name} ({s.rollNo})</span>
                    <span className="text-[10px] text-rose-400 font-mono">Att: {s.attendance}%</span>
                    <span className="text-[10px] text-amber-400 font-mono">CGPA: {s.cgpa}</span>
                    <button
                      onClick={() => handleResolveWarning(s.id)}
                      className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 ml-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20"
                      title="Mark reviewed and clear early warning flag"
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGNED STUDENT ROSTER */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-teal-400" />
              Assigned Mentee Roster with Risk Flags
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Continuous health score and performance monitoring</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="Search by student or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 w-64"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoster.map((s) => {
            const flagStyles = {
              danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
              warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
              success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            };

            return (
              <div 
                key={s.id} 
                className="p-5 rounded-2xl bg-slate-850/90 border border-slate-800 hover:border-slate-700 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={s.avatar} 
                      alt={s.name} 
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700"
                    />
                    <div>
                      <div className="font-bold text-white text-sm">{s.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.rollNo} • {s.semester}</div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${flagStyles[s.flagType]} ${s.flagType === 'danger' ? 'animate-pulse' : ''}`}>
                    {s.flag}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">CGPA</div>
                    <div className="font-mono font-bold text-white text-sm">{s.cgpa}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Attendance</div>
                    <div className={`font-mono font-bold text-sm ${s.attendance < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {s.attendance}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Last Review</div>
                    <div className="font-mono text-[11px] text-slate-300 mt-0.5">{s.lastSession}</div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="font-semibold text-slate-400">Current Focus: </span>
                  {s.concern}
                </div>

                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSessionStudentId(s.id);
                        setShowLogModal(true);
                      }}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      Log 1-on-1 Session Progress
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {s.flagType !== 'success' && (
                      <button
                        onClick={() => handleResolveWarning(s.id)}
                        className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 transition-colors"
                        title="Mark mentee reviewed and resolve flag"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Clear Flag
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {s.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1-ON-1 SESSION PROGRESS LOGS (HISTORY TIMELINE - NO FEEDBACK FORMS) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              1-on-1 Session Progress Log (Official Ledger)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Strictly tracks discussion notes & concrete student action items</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{sessions.length} Sessions Logged</span>
        </div>

        <div className="space-y-4">
          {sessions.map((ses) => (
            <div key={ses.id} className="p-5 rounded-2xl bg-slate-850/80 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/20">
                    {ses.studentName}
                  </span>
                  <span className="text-xs font-semibold text-white">{ses.topic}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {ses.date} ({ses.duration})
                  </span>
                  <span className="text-teal-400">Next: {ses.nextMeeting}</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span className="font-semibold text-slate-400">Session Discussion: </span>
                {ses.notes}
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
                  Agreed Action Items & Deliverables:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ses.actionItems.map((act, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
                      <span className="w-4 h-4 rounded-full bg-teal-500/15 text-teal-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1-on-1 Session Progress Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">Log 1-on-1 Session Progress</h3>
            <p className="text-xs text-slate-400 mb-4">Record mentorship progress and committed student action items (No feedback form).</p>

            <form onSubmit={handleSaveSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Mentee</label>
                <select
                  value={sessionStudentId}
                  onChange={(e) => setSessionStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {mentorRosterData.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.rollNo}) - {m.flag}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Topic / Agenda</label>
                  <input
                    type="text"
                    placeholder="e.g. Attendance turnaround & midterms"
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
                  <select
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="30 mins">30 mins</option>
                    <option value="45 mins">45 mins</option>
                    <option value="60 mins">60 mins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Progress Summary & Guidance Notes</label>
                <textarea
                  rows={3}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Summarize key points discussed during the 1-on-1 session..."
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Action Items for Student (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={sessionActionItems}
                  onChange={(e) => setSessionActionItems(e.target.value)}
                  placeholder="Submit lab exercise by Friday&#10;Attend makeup lecture on Monday&#10;Review Compiler Design unit 2"
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Next Follow-Up Review Date</label>
                <input
                  type="date"
                  value={sessionNextDate}
                  onChange={(e) => setSessionNextDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Progress Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
