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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [popup, setPopup] = useState<SelectionPopup>({ visible: false, x: 0, y: 0, text: "" });

  // Handle mouse up on textarea to detect text selection
  const handleMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const text = textarea.value.substring(start, end).trim();
      // Only show if text is valid and not a whole paragraph
      if (text.length > 0 && text.length < 100) {
        setPopup({
          visible: true,
          x: e.clientX,
          y: e.clientY - 40, // Position above cursor
          text: text,
        });
        return;
      }
    }
    setPopup({ visible: false, x: 0, y: 0, text: "" });
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popup.visible && !(e.target as Element).closest('.selection-popover')) {
        setPopup({ visible: false, x: 0, y: 0, text: "" });
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popup.visible]);

  const handleSavePhrase = () => {
    if (popup.text && onSavePhrase) {
      onSavePhrase(popup.text);
      setPopup({ visible: false, x: 0, y: 0, text: "" });
      // Clear selection
      if (textareaRef.current) {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd;
      }
    }
  };

  return (
    <>
      {/* Selection Popup - Fixed positioning */}
      {popup.visible && (
        <div
          className="selection-popover fixed z-50"
          style={{ 
            left: popup.x, 
            top: popup.y,
            transform: 'translateX(-50%)'
          }}
        >
        <Button
            size="sm"
            onClick={handleSavePhrase}
            className="shadow-md whitespace-nowrap h-6 px-2 text-[10px] gap-0.5"
          >
            Save "{popup.text.length > 10 ? popup.text.substring(0, 10) + "…" : popup.text}"
            <Plus className="h-2.5 w-2.5" />
          </Button>
        </div>
      )}

      <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-[hsl(var(--notepad-bg))]">
        <div className="absolute right-3 top-3 z-10">
          <span className="rounded-md bg-muted/80 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Notes autosave
          </span>
        </div>
        <div className="flex-1 overflow-y-auto pt-4">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onMouseUp={handleMouseUp}
            placeholder="Start taking notes here..."
            className="notepad-lines h-full min-h-[500px] w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
      </div>
    </>
  );
}
