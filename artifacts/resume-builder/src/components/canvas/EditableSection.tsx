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
      className={cn("relative", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}

      {/* Add button */}
      {onAdd && (
        <div
          className={cn(
            "mt-2 flex justify-center transition-all duration-150",
            hovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-blue-300 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 hover:border-blue-400 transition-all shadow-sm"
          >
            <Plus className="h-3 w-3" />
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
    <div className={className}>
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
                "outline-none min-w-[4rem] cursor-text rounded px-0.5 transition-all duration-100",
                "before:pointer-events-none",
                !bullet && "before:content-[attr(data-placeholder)] before:text-slate-300 before:absolute before:top-0 before:left-0",
                errors[i]
                  ? "ring-1 ring-red-400 bg-red-50/20"
                  : "hover:ring-1 hover:ring-slate-200 focus:ring-2 focus:ring-blue-400 focus:bg-blue-50/20",
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
        className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-blue-500 hover:text-blue-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <Plus className="h-3 w-3" />
        Add bullet
      </button>
    </div>
  );
}
