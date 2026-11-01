import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Send, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  X,
  UserCheck
} from 'lucide-react';
import { hodDepartmentData } from '../data/mockData';
import { hodApi } from '../services/dataApi';

export default function HodView({ onShowToast }) {
  const [deptData, setDeptData] = useState(hodDepartmentData);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [advisoryModalMentor, setAdvisoryModalMentor] = useState(null);
  const [directiveSubject, setDirectiveSubject] = useState('Urgent: Mandate Immediate 1-on-1 Sessions for At-Risk Mentees');
  const [directiveMessage, setDirectiveMessage] = useState('');
  const [ccDean, setCcDean] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Dynamic Data Binding: Fetch Department & Mentor analytics
  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      try {
        setIsLoading(true);
        const res = await hodApi.getDepartmentAnalytics();
        if (isMounted && res?.data) {
          setDeptData(res.data);
        }
      } catch (err) {
        console.warn('[HodView] Error fetching HOD department analytics:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const mentors = deptData.mentors || [];

  // Filter mentors based on search
  const filteredMentors = mentors.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdvisoryModal = (mentor) => {
    setAdvisoryModalMentor(mentor);
    setDirectiveMessage(
      `Dear ${mentor.name},\n\nAnalysis of the recent academic snapshot indicates that ${mentor.warningFlagsCount} student(s) in your assigned mentee cohort require targeted academic and attendance intervention. Please schedule 1-on-1 counseling sessions within the next 5 working days and update the session logs.`
    );
  };

  const handleSendDirective = async (e) => {
    e.preventDefault();
    if (!advisoryModalMentor) return;

    try {
      setIsSending(true);
      await hodApi.sendMentorAdvisory(advisoryModalMentor.id, {
        mentorName: advisoryModalMentor.name,
        subject: directiveSubject,
        message: directiveMessage,
        ccDean,
        warningCount: advisoryModalMentor.warningFlagsCount,
      });

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Advisory Dispatched',
          message: `Official HOD directive successfully sent to ${advisoryModalMentor.name}.`
        });
      }

      setAdvisoryModalMentor(null);
    } catch (err) {
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Dispatch Failed',
          message: `Could not send directive: ${err.message}`
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Department Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 p-6 lg:p-8 backdrop-blur-sm shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                EXECUTIVE DASHBOARD
              </span>
              <span className="text-xs text-slate-400 font-mono">AY {deptData.academicYear}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {deptData.departmentName}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Head of Department: <span className="font-semibold text-white">{deptData.hodName}</span> • Real-time mentor cohort tracking, early warning flag mitigation, and peer performance radar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-purple-500/30 flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${isLoading ? 'bg-amber-400 animate-spin' : 'bg-emerald-400 animate-pulse'}`}></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cohort Status</div>
                <div className="text-xs font-bold text-emerald-400">
                  {isLoading ? 'Syncing...' : 'Accreditation Compliant'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Students</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{deptData.totalStudents}</span>
            <span className="text-xs text-teal-400 font-medium">B.Tech Cohort</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Distributed across 4 mentor batches</p>
        </div>

        {/* Total Mentors */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Mentors</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{deptData.totalMentors}</span>
            <span className="text-xs text-indigo-400 font-medium">Faculty Leads</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">1:35 Mentor-to-Mentee ratio</p>
        </div>

        {/* Dept Avg CGPA */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dept Avg CGPA</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{deptData.deptAvgCgpa}</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +0.18 vs benchmark
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Avg Attendance: {deptData.deptAvgAttendance}%</p>
        </div>

        {/* Active Warning Flags */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm hover:border-rose-500/30 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Flags</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400">{deptData.activeWarningFlags}</span>
            <span className="text-xs text-rose-400/80 font-medium animate-pulse">Require Attention</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">&lt; 75% attendance / low CGPA</p>
        </div>
      </div>

      {/* Mentor Performance & Progress Radar Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Mentor Progress Radar & Cohort Comparison
            </h2>
            <p className="text-xs text-slate-400">
              Comparative tracking across assigned batches, mentee grade distribution, and intervention requirements.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search mentor or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Mentor Name & Specialization</th>
                <th className="py-3 px-4 text-center">Mentees</th>
                <th className="py-3 px-4 text-center">Avg CGPA</th>
                <th className="py-3 px-4 text-center">Avg Attendance</th>
                <th className="py-3 px-4 text-center">Points (XP)</th>
                <th className="py-3 px-4 text-center">Risk Status</th>
                <th className="py-3 px-4 text-center">Interventions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMentors.map((mentor) => {
                const isHighRisk = mentor.warningFlagsCount >= 2;
                const isModerate = mentor.warningFlagsCount === 1;

                return (
                  <tr 
                    key={mentor.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                        {mentor.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {mentor.title} • {mentor.specialization}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-semibold text-slate-200">
                      {mentor.assignedMentees}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                        mentor.avgCgpa >= 8.0 
                          ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                          : mentor.avgCgpa >= 7.5
                          ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      }`}>
                        {mentor.avgCgpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                        mentor.avgAttendance >= 85 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : mentor.avgAttendance >= 80
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {mentor.avgAttendance}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-amber-400">
                      {mentor.pointsGenerated.toLocaleString()} XP
                    </td>
                    <td className="py-4 px-4 text-center">
                      {isHighRisk ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          High Attention ({mentor.warningFlagsCount})
                        </span>
                      ) : isModerate ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          Moderate ({mentor.warningFlagsCount})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Optimal
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-[11px] font-medium text-slate-300">
                        {mentor.sessionsCompleted} sessions logged
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedMentor(mentor)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all duration-150 active:scale-95"
                          title="Inspect Mentees"
                        >
                          View Cohort
                        </button>
                        <button
                          onClick={() => handleOpenAdvisoryModal(mentor)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-sm ${
                            isHighRisk
                              ? 'bg-rose-500 text-slate-950 hover:bg-rose-400 shadow-rose-500/20'
                              : 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-600/20'
                          }`}
                          title="Dispatch Official HOD Directive"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send Directive</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Drill-Down View (When a mentor is clicked) */}
      {selectedMentor && (
        <div className="rounded-2xl bg-slate-900 border border-purple-500/30 p-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Cohort Roster: {selectedMentor.name}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {selectedMentor.students?.length || 0} Sampled Records
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Individual student standing, attendance breakdown, and risk analysis for this mentor batch.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMentor(null)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedMentor.students?.map((stu) => {
              const hasFlag = stu.flag !== null && stu.flag !== undefined;
              return (
                <div 
                  key={stu.id}
                  className={`p-4 rounded-xl border transition-all ${
                    hasFlag 
                      ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50' 
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{stu.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{stu.rollNo}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      hasFlag
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    }`}>
                      {stu.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">CGPA</div>
                      <div className="font-mono font-bold text-white">{stu.cgpa.toFixed(2)}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Attendance</div>
                      <div className={`font-mono font-bold ${stu.attendance >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stu.attendance}%
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Points</div>
                      <div className="font-mono font-bold text-amber-400">{stu.points} XP</div>
                    </div>
                  </div>

                  {hasFlag && (
                    <div className="mt-2.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{stu.flag}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Official HOD Intervention Directive Modal */}
      {advisoryModalMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Send Official HOD Directive</h3>
                  <p className="text-xs text-slate-400">
                    Recipient: <span className="text-purple-300 font-semibold">{advisoryModalMentor.name}</span> ({advisoryModalMentor.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdvisoryModalMentor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendDirective} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Directive Template / Subject
                </label>
                <select
                  value={directiveSubject}
                  onChange={(e) => setDirectiveSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Urgent: Mandate Immediate 1-on-1 Sessions for At-Risk Mentees">
                    Urgent: Mandate Immediate 1-on-1 Sessions for At-Risk Mentees
                  </option>
                  <option value="Academic Support: Remedial Class & Lab Attendance Catch-up">
                    Academic Support: Remedial Class & Lab Attendance Catch-up
                  </option>
                  <option value="Parent Outreach: Schedule Parent-Teacher Academic Review">
                    Parent Outreach: Schedule Parent-Teacher Academic Review
                  </option>
                  <option value="Executive Directive: Custom Advisory from HOD Office">
                    Executive Directive: Custom Advisory from HOD Office
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Directive Notice Body
                </label>
                <textarea
                  rows={5}
                  value={directiveMessage}
                  onChange={(e) => setDirectiveMessage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ccDean"
                  checked={ccDean}
                  onChange={(e) => setCcDean(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-700 bg-slate-800"
                />
                <label htmlFor="ccDean" className="text-xs text-slate-300 select-none cursor-pointer">
                  CC Academic Dean & Student Welfare Committee
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdvisoryModalMentor(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Directive</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}