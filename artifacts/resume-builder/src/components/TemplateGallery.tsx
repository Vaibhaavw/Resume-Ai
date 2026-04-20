import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useListTemplates } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { Layout, Check } from "lucide-react";

interface Props {
  selectedId: number;
  onSelect: (id: number) => void;
  userTier?: string;
}

// Maps swatch option → theme index matching SECTOR_THEMES in ResumePreview
const SWATCH_CONFIG = [
  { color: "#2563EB", themeIdx: 0, label: "Blue" },
  { color: "#059669", themeIdx: 1, label: "Emerald" },
  { color: "#7C3AED", themeIdx: 3, label: "Violet" },
  { color: "#E11D48", themeIdx: 7, label: "Rose" },
  { color: "#D97706", themeIdx: 4, label: "Amber" },
];

const LAYOUT_ORDER = [
  "classic-v3",
  "minimal",
  "minimal-v2",
  "creative",
  "dark",
  "academic-classic",
  "modern-sidebar",
  "tech-executive",
  "double-column",
  "corporate-elite",
];

function encodeTemplateId(layoutIdx: number, themeIdx: number): number {
  return layoutIdx * 8 + themeIdx + 1;
}

function decodeTemplateId(id: number): { layoutIdx: number; themeIdx: number } {
  const zero = Math.max(0, id - 1);
  return { layoutIdx: Math.floor(zero / 8), themeIdx: zero % 8 };
}

interface ThumbnailProps {
  style: string;
  accentColor: string;
  previewUrl?: string;
}

function TemplateThumbnail({ style, accentColor, previewUrl }: ThumbnailProps) {
  const isDark = style === "dark" || style === "executive-cv";

  if (previewUrl) {
    return (
      <div className="relative aspect-[8.5/11] rounded-xl overflow-hidden border border-slate-100 shadow-sm mb-4">
        <img src={previewUrl} alt={style} className="w-full h-full object-cover" />
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: accentColor }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-[8.5/11] rounded-lg overflow-hidden border shadow-md mb-4",
        isDark ? "bg-[#111] border-slate-800" : "bg-white border-slate-100"
      )}
    >
      <div
        className="h-8 w-full"
        style={{ backgroundColor: isDark ? "#1a1a1a" : accentColor + "20", borderBottom: `2px solid ${accentColor}` }}
      >
        <div className="ml-4 mt-2 w-20 h-2 rounded" style={{ backgroundColor: accentColor }} />
      </div>
      <div className="p-4 space-y-2">
        {[100, 80, 90, 60, 75].map((w, i) => (
          <div
            key={i}
            className={cn("h-1.5 rounded-full", isDark ? "bg-white/10" : "bg-slate-100")}
            style={{ width: `${w}%` }}
          />
        ))}
        <div className="pt-1 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <div className={cn("h-1.5 w-20 rounded-full", isDark ? "bg-white/10" : "bg-slate-100")} />
        </div>
        {[70, 55].map((w, i) => (
          <div
            key={i + 10}
            className={cn("h-1.5 rounded-full ml-3", isDark ? "bg-white/10" : "bg-slate-100")}
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />
    </div>
  );
}

export function TemplateGallery({ selectedId, onSelect, userTier = "free" }: Props) {
  const { data: templates, isLoading } = useListTemplates();
  const [open, setOpen] = useState(false);

  // Derive initial color selections from the currently selected templateId
  const { layoutIdx: initLayout, themeIdx: initTheme } = decodeTemplateId(selectedId);
  const initStyle = LAYOUT_ORDER[initLayout] ?? LAYOUT_ORDER[0];

  const [colorSelections, setColorSelections] = useState<Record<string, number>>(() => ({
    [initStyle]: initTheme,
  }));

  // De-duplicate by style — one card per layout
  const displayTemplates = LAYOUT_ORDER.map((style) =>
    templates?.find((t) => t.style === style) ? { ...templates!.find((t) => t.style === style)!, style } : null
  ).filter(Boolean) as NonNullable<typeof templates>[number][];

  const handleSelect = (layoutStyle: string) => {
    const layoutIdx = LAYOUT_ORDER.indexOf(layoutStyle);
    const themeIdx = colorSelections[layoutStyle] ?? 0;
    const finalId = encodeTemplateId(layoutIdx, themeIdx);
    onSelect(finalId);
    setOpen(false);
  };

  // Sync color selection when a swatch is clicked without closing dialog
  const handleSwatchClick = (style: string, themeIdx: number) => {
    setColorSelections((prev) => ({ ...prev, [style]: themeIdx }));
    // Also update the live preview in the editor immediately
    const layoutIdx = LAYOUT_ORDER.indexOf(style);
    const finalId = encodeTemplateId(layoutIdx, themeIdx);
    onSelect(finalId); // real-time preview update
  };

  const { layoutIdx: curLayout } = decodeTemplateId(selectedId);
  const currentStyle = LAYOUT_ORDER[curLayout];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-9 text-xs font-bold shadow-sm border-gray-200 hover:border-primary/50 bg-white"
        >
          <Layout className="w-4 h-4 text-primary" />
          Choose Template
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[1100px] max-h-[92vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 bg-white border-b sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
                Choose Your Design
              </DialogTitle>
              <p className="text-slate-400 text-sm font-medium mt-1">
                Select a layout, pick an accent color — preview updates live
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-8 bg-[#FBFBFC]">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[8.5/11] bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayTemplates.map((template) => {
                const selectedThemeIdx = colorSelections[template.style] ?? 0;
                const swatch = SWATCH_CONFIG.find((s) => s.themeIdx === selectedThemeIdx) ?? SWATCH_CONFIG[0];
                const accentColor = swatch.color;
                const label = template.name.split(" - ")[0];

                const layoutIdx = LAYOUT_ORDER.indexOf(template.style);
                const currentId = encodeTemplateId(layoutIdx, selectedThemeIdx);
                const isSelected = selectedId === currentId;

                return (
                  <div
                    key={template.style}
                    className={cn(
                      "flex flex-col bg-white p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                      isSelected
                        ? "ring-2 shadow-xl"
                        : "border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200"
                    )}
                    style={isSelected ? { borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}40` } : {}}
                    onClick={() => handleSelect(template.style)}
                  >
                    {/* Thumbnail */}
                    <div className="relative">
                      <TemplateThumbnail style={template.style} accentColor={accentColor} previewUrl={template.previewUrl || undefined} />
                      {isSelected && (
                        <div
                          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg z-10"
                          style={{ backgroundColor: accentColor }}
                        >
                          <Check className="w-4 h-4 stroke-[3px]" />
                        </div>
                      )}
                    </div>

                    {/* Swatches */}
                    <div className="flex justify-center gap-2 mb-3">
                      {SWATCH_CONFIG.map((config) => {
                        const active = selectedThemeIdx === config.themeIdx;
                        return (
                          <button
                            key={config.themeIdx}
                            title={config.label}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSwatchClick(template.style, config.themeIdx);
                            }}
                            className={cn(
                              "w-4 h-4 rounded-full border-2 border-white transition-all hover:scale-125 focus:outline-none",
                              active ? "scale-110 ring-2 ring-offset-1" : ""
                            )}
                            style={{
                              backgroundColor: config.color,
                              boxShadow: active ? `0 0 0 2px ${config.color}` : undefined,
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Label */}
                    <div className="text-center">
                      <h3 className="font-bold text-xs text-slate-800 leading-tight">{label}</h3>
                      <p className="text-[9px] font-semibold mt-0.5" style={{ color: accentColor }}>
                        {swatch.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t bg-white flex items-center justify-between sticky bottom-0 z-10">
          <p className="text-xs text-slate-400">
            Click a template to apply it instantly to your resume
          </p>
          <Button variant="ghost" size="sm" className="text-slate-400 text-xs" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
