interface NotepadProps {
  value: string;
  onChange: (value: string) => void;
}

export function Notepad({ value, onChange }: NotepadProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-[hsl(var(--notepad-bg))]">
      <div className="absolute right-3 top-3 z-10">
        <span className="rounded-md bg-muted/80 px-3 py-1.5 text-xs font-medium text-muted-foreground">
          Notes autosave
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 pt-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start taking notes here..."
          className="notepad-lines h-full min-h-[500px] w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </div>
  );
}
