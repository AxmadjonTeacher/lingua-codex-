import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NotepadProps {
  value: string;
  onChange: (value: string) => void;
  onSavePhrase?: (text: string) => void;
}

interface SelectionPopup {
  visible: boolean;
  x: number;
  y: number;
  text: string;
}

export function Notepad({ value, onChange, onSavePhrase }: NotepadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [popup, setPopup] = useState<SelectionPopup>({ visible: false, x: 0, y: 0, text: "" });

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPopup({ visible: false, x: 0, y: 0, text: "" });
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length > 100) {
        setPopup({ visible: false, x: 0, y: 0, text: "" });
        return;
      }

      // Check if selection is within our container
      const range = selection.getRangeAt(0);
      if (!containerRef.current?.contains(range.commonAncestorContainer)) {
        return;
      }

      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      setPopup({
        visible: true,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 40,
        text,
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Hide popup when clicking outside of it
      if (!(e.target as HTMLElement).closest('[data-selection-popup]')) {
        setPopup({ visible: false, x: 0, y: 0, text: "" });
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const handleSavePhrase = () => {
    if (popup.text && onSavePhrase) {
      onSavePhrase(popup.text);
      setPopup({ visible: false, x: 0, y: 0, text: "" });
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-[hsl(var(--notepad-bg))]"
    >
      {/* Selection Popup */}
      {popup.visible && (
        <div
          data-selection-popup
          className="absolute z-20 transform -translate-x-1/2"
          style={{ left: popup.x, top: Math.max(0, popup.y) }}
        >
          <Button
            size="sm"
            onClick={handleSavePhrase}
            className="shadow-lg whitespace-nowrap"
          >
            Save "{popup.text.length > 15 ? popup.text.substring(0, 15) + "..." : popup.text}"
            <Plus className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="absolute right-3 top-3 z-10">
        <span className="rounded-md bg-muted/80 px-3 py-1.5 text-xs font-medium text-muted-foreground">
          Notes autosave
        </span>
      </div>
      <div className="flex-1 overflow-y-auto pt-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start taking notes here..."
          className="notepad-lines h-full min-h-[500px] w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
      </div>
    </div>
  );
}
