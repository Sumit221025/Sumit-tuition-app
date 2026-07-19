import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CreditCard,
  GripVertical,
  Info,
  ChevronRight,
  Camera,
  Circle,
  MessageSquareText,
  FileText,
  X,
  Eye,
  Download,
  AlertCircle,
  Cpu,
  Atom,
  FlaskConical,
  Dna,
  Globe,
  Scroll,
  Languages,
  CalendarDays,
  Clock3,
  CircleDollarSign,
  ReceiptText,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { motion } from "motion/react";
import { Student, ChapterNote } from "../types";
import { ALL_ACADEMIC_MONTHS, MONTH_NAMES } from "../utils/monthHelper";

interface StudentDashboardProps {
  student: Student;
  onSelectSubject: (subject: string) => void;
  onNavigateToTab: (tab: "Settings" | "My") => void;
  onOpenAvatarModal: () => void;
  onUpdateChapterRemark: (subject: string, noteId: string, remark: string) => void;
}

type TileSize = "1x1" | "2x1" | "1x2" | "2x2" | "1x3" | "3x1" | "1/2x1" | "1x1/2" | "2x3" | "3x2";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

interface SubjectColorPalette {
  from: string;
  bg: string;
  text: string;
  darkText: string;
  accent: string;
  ring: string;
  badge: string;
  badgeText: string;
}

interface SubjectCardPalette {
  shell: string;
  accent: string;
  ring: string;
  chip: string;
  text: string;
  shadow: string;
}

function getSubjectCardPalette(index: number): SubjectCardPalette {
  const palettes: SubjectCardPalette[] = [
    {
      shell: "from-sky-600/95 via-blue-600/95 to-indigo-700/95",
      accent: "text-sky-700",
      ring: "text-sky-600",
      chip: "bg-sky-100/80 text-sky-700",
      text: "text-slate-900",
      shadow: "shadow-[0_24px_70px_rgba(59,130,246,0.16)]"
    },
    {
      shell: "from-emerald-600/95 via-teal-500/95 to-cyan-600/95",
      accent: "text-emerald-700",
      ring: "text-emerald-600",
      chip: "bg-emerald-100/80 text-emerald-700",
      text: "text-slate-900",
      shadow: "shadow-[0_24px_70px_rgba(16,185,129,0.16)]"
    },
    {
      shell: "from-orange-500/95 via-amber-500/95 to-yellow-500/95",
      accent: "text-amber-700",
      ring: "text-amber-600",
      chip: "bg-amber-100/80 text-amber-700",
      text: "text-slate-900",
      shadow: "shadow-[0_24px_70px_rgba(245,158,11,0.16)]"
    },
    {
      shell: "from-violet-600/95 via-fuchsia-600/95 to-purple-700/95",
      accent: "text-violet-700",
      ring: "text-violet-600",
      chip: "bg-violet-100/80 text-violet-700",
      text: "text-slate-900",
      shadow: "shadow-[0_24px_70px_rgba(139,92,246,0.16)]"
    },
    {
      shell: "from-cyan-600/95 via-sky-500/95 to-blue-500/95",
      accent: "text-cyan-700",
      ring: "text-cyan-600",
      chip: "bg-cyan-100/80 text-cyan-700",
      text: "text-slate-900",
      shadow: "shadow-[0_24px_70px_rgba(6,182,212,0.16)]"
    },
    {
      shell: "from-rose-500/95 via-pink-500/95 to-fuchsia-600/95",
      accent: "text-pink-700",
      ring: "text-pink-600",
      chip: "bg-pink-100/80 text-pink-700",
      text: "text-slate-900",
      shadow: "shadow-[0_24px_70px_rgba(236,72,153,0.16)]"
    },
    {
      shell: "from-teal-600/95 via-emerald-500/95 to-green-600/95",
      accent: "text-teal-700",
      ring: "text-teal-600",
      chip: "bg-teal-100/80 text-teal-700",
      text: "text-slate-900",
      shadow: "shadow-[0_24px_70px_rgba(20,184,166,0.16)]"
    }
  ];
  return palettes[index % palettes.length];
}

function getWeeklyAttendanceDays(student: Student) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));

  const entries: Array<{ label: string; key: string; status: "present" | "absent" | "holiday" | "hidden" | "na" }> = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + offset);
    const key = current.toISOString().slice(0, 10);
    const rawValue = student.attendance?.[key];
    const isWeekend = current.getDay() === 0 || current.getDay() === 6;

    if (rawValue === true) {
      entries.push({ label: current.toLocaleDateString("en-IN", { weekday: "short" }), key, status: "present" });
    } else if (rawValue === false) {
      entries.push({ label: current.toLocaleDateString("en-IN", { weekday: "short" }), key, status: "absent" });
    } else if (isWeekend && current.getDay() === 6) {
      entries.push({ label: current.toLocaleDateString("en-IN", { weekday: "short" }), key, status: "holiday" });
    } else if (current.getDay() === 0 && rawValue === undefined) {
      continue;
    } else {
      entries.push({ label: current.toLocaleDateString("en-IN", { weekday: "short" }), key, status: "na" });
    }
  }

  return entries;
}

function getCalendarDaysForCurrentMonth(student: Student) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  const monthDays: Array<{ key: string; value: string | null; status: "present" | "absent" | "holiday" | "na" | "none" }> = [];

  for (let index = 0; index < startWeekday; index += 1) {
    monthDays.push({ key: `empty-${index}`, value: null, status: "none" });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const current = new Date(year, month, day);
    const key = current.toISOString().slice(0, 10);
    const rawValue = student.attendance?.[key];
    let status: "present" | "absent" | "holiday" | "na" | "none" = "none";
    if (rawValue === true) {
      status = "present";
    } else if (rawValue === false) {
      status = "absent";
    } else if (rawValue === "na") {
      status = "na";
    } else if (current.getDay() === 0 || current.getDay() === 6) {
      status = "holiday";
    }
    monthDays.push({ key, value: `${day}`, status });
  }

  return monthDays;
}

interface StudentHeaderProps {
  student: Student;
}

function StudentHeader({ student }: StudentHeaderProps) {
  return (
    <div className="sticky top-0 z-20 mb-4 flex items-center justify-between rounded-[24px] border border-slate-200/70 bg-white/80 px-3.5 py-2.5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]" />
        <span className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-600">
          Student Portal : {student.name.toUpperCase()}
        </span>
      </div>
      <div className="rounded-full border border-slate-200/70 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
        v1.0
      </div>
    </div>
  );
}

interface HeroCardProps {
  student: Student;
  onOpenAvatarModal: () => void;
  formatDate: (value?: string) => string;
}

function HeroCard({ student, onOpenAvatarModal, formatDate }: HeroCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/50 bg-gradient-to-br from-sky-700 via-indigo-700 to-violet-800 p-4 text-white shadow-[0_30px_90px_rgba(37,99,235,0.25)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.12),_transparent_30%)]" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          <button onClick={onOpenAvatarModal} className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/90 bg-white/15 shadow-lg transition-all hover:scale-105" title="Upload and edit photo">
            {student.avatarUrl ? (
              <img src={student.avatarUrl} alt={student.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-black">{getInitials(student.name)}</span>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-sky-100">Personal Student Space</p>
            <h1 className="text-lg font-black text-white">{student.name}</h1>
            <p className="mt-1 text-[12px] text-sky-100/90">Keep track of notes, progress, attendance and many more.</p>
            {student.registrationDate && (
              <p className="mt-1 text-[10px] text-sky-200/90">Joined {formatDate(student.registrationDate)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface WeeklyAttendanceChecklistProps {
  entries: Array<{ label: string; key: string; status: "present" | "absent" | "holiday" | "hidden" | "na" }>;
}

function WeeklyAttendanceChecklist({ entries }: WeeklyAttendanceChecklistProps) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {entries.map((entry) => {
        const isPresent = entry.status === "present";
        const isAbsent = entry.status === "absent";
        const isHoliday = entry.status === "holiday";
        const isHidden = entry.status === "hidden";
        if (isHidden) return null;
        return (
          <div key={entry.key} className={`flex flex-col items-center justify-center rounded-2xl border px-2 py-2 text-center backdrop-blur ${isPresent ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-50" : isAbsent ? "border-rose-400/40 bg-rose-500/20 text-rose-50" : isHoliday ? "border-white/20 bg-white/10 text-slate-100" : "border-white/15 bg-white/10 text-slate-100/80"}`}>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] opacity-80">{entry.label}</div>
            <div className="mt-1 flex h-5 w-5 items-center justify-center text-sm font-black">
              {isPresent ? <CheckCircle2 className="h-4 w-4" /> : isAbsent ? <Circle className="h-4 w-4" /> : isHoliday ? <Circle className="h-4 w-4" /> : <Circle className="h-4 w-4 opacity-70" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  labelClassName?: string;
}

function ProgressRing({ percent, size = 70, strokeWidth = 8, labelClassName = "text-slate-800" }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * percent) / 100;
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.55)" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" fill="none" strokeDasharray={circumference} strokeDashoffset={dashOffset} className="text-slate-700 transition-all duration-500" />
      </svg>
      <div className={`absolute text-sm font-black ${labelClassName}`}>{percent}%</div>
    </div>
  );
}

interface AttendanceCardProps {
  attendanceStats: { rate: number; presents: number; total: number };
  attendanceTodayBadge: string;
  attendanceTodayLabel: string;
  weeklyAttendance: Array<{ label: string; key: string; status: "present" | "absent" | "holiday" | "hidden" | "na" }>;
  attendanceStreak: number;
  currentMonthAttendanceCount: number;
  lastAttendanceDate: string | null;
  formatDate: (value?: string) => string;
  onOpenSheet: () => void;
}

function AttendanceCard({ attendanceStats, weeklyAttendance, onOpenSheet }: AttendanceCardProps) {
  return (
    <div className="relative flex min-h-[260px] flex-col overflow-hidden rounded-[30px] border border-emerald-400/20 bg-gradient-to-br from-emerald-600 via-green-500 to-lime-500 p-4 text-white shadow-[0_28px_80px_rgba(5,150,105,0.24)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_44%)]" />
      <div className="relative flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-50/85">Attendance</p>
            <h3 className="mt-1 text-lg font-black">Weekly overview</h3>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onOpenSheet(); }} className="rounded-full border border-white/25 bg-white/10 p-2 shadow-sm backdrop-blur" aria-label="Open attendance history">
            <Info className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-black leading-none">{attendanceStats.rate}%</p>
            <p className="mt-1 text-[11px] text-emerald-50/85">{attendanceStats.presents}/{attendanceStats.total} classes</p>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/20 bg-white/12 p-3 shadow-inner backdrop-blur-lg">
          <WeeklyAttendanceChecklist entries={weeklyAttendance} />
        </div>
      </div>
    </div>
  );
}

interface FeeCardProps {
  student: Student;
  currentMonthName: string;
  currentMonthStatus: string;
  pendingMonths: string[];
  totalPendingAmount: number;
  paidAcademicYearAmount: number;
  lastPaymentDate: string | null;
  onOpenSheet: () => void;
}

function FeeCard({ student, currentMonthName, currentMonthStatus, pendingMonths, totalPendingAmount, onOpenSheet }: FeeCardProps) {
  const isPaid = currentMonthStatus === "paid";
  const isNa = currentMonthStatus === "na";
  const gradient = isPaid ? "from-emerald-600 via-teal-500 to-cyan-600" : isNa ? "from-slate-700 via-slate-600 to-slate-500" : "from-rose-600 via-red-500 to-orange-500";
  const accent = isPaid || isNa ? "bg-emerald-500/15 text-emerald-50 border-emerald-400/30" : "bg-amber-500/15 text-amber-50 border-amber-400/30";
  const monthLabel = currentMonthName.includes(" ") ? currentMonthName.split(" ")[0] : currentMonthName;
  return (
    <div className={`relative flex min-h-[260px] flex-col overflow-hidden rounded-[30px] border border-white/20 bg-gradient-to-br ${gradient} p-4 text-white shadow-[0_28px_80px_rgba(15,23,42,0.2)]`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.15),_transparent_44%)]" />
      <div className="relative flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Fees</p>
            <h3 className="mt-1 text-lg font-black">{monthLabel}</h3>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onOpenSheet(); }} className="rounded-full border border-white/25 bg-white/10 p-2 shadow-sm backdrop-blur" aria-label="Open fee history">
            <Info className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-black leading-none">₹{student.monthlyFee}</p>
            <p className="mt-1 text-[11px] text-white/85">{currentMonthName}</p>
          </div>
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${accent}`}>
            {currentMonthStatus === "paid" ? "Paid" : currentMonthStatus === "na" ? "N/A" : "Pending"}
          </span>
        </div>
        <div className="rounded-[24px] border border-white/20 bg-white/12 p-3 shadow-inner backdrop-blur-lg">
          <div className="flex items-center justify-between text-[11px] font-semibold text-white/85">
            <span className="flex items-center gap-1">
              <ReceiptText className="h-3.5 w-3.5" />
              Pending months
            </span>
            <span className="text-sm font-black">{pendingMonths.length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-white/85">
            <span className="flex items-center gap-1">
              <CircleDollarSign className="h-3.5 w-3.5" />
              Pending amount
            </span>
            <span className="text-sm font-black">₹{totalPendingAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AttendanceBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceStats: { rate: number; presents: number; total: number };
  attendanceHistoryByMonth: Array<{ month: string; present: number; absent: number; total: number; pct: number }>;
  student: Student;
}

function AttendanceBottomSheet({ isOpen, onClose, attendanceStats, attendanceHistoryByMonth, student }: AttendanceBottomSheetProps) {
  const calendarDays = React.useMemo(() => getCalendarDaysForCurrentMonth(student), [student]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/60 p-2 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[30px] border border-slate-200/70 bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Attendance sheets</p>
            <h3 className="text-lg font-black text-slate-900">Monthly attendance calendar</h3>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-[22px] border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">Attendance %</p>
            <p className="mt-1 text-xl font-black text-emerald-700">{attendanceStats.rate}%</p>
          </div>
          <div className="rounded-[22px] border border-rose-100 bg-rose-50 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-rose-600">Present / Absent</p>
            <p className="mt-1 text-xl font-black text-rose-700">{attendanceStats.presents}/{attendanceStats.total}</p>
          </div>
          <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-3 sm:col-span-2">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Monthly summary</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">Present {attendanceStats.presents}</span>
              <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-700">Absent {attendanceStats.total - attendanceStats.presents}</span>
              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-slate-700">Leaves 0</span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => (
            <div key={day} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{day}</div>
          ))}
          {calendarDays.map((item) => {
            const isPresent = item.status === "present";
            const isAbsent = item.status === "absent";
            const isHoliday = item.status === "holiday";
            const isNone = item.status === "none";
            return (
              <div key={item.key} className={`rounded-2xl border p-2 text-center text-[11px] font-black ${isPresent ? "border-emerald-200 bg-emerald-100 text-emerald-700" : isAbsent ? "border-rose-200 bg-rose-100 text-rose-700" : isHoliday ? "border-slate-200 bg-slate-100 text-slate-600" : isNone ? "border-transparent bg-transparent text-transparent" : "border-slate-200 bg-white text-slate-500"}`}>
                {item.value || ""}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-[10px] font-black uppercase tracking-[0.23em] text-slate-500">
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">Green Present</span>
          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-700">Red Absent</span>
          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-slate-700">Grey Holiday</span>
          <span className="rounded-full bg-white px-2.5 py-1 text-slate-600">White No class</span>
        </div>
      </div>
    </div>
  );
}

interface FeeHistoryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  feeHistory: Array<{ month: string; status: string; payDate?: string }>;
  student: Student;
  formatDate: (value?: string) => string;
}

function FeeHistoryBottomSheet({ isOpen, onClose, feeHistory, student, formatDate }: FeeHistoryBottomSheetProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/60 p-2 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[30px] border border-slate-200/70 bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Fee ledger</p>
            <h3 className="text-lg font-black text-slate-900">Fee history</h3>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex flex-col gap-2">
            {feeHistory.map((item) => (
              <div key={item.month} className="rounded-[22px] border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-black text-slate-800">{item.month}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Amount: ₹{student.monthlyFee}</p>
                    <p className="text-[11px] text-slate-500">Paid date: {item.payDate ? formatDate(item.payDate) : "—"}</p>
                    <p className="text-[11px] text-slate-500">Payment mode: —</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${item.status === "paid" ? "bg-emerald-100 text-emerald-700" : item.status === "na" ? "bg-slate-200 text-slate-700" : "bg-rose-100 text-rose-700"}`}>
                    {item.status === "paid" ? "Paid" : item.status === "na" ? "N/A" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SubjectProgressCardProps {
  subject: { name: string; total: number; completed: number; rate: number; notes: ChapterNote[] };
  index: number;
  size: TileSize;
  isDragging: boolean;
  onSelectSubject: (subject: string) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, cardId: string) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>, cardId: string) => void;
  onDragEnd: () => void;
  onSizeChange: (subject: string, size: TileSize) => void;
  onMoveUp: (subject: string) => void;
  onMoveDown: (subject: string) => void;
  sizeClassName: string;
}

function SubjectProgressCard({ subject, index, size, isDragging, onSelectSubject, onDragStart, onDragOver, onDragEnd, onSizeChange, onMoveUp, onMoveDown, sizeClassName }: SubjectProgressCardProps) {
  const palette = getSubjectCardPalette(index);
  const IconComponent = getSubjectIcon(subject.name);
  const isEmpty = subject.total === 0 && subject.completed === 0;
  return (
    <motion.div
      layout
      draggable
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onDragStart={(event) => onDragStart(event, subject.name)}
      onDragOver={(event) => onDragOver(event, subject.name)}
      onDragEnd={onDragEnd}
      onClick={() => onSelectSubject(subject.name)}
      className={`${sizeClassName} ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <div className={`group flex h-full flex-col overflow-hidden rounded-[30px] border border-white/50 bg-gradient-to-br ${palette.shell} p-4 text-white shadow-[0_20px_55px_rgba(15,23,42,0.12)] ${palette.shadow}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-white/40 bg-white/70 shadow-sm ${palette.chip}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.26em] text-white/80">{subject.name}</p>
              <p className="text-[11px] text-white/80">Progress overview</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="rounded-full border border-white/25 bg-white/10 p-1.5 text-white/80" title="Drag to reorder">
              <GripVertical className="h-3.5 w-3.5" />
            </div>
            <select value={size} onChange={(event) => onSizeChange(subject.name, event.target.value as TileSize)} className="rounded-full border border-white/20 bg-white/12 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/90 backdrop-blur">
              <option value="1x1">1×1</option>
              <option value="2x1">2×1</option>
              <option value="2x2">2×2</option>
              <option value="3x2">3×2</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <ProgressRing percent={isEmpty ? 0 : subject.rate} size={74} strokeWidth={9} labelClassName="text-white text-sm" />
          <div className="flex-1">
            {isEmpty ? (
              <>
                <p className="text-sm font-black text-white">0/0 Chapters</p>
                <p className="mt-1 text-[11px] text-white/80">No remaining chapters</p>
              </>
            ) : (
              <>
                <p className="text-sm font-black text-white">{subject.completed}/{subject.total} completed</p>
                <p className="mt-1 text-[11px] text-white/80">{subject.total - subject.completed} remaining</p>
              </>
            )}
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3 text-[11px] font-semibold text-white/90">
          <span>{isEmpty ? "0% complete" : `${subject.rate}% complete`}</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
}

export function getSubjectColor(subject: string): SubjectColorPalette {
  const norm = subject.trim().toLowerCase();
  
  const colors: Record<string, SubjectColorPalette> = {
    mathematics: {
      from: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      text: "text-blue-600 dark:text-blue-400",
      darkText: "text-blue-900 dark:text-blue-200",
      accent: "bg-blue-500 border-blue-200 dark:border-blue-900/50",
      ring: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-100 dark:bg-blue-900/50",
      badgeText: "text-blue-800 dark:text-blue-200"
    },
    english: {
      from: "from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      text: "text-indigo-600 dark:text-indigo-400",
      darkText: "text-indigo-900 dark:text-indigo-200",
      accent: "bg-indigo-500 border-indigo-200 dark:border-indigo-900/50",
      ring: "text-indigo-600 dark:text-indigo-400",
      badge: "bg-indigo-100 dark:bg-indigo-900/50",
      badgeText: "text-indigo-800 dark:text-indigo-200"
    },
    science: {
      from: "from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20",
      bg: "bg-green-50 dark:bg-green-950/30",
      text: "text-green-600 dark:text-green-400",
      darkText: "text-green-900 dark:text-green-200",
      accent: "bg-green-500 border-green-200 dark:border-green-900/50",
      ring: "text-green-600 dark:text-green-400",
      badge: "bg-green-100 dark:bg-green-900/50",
      badgeText: "text-green-800 dark:text-green-200"
    },
    physics: {
      from: "from-purple-500/10 to-fuchsia-500/10 dark:from-purple-500/20 dark:to-fuchsia-500/20",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      text: "text-purple-600 dark:text-purple-400",
      darkText: "text-purple-900 dark:text-purple-200",
      accent: "bg-purple-500 border-purple-200 dark:border-purple-900/50",
      ring: "text-purple-600 dark:text-purple-400",
      badge: "bg-purple-100 dark:bg-purple-900/50",
      badgeText: "text-purple-800 dark:text-purple-200"
    },
    chemistry: {
      from: "from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-orange-500/20",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      text: "text-orange-650 dark:text-orange-400",
      darkText: "text-orange-900 dark:text-orange-200",
      accent: "bg-orange-500 border-orange-200 dark:border-orange-900/50",
      ring: "text-orange-600 dark:text-orange-400",
      badge: "bg-orange-100 dark:bg-orange-900/50",
      badgeText: "text-orange-800 dark:text-orange-200"
    },
    biology: {
      from: "from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20",
      bg: "bg-teal-50 dark:bg-teal-950/30",
      text: "text-teal-600 dark:text-teal-400",
      darkText: "text-teal-900 dark:text-teal-200",
      accent: "bg-teal-500 border-teal-200 dark:border-teal-900/50",
      ring: "text-teal-600 dark:text-teal-400",
      badge: "bg-teal-100 dark:bg-teal-900/50",
      badgeText: "text-teal-800 dark:text-teal-200"
    },
    history: {
      from: "from-amber-500/10 to-yellow-500/10 dark:from-amber-500/20 dark:to-yellow-500/20",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-600 dark:text-amber-450",
      darkText: "text-amber-900 dark:text-amber-200",
      accent: "bg-amber-500 border-amber-200 dark:border-amber-900/50",
      ring: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-100 dark:bg-amber-900/50",
      badgeText: "text-amber-850 dark:text-amber-200"
    },
    geography: {
      from: "from-cyan-500/10 to-sky-500/10 dark:from-cyan-500/20 dark:to-sky-500/20",
      bg: "bg-cyan-50 dark:bg-cyan-950/30",
      text: "text-cyan-600 dark:text-cyan-400",
      darkText: "text-cyan-900 dark:text-cyan-200",
      accent: "bg-cyan-500 border-cyan-200 dark:border-cyan-900/50",
      ring: "text-cyan-600 dark:text-cyan-400",
      badge: "bg-cyan-100 dark:bg-cyan-900/50",
      badgeText: "text-cyan-800 dark:text-cyan-200"
    },
    "political science": {
      from: "from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20",
      bg: "bg-violet-50 dark:bg-violet-950/30",
      text: "text-violet-600 dark:text-violet-400",
      darkText: "text-violet-900 dark:text-violet-200",
      accent: "bg-violet-500 border-violet-200 dark:border-violet-900/50",
      ring: "text-violet-600 dark:text-violet-400",
      badge: "bg-violet-100 dark:bg-violet-900/50",
      badgeText: "text-violet-800 dark:text-violet-200"
    },
    economics: {
      from: "from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-600 dark:text-emerald-400",
      darkText: "text-emerald-900 dark:text-emerald-200",
      accent: "bg-emerald-500 border-emerald-200 dark:border-emerald-900/50",
      ring: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-100 dark:bg-emerald-900/50",
      badgeText: "text-emerald-800 dark:text-emerald-200"
    },
    "computer science": {
      from: "from-blue-900/10 to-indigo-900/10 dark:from-blue-900/20 dark:to-indigo-900/20",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      text: "text-blue-700 dark:text-blue-300",
      darkText: "text-blue-900 dark:text-blue-100",
      accent: "bg-blue-900 border-blue-300 dark:border-blue-900",
      ring: "text-blue-800 dark:text-blue-400",
      badge: "bg-blue-100 dark:bg-blue-900/50",
      badgeText: "text-blue-800 dark:text-blue-200"
    },
    hindi: {
      from: "from-amber-600/10 to-red-500/10 dark:from-amber-600/20 dark:to-red-500/20",
      bg: "bg-amber-50/40 dark:bg-amber-950/25",
      text: "text-amber-700 dark:text-amber-400",
      darkText: "text-amber-950 dark:text-amber-250",
      accent: "bg-amber-500 border-amber-200 dark:border-amber-900",
      ring: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-100 dark:bg-amber-900/50",
      badgeText: "text-amber-800 dark:text-amber-200"
    },
    nepali: {
      from: "from-red-500/10 to-rose-500/10 dark:from-red-500/20 dark:to-rose-500/20",
      bg: "bg-red-50 dark:bg-red-950/30",
      text: "text-red-600 dark:text-red-450",
      darkText: "text-red-900 dark:text-red-200",
      accent: "bg-red-500 border-red-200 dark:border-red-900/50",
      ring: "text-red-600 dark:text-red-400",
      badge: "bg-red-100 dark:bg-red-900/50",
      badgeText: "text-red-800 dark:text-red-200"
    }
  };

  if (colors[norm]) return colors[norm];
  const found = Object.keys(colors).find(key => norm.includes(key));
  if (found) return colors[found];

  const list = Object.values(colors);
  const index = subject.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % list.length;
  return list[index];
}

export function getSubjectIcon(subject: string) {
  const norm = subject.toLowerCase();
  if (norm.includes("math")) return Cpu;
  if (norm.includes("computer") || norm.includes("code")) return Cpu;
  if (norm.includes("physic")) return Atom;
  if (norm.includes("chemistry")) return FlaskConical;
  if (norm.includes("biology")) return Dna;
  if (norm.includes("science")) return Atom;
  if (norm.includes("history")) return Scroll;
  if (norm.includes("geograph")) return Globe;
  if (norm.includes("english")) return Languages;
  if (norm.includes("nepali") || norm.includes("hindi")) return Languages;
  return BookOpen;
}

export function StudentMyTab({ 
  student, 
  initialSubject, 
  onSelectSubject, 
  onUpdateChapterRemark 
}: { 
  student: Student; 
  initialSubject?: string | null;
  onSelectSubject?: (subject: string) => void;
  onUpdateChapterRemark: (subject: string, noteId: string, remark: string) => void; 
}) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(() => {
    return initialSubject || student.enrolledSubjects[0] || null;
  });
  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);
  const [remarkDrafts, setRemarkDrafts] = useState<Record<string, string>>({});
  const [activePreviewPdf, setActivePreviewPdf] = useState<{ url: string; title: string } | null>(null);

  React.useEffect(() => {
    if (initialSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  const handleSelectSubject = (subject: string) => {
    setSelectedSubject(subject);
    if (onSelectSubject) {
      onSelectSubject(subject);
    }
  };

  const selectedNotes = useMemo(() => {
    if (!selectedSubject) return [] as ChapterNote[];
    return ((student.notes?.[selectedSubject] || []) as ChapterNote[])
      .slice()
      .sort((a, b) => (a.chapterNo || 0) - (b.chapterNo || 0));
  }, [selectedSubject, student.notes]);

  const sortedSubjects = useMemo(() => {
    return [...student.enrolledSubjects].sort((a, b) => a.localeCompare(b));
  }, [student.enrolledSubjects]);

  const handleSaveRemark = (note: ChapterNote) => {
    const draft = (remarkDrafts[note.id] ?? note.remark ?? "").trim();
    onUpdateChapterRemark(selectedSubject || "", note.id, draft);
    setEditingRemarkId(null);
  };

  const getFileSizeStr = (pdfUrl: string, chapterNo: number) => {
    if (pdfUrl.startsWith("data:")) {
      const base64Length = pdfUrl.length - (pdfUrl.indexOf(",") + 1);
      const sizeInBytes = Math.round(base64Length * 0.75);
      if (sizeInBytes > 1024 * 1024) {
        return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
      }
      return `${Math.round(sizeInBytes / 1024)} KB`;
    }
    const mockedKb = ((chapterNo * 420 + 280) % 1800) + 350;
    if (mockedKb > 1024) {
      return `${(mockedKb / 1024).toFixed(1)} MB`;
    }
    return `${mockedKb} KB`;
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn" id="student-my-tab">
      {/* File Explorer Layout Grid */}
      <div className="grid grid-cols-1 min-[520px]:grid-cols-12 gap-4 h-[calc(100vh-220px)] min-h-[500px] overflow-hidden" id="my-study-space-split-container">
        
        {/* LEFT PANEL (32% width on sm+ or 4/12 columns) */}
        <div className="col-span-12 min-[520px]:col-span-4 flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4" id="split-left-panel">
          <div className="mb-4 shrink-0" id="study-left-header">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">ENROLLED SUBJECTS</p>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">My Study Space</h2>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin" id="study-left-subjects">
            {sortedSubjects.map((subject) => {
              const isActive = selectedSubject === subject;
              const palette = getSubjectColor(subject);
              const IconComponent = getSubjectIcon(subject);
              return (
                <button
                  key={subject}
                  onClick={() => handleSelectSubject(subject)}
                  className={`group rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isActive 
                      ? `${palette.bg} border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm` 
                      : "border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`p-1.5 rounded-lg ${isActive ? palette.badge : "bg-slate-50 dark:bg-slate-950 group-hover:bg-slate-100"}`}>
                      <IconComponent className={`h-3.5 w-3.5 ${isActive ? palette.text : "text-slate-400"}`} />
                    </div>
                    <span className="truncate">{subject}</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? "text-blue-500 translate-x-0.5" : "text-slate-350 opacity-0 group-hover:opacity-100"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL (68% width on sm+ or 8/12 columns) */}
        <div className="col-span-12 min-[520px]:col-span-8 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-xs" id="split-right-panel">
          {selectedSubject ? (
            <>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between shrink-0" id="study-right-header">
                <div className="truncate">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Selected Subject</p>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 truncate pr-2">{selectedSubject}</h3>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-850/60 flex items-center gap-1.5 shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>{selectedNotes.length} Chapters</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin" id="study-right-notes">
                {selectedNotes.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10">
                    <div className="relative mb-4">
                      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 shadow-xs">
                        <FileText className="w-10 h-10 stroke-[1.2]" />
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 p-1 bg-amber-500 rounded-full text-white shadow-xs">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <h4 className="text-sm font-black text-slate-750 dark:text-slate-200">No notes are available for this subject.</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mt-1">
                      Your tutor hasn't uploaded any PDF chapters for {selectedSubject} yet. Please check back later.
                    </p>
                  </div>
                ) : (
                  selectedNotes.map((note) => (
                    <div key={note.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 p-3 hover:border-slate-200 dark:hover:border-slate-750 hover:bg-slate-50/80 dark:hover:bg-slate-950/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2.5 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-500 dark:text-red-400 shrink-0 border border-red-100/60 dark:border-red-900/30">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Chapter {note.chapterNo}</p>
                          <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate pr-4">{note.chapterName}</h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[9px] font-semibold text-slate-400">
                            {note.createdAt && (
                              <span className="bg-slate-100/80 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                                Added {formatDate(note.createdAt)}
                              </span>
                            )}
                            <span className="bg-slate-100/80 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                              Size: {getFileSizeStr(note.pdfUrl, note.chapterNo)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setActivePreviewPdf({ url: note.pdfUrl, title: `Chapter ${note.chapterNo}: ${note.chapterName}` });
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
                          title="View PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <a
                          href={note.pdfUrl}
                          download={`${note.chapterName.replace(/\s+/g, "_")}.pdf`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>

                        <button
                          onClick={() => {
                            if (editingRemarkId === note.id) {
                              handleSaveRemark(note);
                            } else {
                              setEditingRemarkId(note.id);
                              setRemarkDrafts((prev) => ({ ...prev, [note.id]: note.remark || "" }));
                            }
                          }}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
                          title={note.remark ? "Edit remark" : "Add remark"}
                        >
                          <MessageSquareText className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-sm text-slate-500">
              Choose a subject to view chapter-wise notes.
            </div>
          )}
        </div>

      </div>

      {/* Student PDF Preview Modal */}
      {activePreviewPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 animate-fadeIn backdrop-blur-sm" id="student-pdf-modal" onClick={() => setActivePreviewPdf(null)}>
          <div className="absolute inset-0" />
          <div className="relative w-full h-full sm:h-[90vh] max-w-4xl bg-white dark:bg-slate-950 rounded-none sm:rounded-2xl p-0 shadow-2xl z-10 flex flex-col overflow-hidden border border-slate-100 dark:border-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center bg-slate-900 text-white p-4 shrink-0">
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-bold truncate">{activePreviewPdf.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activePreviewPdf.url}
                  download={`${activePreviewPdf.title.replace(/\s+/g, "_")}.pdf`}
                  className="p-2 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setActivePreviewPdf(null)}
                  className="p-2 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-2 sm:p-4 flex items-center justify-center relative">
              {activePreviewPdf.url ? (
                <iframe
                  src={activePreviewPdf.url.startsWith("data:") ? activePreviewPdf.url : `${activePreviewPdf.url}#toolbar=1&view=FitH&page=1`}
                  className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white"
                  title={activePreviewPdf.title}
                />
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <p className="font-bold text-sm">Cannot render raw data format directly</p>
                  <p className="text-xs text-slate-400 mt-1">Please use the Download button to open this PDF document.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentDashboard({
  student,
  onSelectSubject,
  onNavigateToTab,
  onOpenAvatarModal,
  onUpdateChapterRemark
}: StudentDashboardProps) {
  const [feesSize, setFeesSize] = useState<TileSize>("2x1");
  const [attendanceSize, setAttendanceSize] = useState<TileSize>("2x1");
  const [showAttendanceHistoryModal, setShowAttendanceHistoryModal] = useState(false);
  const [showFeeHistoryModal, setShowFeeHistoryModal] = useState(false);
  const [weeklyAttendance, setWeeklyAttendance] = useState<Array<{ label: string; key: string; status: "present" | "absent" | "holiday" | "hidden" | "na" }>>([]);

  const studentMonthsSinceJoining = useMemo(() => {
    const regDate = student.registrationDate || "2026-06-01";
    const [regYearStr, regMonthStr] = regDate.split("-");
    const regYear = parseInt(regYearStr) || 2026;
    const regMonthIdx = (parseInt(regMonthStr) || 6) - 1; // 0-indexed

    // Prevent displaying any future months in student portal
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthIdx = today.getMonth();

    return ALL_ACADEMIC_MONTHS.filter((m) => {
      const [mName, yStr] = m.split(" ");
      const mIdx = MONTH_NAMES.indexOf(mName);
      const year = parseInt(yStr) || 2026;
      
      const isAfterReg = year > regYear || (year === regYear && mIdx >= regMonthIdx);
      const isBeforeOrCurrent = year < currentYear || (year === currentYear && mIdx <= currentMonthIdx);

      return isAfterReg && isBeforeOrCurrent;
    });
  }, [student.registrationDate]);

  const attendanceHistoryByMonth = useMemo(() => {
    const records: Record<string, { present: number; absent: number; total: number }> = {};
    studentMonthsSinceJoining.forEach((m) => {
      records[m] = { present: 0, absent: 0, total: 0 };
    });

    Object.entries(student.attendance).forEach(([dateStr, status]) => {
      if (status === "na") return;
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return;
        const key = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
        if (records[key]) {
          records[key].total += 1;
          if (status === true) records[key].present += 1;
          else if (status === false) records[key].absent += 1;
        }
      } catch (e) {
        console.error(e);
      }
    });

    return studentMonthsSinceJoining.map((m) => {
      const stats = records[m] || { present: 0, absent: 0, total: 0 };
      const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;
      return { month: m, ...stats, pct };
    });
  }, [student.attendance, studentMonthsSinceJoining, MONTH_NAMES]);

  const feeHistory = useMemo(() => {
    return studentMonthsSinceJoining.map((m) => {
      const status = student.feeMonths?.[m] || "unpaid";
      const payDate = student.feePaymentDates?.[m];
      return { month: m, status, payDate };
    });
  }, [student.feeMonths, student.feePaymentDates, studentMonthsSinceJoining]);

  const [subjectSizes, setSubjectSizes] = useState<Record<string, TileSize>>(() => {
    const initial: Record<string, TileSize> = {};
    const saved = localStorage.getItem(`tuition_student_subject_sizes_${student.id}`);
    const parsed = saved ? JSON.parse(saved) : {};
    student.enrolledSubjects.forEach((sub) => {
      initial[sub] = parsed[sub] || "2x1";
    });
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(`tuition_student_subject_sizes_${student.id}`, JSON.stringify(subjectSizes));
  }, [student.id, subjectSizes]);

  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem(`tuition_student_layout_${student.id}`);
    const allCards = ["attendance", "fees", ...student.enrolledSubjects];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((c) => allCards.includes(c));
          const missing = allCards.filter((c) => !filtered.includes(c));
          return [...filtered, ...missing];
        }
      } catch (e) {
        console.error("Failed to parse saved layout:", e);
      }
    }
    return allCards;
  });

  const enrolledSubjectCardsOnly = useMemo(() => {
    return cardOrder.filter((id) => id !== "attendance" && id !== "fees");
  }, [cardOrder]);

  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [selectedSubjectModal, setSelectedSubjectModal] = useState<string | null>(null);

  const saveOrder = (newOrder: string[]) => {
    setCardOrder(newOrder);
    localStorage.setItem(`tuition_student_layout_${student.id}`, JSON.stringify(newOrder));
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    if (!draggedCardId || draggedCardId === targetCardId) return;

    const dragIndex = cardOrder.indexOf(draggedCardId);
    const targetIndex = cardOrder.indexOf(targetCardId);

    if (dragIndex !== -1 && targetIndex !== -1) {
      const updated = [...cardOrder];
      updated.splice(dragIndex, 1);
      updated.splice(targetIndex, 0, draggedCardId);
      saveOrder(updated);
    }
  };

  const handleDragEnd = () => setDraggedCardId(null);

  const handleMoveUp = (cardId: string) => {
    const idx = cardOrder.indexOf(cardId);
    if (idx > 0) {
      const updated = [...cardOrder];
      const temp = updated[idx];
      updated[idx] = updated[idx - 1];
      updated[idx - 1] = temp;
      saveOrder(updated);
    }
  };

  const handleMoveDown = (cardId: string) => {
    const idx = cardOrder.indexOf(cardId);
    if (idx !== -1 && idx < cardOrder.length - 1) {
      const updated = [...cardOrder];
      const temp = updated[idx];
      updated[idx] = updated[idx + 1];
      updated[idx + 1] = temp;
      saveOrder(updated);
    }
  };

  const handleSetSubjectSize = (subject: string, size: TileSize) => {
    setSubjectSizes((prev) => ({ ...prev, [subject]: size }));
  };

  const attendanceStats = useMemo(() => {
    const records = Object.values(student.attendance || {}).filter((r) => r !== "na");
    const total = records.length;
    const presents = records.filter((r) => r === true).length;
    const rate = total > 0 ? Math.round((presents / total) * 100) : 100;
    return { presents, total, rate };
  }, [student.attendance]);

  const subjectProgress = useMemo(() => {
    return student.enrolledSubjects
      .map((sub) => {
        const notes = student.notes?.[sub] || [];
        const total = notes.length;
        const completed = notes.filter((n) => n.isCompleted).length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { name: sub, total, completed, rate, notes };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [student.enrolledSubjects, student.notes]);

  const recentAttendance = useMemo(() => {
    const dates = ["2026-07-14", "2026-07-13", "2026-07-12", "2026-07-11", "2026-07-10", "2026-07-09", "2026-07-08"];
    return dates.map((date) => {
      const dateObj = new Date(date);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return { date, dayName: dayNames[dateObj.getDay()], dayNum: dateObj.getDate(), val: student.attendance?.[date] };
    });
  }, [student.attendance]);

  const currentMonthName = useMemo(() => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const d = new Date();
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const attendanceTodayStatus = student.attendance?.[todayKey];
  const attendanceTodayLabel = attendanceTodayStatus === true ? "Present" : attendanceTodayStatus === false ? "Absent" : "Not marked";
  const attendanceTodayBadge = attendanceTodayStatus === true
    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    : attendanceTodayStatus === false
      ? "border-rose-400/40 bg-rose-500/15 text-rose-700 dark:text-rose-300"
      : "border-slate-400/30 bg-slate-500/10 text-slate-700 dark:text-slate-300";

  const attendanceStreak = useMemo(() => {
    const dates = Object.keys(student.attendance || {})
      .filter((date) => date <= todayKey)
      .sort((a, b) => b.localeCompare(a));

    let streak = 0;
    for (const date of dates) {
      const status = student.attendance?.[date];
      if (status === true) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }, [student.attendance, todayKey]);

  const lastAttendanceDate = useMemo(() => {
    const dates = Object.keys(student.attendance || {})
      .filter((date) => student.attendance?.[date] === true || student.attendance?.[date] === false)
      .sort((a, b) => b.localeCompare(a));
    return dates[0] || null;
  }, [student.attendance]);

  const currentMonthAttendanceCount = useMemo(() => {
    const monthKey = new Date().toISOString().slice(0, 7);
    return Object.keys(student.attendance || {}).filter((date) => date.startsWith(monthKey) && student.attendance?.[date] !== "na").length;
  }, [student.attendance]);

  const currentMonthStatus = student.feeMonths?.[currentMonthName] || (student.feePaidThisMonth ? "paid" : "unpaid");

  useEffect(() => {
    setWeeklyAttendance(getWeeklyAttendanceDays(student));
  }, [student]);

  const feeStats = useMemo(() => {
    const entries = student.feeMonths ? Object.entries(student.feeMonths) : [];
    const paidCount = entries.filter(([, status]) => status === "paid").length;
    const unpaidCount = entries.filter(([, status]) => status === "unpaid").length;
    return { paidCount, unpaidCount };
  }, [student.feeMonths]);

  const pendingMonths = useMemo(() => {
    return Object.entries(student.feeMonths || {})
      .filter(([, status]) => status === "unpaid")
      .map(([month]) => month)
      .sort((a, b) => a.localeCompare(b));
  }, [student.feeMonths]);

  const totalPendingAmount = useMemo(() => {
    return pendingMonths.length * (student.monthlyFee || 0);
  }, [pendingMonths.length, student.monthlyFee]);

  const lastPaymentDate = useMemo(() => {
    const entries = Object.entries(student.feePaymentDates || {})
      .filter(([, value]) => Boolean(value))
      .sort((a, b) => (b[1] || "").localeCompare(a[1] || ""));
    return entries[0]?.[1] || null;
  }, [student.feePaymentDates]);

  const nextDueLabel = pendingMonths[0] || "No pending dues";
  const paidAcademicYearAmount = feeStats.paidCount * (student.monthlyFee || 0);

  const activeSubjectDetails = useMemo(() => {
    if (!selectedSubjectModal) return null;
    return subjectProgress.find((sub) => sub.name === selectedSubjectModal) || null;
  }, [selectedSubjectModal, subjectProgress]);

  const sizeClasses: Record<TileSize, string> = {
    "1x1": "col-span-1 row-span-1",
    "2x1": "col-span-1 sm:col-span-2 row-span-1",
    "1x2": "col-span-1 row-span-2",
    "2x2": "col-span-1 sm:col-span-2 row-span-2",
    "1x3": "col-span-1 row-span-3",
    "3x1": "col-span-1 sm:col-span-2 xl:col-span-3 row-span-1",
    "1/2x1": "col-span-1 row-span-1",
    "1x1/2": "col-span-1 row-span-1",
    "2x3": "col-span-1 sm:col-span-2 row-span-3",
    "3x2": "col-span-1 sm:col-span-2 xl:col-span-3 row-span-2"
  };

  const cardBaseClass = "rounded-[28px] border-0 bg-white/90 dark:bg-slate-900/95 p-3 shadow-[0_14px_40px_rgba(15,23,42,0.08),0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300 backdrop-blur";

  return (
    <div className="flex flex-col gap-4 overflow-x-hidden pb-6 animate-fadeIn" id="student-dashboard-root">
      <StudentHeader student={student} />
      <HeroCard student={student} onOpenAvatarModal={onOpenAvatarModal} formatDate={formatDate} />

      <div className="grid gap-3 sm:grid-cols-2" id="fixed-student-tiles">
        <AttendanceCard
          attendanceStats={attendanceStats}
          attendanceTodayBadge={attendanceTodayBadge}
          attendanceTodayLabel={attendanceTodayLabel}
          weeklyAttendance={weeklyAttendance}
          attendanceStreak={attendanceStreak}
          currentMonthAttendanceCount={currentMonthAttendanceCount}
          lastAttendanceDate={lastAttendanceDate}
          formatDate={formatDate}
          onOpenSheet={() => setShowAttendanceHistoryModal(true)}
        />
        <FeeCard
          student={student}
          currentMonthName={currentMonthName}
          currentMonthStatus={currentMonthStatus}
          pendingMonths={pendingMonths}
          totalPendingAmount={totalPendingAmount}
          paidAcademicYearAmount={paidAcademicYearAmount}
          lastPaymentDate={lastPaymentDate}
          onOpenSheet={() => setShowFeeHistoryModal(true)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 auto-rows-[minmax(210px,auto)]" style={{ gridAutoFlow: "dense" }}>
        {enrolledSubjectCardsOnly.map((cardId, index) => {
          const sub = subjectProgress.find((item) => item.name === cardId);
          if (!sub) return null;
          const size = subjectSizes[sub.name] || "2x1";
          const sizeClassName = sizeClasses[size];
          return (
            <SubjectProgressCard
              key={sub.name}
              subject={sub}
              index={index}
              size={size}
              isDragging={draggedCardId === sub.name}
              onSelectSubject={onSelectSubject}
              onDragStart={handleDragStart as unknown as (event: React.DragEvent<HTMLDivElement>, cardId: string) => void}
              onDragOver={handleDragOver as unknown as (event: React.DragEvent<HTMLDivElement>, cardId: string) => void}
              onDragEnd={handleDragEnd}
              onSizeChange={handleSetSubjectSize}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              sizeClassName={sizeClassName}
            />
          );
        })}
      </div>

      <AttendanceBottomSheet
        isOpen={showAttendanceHistoryModal}
        onClose={() => setShowAttendanceHistoryModal(false)}
        attendanceStats={attendanceStats}
        attendanceHistoryByMonth={attendanceHistoryByMonth}
        student={student}
      />

      <FeeHistoryBottomSheet
        isOpen={showFeeHistoryModal}
        onClose={() => setShowFeeHistoryModal(false)}
        feeHistory={feeHistory}
        student={student}
        formatDate={formatDate}
      />
    </div>
  );
}
