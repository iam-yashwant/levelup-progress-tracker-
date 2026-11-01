export const DEMO_USERS = {
  student: {
    id: 'aarav-sharma',
    name: 'Aarav Sharma',
    email: 'aarav@levelup.edu',
    password: 'password123',
    role: 'student',
    roleLabel: 'Student',
    roleBadge: 'Student • CSE Dept',
    subtitle: '21CS042 • Sem 6',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    color: 'teal',
    colorClasses: {
      text: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/30',
      pillActive: 'bg-teal-500 text-slate-950 font-bold border-teal-400 shadow-teal-500/30 shadow-md',
      pillInactive: 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-teal-500/40 text-slate-300'
    },
    defaultTab: 'overview'
  },
  faculty: {
    id: 'vikram-sen',
    name: 'Prof. Vikram Sen',
    email: 'faculty.cse@levelup.edu',
    password: 'password123',
    role: 'faculty',
    roleLabel: 'Faculty',
    roleBadge: 'Faculty • Class Incharge',
    subtitle: 'CS601 Distributed Systems',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    color: 'indigo',
    colorClasses: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      pillActive: 'bg-indigo-500 text-white font-bold border-indigo-400 shadow-indigo-500/30 shadow-md',
      pillInactive: 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-indigo-500/40 text-slate-300'
    },
    defaultTab: 'attendance'
  },
  mentor: {
    id: 'arvind-swaminathan',
    name: 'Dr. Arvind Swaminathan',
    email: 'mentor.kumar@levelup.edu',
    password: 'password123',
    role: 'mentor',
    roleLabel: 'Mentor',
    roleBadge: 'Official Mentor • CS Dept',
    subtitle: 'Academic Mentor (CSE)',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    color: 'amber',
    colorClasses: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      pillActive: 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-amber-500/30 shadow-md',
      pillInactive: 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-amber-500/40 text-slate-300'
    },
    defaultTab: 'roster'
  },
  parent: {
    id: 'rajesh-sharma',
    name: 'Rajesh Sharma',
    email: 'parent.sharma@levelup.edu',
    password: 'password123',
    role: 'parent',
    roleLabel: 'Parent',
    roleBadge: 'Parent of Aarav Sharma (21CS042)',
    subtitle: 'Parent Portal',
    department: 'Guardian / Parent Portal',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    color: 'rose',
    colorClasses: {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      pillActive: 'bg-rose-500 text-white font-bold border-rose-400 shadow-rose-500/30 shadow-md',
      pillInactive: 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-rose-500/40 text-slate-300'
    },
    defaultTab: 'child-overview'
  },
  hod: {
    id: 'ramanujan-ks',
    name: 'Dr. K. S. Ramanujan',
    email: 'hod.cse@levelup.edu',
    password: 'password123',
    role: 'hod',
    roleLabel: 'HOD',
    roleBadge: 'Head of Department • CSE',
    subtitle: 'Dept. of Computer Science & Eng.',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    color: 'purple',
    colorClasses: {
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      pillActive: 'bg-purple-500 text-white font-bold border-purple-400 shadow-purple-500/30 shadow-md',
      pillInactive: 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-purple-500/40 text-slate-300'
    },
    defaultTab: 'hod-overview'
  }
};

export const ROLE_PILLS = [
  { id: 'student', label: 'Student', emoji: '🎓', email: 'aarav@levelup.edu', desc: 'Aarav Sharma' },
  { id: 'faculty', label: 'Faculty', emoji: '👨‍🏫', email: 'faculty.cse@levelup.edu', desc: 'Prof. Vikram Sen' },
  { id: 'mentor', label: 'Mentor', emoji: '🤝', email: 'mentor.kumar@levelup.edu', desc: 'Dr. Arvind' },
  { id: 'parent', label: 'Parent', emoji: '👨‍👩‍👧', email: 'parent.sharma@levelup.edu', desc: 'Rajesh Sharma' },
  { id: 'hod', label: 'HOD', emoji: '🏛️', email: 'hod.cse@levelup.edu', desc: 'Dr. Ramanujan' },
];

/**
 * Match a user by email, or fallback to selected role or default student
 */
export function findUserByEmailOrRole(email, roleKey) {
  const cleanEmail = (email || '').trim().toLowerCase();
  
  // Direct match by email
  for (const key of Object.keys(DEMO_USERS)) {
    if (DEMO_USERS[key].email.toLowerCase() === cleanEmail) {
      return DEMO_USERS[key];
    }
  }

  // Match by keyword in email
  if (cleanEmail.includes('faculty') || cleanEmail.includes('vikram')) return DEMO_USERS.faculty;
  if (cleanEmail.includes('mentor') || cleanEmail.includes('arvind')) return DEMO_USERS.mentor;
  if (cleanEmail.includes('parent') || cleanEmail.includes('rajesh')) return DEMO_USERS.parent;
  if (cleanEmail.includes('hod') || cleanEmail.includes('ramanujan')) return DEMO_USERS.hod;
  if (cleanEmail.includes('student') || cleanEmail.includes('aarav')) return DEMO_USERS.student;

  // Fallback to role key if valid
  if (roleKey && DEMO_USERS[roleKey]) {
    return DEMO_USERS[roleKey];
  }

  return DEMO_USERS.student;
}
