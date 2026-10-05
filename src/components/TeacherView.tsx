import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ClubReport } from '../types';
import { PSSEMRLogo } from './PSSEMRLogo';
import {
  getDayOfWeekName,
  getCurriculumScheduleDescription,
} from '../utils/dateUtils';
import {
  Check,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  HelpCircle,
  Edit2,
  Send,
  Lock,
  Calendar,
  History,
} from 'lucide-react';

const SUGGESTED_REASONS = [
  'Report is still being prepared.',
  'Waiting for photographs from the activity.',
  'Activity was conducted recently.',
  'Report needs correction.',
  'Waiting for information from students.',
  'Will share tomorrow.',
];

export const TeacherView: React.FC = () => {
  const {
    currentUser,
    reports,
    activeReportDate,
    activeCurriculum,
    isSubmissionActive,
    markAsShared,
    submitExplanation,
  } = useApp();
  
  // State for confirm modal
  const [confirmReport, setConfirmReport] = useState<ClubReport | null>(null);
  
  // State for editing explanation per report ID
  const [activeExplainId, setActiveExplainId] = useState<string | null>(null);
  const [explanationText, setExplanationText] = useState('');
  const [explainError, setExplainError] = useState('');
  const [justSubmittedExplainId, setJustSubmittedExplainId] = useState<string | null>(null);

  // Format date helper: returns DD-MM-YYYY string from ISO or input
  const formatToDDMMYYYY = (isoOrDateStr: string) => {
    if (!isoOrDateStr) return '05-10-2026';
    const parts = isoOrDateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return isoOrDateStr;
  };

  // Filter reports belonging strictly to this logged-in teacher
  const myClubReports = useMemo(() => {
    if (!currentUser) return [];
    return reports.filter((r) => r.teacherName === currentUser.name);
  }, [reports, currentUser]);

  // Check if teacher has assignments in the active curriculum
  const myActiveCurriculumReports = useMemo(() => {
    return myClubReports.filter((r) => r.curriculum === activeCurriculum);
  }, [myClubReports, activeCurriculum]);

  const teacherHasCurriculum = myActiveCurriculumReports.length > 0;

  const handleStartExplanation = (report: ClubReport) => {
    setActiveExplainId(report.id);
    setExplanationText(report.explanation || '');
    setExplainError('');
  };

  const handleSaveExplanation = (reportId: string) => {
    if (!explanationText.trim()) {
      setExplainError('Please provide an explanation before submitting.');
      return;
    }
    const success = submitExplanation(reportId, explanationText);
    if (success) {
      setJustSubmittedExplainId(reportId);
      setActiveExplainId(null);
      setExplanationText('');
      setExplainError('');
      setTimeout(() => setJustSubmittedExplainId(null), 4000);
    }
  };

  const handleConfirmShare = () => {
    if (!confirmReport) return;
    markAsShared(confirmReport.id);
    setConfirmReport(null);
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Mobile-First Header with Official Logo */}
      <div className="text-center sm:text-left flex flex-col sm:flex-row items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E5DED5] shadow-xs">
        <PSSEMRLogo className="h-12 sm:h-14 w-auto object-contain shrink-0" />
        <div>
          <span className="text-[11px] font-bold text-[#781C2B] uppercase tracking-wider block">
            PSSEMR School & PU College
          </span>
          <h1 className="text-lg sm:text-xl font-serif font-bold text-[#292929]">
            Club Report Tracker
          </h1>
          <p className="text-xs text-[#66615D]">
            Official WhatsApp Report Sharing Confirmation
          </p>
        </div>
      </div>

      {/* Greeting Banner & Active Session Notification */}
      <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#E5DED5] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-[#66615D]">Logged in Coordinator:</span>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-[#781C2B]">
              Welcome, {currentUser.name}
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F5E8EA] text-[#781C2B] border border-[#781C2B]/30">
            {myClubReports[0]?.curriculum || 'Teacher'}
          </span>
        </div>

        {/* Current Active Report Session Info */}
        <div className="pt-2.5 border-t border-[#E5DED5] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSubmissionActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            ></span>
            <span className="text-[#292929]">
              Active Session: <strong>{activeCurriculum}</strong> on{' '}
              <strong className="font-mono text-[#781C2B]">[{formatToDDMMYYYY(activeReportDate)}]</strong>
            </span>
          </div>

          {isSubmissionActive ? (
            <span className="text-[11px] font-bold text-[#2E7D5B] bg-[#E7F3EC] px-2.5 py-0.5 rounded border border-[#2E7D5B]/30">
              STATUS: ACTIVE (OPEN)
            </span>
          ) : (
            <span className="text-[11px] font-bold text-[#B3261E] bg-[#F5E8EA] px-2.5 py-0.5 rounded border border-[#B3261E]/30">
              STATUS: DEACTIVATED (LOCKED)
            </span>
          )}
        </div>

        {/* If Admin has deactivated submissions entirely */}
        {!isSubmissionActive && (
          <div className="p-3 bg-[#F5E8EA] border border-[#781C2B]/30 rounded-xl text-xs text-[#781C2B] flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Submissions Locked by Admin</strong>
              <span>
                The Activity Coordinator has deactivated submissions for {activeCurriculum} ({formatToDDMMYYYY(activeReportDate)}). Teachers can no longer modify that day's status.
              </span>
            </div>
          </div>
        )}

        {/* If teacher's curriculum does NOT match the active curriculum set by Admin */}
        {isSubmissionActive && !teacherHasCurriculum && (
          <div className="p-3 bg-[#FBF1D9] border border-[#C58A24]/40 rounded-xl text-xs text-[#9A6A16] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Submissions Paused for Your Curriculum</strong>
              <span>
                The Admin has currently activated <strong>{activeCurriculum}</strong> for date <strong>{formatToDDMMYYYY(activeReportDate)}</strong>.
                You cannot submit reports until Admin activates your curriculum.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Club Assignment Cards */}
      {myClubReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 border border-[#E5DED5] text-center text-xs text-[#66615D]">
          No club assignments found for {currentUser.name}. Please contact the Activity Coordinator.
        </div>
      ) : (
        <div className="space-y-6">
          {myClubReports.map((report) => {
            const isShared = report.status === 'SHARED';
            const hasExplanation = Boolean(report.explanation && report.explanation.trim());
            const isEditingExplanation = activeExplainId === report.id;
            const wasJustSubmitted = justSubmittedExplainId === report.id;
            // Can only submit if session is active AND this club's curriculum matches active session
            const isCurriculumActive = report.curriculum === activeCurriculum;
            const canSubmit = isSubmissionActive && isCurriculumActive;

            return (
              <div
                key={report.id}
                className={`bg-white rounded-2xl p-5 sm:p-6 border-2 transition-all space-y-5 ${
                  canSubmit
                    ? 'border-[#E5DED5] shadow-xs hover:border-[#781C2B]/40'
                    : 'border-[#E5DED5]/60 bg-gray-50/50 opacity-90'
                }`}
              >
                {/* Success feedback toast when explanation is submitted */}
                {wasJustSubmitted && (
                  <div className="p-3 bg-[#E7F3EC] border border-[#2E7D5B]/30 rounded-xl text-xs text-[#2E7D5B] font-bold flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Explanation recorded and sent to Activity Coordinator.</span>
                  </div>
                )}

                {/* Section: Your Assignment */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#66615D] uppercase tracking-wider block">
                      Your Assignment ({report.curriculum})
                    </span>
                    {canSubmit ? (
                      <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E7F3EC] px-2 py-0.5 rounded-full border border-[#2E7D5B]/30">
                        Active for Today
                      </span>
                    ) : !isSubmissionActive ? (
                      <span className="text-[10px] font-bold text-[#B3261E] bg-[#F5E8EA] px-2 py-0.5 rounded-full border border-[#B3261E]/30 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Submissions Locked
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#66615D] bg-[#F8F5EF] px-2 py-0.5 rounded-full border border-[#E5DED5]">
                        Curriculum Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between gap-2 mt-1">
                    <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#292929]">
                      {report.clubName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#F8F5EF] border border-[#E5DED5] text-xs font-bold text-[#781C2B]">
                      {report.classGroup}
                    </span>
                  </div>
                </div>

                {/* Section: Report Status Badge */}
                <div className="pt-3 border-t border-[#E5DED5]/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#66615D] uppercase tracking-wider">
                    Report Status
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

                {/* IF STATUS IS SHARED */}
                {isShared ? (
                  <div className="space-y-3 bg-[#F8F5EF] p-4 rounded-xl border border-[#E5DED5] text-xs text-[#292929]">
                    <div className="flex items-center gap-2 text-[#2E7D5B] font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Report marked as Shared</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p>
                        <strong className="text-[#66615D]">Shared by:</strong> {report.sharedBy || report.teacherName}
                      </p>
                      <p>
                        <strong className="text-[#66615D]">Date:</strong> {report.sharedDate}
                      </p>
                      <p>
                        <strong className="text-[#66615D]">Time:</strong> {report.sharedTime}
                      </p>
                    </div>

                    {/* Previous explanation retained in history */}
                    {report.previousExplanation && (
                      <div className="pt-2 border-t border-[#E5DED5] text-[11px] text-[#66615D]">
                        <span className="font-semibold block text-[#781C2B]">Prior pending reason recorded:</span>
                        <p className="italic mt-0.5">"{report.previousExplanation}"</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#E5DED5]">
                      <button
                        type="button"
                        disabled
                        className="w-full py-3 px-4 text-xs font-bold text-[#2E7D5B] bg-[#E7F3EC] border border-[#2E7D5B]/30 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>✓ SHARED</span>
                      </button>
                      <p className="text-[11px] text-[#66615D] text-center mt-1">
                        You have already marked this report as shared.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* IF STATUS IS NOT SHARED -> TWO PROMINENT OPTIONS */
                  <div className="space-y-5 pt-1">
                    
                    {/* OPTION 1: MARK AS SHARED BUTTON */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E7D5B] block">
                        Option 1: If Shared in WhatsApp
                      </span>
                      {canSubmit ? (
                        <button
                          type="button"
                          onClick={() => setConfirmReport(report)}
                          className="w-full py-4 px-6 text-base font-bold text-white bg-[#781C2B] hover:bg-[#5F1623] active:bg-[#461019] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                          <span>✓ MARK AS SHARED</span>
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

                    {/* OPTION 2: NOT SHARED / PROVIDE EXPLANATION */}
                    <div className="bg-[#F8F5EF] p-4 sm:p-5 rounded-xl border border-[#E5DED5] space-y-3">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-[#781C2B] shrink-0" />
                        <h4 className="text-xs sm:text-sm font-bold text-[#292929]">
                          Option 2: Why have you not shared the report?
                        </h4>
                      </div>

                      {!canSubmit && (
                        <div className="p-2.5 bg-[#F5E8EA] border border-[#781C2B]/20 rounded-lg text-[11px] text-[#781C2B] font-medium flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {!isSubmissionActive
                              ? "Submissions have been locked by the Admin. You cannot modify explanations at this time."
                              : `Submissions for ${report.curriculum} are inactive (Admin activated ${activeCurriculum}).`}
                          </span>
                        </div>
                      )}

                      {/* Display existing submitted explanation if not currently editing */}
                      {hasExplanation && !isEditingExplanation ? (
                        <div className="bg-white p-3.5 rounded-xl border border-[#E5DED5] space-y-2 text-xs">
                          <div>
                            <span className="text-[11px] font-bold text-[#781C2B] uppercase tracking-wider block">
                              Reason Recorded:
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
                              onClick={() => handleStartExplanation(report)}
                              className="mt-1 text-xs font-semibold text-[#781C2B] hover:text-[#5F1623] underline flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Update Explanation</span>
                            </button>
                          )}
                        </div>
                      ) : canSubmit ? (
                        /* Mandatory Text Box to Submit or Edit Explanation */
                        <div className="space-y-3">
                          {explainError && (
                            <div className="p-2.5 bg-[#F5E8EA] border border-[#781C2B]/30 rounded-lg text-xs text-[#781C2B] font-semibold flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{explainError}</span>
                            </div>
                          )}

                          <div>
                            <label className="block text-[11px] font-semibold text-[#66615D] mb-1">
                              Mandatory Explanation for Admin <span className="text-[#B3261E]">*</span>
                            </label>
                            <textarea
                              rows={3}
                              value={isEditingExplanation ? explanationText : ''}
                              onFocus={() => {
                                if (!isEditingExplanation) {
                                  handleStartExplanation(report);
                                }
                              }}
                              onChange={(e) => {
                                setExplanationText(e.target.value);
                                if (explainError) setExplainError('');
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
                                    setActiveExplainId(report.id);
                                    setExplanationText(reason);
                                    setExplainError('');
                                  }}
                                  className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#F5E8EA] border border-[#E5DED5] rounded-lg text-[#292929] transition-colors text-left"
                                >
                                  {reason}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Submit button */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleSaveExplanation(report.id)}
                              className="w-full py-2.5 text-xs font-bold text-white bg-[#781C2B] hover:bg-[#5F1623] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit Explanation</span>
                            </button>

                            {hasExplanation && (
                              <button
                                type="button"
                                onClick={() => setActiveExplainId(null)}
                                className="px-3 py-2.5 text-xs font-semibold text-[#66615D] hover:bg-[#E5DED5]/40 rounded-xl"
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
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmReport && (
        <div className="fixed inset-0 z-50 bg-[#292929]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E5DED5] animate-in fade-in zoom-in-95 duration-150">
            
            <h3 className="text-lg font-bold font-serif text-[#292929] mb-2">
              Confirm Report Sharing
            </h3>

            <p className="text-xs sm:text-sm text-[#292929] leading-relaxed mb-4">
              Have you already shared the club report for <strong>{confirmReport.clubName} ({confirmReport.classGroup})</strong> in the official WhatsApp group?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5DED5]">
              <button
                type="button"
                onClick={() => setConfirmReport(null)}
                className="px-4 py-2.5 text-xs font-semibold text-[#66615D] hover:bg-[#F8F5EF] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmShare}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#781C2B] hover:bg-[#5F1623] rounded-xl transition-all shadow-xs"
              >
                Yes, Mark as Shared
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
