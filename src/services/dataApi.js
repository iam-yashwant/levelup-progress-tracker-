import kotlinApi from './kotlinApi';
import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  initialStudentData,
  facultyClassData,
  mentorRosterData,
  mentorInitialSessions,
  leaderboardData,
  campusEventsData,
  hodDepartmentData,
} from '../data/mockData';

// Local storage cache keys for offline fallback resilience
const CACHE_KEYS = {
  STUDENT: 'cached_student_data',
  ROSTER: 'cached_faculty_roster',
  MENTOR_ROSTER: 'cached_mentor_roster',
  MENTOR_SESSIONS: 'cached_mentor_sessions',
  MARKS: 'cached_marks_data',
  ACHIEVEMENTS: 'cached_achievements_data',
  FEEDBACK: 'cached_feedback_data',
  LEADERBOARD: 'cached_leaderboard_data',
  EVENTS: 'cached_campus_events',
  HOD: 'cached_hod_data',
  HOD_ADVISORIES: 'cached_hod_advisories',
};

/**
 * Helper to safely retrieve cached JSON from localStorage
 */
function getLocalCache(key, fallbackValue) {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : fallbackValue;
  } catch (err) {
    console.warn(`[DataApi] Error parsing local cache for ${key}:`, err);
    return fallbackValue;
  }
}

/**
 * Helper to safely store JSON into localStorage
 */
function setLocalCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[DataApi] Error writing local cache for ${key}:`, err);
  }
}

// ============================================================================
// 1. STUDENTS API (Profile, CGPA, Attendance, XP/Points)
// ============================================================================
export const studentsApi = {
  /**
   * GET /api/students/:studentId
   * Fetches student profile, metrics, CGPA, and XP.
   * Fallback: Firestore → localStorage/mock
   */
  getStudents: async (studentId = initialStudentData.id) => {
    // 1. Attempt Kotlin Backend Request
    try {
      const response = await kotlinApi.get(`/students/${studentId}`);
      if (response.data) {
        setLocalCache(CACHE_KEYS.STUDENT, response.data);
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(
        `[DataApi] Kotlin backend /api/students/${studentId} unreachable: ${kotlinError.message}. Triggering Firestore fallback sync.`
      );
    }

    // 2. Fallback: Query Firestore
    try {
      if (db) {
        const studentDocRef = doc(db, 'students', studentId);
        const snapshot = await getDoc(studentDocRef);
        if (snapshot.exists()) {
          const firestoreData = { id: snapshot.id, ...snapshot.data() };
          setLocalCache(CACHE_KEYS.STUDENT, firestoreData);
          return { data: firestoreData, source: 'firestore' };
        }
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore read failed or uninitialized:', firestoreError.message);
    }

    // 3. Fallback: Local Cache or Static Mock
    const fallbackData = getLocalCache(CACHE_KEYS.STUDENT, initialStudentData);
    return { data: fallbackData, source: 'local-fallback' };
  },

  /**
   * POST /api/students/:studentId
   * Updates student profile fields (XP, CGPA, attendance, etc.)
   * Fallback: Firestore → localStorage
   */
  updateStudent: async (studentId = initialStudentData.id, updatePayload = {}) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.put(`/students/${studentId}`, updatePayload);
      if (response.data) {
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin student update unreachable: ${kotlinError.message}. Writing to Firestore.`);
    }

    // 2. Fallback: Write to Firestore
    try {
      if (db) {
        const studentDocRef = doc(db, 'students', studentId);
        await setDoc(studentDocRef, updatePayload, { merge: true });
        return { data: updatePayload, source: 'firestore' };
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore update failed:', firestoreError.message);
    }

    // 3. Fallback: Update localStorage cache
    const currentData = getLocalCache(CACHE_KEYS.STUDENT, initialStudentData);
    const updatedData = { ...currentData, ...updatePayload };
    setLocalCache(CACHE_KEYS.STUDENT, updatedData);
    return { data: updatedData, source: 'local-fallback' };
  },

  /**
   * GET /api/students/roster/:courseId
   * Fetches class roster for a given course. Binary attendance only.
   * Fallback: Firestore → mock facultyClassData
   */
  getClassRoster: async (courseId = 'CS601') => {
    // Normalize attendance to binary Present/Absent
    const normalizeToBinary = (students) =>
      students.map((s) => ({
        ...s,
        attendanceToday:
          s.attendanceToday === 'Present' ? 'Present' : 'Absent',
      }));

    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.get(`/students/roster/${courseId}`);
      if (response.data && Array.isArray(response.data)) {
        const normalized = normalizeToBinary(response.data);
        setLocalCache(CACHE_KEYS.ROSTER, normalized);
        return { data: normalized, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin roster unreachable: ${kotlinError.message}. Trying Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const rosterRef = collection(db, `rosters/${courseId}/students`);
        const snapshot = await getDocs(rosterRef);
        if (!snapshot.empty) {
          const firestoreRoster = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          const normalized = normalizeToBinary(firestoreRoster);
          setLocalCache(CACHE_KEYS.ROSTER, normalized);
          return { data: normalized, source: 'firestore' };
        }
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore roster read failed:', firestoreError.message);
    }

    // 3. Fallback: Mock data
    const mockRoster = facultyClassData?.students || [];
    const normalized = normalizeToBinary(mockRoster);
    setLocalCache(CACHE_KEYS.ROSTER, normalized);
    return { data: normalized, source: 'local-fallback' };
  },

  /**
   * POST /api/students/attendance
   * Logs batch attendance. Strictly enforces binary Present/Absent.
   * Fallback: Firestore → localStorage
   */
  logAttendance: async (attendanceRecords = []) => {
    // Enforce binary — strip any 'Late' or other status
    const binaryRecords = attendanceRecords.map((record) => ({
      ...record,
      status:
        record.status === 'Present' ? 'Present' : 'Absent',
    }));

    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.post('/students/attendance', binaryRecords);
      if (response.data) {
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin attendance log unreachable: ${kotlinError.message}. Using Firestore.`);
    }

    // 2. Fallback: Write to Firestore
    try {
      if (db) {
        const attendanceRef = collection(db, 'attendance');
        for (const record of binaryRecords) {
          await addDoc(attendanceRef, {
            ...record,
            createdAt: serverTimestamp(),
          });
        }
        return { data: binaryRecords, source: 'firestore' };
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore attendance write failed:', firestoreError.message);
    }

    // 3. Fallback: localStorage
    setLocalCache('cached_latest_attendance', binaryRecords);
    return { data: binaryRecords, source: 'local-fallback' };
  },

  /**
   * GET /api/students/mentor-roster
   * Fetches list of students assigned to the current mentor.
   * Fallback: Firestore → mock mentorRosterData
   */
  getMentorRoster: async (mentorId = 'mentor-001') => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.get(`/students/mentor-roster/${mentorId}`);
      if (response.data && Array.isArray(response.data)) {
        setLocalCache(CACHE_KEYS.MENTOR_ROSTER, response.data);
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin mentor roster unreachable: ${kotlinError.message}. Trying Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const rosterRef = collection(db, `mentors/${mentorId}/students`);
        const snapshot = await getDocs(rosterRef);
        if (!snapshot.empty) {
          const firestoreRoster = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setLocalCache(CACHE_KEYS.MENTOR_ROSTER, firestoreRoster);
          return { data: firestoreRoster, source: 'firestore' };
        }
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore mentor roster read failed:', firestoreError.message);
    }

    // 3. Fallback: Mock data
    const mockRoster = getLocalCache(CACHE_KEYS.MENTOR_ROSTER, mentorRosterData);
    return { data: mockRoster, source: 'local-fallback' };
  },

  /**
   * PUT /api/students/:studentId/mentee-status
   * Updates a mentee's status flags (warning level, last session, goal state, etc.)
   * Fallback: Firestore → localStorage
   */
  updateMenteeStatus: async (studentId, statusPayload = {}) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.put(`/students/${studentId}/mentee-status`, statusPayload);
      if (response.data) {
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin mentee status update unreachable: ${kotlinError.message}. Writing to Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const docRef = doc(db, 'students', studentId);
        await setDoc(docRef, statusPayload, { merge: true });
        return { data: statusPayload, source: 'firestore' };
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore mentee status update failed:', firestoreError.message);
    }

    // 3. localStorage fallback
    const cached = getLocalCache(CACHE_KEYS.MENTOR_ROSTER, mentorRosterData);
    const updated = cached.map((s) =>
      s.id === studentId ? { ...s, ...statusPayload } : s
    );
    setLocalCache(CACHE_KEYS.MENTOR_ROSTER, updated);
    return { data: statusPayload, source: 'local-fallback' };
  },
};

// ============================================================================
// 2. MARKS API (Subject Marks & Academic Performance)
// ============================================================================
export const marksApi = {
  /**
   * GET /api/marks
   * Fetches subject marks and semester academic performance.
   * Fallback: Firestore → localStorage/mock
   */
  getMarks: async (studentId = initialStudentData.id) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.get(`/marks/${studentId}`);
      if (response.data) {
        setLocalCache(CACHE_KEYS.MARKS, response.data);
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin marks API unreachable: ${kotlinError.message}. Trying Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const marksRef = collection(db, `students/${studentId}/marks`);
        const snapshot = await getDocs(marksRef);
        if (!snapshot.empty) {
          const marksData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setLocalCache(CACHE_KEYS.MARKS, marksData);
          return { data: marksData, source: 'firestore' };
        }
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore marks read failed:', firestoreError.message);
    }

    // 3. Fallback: Mock subject marks from student data
    const fallbackMarks = getLocalCache(
      CACHE_KEYS.MARKS,
      initialStudentData.subjectMarks || []
    );
    return { data: fallbackMarks, source: 'local-fallback' };
  },

  /**
   * POST /api/marks (batch save)
   * Saves marks entries for all students in a class roster.
   * Fallback: Firestore → localStorage
   */
  saveMarks: async (marksPayload = []) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.post('/marks', marksPayload);
      if (response.data) {
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin marks save unreachable: ${kotlinError.message}. Writing to Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const marksRef = collection(db, 'marks');
        for (const entry of marksPayload) {
          await addDoc(marksRef, { ...entry, savedAt: serverTimestamp() });
        }
        return { data: marksPayload, source: 'firestore' };
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore marks save failed:', firestoreError.message);
    }

    // 3. Fallback
    setLocalCache(CACHE_KEYS.MARKS, marksPayload);
    return { data: marksPayload, source: 'local-fallback' };
  },

  /**
   * POST /api/marks/submit
   * Submits marks entered by a faculty member for assessment.
   * Fallback: Firestore → localStorage
   */
  submitMarks: async (marksEntry = {}) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.post('/marks/submit', marksEntry);
      if (response.data) {
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin marks submit unreachable: ${kotlinError.message}. Writing to Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const submissionsRef = collection(db, 'mark_submissions');
        await addDoc(submissionsRef, {
          ...marksEntry,
          submittedAt: serverTimestamp(),
        });
        return { data: marksEntry, source: 'firestore' };
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore marks submission failed:', firestoreError.message);
    }

    // 3. Fallback
    setLocalCache('cached_marks_submission', marksEntry);
    return { data: marksEntry, source: 'local-fallback' };
  },
};

// ============================================================================
// 3. ACHIEVEMENTS API (Gamification, Badges, XP Claims)
// ============================================================================
export const achievementsApi = {
  /**
   * GET /api/achievements
   * Fetches student achievements, unlocked badges, and available claims.
   * Fallback: Firestore → localStorage/mock
   */
  getAchievements: async (studentId = initialStudentData.id) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.get(`/achievements/${studentId}`);
      if (response.data) {
        setLocalCache(CACHE_KEYS.ACHIEVEMENTS, response.data);
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin achievements unreachable: ${kotlinError.message}. Trying Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const achRef = collection(db, `students/${studentId}/achievements`);
        const snapshot = await getDocs(achRef);
        if (!snapshot.empty) {
          const achData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setLocalCache(CACHE_KEYS.ACHIEVEMENTS, achData);
          return { data: achData, source: 'firestore' };
        }
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore achievements read failed:', firestoreError.message);
    }

    // 3. Fallback: Mock badges from student data
    const fallbackAchievements = getLocalCache(
      CACHE_KEYS.ACHIEVEMENTS,
      initialStudentData.badges || []
    );
    return { data: fallbackAchievements, source: 'local-fallback' };
  },

  /**
   * POST /api/achievements/claim
   * Submits a badge unlock or XP point allocation claim.
   * Fallback: Firestore → localStorage
   */
  claimAchievement: async (claimPayload = {}) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.post('/achievements/claim', claimPayload);
      if (response.data) {
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin achievement claim unreachable: ${kotlinError.message}. Writing to Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const claimsRef = collection(db, 'achievement_claims');
        await addDoc(claimsRef, {
          ...claimPayload,
          claimedAt: serverTimestamp(),
        });
        return { data: claimPayload, source: 'firestore' };
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore achievement claim failed:', firestoreError.message);
    }

    // 3. Fallback
    setLocalCache('cached_latest_claim', claimPayload);
    return { data: claimPayload, source: 'local-fallback' };
  },

  // Alias for backward compatibility with StudentView usage
  claim: async (claimPayload = {}) => achievementsApi.claimAchievement(claimPayload),

  /**
   * GET /api/leaderboard
   * Fetches top ranked students with XP and badges.
   * Fallback: Firestore leaderboard collection → mock leaderboardData
   */
  getLeaderboard: async () => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.get('/leaderboard');
      if (response.data && Array.isArray(response.data)) {
        setLocalCache(CACHE_KEYS.LEADERBOARD, response.data);
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin leaderboard unreachable: ${kotlinError.message}. Trying Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const lbRef = collection(db, 'leaderboard');
        const snapshot = await getDocs(lbRef);
        if (!snapshot.empty) {
          const firestoreLb = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setLocalCache(CACHE_KEYS.LEADERBOARD, firestoreLb);
          return { data: firestoreLb, source: 'firestore' };
        }
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore leaderboard read failed:', firestoreError.message);
    }

    // 3. Fallback: Mock leaderboardData
    const fallbackLb = getLocalCache(CACHE_KEYS.LEADERBOARD, leaderboardData);
    return { data: fallbackLb, source: 'local-fallback' };
  },
};

// ============================================================================
// 4. FEEDBACK API (Faculty & Mentor Notes, Parent Actions)
// ============================================================================
export const feedbackApi = {
  /**
   * GET /api/feedback
   * Fetches feedback threads and notes for a student.
   * Fallback: Firestore → localStorage/mock
   */
  getFeedback: async (studentId = initialStudentData.id) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.get(`/feedback/${studentId}`);
      if (response.data) {
        setLocalCache(CACHE_KEYS.FEEDBACK, response.data);
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin feedback unreachable: ${kotlinError.message}. Trying Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const feedbackRef = collection(db, `students/${studentId}/feedback`);
        const snapshot = await getDocs(feedbackRef);
        if (!snapshot.empty) {
          const feedbackData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setLocalCache(CACHE_KEYS.FEEDBACK, feedbackData);
          return { data: feedbackData, source: 'firestore' };
        }
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore feedback read failed:', firestoreError.message);
    }

    // 3. Fallback: Mock feedback timeline from student data
    const fallbackFeedback = getLocalCache(
      CACHE_KEYS.FEEDBACK,
      initialStudentData.feedbackTimeline || []
    );
    return { data: fallbackFeedback, source: 'local-fallback' };
  },

  /**
   * POST /api/feedback
   * Posts a new faculty or mentor feedback note.
   * Fallback: Firestore → localStorage
   */
  postFeedback: async (feedbackPayload = {}) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.post('/feedback', feedbackPayload);
      if (response.data) {
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin feedback post unreachable: ${kotlinError.message}. Writing to Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const feedbackRef = collection(db, 'feedback');
        await addDoc(feedbackRef, {
          ...feedbackPayload,
          createdAt: serverTimestamp(),
        });
        return { data: feedbackPayload, source: 'firestore' };
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore feedback write failed:', firestoreError.message);
    }

    // 3. Fallback
    setLocalCache('cached_latest_feedback', feedbackPayload);
    return { data: feedbackPayload, source: 'local-fallback' };
  },

  /**
   * GET /api/feedback/mentor-sessions/:mentorId
   * Fetches historical 1-on-1 mentorship session logs.
   * Fallback: Firestore → mock mentorInitialSessions
   */
  getMentorSessions: async (mentorId = 'mentor-001') => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.get(`/feedback/mentor-sessions/${mentorId}`);
      if (response.data && Array.isArray(response.data)) {
        setLocalCache(CACHE_KEYS.MENTOR_SESSIONS, response.data);
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin mentor sessions unreachable: ${kotlinError.message}. Trying Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const sessionsRef = collection(db, `mentors/${mentorId}/sessions`);
        const snapshot = await getDocs(sessionsRef);
        if (!snapshot.empty) {
          const sessionsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setLocalCache(CACHE_KEYS.MENTOR_SESSIONS, sessionsData);
          return { data: sessionsData, source: 'firestore' };
        }
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore mentor sessions read failed:', firestoreError.message);
    }

    // 3. Fallback: Mock sessions
    const fallbackSessions = getLocalCache(CACHE_KEYS.MENTOR_SESSIONS, mentorInitialSessions || []);
    return { data: fallbackSessions, source: 'local-fallback' };
  },

  /**
   * POST /api/feedback/mentor-session
   * Logs a new 1-on-1 mentorship session entry.
   * Fallback: Firestore → localStorage
   */
  logMentorSession: async (sessionPayload = {}) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.post('/feedback/mentor-session', sessionPayload);
      if (response.data) {
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin mentor session log unreachable: ${kotlinError.message}. Writing to Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const sessionsRef = collection(db, 'mentor_sessions');
        await addDoc(sessionsRef, {
          ...sessionPayload,
          loggedAt: serverTimestamp(),
        });
        return { data: sessionPayload, source: 'firestore' };
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore mentor session write failed:', firestoreError.message);
    }

    // 3. Fallback
    const cached = getLocalCache(CACHE_KEYS.MENTOR_SESSIONS, []);
    setLocalCache(CACHE_KEYS.MENTOR_SESSIONS, [sessionPayload, ...cached]);
    return { data: sessionPayload, source: 'local-fallback' };
  },

  /**
   * POST /api/parent/callback-request
   * Logs a parent's request for a mentor callback or meeting.
   * Fallback: Firestore feedback collection → localStorage
   */
  postCallbackRequest: async (callbackPayload = {}) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.post('/parent/callback-request', callbackPayload);
      if (response.data) {
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (err) {
      console.warn('[DataApi] Kotlin callback request fallback:', err.message);
    }

    // 2. Fallback: Mirror into Firestore feedback collection
    try {
      if (db) {
        const ref = collection(db, 'feedback');
        await addDoc(ref, {
          ...callbackPayload,
          type: 'Parent Callback Request',
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('[DataApi] Firestore callback request write failed:', err.message);
    }

    // 3. Cache and return
    setLocalCache('cached_last_callback_request', callbackPayload);
    return { data: callbackPayload, source: 'local-fallback' };
  },

  /**
   * POST /api/parent/report-export
   * Triggers a performance report export or download request.
   * Fallback: Firestore report_exports collection → localStorage
   */
  requestReportExport: async (reportPayload = {}) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.post('/parent/report-export', reportPayload);
      if (response.data) {
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (err) {
      console.warn('[DataApi] Kotlin report export fallback:', err.message);
    }

    // 2. Fallback: log to Firestore
    try {
      if (db) {
        const ref = collection(db, 'report_exports');
        await addDoc(ref, {
          ...reportPayload,
          requestedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('[DataApi] Firestore report export write failed:', err.message);
    }

    setLocalCache('cached_last_report_request', reportPayload);
    return { data: reportPayload, source: 'local-fallback' };
  },
};

// ============================================================================
// 5. EVENTS API (Campus Competitions, Hackathons & XP Quests)
// ============================================================================
export const eventsApi = {
  /**
   * GET /api/events
   * Fetches upcoming campus hackathons, workshops, and quizzes with XP rewards.
   * Fallback: Firestore events collection → mock campusEventsData
   */
  getEvents: async () => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.get('/events');
      if (response.data && Array.isArray(response.data)) {
        setLocalCache(CACHE_KEYS.EVENTS, response.data);
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin events unreachable: ${kotlinError.message}. Trying Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const eventsRef = collection(db, 'events');
        const snapshot = await getDocs(eventsRef);
        if (!snapshot.empty) {
          const firestoreEvents = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setLocalCache(CACHE_KEYS.EVENTS, firestoreEvents);
          return { data: firestoreEvents, source: 'firestore' };
        }
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore events read failed:', firestoreError.message);
    }

    // 3. Fallback: Mock campusEventsData
    const fallbackEvents = getLocalCache(CACHE_KEYS.EVENTS, campusEventsData);
    return { data: fallbackEvents, source: 'local-fallback' };
  },

  /**
   * POST /api/events/:eventId/register
   * Registers a student for an event and logs the registration.
   * Fallback: Firestore event_registrations → localStorage
   */
  registerEvent: async (eventId, registrationPayload = {}) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.post(`/events/${eventId}/register`, registrationPayload);
      if (response.data) {
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin event registration fallback: ${kotlinError.message}. Writing to Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const regRef = collection(db, 'event_registrations');
        await addDoc(regRef, {
          eventId,
          ...registrationPayload,
          registeredAt: serverTimestamp(),
        });
        return { data: registrationPayload, source: 'firestore' };
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore event registration write failed:', firestoreError.message);
    }

    // 3. Fallback: localStorage
    setLocalCache(`cached_event_reg_${eventId}`, registrationPayload);
    return { data: registrationPayload, source: 'local-fallback' };
  },
};

// ============================================================================
// 6. HOD API (Department Analytics, Mentor Radar, Intervention Advisories)
// ============================================================================
export const hodApi = {
  /**
   * GET /api/hod/department
   * Fetches department KPIs, mentor cohort analytics, and warning metrics.
   * Fallback: Firestore hod_analytics -> local cache -> hodDepartmentData
   */
  getDepartmentAnalytics: async () => {
    // 1. Attempt Kotlin Backend Request
    try {
      const response = await kotlinApi.get('/hod/department');
      if (response.data) {
        setLocalCache(CACHE_KEYS.HOD, response.data);
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(
        `[DataApi] Kotlin backend /api/hod/department fallback: ${kotlinError.message}. Querying Firestore.`
      );
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const docRef = doc(db, 'hod_analytics', 'DEPT-CSE');
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const firestoreData = snapshot.data();
          setLocalCache(CACHE_KEYS.HOD, firestoreData);
          return { data: firestoreData, source: 'firestore' };
        }
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore HOD analytics read failed:', firestoreError.message);
    }

    // 3. Fallback: Local Cache or Static Mock
    const fallbackHod = getLocalCache(CACHE_KEYS.HOD, hodDepartmentData);
    return { data: fallbackHod, source: 'local-fallback' };
  },

  /**
   * POST /api/hod/advisories
   * Dispatches an executive intervention directive/advisory to a mentor.
   * Fallback: Firestore hod_advisories -> localStorage
   */
  sendMentorAdvisory: async (mentorId, advisoryPayload = {}) => {
    // 1. Attempt Kotlin Backend
    try {
      const response = await kotlinApi.post('/hod/advisories', {
        mentorId,
        ...advisoryPayload,
      });
      if (response.data) {
        return { data: response.data, source: 'kotlin-backend' };
      }
    } catch (kotlinError) {
      console.warn(`[DataApi] Kotlin mentor advisory fallback: ${kotlinError.message}. Writing to Firestore.`);
    }

    // 2. Fallback: Firestore
    try {
      if (db) {
        const advRef = collection(db, 'hod_advisories');
        const docRes = await addDoc(advRef, {
          mentorId,
          ...advisoryPayload,
          createdAt: serverTimestamp(),
        });
        return { data: { id: docRes.id, mentorId, ...advisoryPayload }, source: 'firestore' };
      }
    } catch (firestoreError) {
      console.warn('[DataApi] Firestore mentor advisory write failed:', firestoreError.message);
    }

    // 3. Fallback: localStorage
    const cachedAdvisories = getLocalCache(CACHE_KEYS.HOD_ADVISORIES, []);
    const newRecord = {
      id: `adv-${Date.now()}`,
      mentorId,
      ...advisoryPayload,
      createdAt: new Date().toISOString(),
    };
    cachedAdvisories.unshift(newRecord);
    setLocalCache(CACHE_KEYS.HOD_ADVISORIES, cachedAdvisories);
    return { data: newRecord, source: 'local-fallback' };
  },
};

// ============================================================================
// DEFAULT EXPORT — Convenience bundle for direct destructure imports
// ============================================================================
export default {
  students: studentsApi,
  marks: marksApi,
  achievements: achievementsApi,
  feedback: feedbackApi,
  events: eventsApi,
  hod: hodApi,
};
