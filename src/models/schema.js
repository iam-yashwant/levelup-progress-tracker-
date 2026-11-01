/**
 * Level Up - Student Academic Performance & Mentorship Tracking System
 * MongoDB Schema Architecture (Mongoose Models Reference)
 */

export const mongoSchemaCode = `
import mongoose, { Schema } from 'mongoose';

// 1. User Base Schema (Multi-role single login)
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'faculty', 'mentor', 'parent', 'admin'], 
    required: true 
  },
  fullName: { type: String, required: true },
  avatarUrl: { type: String },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 2. Student Profile Schema
const StudentProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  rollNo: { type: String, required: true, unique: true, uppercase: true },
  department: { type: String, required: true }, // e.g. "Computer Science & Engineering"
  semester: { type: Number, required: true, min: 1, max: 8 },
  batchYear: { type: String, required: true }, // e.g. "2021-2025"
  currentCgpa: { type: Number, default: 0.0, min: 0.0, max: 10.0 },
  cumulativeAttendancePct: { type: Number, default: 100.0, min: 0.0, max: 100.0 },
  rank: { type: Number },
  mentorId: { type: Schema.Types.ObjectId, ref: 'User' },
  parentUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  level: { type: Number, default: 1 },
  experiencePoints: { type: Number, default: 0 },
  earnedBadges: [{
    badgeKey: String,
    title: String,
    awardedAt: { type: Date, default: Date.now },
    description: String
  }]
});

// 3. Subject Course Schema
const CourseSchema = new Schema({
  code: { type: String, required: true, unique: true }, // e.g. "CS601"
  title: { type: String, required: true },
  credits: { type: Number, default: 4 },
  semester: { type: Number, required: true },
  department: { type: String, required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

// 4. Daily Attendance Record Schema
const AttendanceRecordSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
  sessionType: { type: String, enum: ['Lecture', 'Lab', 'Tutorial'], default: 'Lecture' }
}, { timestamps: true });

AttendanceRecordSchema.index({ courseId: 1, studentId: 1, date: 1 }, { unique: true });

// 5. Subject Marks & Grade Schema
const GradeEntrySchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: Number, required: true },
  internal1: { type: Number, min: 0, max: 30, default: 0 },
  midterm: { type: Number, min: 0, max: 30, default: 0 },
  practicals: { type: Number, min: 0, max: 40, default: 0 },
  totalMarks: { type: Number, min: 0, max: 100, default: 0 },
  gradeLetter: { type: String, enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'] },
  evaluatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// 6. Mentor 1-on-1 Session Schema (Strictly session progress & action items - no feedback forms)
const MentorSessionSchema = new Schema({
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  sessionDate: { type: Date, default: Date.now },
  durationMinutes: { type: Number, default: 45 },
  agendaTopic: { type: String, required: true },
  discussionSummary: { type: String, required: true },
  actionItems: [{
    task: String,
    isResolved: { type: Boolean, default: false }
  }],
  nextFollowUpDate: { type: Date },
  earlyWarningTriggered: {
    lowAttendance: { type: Boolean, default: false },
    cgpaDrop: { type: Boolean, default: false }
  }
}, { timestamps: true });

// 7. Faculty Improvement Feedback Timeline Schema
const FacultyFeedbackSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  category: { type: String, enum: ['Praise', 'Improvement Area', 'Participation', 'Urgent Alert'], default: 'Praise' },
  content: { type: String, required: true },
  isReadByStudent: { type: Boolean, default: false },
  visibleToParent: { type: Boolean, default: true }
}, { timestamps: true });

// 8. Student Action-Item Goal Schema
const StudentGoalSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['Assignment', 'Exam', 'Certification', 'Project', 'Revision'], default: 'Assignment' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  dueDate: { type: Date },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { timestamps: true });
`;
