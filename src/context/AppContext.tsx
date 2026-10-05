import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ClubReport, TeacherUser, Curriculum, StudentAttendance } from '../types';
import { INITIAL_REPORTS, getInitialUsers } from '../data/seedData';

interface AppContextType {
  currentUser: TeacherUser | null;
  users: TeacherUser[];
  reports: ClubReport[];
  activeReportDate: string; // e.g. '2026-10-05'
  activeCurriculum: Curriculum; // 'CBSE' | 'IGCSE / CIE'
  isSubmissionActive: boolean; // true = submissions open, false = deactivated by Admin
  stats: {
    total: number;
    shared: number;
    notShared: number;
    explanationsSubmitted: number;
    explanationsRequired: number;
  };
  setActiveSession: (date: string, curriculum: Curriculum, activate?: boolean) => void;
  deactivateSubmission: () => void;
  loginAs: (user: TeacherUser) => void;
  loginWithCredentials: (identifier: string) => boolean;
  logout: () => void;
  markAsShared: (reportId: string, attendance?: StudentAttendance) => void;
  submitExplanation: (reportId: string, explanation: string, attendance?: StudentAttendance) => boolean;
  updateAttendance: (reportId: string, attendance: StudentAttendance) => void;
  getReportAttendance: (report: ClubReport, date?: string) => StudentAttendance;
  adminResetStatus: (reportId: string) => void;
  resetAllToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  REPORTS: 'pssemr_report_tracker_v7',
  CURRENT_USER: 'pssemr_current_user_v7',
  ACTIVE_SESSION: 'pssemr_active_session_v7',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const users = useMemo(() => getInitialUsers(), []);

  // Active Admin Session (Date + Curriculum + Status)
  const [activeSession, setActiveSessionState] = useState<{
    date: string;
    curriculum: Curriculum;
    isActive: boolean;
  }>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse active session', e);
      }
    }
    return { date: '2026-10-05', curriculum: 'CBSE', isActive: true };
  });

  const [reports, setReports] = useState<ClubReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse reports', e);
      }
    }
    return INITIAL_REPORTS;
  });

  const [currentUser, setCurrentUser] = useState<TeacherUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse current user', e);
      }
    }
    // Default to Mr. Jithendra (CBSE) or first teacher
    const defaultTeacher = users.find((u) => u.name === 'Mr. Jithendra') || users[1];
    return defaultTeacher || null;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(activeSession));
  }, [activeSession]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  // Dashboard Stats: Filtered to activeCurriculum
  const stats = useMemo(() => {
    const curReports = reports.filter((r) => r.curriculum === activeSession.curriculum);
    const total = curReports.length;
    const shared = curReports.filter((r) => r.status === 'SHARED').length;
    const notShared = total - shared;
    const pendingReports = curReports.filter((r) => r.status === 'NOT SHARED');
    const explanationsSubmitted = pendingReports.filter(
      (r) => r.explanation && r.explanation.trim().length > 0
    ).length;
    const explanationsRequired = notShared - explanationsSubmitted;

    return {
      total,
      shared,
      notShared,
      explanationsSubmitted,
      explanationsRequired,
    };
  }, [reports, activeSession.curriculum]);

  const setActiveSession = (date: string, curriculum: Curriculum, activate = true) => {
    setActiveSessionState({ date, curriculum, isActive: activate });
  };

  const deactivateSubmission = () => {
    setActiveSessionState((prev) => ({ ...prev, isActive: false }));
  };

  const loginAs = (user: TeacherUser) => {
    setCurrentUser(user);
  };

  const loginWithCredentials = (identifier: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.mobile === cleanId ||
        u.name.toLowerCase().includes(cleanId)
    );
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const getReportAttendance = (report: ClubReport, date?: string): StudentAttendance => {
    const targetDate = date || activeSession.date;
    if (report.attendanceByDate && report.attendanceByDate[targetDate]) {
      return report.attendanceByDate[targetDate];
    }
    return {
      totalStudents: report.totalStudents ?? 25,
      studentsPresent: report.studentsPresent ?? 25,
      studentsAbsent: report.studentsAbsent ?? 0,
      absentStudentNames: report.absentStudents ?? [],
    };
  };

  const updateAttendance = (reportId: string, attendance: StudentAttendance) => {
    const targetDate = activeSession.date;
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const updatedAttendanceByDate = {
            ...(r.attendanceByDate || {}),
            [targetDate]: attendance,
          };
          return {
            ...r,
            totalStudents: attendance.totalStudents,
            studentsPresent: attendance.studentsPresent,
            studentsAbsent: attendance.studentsAbsent,
            absentStudents: attendance.absentStudentNames,
            attendanceByDate: updatedAttendanceByDate,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );
  };

  const markAsShared = (reportId: string, attendance?: StudentAttendance) => {
    const nowIso = new Date('2026-10-05T10:35:00').toISOString();
    const dateStr = '05 Oct 2026';
    const timeStr = '10:35 PM';
    const targetDate = activeSession.date;

    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const updatedAttendanceByDate = attendance
            ? {
                ...(r.attendanceByDate || {}),
                [targetDate]: attendance,
              }
            : r.attendanceByDate;

          return {
            ...r,
            status: 'SHARED',
            sharedDate: dateStr,
            sharedTime: timeStr,
            sharedBy: currentUser?.name || r.teacherName,
            // Keep previous explanation in history as requested
            previousExplanation: r.explanation || r.previousExplanation,
            updatedAt: nowIso,
            ...(attendance
              ? {
                  totalStudents: attendance.totalStudents,
                  studentsPresent: attendance.studentsPresent,
                  studentsAbsent: attendance.studentsAbsent,
                  absentStudents: attendance.absentStudentNames,
                  attendanceByDate: updatedAttendanceByDate,
                }
              : {}),
          };
        }
        return r;
      })
    );
  };

  const submitExplanation = (
    reportId: string,
    explanationText: string,
    attendance?: StudentAttendance
  ): boolean => {
    const trimmed = explanationText.trim();
    if (!trimmed) return false;

    const nowIso = new Date('2026-10-05T10:45:00').toISOString();
    const formattedStamp = '05 Oct 2026, 10:45 PM';
    const targetDate = activeSession.date;

    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const updatedAttendanceByDate = attendance
            ? {
                ...(r.attendanceByDate || {}),
                [targetDate]: attendance,
              }
            : r.attendanceByDate;

          return {
            ...r,
            status: 'NOT SHARED',
            explanation: trimmed,
            explanationUpdatedAt: formattedStamp,
            updatedAt: nowIso,
            ...(attendance
              ? {
                  totalStudents: attendance.totalStudents,
                  studentsPresent: attendance.studentsPresent,
                  studentsAbsent: attendance.studentsAbsent,
                  absentStudents: attendance.absentStudentNames,
                  attendanceByDate: updatedAttendanceByDate,
                }
              : {}),
          };
        }
        return r;
      })
    );
    return true;
  };

  const adminResetStatus = (reportId: string) => {
    const nowIso = new Date('2026-10-05T10:35:00').toISOString();
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'NOT SHARED',
            sharedDate: '—',
            sharedTime: '—',
            sharedBy: undefined,
            // Restore previous explanation if available
            explanation: r.previousExplanation || r.explanation,
            updatedAt: nowIso,
          };
        }
        return r;
      })
    );
  };

  const resetAllToDefault = () => {
    setReports(INITIAL_REPORTS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        reports,
        activeReportDate: activeSession.date,
        activeCurriculum: activeSession.curriculum,
        isSubmissionActive: activeSession.isActive,
        stats,
        setActiveSession,
        deactivateSubmission,
        loginAs,
        loginWithCredentials,
        logout,
        markAsShared,
        submitExplanation,
        updateAttendance,
        getReportAttendance,
        adminResetStatus,
        resetAllToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
