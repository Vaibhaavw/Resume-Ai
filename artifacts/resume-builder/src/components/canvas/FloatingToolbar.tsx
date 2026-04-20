import { useEffect, useState, useCallback, useRef } from "react";
import { Bold, Italic, Sparkles, Type } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarPosition {
  top: number;
  left: number;
}

interface FloatingToolbarProps {
  onEnhance?: (selectedText: string) => void;
  enhancing?: boolean;
  /** Container ref to constrain toolbar positioning */
  containerRef?: React.RefObject<HTMLElement | null>;
}

export function FloatingToolbar({ onEnhance, enhancing, containerRef }: FloatingToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<ToolbarPosition>({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const toolbarRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setVisible(false);
      return;
    }

    const text = sel.toString().trim();
    if (text.length === 0) {
      setVisible(false);
      return;
    }

    setSelectedText(text);

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Check if selection is inside our container
    if (containerRef?.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
        setVisible(false);
        return;
      }
    }

    const toolbarWidth = 248;
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;

    let left = rect.left + scrollLeft + rect.width / 2 - toolbarWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - toolbarWidth - 8));
    const top = rect.top + scrollTop - 46;

    setPos({ top, left });
    setVisible(true);
  }, [containerRef]);

  useEffect(() => {
    const onMouseUp = () => setTimeout(updatePosition, 10);
    const onKeyUp = () => setTimeout(updatePosition, 10);
    const onMouseDown = (e: MouseEvent) => {
      // Hide if clicking outside toolbar
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [updatePosition]);

  const execCmd = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    // Re-focus the contenteditable
    const sel = window.getSelection();
    if (sel && sel.focusNode) {
      const el = sel.focusNode.parentElement?.closest("[contenteditable]") as HTMLElement | null;
      el?.focus();
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
      className="flex items-center gap-0.5 rounded-lg bg-slate-900 px-1.5 py-1 shadow-2xl border border-slate-700 select-none"
      onMouseDown={(e) => e.preventDefault()} // prevent blur on click
    >
      {/* Bold */}
      <button
        className="flex h-7 w-7 items-center justify-center rounded text-slate-200 hover:bg-white/10 transition-colors"
        onClick={() => execCmd("bold")}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-3.5 w-3.5 stroke-[2.5]" />
      </button>

      {/* Italic */}
      <button
        className="flex h-7 w-7 items-center justify-center rounded text-slate-200 hover:bg-white/10 transition-colors"
        onClick={() => execCmd("italic")}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>

      {/* Separator */}
      <div className="h-4 w-px bg-slate-700 mx-0.5" />

      {/* Font size decrease */}
      <button
        className="flex h-7 items-center px-1.5 rounded text-slate-300 text-xs font-bold hover:bg-white/10 transition-colors"
        onClick={() => execCmd("fontSize", "1")}
        title="Decrease font size"
      >
        A<span className="text-[8px] align-sub ml-0.5">-</span>
      </button>

      {/* Font size increase */}
      <button
        className="flex h-7 items-center px-1.5 rounded text-slate-300 text-xs font-bold hover:bg-white/10 transition-colors"
        onClick={() => execCmd("fontSize", "4")}
        title="Increase font size"
      >
        A<span className="text-[10px] align-super ml-0.5">+</span>
      </button>

      {/* Separator */}
      <div className="h-4 w-px bg-slate-700 mx-0.5" />

      {/* AI Enhance */}
      {onEnhance && (
        <button
          className={cn(
            "flex h-7 items-center gap-1.5 rounded px-2 text-[11px] font-semibold transition-all",
            enhancing
              ? "text-blue-300 opacity-70 cursor-wait"
              : "text-blue-400 hover:bg-blue-500/20 hover:text-blue-200"
          )}
          onClick={() => !enhancing && onEnhance(selectedText)}
          title="Enhance with AI"
          disabled={enhancing}
        >
          <Sparkles className="h-3 w-3" />
          {enhancing ? "Enhancing…" : "AI"}
        </button>
      )}
    </div>
  );
}
