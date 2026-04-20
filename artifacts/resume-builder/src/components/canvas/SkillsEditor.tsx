import { useState, useRef } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillsEditorProps {
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
  editable?: boolean;
  suggestions?: string[];
  error?: string;
  className?: string;
  /** How to render each skill tag (varies per template) */
  renderTag?: (skill: string, onRemove?: () => void) => React.ReactNode;
}

export function SkillsEditor({
  skills,
  onAdd,
  onRemove,
  editable = true,
  suggestions = [],
  error,
  className,
  renderTag,
}: SkillsEditorProps) {
  const [inputOpen, setInputOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions
    .filter((s) => !skills.includes(s) && s.toLowerCase().includes(inputVal.toLowerCase()))
    .slice(0, 8);

  const commitSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onAdd(trimmed);
    }
    setInputVal("");
    inputRef.current?.focus();
  };

  if (!editable) {
    if (renderTag) {
      return <div className={className}>{skills.map((s) => renderTag(s))}</div>;
    }
    return (
      <div className={className}>
        {skills.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative group/skills", className)}>
      {/* Skill tags */}
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill, i) =>
          renderTag ? (
            <span key={i} className="relative group/stag inline-flex items-center">
              {renderTag(skill, () => onRemove(skill))}
            </span>
          ) : (
            <span
              key={i}
              className="relative group/stag inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:border-slate-300 transition-all"
            >
              {skill}
              <button
                type="button"
                onClick={() => onRemove(skill)}
                className="ml-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover/stag:opacity-100"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )
        )}

        {/* Add skill chip */}
        {!inputOpen ? (
          <button
            type="button"
            onClick={() => { setInputOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-blue-300 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 hover:border-blue-400 hover:bg-blue-100 transition-all"
          >
            <Plus className="h-3 w-3" />
            Add skill
          </button>
        ) : (
          <div className="relative">
            <input
              ref={inputRef}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commitSkill(inputVal); }
                if (e.key === "Escape") { setInputOpen(false); setInputVal(""); }
              }}
              onBlur={() => { if (!inputVal) setInputOpen(false); }}
              placeholder="Type a skill…"
              className="rounded-full border border-blue-400 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300 w-32 shadow-sm"
            />
            {/* Suggestions dropdown */}
            {filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-lg border border-slate-100 bg-white shadow-xl p-1">
                {filteredSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); commitSkill(s); }}
                    className="w-full rounded px-2 py-1. text-left text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation error */}
      {error && (
        <p className="mt-1 text-[10px] font-semibold text-red-600">{error}</p>
      )}
    </div>
  );
}
