export type Curriculum = 'CBSE' | 'IGCSE / CIE';

export type ClassGroup = 
  | 'G1–G5'
  | 'G6–G8'
  | 'CBSE G9–G10'
  | 'CIE G1–G5'
  | 'CIE G6–G10';

export type SharingStatus = 'SHARED' | 'NOT SHARED';

export interface StudentAttendance {
  totalStudents: number;
  studentsPresent: number;
  studentsAbsent: number;
  absentStudentNames: string[];
}

export interface ClubReport {
  id: string;
  curriculum: Curriculum;
  classGroup: ClassGroup;
  clubName: string;
  teacherName: string;
  status: SharingStatus;
  sharedDate: string; // e.g. '05-10-2026' or '05 Oct 2026' or '—'
  sharedTime: string; // e.g. '10:15 AM' or '—'
  sharedBy?: string;
  explanation?: string; // Reason why report is not shared
  explanationUpdatedAt?: string; // e.g. '05 Oct 2026, 10:45 PM'
  previousExplanation?: string; // Kept in history once shared
  updatedAt: string;

  // Attendance for active/current record
  totalStudents?: number;
  studentsPresent?: number;
  studentsAbsent?: number;
  absentStudents?: string[];

  // Attendance indexed by Date to isolate weekly reports
  attendanceByDate?: Record<string, StudentAttendance>;
}

export interface TeacherUser {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: 'admin' | 'teacher';
  curriculums?: Curriculum[]; // which curriculums this teacher belongs to
}
