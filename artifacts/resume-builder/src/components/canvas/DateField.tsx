import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDate(iso: string): { month: number; year: number } | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return { month: d.getMonth(), year: d.getFullYear() };
}

function formatDisplay(iso: string): string {
  if (!iso) return "";
  const p = parseDate(iso);
  if (!p) return iso;
  return `${MONTHS[p.month]} ${p.year}`;
}

function toIso(month: number, year: number): string {
  return new Date(year, month, 1).toISOString();
}

interface DateFieldProps {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  error?: string;
  allowPresent?: boolean;
}

export function DateField({
  value,
  onChange,
  placeholder = "Select date",
  className,
  editable = true,
  error,
  allowPresent = false,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseDate(value);
  const now = new Date();
  const [viewYear, setViewYear] = useState(parsed?.year ?? now.getFullYear());
  const containerRef = useRef<HTMLDivElement>(null);

  const displayText = value === "present" ? "Present" : formatDisplay(value);
  const hasError = !!error && !value;

  if (!editable) {
    return <span className={className}>{displayText || placeholder}</span>;
  }

  return (
    <span className="relative group/df inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "rounded px-1 py-0.5 transition-all duration-150 text-inherit font-inherit text-left",
          !displayText && "text-slate-300",
          hasError
            ? "ring-1 ring-red-400 bg-red-50/20"
            : "hover:ring-1 hover:ring-slate-300 hover:bg-slate-50/50",
          open && "ring-2 ring-blue-400 bg-blue-50/30",
          className
        )}
      >
        {displayText || placeholder}
      </button>

      {/* Error tooltip */}
      {hasError && !open && (
        <span className="absolute -top-6 left-0 z-50 whitespace-nowrap rounded bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg opacity-0 group-hover/df:opacity-100 transition-opacity pointer-events-none">
          {error}
        </span>
      )}

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 z-50 mt-1 w-52 rounded-xl border border-slate-100 bg-white shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-100">
            {/* Year nav */}
            <div className="flex items-center justify-between mb-2">
              <button
                className="h-6 w-6 rounded hover:bg-slate-100 flex items-center justify-center"
                onClick={() => setViewYear((y) => y - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5 text-slate-500" />
              </button>
              <span className="text-sm font-bold text-slate-700">{viewYear}</span>
              <button
                className="h-6 w-6 rounded hover:bg-slate-100 flex items-center justify-center"
                onClick={() => setViewYear((y) => y + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((m, idx) => {
                const active = parsed?.month === idx && parsed?.year === viewYear;
                return (
                  <button
                    key={m}
                    onClick={() => { onChange(toIso(idx, viewYear)); setOpen(false); }}
                    className={cn(
                      "rounded py-1 text-xs font-semibold transition-colors",
                      active
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>

            {allowPresent && (
              <button
                className={cn(
                  "mt-2 w-full rounded py-1 text-xs font-semibold border transition-colors",
                  value === "present"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
                onClick={() => { onChange("present"); setOpen(false); }}
              >
                Present / Current
              </button>
            )}
          </div>
        </>
      )}
    </span>
  );
}
