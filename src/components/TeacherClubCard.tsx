import React, { useState, useEffect } from 'react';
import { ClubReport, StudentAttendance, Curriculum } from '../types';
import {
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit2,
  Send,
  Lock,
  Calendar,
  Users,
  UserCheck,
  UserMinus,
  Plus,
  Trash2,
  Sparkles,
  Info,
} from 'lucide-react';

const SUGGESTED_REASONS = [
  'Report is still being prepared.',
  'Waiting for photographs from the activity.',
  'Activity was conducted recently.',
  'Report needs correction.',
  'Waiting for information from students.',
  'Will share tomorrow.',
];

const QUICK_ABSENT_SUGGESTIONS = [
  'Rahul Kumar',
  'Ananya S',
  'Arjun P',
  'Pooja Patil',
  'Kavya M',
  'Rohan Gowda',
];

interface TeacherClubCardProps {
  report: ClubReport;
  activeReportDate: string;
  activeCurriculum: Curriculum;
  isSubmissionActive: boolean;
  canSubmit: boolean;
  formatToDDMMYYYY: (dateStr: string) => string;
  getAttendance: (report: ClubReport, date?: string) => StudentAttendance;
  onConfirmShareRequest: (report: ClubReport, attendance: StudentAttendance) => void;
  onSubmitExplanation: (
    reportId: string,
    explanation: string,
    attendance: StudentAttendance
  ) => boolean;
  onUpdateAttendance: (reportId: string, attendance: StudentAttendance) => void;
}

export const TeacherClubCard: React.FC<TeacherClubCardProps> = ({
  report,
  activeReportDate,
  activeCurriculum,
  isSubmissionActive,
  canSubmit,
  formatToDDMMYYYY,
  getAttendance,
  onConfirmShareRequest,
  onSubmitExplanation,
  onUpdateAttendance,
}) => {
  const isShared = report.status === 'SHARED';
  const hasExplanation = Boolean(report.explanation && report.explanation.trim());

  // Current attendance for this active report date
  const initialAtt = getAttendance(report, activeReportDate);

  const [totalStudents, setTotalStudents] = useState<number>(initialAtt.totalStudents || 25);
  const [studentsPresent, setStudentsPresent] = useState<number>(initialAtt.studentsPresent || 22);
  const [studentsAbsent, setStudentsAbsent] = useState<number>(initialAtt.studentsAbsent || 3);
  const [absentNames, setAbsentNames] = useState<string[]>(initialAtt.absentStudentNames || []);

  const [newStudentName, setNewStudentName] = useState('');
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [attendanceSuccessMsg, setAttendanceSuccessMsg] = useState<string | null>(null);

  // Explanation state
  const [isEditingExplanation, setIsEditingExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState(report.explanation || '');
  const [explainError, setExplainError] = useState<string | null>(null);
  const [justSubmittedExplanation, setJustSubmittedExplanation] = useState(false);

  // Sync attendance if activeReportDate or report changes
  useEffect(() => {
    const currentAtt = getAttendance(report, activeReportDate);
    setTotalStudents(currentAtt.totalStudents);
    setStudentsPresent(currentAtt.studentsPresent);
    setStudentsAbsent(currentAtt.studentsAbsent);
    setAbsentNames(currentAtt.absentStudentNames || []);
    setExplanationText(report.explanation || '');
    setAttendanceError(null);
  }, [report.id, activeReportDate, report.status]);

  // Validation: Present + Absent = Total Students
  const sumPresentAbsent = Number(studentsPresent) + Number(studentsAbsent);
  const isBalanced = sumPresentAbsent === Number(totalStudents);

  const handleTotalChange = (val: number) => {
    const safeTotal = Math.max(0, val);
    setTotalStudents(safeTotal);
    // If present is already set, auto-adjust absent to balance
    if (studentsPresent <= safeTotal) {
      setStudentsAbsent(safeTotal - studentsPresent);
    } else {
      setStudentsPresent(safeTotal);
      setStudentsAbsent(0);
    }
    setAttendanceError(null);
  };

  const handlePresentChange = (val: number) => {
    const safePresent = Math.max(0, val);
    setStudentsPresent(safePresent);
    // Auto-calculate absent
    const newAbsent = Math.max(0, totalStudents - safePresent);
    setStudentsAbsent(newAbsent);
    setAttendanceError(null);
  };

  const handleAbsentChange = (val: number) => {
    const safeAbsent = Math.max(0, val);
    setStudentsAbsent(safeAbsent);
    // Auto-calculate present
    const newPresent = Math.max(0, totalStudents - safeAbsent);
    setStudentsPresent(newPresent);
    setAttendanceError(null);
  };

  const handleAutoBalance = () => {
    const calculatedAbsent = Math.max(0, totalStudents - studentsPresent);
    setStudentsAbsent(calculatedAbsent);
    setAttendanceError(null);
  };

  const handleAddAbsentStudent = () => {
    const trimmed = newStudentName.trim();
    if (!trimmed) return;
    if (absentNames.includes(trimmed)) {
      setAttendanceError(`"${trimmed}" is already added.`);
      return;
    }
    const updated = [...absentNames, trimmed];
    setAbsentNames(updated);
    setNewStudentName('');
    setAttendanceError(null);

    // If absent count is less than names count, keep absent count synchronized
    if (studentsAbsent < updated.length) {
      setStudentsAbsent(updated.length);
      setStudentsPresent(Math.max(0, totalStudents - updated.length));
    }
  };

  const handleRemoveAbsentStudent = (indexToRemove: number) => {
    const updated = absentNames.filter((_, idx) => idx !== indexToRemove);
    setAbsentNames(updated);
    setAttendanceError(null);
  };

  const buildCurrentAttendance = (): StudentAttendance => ({
    totalStudents: Number(totalStudents),
    studentsPresent: Number(studentsPresent),
    studentsAbsent: Number(studentsAbsent),
    absentStudentNames: absentNames,
  });

  const validateAttendance = (): boolean => {
    if (!isBalanced) {
      setAttendanceError(
        `Attendance mismatch: Present (${studentsPresent}) + Absent (${studentsAbsent}) = ${sumPresentAbsent}, but Total Students is ${totalStudents}. They must be equal.`
      );
      return false;
    }
    if (studentsAbsent > 0 && absentNames.length === 0) {
      setAttendanceError(
        `You have indicated ${studentsAbsent} absent student(s). Please add their names in the "Absent Students' Names" section below.`
      );
      return false;
    }
    setAttendanceError(null);
    return true;
  };

  const handleSaveAttendanceOnly = () => {
    if (!validateAttendance()) return;
    const att = buildCurrentAttendance();
    onUpdateAttendance(report.id, att);
    setAttendanceSuccessMsg('Student attendance saved successfully for this report date.');
    setTimeout(() => setAttendanceSuccessMsg(null), 3500);
  };

  const handleMarkAsSharedClick = () => {
    if (!validateAttendance()) return;
    const att = buildCurrentAttendance();
    onConfirmShareRequest(report, att);
  };

  const handleSaveExplanationClick = () => {
    if (!explanationText.trim()) {
      setExplainError('Please provide an explanation before submitting.');
      return;
    }
    if (!validateAttendance()) return;

    const att = buildCurrentAttendance();
    const success = onSubmitExplanation(report.id, explanationText, att);
    if (success) {
      setJustSubmittedExplanation(true);
      setIsEditingExplanation(false);
      setExplainError(null);
      setTimeout(() => setJustSubmittedExplanation(false), 4000);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 sm:p-6 border-2 transition-all space-y-6 ${
        canSubmit
          ? 'border-[#E5DED5] shadow-xs hover:border-[#781C2B]/40'
          : 'border-[#E5DED5]/60 bg-gray-50/50 opacity-95'
      }`}
    >
      {/* Toast Feedback for Explanation */}
      {justSubmittedExplanation && (
        <div className="p-3 bg-[#E7F3EC] border border-[#2E7D5B]/30 rounded-xl text-xs text-[#2E7D5B] font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Explanation & attendance submitted to Activity Coordinator.</span>
        </div>
      )}

      {/* Toast Feedback for Attendance Saved */}
      {attendanceSuccessMsg && (
        <div className="p-3 bg-[#E7F3EC] border border-[#2E7D5B]/30 rounded-xl text-xs text-[#2E7D5B] font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{attendanceSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CLUB IDENTIFICATION & REPORT DATE HEADER */}
      {/* ========================================================================= */}
      <div className="space-y-3 pb-4 border-b border-[#E5DED5]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#66615D] uppercase tracking-wider block">
            Club Report Status Form
          </span>

          {canSubmit ? (
            <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E7F3EC] px-2.5 py-0.5 rounded-full border border-[#2E7D5B]/30">
              Active for Submission
            </span>
          ) : !isSubmissionActive ? (
            <span className="text-[10px] font-bold text-[#B3261E] bg-[#F5E8EA] px-2.5 py-0.5 rounded-full border border-[#B3261E]/30 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Submissions Locked
            </span>
          ) : (
            <span className="text-[10px] font-bold text-[#66615D] bg-[#F8F5EF] px-2.5 py-0.5 rounded-full border border-[#E5DED5]">
              Curriculum Inactive
            </span>
          )}
        </div>

        {/* Club Details Grid: Club, Curriculum, Report Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#F8F5EF] rounded-xl border border-[#E5DED5]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#66615D] block">
              Club
            </span>
            <span className="text-base font-bold font-serif text-[#781C2B] block truncate">
              {report.clubName}
            </span>
            <span className="text-[11px] font-semibold text-[#66615D]">
              {report.classGroup}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#66615D] block">
              Curriculum
            </span>
            <span className="text-sm font-bold text-[#292929] block">
              {report.curriculum}
            </span>
            <span className="text-[10px] text-[#66615D]">
              Teacher: {report.teacherName}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#66615D] block">
              Report Date
            </span>
            <span className="text-sm font-mono font-bold text-[#781C2B] block">
              {formatToDDMMYYYY(activeReportDate)}
            </span>
            <span className="text-[10px] text-[#66615D]">
              Session Date
            </span>
          </div>
        </div>

        {/* Report Sharing Status indicator */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-[#66615D] uppercase tracking-wider">
            Report Sharing Status
          </span>
          {isShared ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F3EC] text-[#2E7D5B] border border-[#2E7D5B]/30 font-bold text-xs">
              <span>🟢</span>
              <span>SHARED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E8EA] text-[#781C2B] border border-[#781C2B]/30 font-bold text-xs">
              <span>🔴</span>
              <span>Not Shared</span>
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STUDENT ATTENDANCE SECTION */}
      {/* ========================================================================= */}
      <div className="space-y-4 bg-[#FFFDF9] p-4 sm:p-5 rounded-2xl border border-[#E5DED5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#781C2B]" />
            <h4 className="text-sm font-bold font-serif text-[#292929]">
              Student Attendance
            </h4>
          </div>
          <span className="text-[11px] text-[#66615D]">
            Required validation: <strong>Present + Absent = Total</strong>
          </span>
        </div>

        {/* Attendance Inputs: Total, Present, Absent */}
        <div className="grid grid-cols-3 gap-3">
          {/* Total Students */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#66615D] uppercase tracking-wider">
              Total Students
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                disabled={!canSubmit && isShared}
                value={totalStudents}
                onChange={(e) => handleTotalChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-center text-sm font-bold font-mono text-[#292929] bg-white border border-[#E5DED5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#781C2B] disabled:bg-[#F8F5EF] disabled:cursor-not-allowed"
              />
            </div>
            <span className="text-[10px] text-[#66615D] text-center block">
              Enrolled
            </span>
          </div>

          {/* Students Present */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#2E7D5B] uppercase tracking-wider">
              Present
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                disabled={!canSubmit && isShared}
                value={studentsPresent}
                onChange={(e) => handlePresentChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-center text-sm font-bold font-mono text-[#2E7D5B] bg-white border border-[#2E7D5B]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D5B] disabled:bg-[#F8F5EF] disabled:cursor-not-allowed"
              />
            </div>
            <span className="text-[10px] text-[#2E7D5B] text-center block">
              In Club
            </span>
          </div>

          {/* Students Absent */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#781C2B] uppercase tracking-wider">
              Absent
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                disabled={!canSubmit && isShared}
                value={studentsAbsent}
                onChange={(e) => handleAbsentChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-center text-sm font-bold font-mono text-[#781C2B] bg-white border border-[#781C2B]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#781C2B] disabled:bg-[#F8F5EF] disabled:cursor-not-allowed"
              />
            </div>
            <span className="text-[10px] text-[#781C2B] text-center block">
              Not in Club
            </span>
          </div>
        </div>

        {/* Validation Status Badge */}
        <div className="pt-1">
          {isBalanced ? (
            <div className="p-2.5 bg-[#E7F3EC] border border-[#2E7D5B]/30 rounded-xl text-xs text-[#2E7D5B] font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  ✓ Validated: Present ({studentsPresent}) + Absent ({studentsAbsent}) = Total Students ({totalStudents})
                </span>
              </span>
            </div>
          ) : (
            <div className="p-2.5 bg-[#F5E8EA] border border-[#781C2B]/30 rounded-xl text-xs text-[#781C2B] font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#B3261E]" />
                <span>
                  Mismatched: Present ({studentsPresent}) + Absent ({studentsAbsent}) = {sumPresentAbsent} (Total is {totalStudents})
                </span>
              </span>
              <button
                type="button"
                onClick={handleAutoBalance}
                className="px-2.5 py-1 bg-white hover:bg-[#F8F5EF] border border-[#781C2B]/40 text-[#781C2B] rounded-lg text-[11px] font-bold transition-colors self-start sm:self-auto cursor-pointer"
              >
                Auto-balance Absent ({Math.max(0, totalStudents - studentsPresent)})
              </button>
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* IF ABSENT STUDENTS > 0 -> ABSENT STUDENTS' NAMES SECTION */}
        {/* ===================================================================== */}
        {studentsAbsent > 0 && (
          <div className="mt-3 pt-3 border-t border-[#E5DED5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <UserMinus className="w-4 h-4 text-[#781C2B]" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#781C2B]">
                  Absent Students' Names
                </h5>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F5E8EA] text-[#781C2B]">
                {absentNames.length} of {studentsAbsent} names recorded
              </span>
            </div>

            {/* Add Student Input Row */}
            {canSubmit && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter absent student name (e.g. Rahul Kumar)..."
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAbsentStudent();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs text-[#292929] bg-white border border-[#E5DED5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#781C2B]"
                />
                <button
                  type="button"
                  onClick={handleAddAbsentStudent}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#781C2B] hover:bg-[#5F1623] rounded-xl transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Student</span>
                </button>
              </div>
            )}

            {/* Quick Suggestions to add common student names */}
            {canSubmit && absentNames.length < studentsAbsent && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-[10px] text-[#66615D] font-bold">Quick suggestions:</span>
                {QUICK_ABSENT_SUGGESTIONS.filter((name) => !absentNames.includes(name)).map(
                  (name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setAbsentNames((prev) => [...prev, name]);
                        setAttendanceError(null);
                      }}
                      className="px-2 py-0.5 bg-white hover:bg-[#F5E8EA] border border-[#E5DED5] text-[#292929] rounded text-[10px] font-medium transition-colors cursor-pointer"
                    >
                      + {name}
                    </button>
                  )
                )}
              </div>
            )}

            {/* Table of Absent Students */}
            <div className="overflow-hidden rounded-xl border border-[#E5DED5] bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F5EF] border-b border-[#E5DED5] text-[#66615D] font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-2 px-3 w-10 text-center">#</th>
                    <th className="py-2 px-3">Absent Student Name</th>
                    {canSubmit && <th className="py-2 px-3 text-right w-16">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DED5]/60">
                  {absentNames.length === 0 ? (
                    <tr>
                      <td
                        colSpan={canSubmit ? 3 : 2}
                        className="py-3 px-3 text-center text-xs text-[#9A6A16] bg-[#FBF1D9]/30"
                      >
                        ⚠️ Please add the names of the {studentsAbsent} absent student(s).
                      </td>
                    </tr>
                  ) : (
                    absentNames.map((name, idx) => (
                      <tr key={idx} className="hover:bg-[#F8F5EF]/50">
                        <td className="py-2 px-3 text-center font-mono text-[#66615D] text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-semibold text-[#292929]">
                          {name}
                        </td>
                        {canSubmit && (
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveAbsentStudent(idx)}
                              className="text-[#66615D] hover:text-[#B3261E] p-1 rounded hover:bg-[#F5E8EA] transition-colors"
                              title="Remove student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Save Attendance standalone helper button if already shared */}
            {canSubmit && isShared && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAttendanceOnly}
                  className="px-3 py-1.5 text-xs font-semibold text-[#781C2B] hover:bg-[#F5E8EA] border border-[#781C2B]/30 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Update Attendance for Today</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Validation Error Banner */}
        {attendanceError && (
          <div className="p-3 bg-[#F5E8EA] border border-[#781C2B]/40 rounded-xl text-xs text-[#781C2B] font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#B3261E]" />
            <span>{attendanceError}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. REPORT SHARED? STATUS SUBMISSION OPTIONS */}
      {/* ========================================================================= */}
      {isShared ? (
        /* ALREADY SHARED DISPLAY */
        <div className="space-y-3 bg-[#F8F5EF] p-4 sm:p-5 rounded-2xl border border-[#E5DED5] text-xs text-[#292929]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#2E7D5B] font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Report marked as Shared in WhatsApp</span>
            </div>
            <span className="text-[11px] font-mono bg-[#E7F3EC] text-[#2E7D5B] px-2 py-0.5 rounded font-bold border border-[#2E7D5B]/30">
              🟢 SHARED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E5DED5] text-xs">
            <p>
              <strong className="text-[#66615D]">Shared by:</strong>{' '}
              {report.sharedBy || report.teacherName}
            </p>
            <p>
              <strong className="text-[#66615D]">Date:</strong> {report.sharedDate}
            </p>
            <p>
              <strong className="text-[#66615D]">Time:</strong> {report.sharedTime}
            </p>
          </div>

          {/* Recorded Attendance Summary */}
          <div className="p-3 bg-white rounded-xl border border-[#E5DED5] text-xs space-y-1">
            <span className="text-[10px] font-bold text-[#66615D] uppercase tracking-wider block">
              Recorded Attendance for {formatToDDMMYYYY(activeReportDate)}:
            </span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span>Total: <strong>{totalStudents}</strong></span>
              <span className="text-[#2E7D5B]">Present: <strong>{studentsPresent}</strong></span>
              <span className="text-[#781C2B]">Absent: <strong>{studentsAbsent}</strong></span>
            </div>
            {absentNames.length > 0 && (
              <div className="text-[11px] text-[#66615D] pt-1">
                <strong>Absent Students:</strong> {absentNames.join(', ')}
              </div>
            )}
          </div>

          {/* Previous explanation retained in history */}
          {report.previousExplanation && (
            <div className="pt-2 border-t border-[#E5DED5] text-[11px] text-[#66615D]">
              <span className="font-semibold block text-[#781C2B]">
                Prior pending reason recorded:
              </span>
              <p className="italic mt-0.5">"{report.previousExplanation}"</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              disabled
              className="w-full py-3 px-4 text-xs font-bold text-[#2E7D5B] bg-[#E7F3EC] border border-[#2E7D5B]/30 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>✓ SHARED IN WHATSAPP</span>
            </button>
            <p className="text-[11px] text-[#66615D] text-center mt-1">
              You have already marked this report as shared for {formatToDDMMYYYY(activeReportDate)}.
            </p>
          </div>
        </div>
      ) : (
        /* STATUS NOT SHARED -> SUBMISSION FORM */
        <div className="space-y-5 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold font-serif text-[#292929]">
              Report Shared?
            </h4>
            <span className="text-[11px] text-[#66615D]">
              Choose one of the two options below:
            </span>
          </div>

          {/* OPTION 1: 🟢 MARK AS SHARED BUTTON */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E7D5B] block">
              Option 1: If Shared in WhatsApp
            </span>
            {canSubmit ? (
              <button
                type="button"
                onClick={handleMarkAsSharedClick}
                className="w-full py-4 px-6 text-base font-bold text-white bg-[#781C2B] hover:bg-[#5F1623] active:bg-[#461019] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>🟢 MARK AS SHARED</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-4 px-6 text-base font-bold text-[#66615D] bg-[#E5DED5]/60 rounded-xl transition-all flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Lock className="w-5 h-5" />
                <span>
                  {!isSubmissionActive
                    ? 'Submissions Locked by Admin'
                    : `Submissions Inactive (Admin activated ${activeCurriculum})`}
                </span>
              </button>
            )}
            <span className="text-[10px] text-[#66615D] text-center block">
              {canSubmit
                ? `Click after sharing the report in the official WhatsApp group for ${formatToDDMMYYYY(activeReportDate)}`
                : !isSubmissionActive
                ? `The Activity Coordinator has deactivated submissions for this date. Modifications are locked.`
                : `Admin has currently activated ${activeCurriculum}. This report is under ${report.curriculum}.`}
            </span>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#E5DED5]"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-[#66615D] uppercase tracking-wider bg-white px-2">
              OR
            </span>
            <div className="flex-grow border-t border-[#E5DED5]"></div>
          </div>

          {/* OPTION 2: 🔴 NOT SHARED / PROVIDE EXPLANATION */}
          <div className="bg-[#F8F5EF] p-4 sm:p-5 rounded-2xl border border-[#E5DED5] space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs">🔴</span>
              <h5 className="text-xs sm:text-sm font-bold text-[#292929]">
                Option 2: Not Shared (Reason Required)
              </h5>
            </div>

            {!canSubmit && (
              <div className="p-2.5 bg-[#F5E8EA] border border-[#781C2B]/20 rounded-lg text-[11px] text-[#781C2B] font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {!isSubmissionActive
                    ? 'Submissions have been locked by the Admin. You cannot modify explanations at this time.'
                    : `Submissions for ${report.curriculum} are inactive (Admin activated ${activeCurriculum}).`}
                </span>
              </div>
            )}

            {/* Existing Submitted Explanation Display */}
            {hasExplanation && !isEditingExplanation ? (
              <div className="bg-white p-3.5 rounded-xl border border-[#E5DED5] space-y-2 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-[#781C2B] uppercase tracking-wider block">
                    Reason Recorded for Admin:
                  </span>
                  <p className="text-sm font-medium text-[#292929] mt-0.5 leading-relaxed">
                    "{report.explanation}"
                  </p>
                </div>

                {report.explanationUpdatedAt && (
                  <p className="text-[11px] text-[#66615D] font-mono border-t border-[#E5DED5]/60 pt-1.5">
                    <strong>Updated on:</strong> {report.explanationUpdatedAt}
                  </p>
                )}

                {canSubmit && (
                  <button
                    type="button"
                    onClick={() => setIsEditingExplanation(true)}
                    className="mt-1 text-xs font-semibold text-[#781C2B] hover:text-[#5F1623] underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Update Reason / Attendance</span>
                  </button>
                )}
              </div>
            ) : canSubmit ? (
              /* Mandatory Reason Text Box */
              <div className="space-y-3">
                {explainError && (
                  <div className="p-2.5 bg-[#F5E8EA] border border-[#781C2B]/30 rounded-lg text-xs text-[#781C2B] font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{explainError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-[#66615D] mb-1">
                    Reason for not sharing the report <span className="text-[#B3261E]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={explanationText}
                    onChange={(e) => {
                      setExplanationText(e.target.value);
                      if (explainError) setExplainError(null);
                    }}
                    placeholder="Please enter the reason for not sharing the report..."
                    className="w-full px-3.5 py-2.5 text-xs text-[#292929] bg-white border border-[#E5DED5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#781C2B] placeholder:text-[#66615D]/60"
                  />
                </div>

                {/* Quick Suggestion Chips */}
                <div>
                  <span className="text-[10px] font-bold text-[#66615D] uppercase tracking-wider block mb-1.5">
                    Quick suggestions (tap to insert):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_REASONS.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => {
                          setExplanationText(reason);
                          if (explainError) setExplainError(null);
                        }}
                        className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#F5E8EA] border border-[#E5DED5] rounded-lg text-[#292929] transition-colors text-left cursor-pointer"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Explanation Button */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveExplanationClick}
                    className="w-full py-2.5 text-xs font-bold text-white bg-[#781C2B] hover:bg-[#5F1623] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Reason & Attendance</span>
                  </button>

                  {hasExplanation && (
                    <button
                      type="button"
                      onClick={() => setIsEditingExplanation(false)}
                      className="px-3 py-2.5 text-xs font-semibold text-[#66615D] hover:bg-[#E5DED5]/40 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
