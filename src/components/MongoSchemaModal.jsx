import React, { useState } from 'react';
import { Database, X, Copy, Check, Server, Layers } from 'lucide-react';
import { mongoSchemaCode } from '../models/schema';

export default function MongoSchemaModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(mongoSchemaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const collections = [
    { name: 'users', desc: 'Single auth table for Student, Faculty, Mentor, Parent' },
    { name: 'studentprofiles', desc: 'CGPA, total attendance, level, badges, XP, mentor ref' },
    { name: 'courses', desc: 'Subject codes, titles, credits, and faculty allocations' },
    { name: 'attendancerecords', desc: 'Daily per-student lecture/lab attendance transactions' },
    { name: 'gradeentries', desc: 'Internal, midterm, practical marks, and letter grades' },
    { name: 'mentorsessions', desc: '1-on-1 session agenda, discussion, action items, early warning' },
    { name: 'facultyfeedbacks', desc: 'Student improvement observations, categories, parent visibility' },
    { name: 'studentgoals', desc: 'Action-item micro goals with priority and due dates' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                MongoDB Integration Schema Architecture
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Mongoose ODM
                </span>
              </h2>
              <p className="text-xs text-slate-400">Complete multi-role database models powering Level Up</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Mongoose Code' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Collection Pills Overview */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              Database Collections & Model Relations:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {collections.map(col => (
                <div key={col.name} className="p-2.5 rounded-xl bg-slate-850 border border-slate-800 text-xs">
                  <div className="font-mono font-bold text-teal-400">db.{col.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{col.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mongoose Schema Code Block */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Mongoose Definition Code (`src/models/schema.js`):
            </div>
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
              <pre>{mongoSchemaCode.trim()}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
