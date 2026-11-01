import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CalendarCheck2,
  Award,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  PhoneCall,
  Download,
  Loader2,
} from 'lucide-react';
import { parentOverviewData } from '../data/mockData';
import { studentsApi, feedbackApi } from '../services/dataApi';

export default function ParentView({ studentData, onShowToast }) {
  // ── Dynamic data state ───────────────────────────────────────────────────
  const [wardData, setWardData] = useState(studentData);
  const [teacherNotes, setTeacherNotes] = useState(
    parentOverviewData.officialTeacherNotes
  );
  const [isDataSyncing, setIsDataSyncing] = useState(false);
  const [dataSource, setDataSource] = useState('mock');

  // ── Action loading states ────────────────────────────────────────────────
  const [isRequestingCallback, setIsRequestingCallback] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // ── Fetch ward data on mount ─────────────────────────────────────────────
  useEffect(() => {
    const fetchWardData = async () => {
      setIsDataSyncing(true);
      try {
        // 1. Fetch student performance metrics
        const studentResult = await studentsApi.getStudents(studentData?.id);
        if (studentResult?.data) {
          setWardData((prev) => ({
            ...prev,
            ...studentResult.data,
          }));
          setDataSource(studentResult.source);
        }

        // 2. Supplement teacher notes from feedback API
        const feedbackResult = await feedbackApi.getFeedback(studentData?.id);
        if (feedbackResult?.data && Array.isArray(feedbackResult.data) && feedbackResult.data.length > 0) {
          // Map feedback entries to the notes display format
          const apiNotes = feedbackResult.data.map((entry) => ({
            faculty: entry.faculty || entry.author || 'Faculty',
            date: entry.date || new Date().toLocaleDateString('en-IN'),
            note: entry.note || entry.message || entry.content || '',
          })).filter((n) => n.note);

          if (apiNotes.length > 0) {
            setTeacherNotes(apiNotes);
          }
        }
      } catch (err) {
        console.warn('[ParentView] Data fetch error, showing fallback:', err);
      } finally {
        setIsDataSyncing(false);
      }
    };

    fetchWardData();
  }, [studentData?.id]);

  // ── Handle mentor callback request ───────────────────────────────────────
  const handleRequestCallback = async () => {
    setIsRequestingCallback(true);
    try {
      const payload = {
        parentName: parentOverviewData.parentName,
        studentId: wardData?.id || studentData?.id,
        studentName: wardData?.name || parentOverviewData.studentName,
        rollNo: parentOverviewData.rollNo,
        mentorName: 'Dr. Arvind Swaminathan',
        requestedAt: new Date().toISOString(),
        message: 'Parent requests a mentor callback / meeting.',
      };

      const result = await feedbackApi.postCallbackRequest(payload);

      onShowToast({
        type: 'info',
        title: 'Callback Request Sent',
        message: `Mentor Dr. Arvind Swaminathan has received your meeting request. (via ${result.source})`,
      });
    } catch (err) {
      console.warn('[ParentView] Callback request failed:', err);
      onShowToast({
        type: 'error',
        title: 'Request Failed',
        message: 'Could not send callback request. Please try again.',
      });
    } finally {
      setIsRequestingCallback(false);
    }
  };

  // ── Handle report card export ────────────────────────────────────────────
  const handleDownloadReport = async () => {
    setIsExporting(true);
    try {
      const payload = {
        studentId: wardData?.id || studentData?.id,
        studentName: wardData?.name || parentOverviewData.studentName,
        rollNo: parentOverviewData.rollNo,
        semester: parentOverviewData.semester,
        department: parentOverviewData.department,
        cgpa: wardData?.cgpa ?? studentData?.cgpa,
        attendance: wardData?.attendance ?? studentData?.attendance,
        requestedAt: new Date().toISOString(),
      };

      const result = await feedbackApi.requestReportExport(payload);

      onShowToast({
        type: 'success',
        title: 'Report Generated',
        message: `${parentOverviewData.semester} Academic Transcript & Attendance Summary downloaded. (via ${result.source})`,
      });
    } catch (err) {
      console.warn('[ParentView] Report export failed:', err);
      onShowToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not generate report. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Use merged wardData for display, fall back to studentData prop
  const displayData = wardData || studentData;

  return (
    <div className="space-y-6">
      {/* Parent Header View */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
              Verified Guardian Portal (Read-Only)
            </span>
            <span className="text-xs text-slate-400">
              Welcome, {parentOverviewData.parentName}
            </span>
            {/* Data sync indicator */}
            {isDataSyncing && (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                Syncing…
              </span>
            )}
            {!isDataSyncing && dataSource !== 'mock' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Live Data
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Ward: {parentOverviewData.studentName}
          </h1>
          <p className="text-xs text-slate-400">
            Roll No:{' '}
            <span className="text-white font-mono">{parentOverviewData.rollNo}</span> •{' '}
            {parentOverviewData.department} • {parentOverviewData.semester}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRequestCallback}
            disabled={isRequestingCallback}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {isRequestingCallback ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
            ) : (
              <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
            )}
            {isRequestingCallback ? 'Sending…' : 'Request Mentor Call'}
          </button>
          <button
            onClick={handleDownloadReport}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-500/20 transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {isExporting ? 'Generating…' : 'Download Transcript'}
          </button>
        </div>
      </div>

      {/* METRIC HIGHLIGHTS FOR PARENT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:border-teal-500/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current CGPA
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {isDataSyncing ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            ) : (
              displayData.cgpa
            )}
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-1">
            Department Rank: {parentOverviewData.childRank}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Overall Attendance
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {isDataSyncing ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            ) : (
              `${displayData.attendance}%`
            )}
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Compliant with 75% university rule
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:border-amber-500/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Academic Standing
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white">Dean's Honor Roll</div>
          <div className="text-xs text-amber-400 font-medium mt-1">
            Eligible for Campus Placements &amp; Honors
          </div>
        </div>
      </div>

      {/* DETAILED ATTENDANCE BREAKDOWN & MONTHLY LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <CalendarCheck2 className="w-4 h-4 text-teal-400" />
            Component Attendance Breakdown
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Official biometric &amp; class teacher verification
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">
                  Lectures / Classroom Theory
                </div>
                <div className="text-[11px] text-slate-400">Regular subject hours</div>
              </div>
              <span className="font-mono text-sm font-bold text-teal-400">
                {parentOverviewData.attendanceBreakdown.lectures}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">
                  Practical &amp; Computer Labs
                </div>
                <div className="text-[11px] text-slate-400">
                  Coding labs and hands-on experiments
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {parentOverviewData.attendanceBreakdown.labs}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">
                  Tutorials &amp; Problem Classes
                </div>
                <div className="text-[11px] text-slate-400">
                  Small-group problem sessions
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-amber-400">
                {parentOverviewData.attendanceBreakdown.tutorials}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Monthly Trend:</span>
            <div className="flex gap-3">
              {parentOverviewData.monthlyAttendance.map((m) => (
                <span key={m.month} className="font-mono">
                  {m.month}: <strong className="text-white">{m.percentage}%</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* OFFICIAL TEACHER & MENTOR NOTES */}
        <div className="lg:col-span-6 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            Official Faculty &amp; Mentor Notes
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Official remarks recorded during academic review meetings
          </p>

          <div className="space-y-3">
            {teacherNotes.map((note, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-400">{note.faculty}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{note.date}</span>
                </div>
                <p className="text-slate-300 text-xs italic bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  &quot;{note.note}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SUBJECT MARKS & GRADES TABLE (READ ONLY) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-400" />
              Semester 6 Subject Marks Breakdown (Verified)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous Assessment, Midterm examinations, and Practical grades
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Academic Year 2026-27</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-3 text-center">Course Code</th>
                <th className="py-3 px-3 text-center">Internal (30)</th>
                <th className="py-3 px-3 text-center">Midterm (30)</th>
                <th className="py-3 px-3 text-center">Practical (40)</th>
                <th className="py-3 px-3 text-center">Total (100)</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-4 text-center">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
              {(displayData.subjectMarks || studentData.subjectMarks || []).map((s) => (
                <tr key={s.code} className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-semibold text-white">{s.subject}</td>
                  <td className="py-3 px-3 text-center font-mono text-slate-400">
                    {s.code}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-300">
                    {s.internal}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-300">
                    {s.midterm}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-300">
                    {s.practical}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-teal-400 text-sm">
                    {s.total}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                      {s.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono text-slate-300 font-semibold">
                      {s.attendance}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
