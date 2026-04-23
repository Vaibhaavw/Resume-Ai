import { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  /** validation error key – shown as red ring + tooltip */
  error?: string;
  /** if false, renders as plain text (PDF export mode) */
  editable?: boolean;
  /** html tag to render as */
  as?: React.ElementType;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: React.CSSProperties;
}

export function EditableField({
  value,
  onChange,
  placeholder = "Click to edit…",
  className,
  multiline = false,
  error,
  editable = true,
  as: Tag = "span" as React.ElementType,
  onFocus,
  onBlur,
  style,
}: EditableFieldProps) {
  const ref = useRef<HTMLElement>(null);
  const [focused, setFocused] = useState(false);
  // Track internal composition (IME) to avoid partial commits
  const composingRef = useRef(false);

  // Sync external value → DOM (only when not focused to avoid cursor jumping)
  useEffect(() => {
    if (!ref.current || focused) return;
    if (ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value, focused]);

  // Initial hydration
  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = useCallback(() => {
    if (composingRef.current) return;
    const text = ref.current?.textContent ?? "";
    onChange(multiline ? text : text.replace(/\n/g, " "));
  }, [onChange, multiline]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      ref.current?.blur();
    }
  }, [multiline]);

  const handleFocus = useCallback(() => {
    setFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    // Final commit on blur
    const text = ref.current?.textContent ?? "";
    onChange(multiline ? text : text.replace(/\n/g, " "));
    onBlur?.();
  }, [onChange, multiline, onBlur]);

  if (!editable) {
    // Pure read-only render (PDF mode) — no interactive attributes
    return (
      <Tag className={className} style={style}>
        {value || ""}
      </Tag>
    );
  }

  const hasError = !!error;
  const isEmpty = !value.trim();

  return (
    <span className={cn("relative group/ef", multiline ? "block" : "inline-block")} style={style}>
      {/* @ts-ignore – dynamic tag */}
      <Tag
        ref={ref as any}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        data-placeholder={placeholder}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onCompositionStart={() => { composingRef.current = true; }}
        onCompositionEnd={() => {
          composingRef.current = false;
          handleInput();
        }}
        className={cn(
          "outline-none cursor-text transition-all duration-150 relative min-h-[1.5em] w-full",
          "before:pointer-events-none block rounded-sm px-1",
          isEmpty && !focused && "before:content-[attr(data-placeholder)] before:text-slate-400 before:absolute before:top-0 before:left-1 before:italic bg-slate-50/30 border border-dashed border-slate-200",
          focused
            ? "ring-2 ring-blue-500 ring-offset-2 bg-white shadow-md z-10 border-transparent"
            : hasError
            ? "ring-2 ring-red-400 bg-red-50/20 border-red-200"
            : "hover:bg-slate-50 hover:border-slate-300",
          className
        )}
      />
      {/* Validation tooltip */}
      {hasError && !focused && (
        <span className="absolute -top-6 left-0 z-50 whitespace-nowrap rounded bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg opacity-0 group-hover/ef:opacity-100 transition-opacity pointer-events-none">
          {error}
        </span>
      )}
    </span>
  );
}
