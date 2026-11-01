export const initialStudentData = {
  id: "STU-2024-042",
  name: "Aarav Sharma",
  rollNo: "21CS042",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  program: "B.Tech Computer Science & Eng.",
  semester: "6th Semester",
  batch: "2021 - 2025",
  mentorName: "Dr. Arvind Swaminathan",
  parentContact: "+91 98765 43210 (Rajesh Sharma)",
  cgpa: 8.84,
  cgpaTrend: "+0.32 from last sem",
  attendance: 87.5,
  attendanceStatus: "Good Standing (>75% mandatory)",
  rank: "#4 in Dept (Top 3%)",
  level: "Honor Scholar",
  xp: 3450,
  nextLevelXp: 4000,
  badges: [
    { id: 1, name: "Dean's Honor Roll", icon: "Award", color: "from-amber-400 to-yellow-500", desc: "Top 5% CGPA in Sem 5" },
    { id: 2, name: "Algorithm Ace", icon: "Zap", color: "from-teal-400 to-cyan-500", desc: "100/100 in Data Structures Lab" },
    { id: 3, name: "Attendance Legend", icon: "Clock", color: "from-indigo-400 to-purple-500", desc: ">90% attendance across 3 consecutive terms" },
    { id: 4, name: "Goal Crusher", icon: "Target", color: "from-rose-400 to-pink-500", desc: "Completed 15+ academic micro-goals" }
  ],
  cgpaHistory: [
    { semester: "Sem 1", studentCgpa: 8.10, deptAvg: 7.30 },
    { semester: "Sem 2", studentCgpa: 8.35, deptAvg: 7.42 },
    { semester: "Sem 3", studentCgpa: 8.20, deptAvg: 7.28 },
    { semester: "Sem 4", studentCgpa: 8.52, deptAvg: 7.50 },
    { semester: "Sem 5", studentCgpa: 8.84, deptAvg: 7.65 },
    { semester: "Sem 6 (Proj)", studentCgpa: 9.05, deptAvg: 7.70 }
  ],
  subjectMarks: [
    { subject: "Distributed Systems", code: "CS601", internal: 28, midterm: 27, practical: 38, total: 93, grade: "A+", attendance: 92 },
    { subject: "Machine Learning", code: "CS602", internal: 26, midterm: 25, practical: 36, total: 87, grade: "A", attendance: 88 },
    { subject: "Compiler Design", code: "CS603", internal: 24, midterm: 22, practical: 34, total: 80, grade: "B+", attendance: 82 },
    { subject: "Cloud Computing", code: "CS604", internal: 29, midterm: 28, practical: 39, total: 96, grade: "O", attendance: 94 },
    { subject: "Cyber Security", code: "CS605", internal: 25, midterm: 24, practical: 35, total: 84, grade: "A", attendance: 81 }
  ],
  goals: [
    { id: "g1", title: "Complete CS601 Distributed Consensus assignment", dueDate: "2026-10-25", priority: "High", completed: false, category: "Assignment" },
    { id: "g2", title: "Score 85%+ in Machine Learning Midterm 2", dueDate: "2026-11-04", priority: "Urgent", completed: false, category: "Exam" },
    { id: "g3", title: "Attend AWS Cloud Practitioner certification workshop", dueDate: "2026-11-12", priority: "Medium", completed: false, category: "Certification" },
    { id: "g4", title: "Review Compiler AST generation module with study group", dueDate: "2026-10-18", priority: "Low", completed: true, category: "Revision" },
    { id: "g5", title: "Submit Mini-Project Milestone 1 documentation", dueDate: "2026-10-15", priority: "High", completed: true, category: "Project" }
  ],
  feedbackTimeline: [
    {
      id: "fb1",
      facultyName: "Prof. Vikram Sen",
      course: "CS601 - Distributed Systems",
      date: "2026-10-17",
      type: "Praise",
      badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
      comment: "Outstanding implementation of Raft consensus protocol. Deep analytical thinking displayed in the edge-case network partition analysis."
    },
    {
      id: "fb2",
      facultyName: "Dr. Shalini Raman",
      course: "CS603 - Compiler Design",
      date: "2026-10-10",
      type: "Improvement Area",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      comment: "Solid grasp of LL(1) parsing tables, but needs more practice with LR shift-reduce conflict resolution before the midterms."
    },
    {
      id: "fb3",
      facultyName: "Prof. Keith Miller",
      course: "CS604 - Cloud Architecture",
      date: "2026-09-28",
      type: "Participation",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      comment: "Consistently leads seminar discussions on multi-region failover and Kubernetes orchestration. Keep it up!"
    }
  ]
};

export const facultyClassData = {
  courseCode: "CS601",
  courseName: "Distributed Systems & Cloud Computing",
  section: "Section B (Semester 6)",
  facultyName: "Prof. Vikram Sen",
  students: [
    { id: "STU-001", roll: "21CS001", name: "Aaditya Nair", attendanceToday: "Present", recentScore: 88, status: "Good" },
    { id: "STU-042", roll: "21CS042", name: "Aarav Sharma", attendanceToday: "Present", recentScore: 93, status: "Excellent" },
    { id: "STU-014", roll: "21CS014", name: "Bhavna Patel", attendanceToday: "Absent", recentScore: 64, status: "Needs Support" },
    { id: "STU-027", roll: "21CS027", name: "Chirag Singhania", attendanceToday: "Present", recentScore: 72, status: "Average" },
    { id: "STU-033", roll: "21CS033", name: "Divya Krishnan", attendanceToday: "Present", recentScore: 91, status: "Excellent" },
    { id: "STU-058", roll: "21CS058", name: "Farhan Qureshi", attendanceToday: "Absent", recentScore: 58, status: "Critical" },
    { id: "STU-062", roll: "21CS062", name: "Gauri Joshi", attendanceToday: "Present", recentScore: 85, status: "Good" }
  ]
};

export const mentorRosterData = [
  {
    id: "STU-042",
    rollNo: "21CS042",
    name: "Aarav Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    semester: "6th Sem",
    cgpa: 8.84,
    attendance: 87.5,
    flag: "On Track",
    flagType: "success",
    lastSession: "2026-10-12",
    concern: "Preparing for Tier-1 placements, balancing capstone project."
  },
  {
    id: "STU-058",
    rollNo: "21CS058",
    name: "Farhan Qureshi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    semester: "6th Sem",
    cgpa: 6.12,
    attendance: 64.0,
    flag: "Critical: Low Attendance (<75%) & CGPA Drop",
    flagType: "danger",
    lastSession: "2026-09-24",
    concern: "Severe attendance shortage in CS603 & CS605. Missed 2 lab assessments."
  },
  {
    id: "STU-014",
    rollNo: "21CS014",
    name: "Bhavna Patel",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    semester: "6th Sem",
    cgpa: 7.15,
    attendance: 72.8,
    flag: "Warning: Borderline Attendance",
    flagType: "warning",
    lastSession: "2026-10-04",
    concern: "Struggling with Compiler Design theory. Needs remedial peer tutoring."
  },
  {
    id: "STU-027",
    rollNo: "21CS027",
    name: "Chirag Singhania",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    semester: "6th Sem",
    cgpa: 7.40,
    attendance: 78.5,
    flag: "Minor: CGPA Dropped -0.4",
    flagType: "warning",
    lastSession: "2026-10-01",
    concern: "Needs study scheduling support. Distracted by extracurricular committee."
  }
];

export const mentorInitialSessions = [
  {
    id: "ses-101",
    studentId: "STU-042",
    studentName: "Aarav Sharma",
    date: "2026-10-12",
    duration: "45 mins",
    topic: "Pre-placement strategy & System Design portfolio",
    actionItems: [
      "Finalize microservices architecture diagram for GitHub portfolio",
      "Solve 3 medium Leetcode graph problems weekly",
      "Meet Prof. Keith for cloud credit recommendations"
    ],
    nextMeeting: "2026-11-02",
    notes: "Aarav is very focused. Recommended prioritizing system design over competitive programming since CGPA is well-secured."
  },
  {
    id: "ses-102",
    studentId: "STU-058",
    studentName: "Farhan Qureshi",
    date: "2026-09-24",
    duration: "60 mins",
    topic: "Attendance Recovery Action Plan",
    actionItems: [
      "Submit medical certificates to Academic Office by Oct 28",
      "Attend 100% of makeup lab sessions on Friday afternoons",
      "Weekly attendance check-in with mentor every Monday 9 AM"
    ],
    nextMeeting: "2026-10-25",
    notes: "Farhan cited health issues last month. Parent was informed. He committed to attending all remaining lecture hours to clear 75% threshold."
  }
];

// Leaderboard seed data — students ranked strictly by points (XP).
// Aarav Sharma (STU-042) is the logged-in student — marked isCurrentUser: true.
export const leaderboardData = [
  {
    rank: 1,
    id: "STU-033",
    name: "Divya Krishnan",
    rollNo: "21CS033",
    batch: "2021 - 2025",
    department: "Computer Science & Engineering",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80",
    xp: 5120,
    badgeCount: 8,
    cgpa: 9.41,
    github: "https://github.com/divya-krishnan",
    linkedin: "https://linkedin.com/in/divya-krishnan",
    leetcode: "https://leetcode.com/u/divya-krishnan",
    isCurrentUser: false,
  },
  {
    rank: 2,
    id: "STU-001",
    name: "Aaditya Nair",
    rollNo: "21CS001",
    batch: "2021 - 2025",
    department: "Computer Science & Engineering",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80",
    xp: 4780,
    badgeCount: 7,
    cgpa: 9.12,
    github: "https://github.com/aaditya-nair",
    linkedin: "https://linkedin.com/in/aaditya-nair",
    leetcode: "https://leetcode.com/u/aaditya-nair",
    isCurrentUser: false,
  },
  {
    rank: 3,
    id: "STU-071",
    name: "Priya Mehta",
    rollNo: "21CS071",
    batch: "2021 - 2025",
    department: "Computer Science & Engineering",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80",
    xp: 4390,
    badgeCount: 6,
    cgpa: 8.98,
    github: "https://github.com/priya-mehta",
    linkedin: "https://linkedin.com/in/priya-mehta",
    leetcode: "https://leetcode.com/u/priya-mehta",
    isCurrentUser: false,
  },
  {
    rank: 4,
    id: "STU-042",
    name: "Aarav Sharma",
    rollNo: "21CS042",
    batch: "2021 - 2025",
    department: "Computer Science & Engineering",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
    xp: 3450,
    badgeCount: 4,
    cgpa: 8.84,
    github: "https://github.com/aarav-sharma",
    linkedin: "https://linkedin.com/in/aarav-sharma",
    leetcode: "https://leetcode.com/u/aarav-sharma",
    isCurrentUser: true,
  },
  {
    rank: 5,
    id: "STU-089",
    name: "Rohan Desai",
    rollNo: "21CS089",
    batch: "2021 - 2025",
    department: "Computer Science & Engineering",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
    xp: 3120,
    badgeCount: 5,
    cgpa: 8.71,
    github: "https://github.com/rohan-desai",
    linkedin: "https://linkedin.com/in/rohan-desai",
    leetcode: "https://leetcode.com/u/rohan-desai",
    isCurrentUser: false,
  },
  {
    rank: 6,
    id: "STU-055",
    name: "Sneha Iyer",
    rollNo: "21CS055",
    batch: "2021 - 2025",
    department: "Computer Science & Engineering",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&auto=format&fit=crop&q=80",
    xp: 2980,
    badgeCount: 4,
    cgpa: 8.60,
    github: "https://github.com/sneha-iyer",
    linkedin: "https://linkedin.com/in/sneha-iyer",
    leetcode: "https://leetcode.com/u/sneha-iyer",
    isCurrentUser: false,
  },
  {
    rank: 7,
    id: "STU-027",
    name: "Chirag Singhania",
    rollNo: "21CS027",
    batch: "2021 - 2025",
    department: "Computer Science & Engineering",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&auto=format&fit=crop&q=80",
    xp: 2450,
    badgeCount: 3,
    cgpa: 7.40,
    github: "https://github.com/chirag-singhania",
    linkedin: "https://linkedin.com/in/chirag-singhania",
    leetcode: "https://leetcode.com/u/chirag-singhania",
    isCurrentUser: false,
  },
  {
    rank: 8,
    id: "STU-014",
    name: "Bhavna Patel",
    rollNo: "21CS014",
    batch: "2021 - 2025",
    department: "Computer Science & Engineering",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
    xp: 2100,
    badgeCount: 3,
    cgpa: 7.15,
    github: "https://github.com/bhavna-patel",
    linkedin: "https://linkedin.com/in/bhavna-patel",
    leetcode: "https://leetcode.com/u/bhavna-patel",
    isCurrentUser: false,
  },
  {
    rank: 9,
    id: "STU-062",
    name: "Gauri Joshi",
    rollNo: "21CS062",
    batch: "2021 - 2025",
    department: "Computer Science & Engineering",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&auto=format&fit=crop&q=80",
    xp: 1850,
    badgeCount: 2,
    cgpa: 7.08,
    github: "https://github.com/gauri-joshi",
    linkedin: "https://linkedin.com/in/gauri-joshi",
    leetcode: "https://leetcode.com/u/gauri-joshi",
    isCurrentUser: false,
  },
  {
    rank: 10,
    id: "STU-058",
    name: "Farhan Qureshi",
    rollNo: "21CS058",
    batch: "2021 - 2025",
    department: "Computer Science & Engineering",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80",
    xp: 1340,
    badgeCount: 1,
    cgpa: 6.12,
    github: "https://github.com/farhan-qureshi",
    linkedin: "https://linkedin.com/in/farhan-qureshi",
    leetcode: "https://leetcode.com/u/farhan-qureshi",
    isCurrentUser: false,
  },
];

export const campusEventsData = [
  {
    id: "ev-1",
    title: "HackNova 2026: 36-Hr AI & Cloud Hackathon",
    category: "Hackathon",
    date: "2026-11-08",
    time: "09:00 AM",
    venue: "Innovation Hub & Turing Lab",
    description: "Build scalable GenAI microservices and cloud-native architectures with real-time judging.",
    xpReward: 500,
    seatsLeft: 18,
    registered: false,
    tag: "Featured Sprint",
    badgeReward: "Hackathon Titan"
  },
  {
    id: "ev-2",
    title: "Distributed Consensus & Raft Architecture Workshop",
    category: "Workshop",
    date: "2026-10-30",
    time: "02:00 PM",
    venue: "Seminar Hall 3",
    description: "Deep dive into distributed leader election, state replication, and network partition resiliency in Kotlin.",
    xpReward: 350,
    seatsLeft: 12,
    registered: false,
    tag: "Core Syllabus",
    badgeReward: "Consensus Pioneer"
  },
  {
    id: "ev-3",
    title: "Algorithmic Speed & DSA Tech Quiz Bowl",
    category: "Tech Quiz",
    date: "2026-11-02",
    time: "04:30 PM",
    venue: "Auditorium A",
    description: "Rapid-fire algorithmic puzzles, graph traversal races, and system architecture trivia.",
    xpReward: 300,
    seatsLeft: 25,
    registered: false,
    tag: "Fast XP",
    badgeReward: "Quiz Master"
  },
  {
    id: "ev-4",
    title: "Zero-Trust Cloud Security & JWT Masterclass",
    category: "Masterclass",
    date: "2026-11-15",
    time: "11:00 AM",
    venue: "Cybersecurity Lab 4",
    description: "Hands-on API vulnerability assessment, token interception mitigation, and IAM rule design.",
    xpReward: 450,
    seatsLeft: 8,
    registered: false,
    tag: "High Demand",
    badgeReward: "Security Shield"
  }
];

export const parentOverviewData = {
  studentName: "Aarav Sharma",
  rollNo: "21CS042",
  department: "Computer Science & Engineering",
  semester: "Semester 6 (Academic Year 2026-27)",
  parentName: "Mr. Rajesh Sharma",
  childCgpa: 8.84,
  childRank: "4th / 140 Students",
  overallAttendance: 87.5,
  attendanceBreakdown: {
    lectures: "88% (124/141)",
    labs: "94% (47/50)",
    tutorials: "80% (24/30)"
  },
  monthlyAttendance: [
    { month: "Aug", percentage: 91 },
    { month: "Sep", percentage: 89 },
    { month: "Oct (MTD)", percentage: 83 }
  ],
  officialTeacherNotes: [
    {
      date: "2026-10-15",
      faculty: "Prof. Vikram Sen (Class Incharge)",
      note: "Aarav has been elected team lead for the Distributed Systems Capstone project. Excellent leadership and technical consistency."
    },
    {
      date: "2026-10-02",
      faculty: "Dr. Arvind Swaminathan (Official Mentor)",
      note: "Quarterly mentor review completed. Aarav is eligible for Honors degree track and campus placements starting Semester 7."
    }
  ]
};

export const hodDepartmentData = {
  departmentId: "DEPT-CSE",
  departmentName: "Computer Science & Engineering",
  hodName: "Dr. K. S. Ramanujan",
  hodTitle: "Head of Department (CSE)",
  academicYear: "2026 - 2027",
  totalStudents: 140,
  totalMentors: 4,
  totalFaculty: 12,
  deptAvgCgpa: 7.82,
  deptAvgAttendance: 84.6,
  activeWarningFlags: 5,
  totalRewardPoints: 48250,
  mentors: [
    {
      id: "MEN-101",
      name: "Dr. Arvind Swaminathan",
      title: "Senior Professor & Mentorship Lead",
      specialization: "Distributed Systems & Cloud",
      email: "a.swaminathan@university.edu",
      assignedMentees: 35,
      avgAttendance: 89.2,
      avgCgpa: 8.42,
      warningFlagsCount: 1,
      riskLevel: "Low Risk",
      pointsGenerated: 14800,
      sessionsCompleted: 28,
      lastSessionDate: "2026-10-20",
      students: [
        { id: "STU-042", rollNo: "21CS042", name: "Aarav Sharma", cgpa: 8.84, attendance: 87.5, points: 3450, status: "Good Standing", flag: null },
        { id: "STU-033", rollNo: "21CS033", name: "Divya Krishnan", cgpa: 9.10, attendance: 92.0, points: 3820, status: "Honor Roll", flag: null },
        { id: "STU-001", rollNo: "21CS001", name: "Aaditya Nair", cgpa: 8.55, attendance: 88.0, points: 2950, status: "Good Standing", flag: null },
        { id: "STU-027", rollNo: "21CS027", name: "Chirag Singhania", cgpa: 7.20, attendance: 76.5, points: 2100, status: "Warning", flag: "Borderline Attendance" }
      ]
    },
    {
      id: "MEN-102",
      name: "Prof. Sneha Sharma",
      title: "Associate Professor",
      specialization: "Artificial Intelligence & Data Science",
      email: "sneha.sharma@university.edu",
      assignedMentees: 35,
      avgAttendance: 86.4,
      avgCgpa: 7.95,
      warningFlagsCount: 0,
      riskLevel: "Optimal",
      pointsGenerated: 13100,
      sessionsCompleted: 24,
      lastSessionDate: "2026-10-19",
      students: [
        { id: "STU-088", rollNo: "21CS088", name: "Rohan Mehta", cgpa: 8.60, attendance: 91.0, points: 3200, status: "Good Standing", flag: null },
        { id: "STU-062", rollNo: "21CS062", name: "Gauri Joshi", cgpa: 8.50, attendance: 85.0, points: 2800, status: "Good Standing", flag: null },
        { id: "STU-050", rollNo: "21CS050", name: "Ananya Roy", cgpa: 8.10, attendance: 87.0, points: 2750, status: "Good Standing", flag: null },
        { id: "STU-071", rollNo: "21CS071", name: "Meera Nair", cgpa: 7.80, attendance: 83.5, points: 2400, status: "Good Standing", flag: null }
      ]
    },
    {
      id: "MEN-103",
      name: "Dr. Rajesh Kumar",
      title: "Assistant Professor & Security Specialist",
      specialization: "Information Security & Networks",
      email: "rajesh.kumar@university.edu",
      assignedMentees: 35,
      avgAttendance: 78.1,
      avgCgpa: 7.35,
      warningFlagsCount: 3,
      riskLevel: "High Attention",
      pointsGenerated: 9850,
      sessionsCompleted: 16,
      lastSessionDate: "2026-10-12",
      students: [
        { id: "STU-058", rollNo: "21CS058", name: "Farhan Qureshi", cgpa: 5.92, attendance: 68.0, points: 1100, status: "Critical Risk", flag: "Attendance < 70% & Low CGPA" },
        { id: "STU-014", rollNo: "21CS014", name: "Bhavna Patel", cgpa: 6.45, attendance: 71.5, points: 1450, status: "At-Risk", flag: "Attendance < 75%" },
        { id: "STU-102", rollNo: "21CS102", name: "Tarun Verma", cgpa: 6.80, attendance: 73.0, points: 1600, status: "Warning", flag: "Low Midterm Performance" },
        { id: "STU-094", rollNo: "21CS094", name: "Priya Desai", cgpa: 8.25, attendance: 89.0, points: 2600, status: "Good Standing", flag: null }
      ]
    },
    {
      id: "MEN-104",
      name: "Dr. Amit Verma",
      title: "Assistant Professor",
      specialization: "Algorithms & Systems",
      email: "amit.verma@university.edu",
      assignedMentees: 35,
      avgAttendance: 84.8,
      avgCgpa: 7.56,
      warningFlagsCount: 1,
      riskLevel: "Moderate",
      pointsGenerated: 10500,
      sessionsCompleted: 19,
      lastSessionDate: "2026-10-16",
      students: [
        { id: "STU-115", rollNo: "21CS115", name: "Sahil Gupta", cgpa: 6.70, attendance: 74.0, points: 1750, status: "Warning", flag: "Attendance < 75%" },
        { id: "STU-082", rollNo: "21CS082", name: "Pooja Kulkarni", cgpa: 8.40, attendance: 90.0, points: 2900, status: "Good Standing", flag: null },
        { id: "STU-076", rollNo: "21CS076", name: "Neha Kapoor", cgpa: 8.15, attendance: 88.0, points: 2600, status: "Good Standing", flag: null },
        { id: "STU-120", rollNo: "21CS120", name: "Vikram Rao", cgpa: 7.90, attendance: 85.5, points: 2350, status: "Good Standing", flag: null }
      ]
    }
  ]
};
