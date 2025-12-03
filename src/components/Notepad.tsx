interface NotepadProps {
  value: string;
  onChange: (value: string) => void;
}

export function Notepad({ value, onChange }: NotepadProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-end border-b border-border px-4 py-2">
        <span className="text-xs text-muted-foreground">Notes autosave</span>
      </div>
      <div className="flex-1 p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start taking notes here... (e.g., grammar rules, cultural context)"
          className="notepad-lines h-full w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </div>
  );
}
