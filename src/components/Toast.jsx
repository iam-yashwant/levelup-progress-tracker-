import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-teal-400" />
  };

  const borders = {
    success: 'border-emerald-500/40 bg-slate-900/95 shadow-emerald-500/10',
    error: 'border-rose-500/40 bg-slate-900/95 shadow-rose-500/10',
    info: 'border-teal-500/40 bg-slate-900/95 shadow-teal-500/10'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 ${borders[toast.type || 'info']}`}>
      {icons[toast.type || 'info']}
      <div className="text-xs">
        <div className="font-bold text-white">{toast.title}</div>
        {toast.message && <div className="text-slate-300 text-[11px] mt-0.5">{toast.message}</div>}
      </div>
      <button 
        onClick={onClose} 
        className="ml-3 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
