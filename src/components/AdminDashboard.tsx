import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ClassGroup, ClubReport, Curriculum, SharingStatus } from '../types';
import {
  getDayOfWeekName,
  isNormalScheduledDay,
  getCurriculumScheduleDescription,
} from '../utils/dateUtils';
import {
  Search,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  Check,
  Filter,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Power,
  ShieldAlert,
  Info,
  FileSpreadsheet,
} from 'lucide-react';

const CURRICULUM_OPTIONS: Curriculum[] = ['CBSE', 'IGCSE / CIE'];

export const AdminDashboard: React.FC = () => {
  const {
    reports,
    stats,
    activeReportDate,
    activeCurriculum,
    isSubmissionActive,
    setActiveSession,
    deactivateSubmission,
    adminResetStatus,
    markAsShared,
    resetAllToDefault,
  } = useApp();

  // Admin Controls State (Report Date + Curriculum)
  const [inputDate, setInputDate] = useState(activeReportDate || '2026-10-05');
  const [inputCurriculum, setInputCurriculum] = useState<Curriculum>(activeCurriculum || 'CBSE');
  const [activationMessage, setActivationMessage] = useState<string | null>(null);

  // Filters State within the active curriculum
  const [selectedClass, setSelectedClass] = useState<'ALL' | ClassGroup>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | SharingStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Reset confirmation state
  const [resettingReport, setResettingReport] = useState<ClubReport | null>(null);

  // Filtered reports: strictly by activeCurriculum + optional search/class/status filters
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Must match active curriculum set by Admin
      if (r.curriculum !== activeCurriculum) return false;

      // Class filter
      if (selectedClass !== 'ALL' && r.classGroup !== selectedClass) return false;

      // Status filter
      if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;

      // Search query (by Teacher or Club)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTeacher = r.teacherName.toLowerCase().includes(q);
        const matchesClub = r.clubName.toLowerCase().includes(q);
        if (!matchesTeacher && !matchesClub) return false;
      }

      return true;
    });
  }, [reports, activeCurriculum, selectedClass, selectedStatus, searchQuery]);

  // Available classes for active curriculum
  const availableClassOptions = useMemo(() => {
    const classes = Array.from(
      new Set(reports.filter((r) => r.curriculum === activeCurriculum).map((r) => r.classGroup))
    );
    return ['ALL' as const, ...classes];
  }, [reports, activeCurriculum]);

  // Format date helper: returns DD-MM-YYYY string from ISO or input
  const formatToDDMMYYYY = (isoOrDateStr: string) => {
    if (!isoOrDateStr) return '05-10-2026';
    const parts = isoOrDateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return isoOrDateStr;
  };

  // Day of week for current inputs
  const inputDayOfWeek = getDayOfWeekName(inputDate);
  const isNormalDay = isNormalScheduledDay(inputCurriculum, inputDate);

  // Active session day details
  const activeDayOfWeek = getDayOfWeekName(activeReportDate);

  // Handler to Set / Activate date and curriculum
  const handleActivateSession = () => {
    setActiveSession(inputDate, inputCurriculum, true);
    const dateFormatted = formatToDDMMYYYY(inputDate);
    const dayName = getDayOfWeekName(inputDate);
    setActivationMessage(`Activated: ${inputCurriculum} for ${dayName}, ${dateFormatted}. Only ${inputCurriculum} teachers can submit!`);
    setTimeout(() => setActivationMessage(null), 4500);
  };

  // Handler to Deactivate submission
  const handleDeactivateSession = () => {
    deactivateSubmission();
    setActivationMessage(`Submissions Deactivated for ${activeCurriculum}. Teachers can no longer modify status for this date.`);
    setTimeout(() => setActivationMessage(null), 4500);
  };

  // CSV Generator function based on selected Date + Curriculum
  // Example filename: PSSEMR_CBSE_Club_Report_Status_05-10-2026.csv
  const handleExportCSV = () => {
    const dateFormatted = formatToDDMMYYYY(activeReportDate);
    const currSlug = activeCurriculum === 'CBSE' ? 'CBSE' : 'CIE';

    // Required CSV Columns:
    // 1. Teacher Name, 2. Curriculum, 3. Class Group, 4. Club Name, 5. Coordinator,
    // 6. Status, 7. Explanation / Reason, 8. Shared Date, 9. Shared Time, 10. Last Updated
    const headers = [
      'Teacher Name',
      'Curriculum',
      'Class Group',
      'Club Name',
      'Coordinator',
      'Status',
      'Explanation / Reason',
      'Shared Date',
      'Shared Time',
      'Last Updated',
    ];

    const recordsToExport = filteredReports;

    const rows = recordsToExport.map((r) => {
      const isShared = r.status === 'SHARED';
      let explanation = '—';
      if (!isShared) {
        explanation = r.explanation && r.explanation.trim() ? r.explanation : 'Explanation Required';
      } else if (r.previousExplanation) {
        explanation = `Prior reason: ${r.previousExplanation}`;
      }

      const formattedSharedDate = isShared ? dateFormatted : '—';
      const formattedSharedTime = isShared ? r.sharedTime : '—';
      const lastUpdated = r.explanationUpdatedAt || (isShared ? `${dateFormatted}, ${formattedSharedTime}` : dateFormatted);

      return [
        `"${r.teacherName.replace(/"/g, '""')}"`,
        `"${r.curriculum}"`,
        `"${r.classGroup.replace(/"/g, '""')}"`,
        `"${r.clubName.replace(/"/g, '""')}"`,
        `"${r.teacherName.replace(/"/g, '""')}"`,
        `"${isShared ? 'Shared' : 'Not Shared'}"`,
        `"${explanation.replace(/"/g, '""')}"`,
        `"${formattedSharedDate}"`,
        `"${formattedSharedTime}"`,
        `"${lastUpdated.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Filename format: PSSEMR_CBSE_Club_Report_Status_05-10-2026.csv
    const fileName = `PSSEMR_${currSlug}_Club_Report_Status_${dateFormatted}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccessMessage(`Downloaded ${fileName} (${recordsToExport.length} records)`);
    setTimeout(() => setExportSuccessMessage(null), 4000);
  };

  const handleConfirmReset = () => {
    if (!resettingReport) return;
    adminResetStatus(resettingReport.id);
    setResettingReport(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Toast message upon Activation / Deactivation */}
      {activationMessage && (
        <div className="bg-[#781C2B] text-white p-3.5 rounded-xl shadow-md text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            {activationMessage}
          </span>
          <button
            onClick={() => setActivationMessage(null)}
            className="text-white hover:text-amber-200 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Toast message upon CSV download */}
      {exportSuccessMessage && (
        <div className="bg-[#2E7D5B] text-white p-3.5 rounded-xl shadow-md text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            {exportSuccessMessage}
          </span>
          <button
            onClick={() => setExportSuccessMessage(null)}
            className="text-white hover:text-emerald-200 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner: Dashboard Heading & Institutional Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-[#781C2B] uppercase tracking-wider block">
            PSSEMR Activity Office
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#292929] mt-0.5">
            Club Report Sharing Status
          </h1>
          <p className="text-xs text-[#66615D]">
            Official Administrator Hub — Control Report Date & Curriculum, monitor teacher WhatsApp submissions
          </p>
        </div>

        {/* Global Reset */}
        <button
          onClick={resetAllToDefault}
          className="self-start md:self-auto text-xs font-semibold text-[#66615D] hover:text-[#781C2B] flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E5DED5] rounded-xl transition-colors shadow-2xs"
          title="Reset to default initial records"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. TEACHER ACTIVATION SCHEDULE REFERENCE CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5DED5] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#781C2B]" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#781C2B]">
                Teacher Activation Schedule
              </h2>
            </div>
            <p className="text-xs text-[#66615D]">
              Admin can manually activate the website on any date whenever required. Normal schedule:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F8F5EF] px-3 py-1.5 rounded-xl border border-[#E5DED5] text-xs">
              <strong className="text-[#781C2B]">CBSE:</strong>
              <span className="font-semibold text-[#292929]">Normal Active Day: Saturday</span>
            </div>
            <div className="flex items-center gap-2 bg-[#F8F5EF] px-3 py-1.5 rounded-xl border border-[#E5DED5] text-xs">
              <strong className="text-[#781C2B]">IGCSE / CIE:</strong>
              <span className="font-semibold text-[#292929]">Normal Active Days: Tuesday & Wednesday</span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ADMIN CONTROLS PANEL: Report Date + Curriculum + [ Set / Activate ] + [ Deactivate ] + [ Export CSV ] */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#781C2B]/30 shadow-sm space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Controls: Report Date + Curriculum + Set / Activate Button */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* 1. Report Date */}
            <div className="flex items-center gap-2 bg-[#F8F5EF] px-3 py-2 rounded-xl border border-[#E5DED5]">
              <Calendar className="w-4 h-4 text-[#781C2B] shrink-0" />
              <label htmlFor="admin-report-date" className="text-xs font-bold text-[#292929] whitespace-nowrap">
                Report Date:
              </label>
              <input
                id="admin-report-date"
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="px-2.5 py-1 text-xs font-semibold text-[#292929] bg-white border border-[#E5DED5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#781C2B]"
              />
              <span className="inline-block px-2 py-0.5 text-[11px] font-mono font-bold bg-[#F5E8EA] text-[#781C2B] rounded">
                [{formatToDDMMYYYY(inputDate)}]
              </span>
              {inputDayOfWeek && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  isNormalDay ? 'bg-emerald-100 text-[#2E7D5B]' : 'bg-amber-100 text-[#9A6A16]'
                }`}>
                  {inputDayOfWeek} {isNormalDay ? '(Normal schedule)' : '(Manual override)'}
                </span>
              )}
            </div>

            {/* 2. Curriculum Dropdown */}
            <div className="flex items-center gap-2 bg-[#F8F5EF] px-3 py-2 rounded-xl border border-[#E5DED5]">
              <Layers className="w-4 h-4 text-[#781C2B] shrink-0" />
              <label htmlFor="admin-curriculum" className="text-xs font-bold text-[#292929] whitespace-nowrap">
                Curriculum:
              </label>
              <select
                id="admin-curriculum"
                value={inputCurriculum}
                onChange={(e) => setInputCurriculum(e.target.value as Curriculum)}
                className="px-3 py-1 text-xs font-bold text-[#781C2B] bg-white border border-[#E5DED5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#781C2B]"
              >
                {CURRICULUM_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c} (Normal: {getCurriculumScheduleDescription(c)})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. [ Set / Activate ] Action Button */}
            <button
              type="button"
              onClick={handleActivateSession}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#781C2B] hover:bg-[#5F1623] active:bg-[#461019] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Set / Activate</span>
            </button>

            {/* 4. [ Deactivate ] Action Button (Closes submissions) */}
            {isSubmissionActive && (
              <button
                type="button"
                onClick={handleDeactivateSession}
                className="px-3.5 py-2.5 text-xs font-semibold text-[#66615D] hover:text-[#B3261E] hover:bg-[#F5E8EA] bg-white border border-[#E5DED5] rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                title="Deactivate submission: Teachers can no longer modify that day's status"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Deactivate Submissions</span>
              </button>
            )}

          </div>

          {/* Export CSV for active Date + Curriculum */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-[#781C2B] bg-[#F5E8EA] hover:bg-[#781C2B] hover:text-white border border-[#781C2B]/30 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap"
              title={`Download CSV: PSSEMR_${activeCurriculum === 'CBSE' ? 'CBSE' : 'CIE'}_Club_Report_Status_${formatToDDMMYYYY(activeReportDate)}.csv`}
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Export CSV ({activeCurriculum})</span>
            </button>
          </div>

        </div>

        {/* Current Active Status Indicator banner */}
        <div className="pt-2 border-t border-[#E5DED5] flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isSubmissionActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-[#66615D]">
              Active System Session: <strong className="text-[#781C2B] font-semibold">{activeCurriculum}</strong> on{' '}
              <strong className="text-[#292929] font-mono">{formatToDDMMYYYY(activeReportDate)}</strong> ({activeDayOfWeek})
            </span>
            {isSubmissionActive ? (
              <span className="px-2 py-0.5 rounded bg-[#E7F3EC] text-[#2E7D5B] text-[10px] font-bold">
                STATUS: ACTIVE (SUBMISSIONS OPEN)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-[#F5E8EA] text-[#B3261E] text-[10px] font-bold">
                STATUS: DEACTIVATED (SUBMISSIONS LOCKED)
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#66615D]">
            {isSubmissionActive
              ? `Only ${activeCurriculum} teachers can submit reports for this active date.`
              : `Submissions locked by Admin. Teachers cannot modify today's status.`}
          </span>
        </div>

      </div>

      {/* FOUR SUMMARY CARDS (FOR ACTIVE CURRICULUM) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* TOTAL */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5DED5] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#66615D] block">
            TOTAL ({activeCurriculum})
          </span>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-[#292929] mt-1 tabular-nums">
            {stats.total}
          </div>
          <span className="text-[11px] text-[#66615D] mt-1 block">
            Clubs in {activeCurriculum}
          </span>
        </div>

        {/* SHARED */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'SHARED' ? 'ALL' : 'SHARED')}
          className={`bg-[#E7F3EC] rounded-2xl p-4 sm:p-5 border shadow-xs cursor-pointer transition-all flex flex-col justify-between ${
            selectedStatus === 'SHARED' ? 'ring-2 ring-[#2E7D5B] border-transparent' : 'border-[#2E7D5B]/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D5B]">
              SHARED
            </span>
            <span className="text-xs">🟢</span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-[#2E7D5B] mt-1 tabular-nums">
            {stats.shared}
          </div>
          <span className="text-[11px] text-[#2E7D5B]/80 font-medium mt-1 block">
            Confirmed in WhatsApp
          </span>
        </div>

        {/* NOT SHARED */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'NOT SHARED' ? 'ALL' : 'NOT SHARED')}
          className={`bg-[#F5E8EA] rounded-2xl p-4 sm:p-5 border shadow-xs cursor-pointer transition-all flex flex-col justify-between ${
            selectedStatus === 'NOT SHARED' ? 'ring-2 ring-[#781C2B] border-transparent' : 'border-[#781C2B]/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#781C2B]">
              NOT SHARED
            </span>
            <span className="text-xs">🔴</span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-[#781C2B] mt-1 tabular-nums">
            {stats.notShared}
          </div>
          <span className="text-[11px] text-[#781C2B]/80 font-medium mt-1 block">
            Pending confirmation
          </span>
        </div>

        {/* EXPLANATIONS SUBMITTED */}
        <div className="bg-[#FFFDF9] rounded-2xl p-4 sm:p-5 border border-[#E5DED5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66615D] block">
              EXPLANATIONS
            </span>
            <HelpCircle className="w-4 h-4 text-[#781C2B]" />
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-[#781C2B] mt-1 tabular-nums">
            {stats.explanationsSubmitted}
            <span className="text-sm font-sans font-normal text-[#66615D]"> / {stats.notShared}</span>
          </div>
          <span className="text-[11px] text-[#66615D] mt-1 block">
            {stats.explanationsRequired > 0 ? (
              <strong className="text-[#9A6A16]">{stats.explanationsRequired} missing explanation</strong>
            ) : (
              <span className="text-[#2E7D5B] font-medium">All reasons submitted</span>
            )}
          </span>
        </div>

      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5DED5] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          
          {/* 🔍 Search by Teacher or Club (6 cols) */}
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#66615D] mb-1">
              🔍 Search ({activeCurriculum})
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#66615D] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search teacher or club in ${activeCurriculum}...`}
                className="w-full pl-9 pr-3 py-2 text-xs text-[#292929] bg-white border border-[#E5DED5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#781C2B]"
              />
            </div>
          </div>

          {/* Class Filter (3 cols) */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#66615D] mb-1">
              Class Group
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as any)}
              className="w-full px-3 py-2 text-xs text-[#292929] bg-white border border-[#E5DED5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#781C2B]"
            >
              {availableClassOptions.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Classes' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter (3 cols) */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#66615D] mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs text-[#292929] bg-white border border-[#E5DED5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#781C2B]"
            >
              <option value="ALL">All Statuses</option>
              <option value="SHARED">🟢 Shared</option>
              <option value="NOT SHARED">🔴 Not Shared</option>
            </select>
          </div>

        </div>

        {/* Clear Filters helper */}
        {(selectedClass !== 'ALL' || selectedStatus !== 'ALL' || searchQuery !== '') && (
          <div className="flex items-center justify-between pt-1 border-t border-[#E5DED5]/60 text-xs">
            <span className="text-[#66615D]">
              Filtered results: <strong className="text-[#781C2B]">{filteredReports.length}</strong> record(s)
            </span>
            <button
              onClick={() => {
                setSelectedClass('ALL');
                setSelectedStatus('ALL');
                setSearchQuery('');
              }}
              className="font-semibold text-[#781C2B] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MAIN ADMIN STATUS TABLE WITH EXACT SPECIFIED COLUMNS: */}
      {/* Curriculum | Class Group | Club | Teacher | Status | Explanation | Shared Time | Action */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#E5DED5] shadow-xs overflow-hidden">
        
        <div className="p-4 bg-[#F8F5EF] border-b border-[#E5DED5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <h3 className="font-bold text-[#292929] font-serif text-sm">
              Club Report Sharing Status Table
            </h3>
            <span className="text-[11px] text-[#66615D]">
              Curriculum: <strong className="text-[#781C2B]">{activeCurriculum}</strong> · Active Date:{' '}
              <strong className="text-[#292929] font-mono">{formatToDDMMYYYY(activeReportDate)}</strong> ({activeDayOfWeek})
            </span>
          </div>
          <span className="text-[#66615D] font-mono text-[11px]">
            Showing <strong>{filteredReports.length}</strong> of{' '}
            {reports.filter((r) => r.curriculum === activeCurriculum).length} {activeCurriculum} clubs
          </span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#66615D]">
            No records found for {activeCurriculum} matching your search or filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5E8EA] border-b border-[#E5DED5] text-[#781C2B] font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 whitespace-nowrap">Curriculum</th>
                  <th className="py-3 px-4 whitespace-nowrap">Class Group</th>
                  <th className="py-3 px-4 whitespace-nowrap">Club</th>
                  <th className="py-3 px-4 whitespace-nowrap">Teacher</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 min-w-[220px]">Explanation</th>
                  <th className="py-3 px-4 whitespace-nowrap">Shared Time</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DED5]/60 bg-white">
                {filteredReports.map((report) => {
                  const isShared = report.status === 'SHARED';
                  const hasExplanation = Boolean(report.explanation && report.explanation.trim());
                  const formattedDisplayTime = isShared ? report.sharedTime : '—';

                  return (
                    <tr
                      key={report.id}
                      className={`hover:bg-[#FCF7F5] transition-colors ${
                        !isShared && !hasExplanation ? 'bg-[#FBF1D9]/20' : ''
                      }`}
                    >
                      {/* Curriculum */}
                      <td className="py-3.5 px-4 font-bold text-[#781C2B] whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-[#F5E8EA] rounded text-[11px]">
                          {report.curriculum}
                        </span>
                      </td>

                      {/* Class Group */}
                      <td className="py-3.5 px-4 font-semibold text-[#292929] whitespace-nowrap">
                        {report.classGroup}
                      </td>

                      {/* Club */}
                      <td className="py-3.5 px-4 font-bold text-[#292929] whitespace-nowrap">
                        {report.clubName}
                      </td>

                      {/* Teacher */}
                      <td className="py-3.5 px-4 text-[#292929] whitespace-nowrap font-medium">
                        {report.teacherName}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isShared ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[#2E7D5B] bg-[#E7F3EC] px-2.5 py-1 rounded-full text-[11px] border border-[#2E7D5B]/30">
                            Shared
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-[#781C2B] bg-[#F5E8EA] px-2.5 py-1 rounded-full text-[11px] border border-[#781C2B]/30">
                            Not Shared
                          </span>
                        )}
                      </td>

                      {/* Explanation */}
                      <td className="py-3.5 px-4">
                        {isShared ? (
                          report.previousExplanation ? (
                            <span className="text-[11px] text-[#66615D] italic" title={`Prior pending reason: ${report.previousExplanation}`}>
                              — (Prior: "{report.previousExplanation}")
                            </span>
                          ) : (
                            <span className="text-[#66615D]/40">—</span>
                          )
                        ) : hasExplanation ? (
                          <div className="space-y-0.5">
                            <p className="font-medium text-[#292929] leading-snug">
                              {report.explanation}
                            </p>
                            {report.explanationUpdatedAt && (
                              <span className="text-[10px] text-[#66615D] font-mono block">
                                Updated: {report.explanationUpdatedAt}
                              </span>
                            )}
                          </div>
                        ) : (
                          /* Explanation Required Alert */
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FBF1D9] text-[#9A6A16] border border-[#C58A24]/40 rounded-md text-[11px] font-bold">
                            <AlertTriangle className="w-3 h-3 text-[#9A6A16] shrink-0" />
                            <span>⚠️ Explanation Required</span>
                          </div>
                        )}
                      </td>

                      {/* Shared Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[#66615D]">
                        {formattedDisplayTime}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isShared ? (
                          <button
                            type="button"
                            onClick={() => setResettingReport(report)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-[#66615D] hover:text-[#781C2B] hover:bg-[#F5E8EA] border border-[#E5DED5] rounded-lg transition-colors inline-flex items-center gap-1"
                            title="Reset to Not Shared"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => markAsShared(report.id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#781C2B] hover:bg-[#5F1623] rounded-lg transition-colors"
                            title="Mark as Shared on teacher's behalf"
                          >
                            Mark Shared
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Reset Confirmation Dialog */}
      {resettingReport && (
        <div className="fixed inset-0 z-50 bg-[#292929]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E5DED5]">
            <h3 className="text-base font-bold font-serif text-[#292929] mb-2">
              Reset Report Status
            </h3>
            <p className="text-xs text-[#66615D] leading-relaxed mb-4">
              Are you sure you want to reset this report status to <strong>Not Shared</strong> for <strong>{resettingReport.clubName} ({resettingReport.classGroup})</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5DED5]">
              <button
                type="button"
                onClick={() => setResettingReport(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[#66615D] hover:bg-[#F8F5EF] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-bold text-white bg-[#781C2B] hover:bg-[#5F1623] rounded-xl transition-colors"
              >
                Yes, Reset Status
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
