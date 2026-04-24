import { useState, useRef } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableSectionProps {
  /** Section title for accessibility */
  label: string;
  /** Whether to show add/remove controls */
  editable?: boolean;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  className?: string;
}

/**
 * Wrapper for repeatable sections (Experience, Education, Projects).
 * Shows Add button below the section on hover. Individual items expose
 * their own remove button via EditableSectionItem.
 */
export function EditableSection({
  label,
  editable = true,
  children,
  onAdd,
  addLabel = "Add",
  className,
}: EditableSectionProps) {
  const [hovered, setHovered] = useState(false);

  if (!editable) return <>{children}</>;

  return (
    <div
      className={cn("relative transition-all duration-200 rounded-xl", hovered && "bg-slate-50/50 ring-1 ring-slate-100 shadow-inner", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}

      {/* Add button */}
      {onAdd && (
        <div
          className={cn(
            "mt-4 mb-2 flex justify-center transition-all duration-200",
            hovered ? "opacity-100" : "opacity-40"
          )}
        >
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-blue-200 bg-white px-4 py-2 text-[12px] font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md transition-all group/addbtn"
          >
            <Plus className="h-4 w-4 transition-transform group-hover/addbtn:rotate-90" />
            {addLabel}
          </button>
        </div>
      )}
    </div>
  );
}

interface EditableSectionItemProps {
  children: React.ReactNode;
  onRemove?: () => void;
  editable?: boolean;
  className?: string;
}

/**
 * Individual item within a repeatable section.
 * Shows X remove button on hover.
 */
export function EditableSectionItem({
  children,
  onRemove,
  editable = true,
  className,
}: EditableSectionItemProps) {
  const [hovered, setHovered] = useState(false);

  if (!editable) return <div className={className}>{children}</div>;

  return (
    <div
      className={cn("relative group/item", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Remove button */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            "absolute -right-7 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 hover:text-red-700 transition-all duration-150 shadow-sm",
            hovered ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
          )}
          title="Remove"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
      {children}
    </div>
  );
}

interface EditableBulletListProps {
  bullets: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  editable?: boolean;
  className?: string;
  itemClassName?: string;
  placeholder?: string;
  errors?: Record<number, string>;
}

/**
 * A bullet list where each item is editable via contentEditable.
 * Shows + Add bullet / × remove per item on hover.
 */
export function EditableBulletList({
  bullets,
  onChange,
  onAdd,
  onRemove,
  editable = true,
  className,
  itemClassName,
  placeholder = "Describe an achievement or responsibility…",
  errors = {},
}: EditableBulletListProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!editable) {
    return (
      <ul className={className}>
        {bullets.map((b, i) => (
          <li key={i} className={itemClassName} dangerouslySetInnerHTML={{ __html: b }} />
        ))}
      </ul>
    );
  }

  return (
    <div className={cn("group/bullets space-y-1", className)}>
      {bullets.map((bullet, i) => (
        <div
          key={i}
          className="relative group/bullet flex items-start gap-1"
          onMouseEnter={() => setHoveredIdx(i)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Bullet marker */}
          <span className={cn("select-none mt-0.5 shrink-0", itemClassName?.includes("list-disc") ? "text-current" : "")}>•</span>

          {/* Editable content */}
          <div className="relative flex-1 min-w-0 group/bef">
            <div
              contentEditable
              suppressContentEditableWarning
              spellCheck
              data-placeholder={placeholder}
              onBlur={(e) => onChange(i, e.currentTarget.textContent || "")}
              className={cn(
                "outline-none min-w-[4rem] min-h-[1.5em] cursor-text rounded px-1 transition-all duration-100 block w-full",
                "before:pointer-events-none relative",
                !bullet && "before:content-[attr(data-placeholder)] before:text-slate-400 before:relative before:italic bg-slate-50/30 border border-dashed border-slate-200",
                errors[i]
                  ? "ring-2 ring-red-400 bg-red-50/20 border-red-200"
                  : "hover:bg-slate-50 hover:border-slate-300 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:shadow-md",
                itemClassName
              )}
              dangerouslySetInnerHTML={{ __html: bullet }}
            />
            {errors[i] && (
              <span className="absolute -top-5 left-0 z-50 whitespace-nowrap rounded bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg opacity-0 group-hover/bef:opacity-100 transition-opacity pointer-events-none">
                {errors[i]}
              </span>
            )}
          </div>

          {/* Remove bullet */}
          {bullets.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              className={cn(
                "ml-1 h-4 w-4 shrink-0 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 transition-all duration-100 mt-0.5",
                hoveredIdx === i ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      ))}

      {/* Add bullet */}
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-all opacity-40 group-hover/bullets:opacity-100 focus:opacity-100 bg-blue-50/20 hover:bg-blue-50 px-3 py-1 rounded border border-dashed border-blue-200"
      >
        <Plus className="h-3 w-3" />
        Add Bullet Point
      </button>
    </div>
  );
}
