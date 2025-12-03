import { Link, useLocation } from "react-router-dom";
import { BookOpen, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" />
          <span className="font-heading text-2xl font-semibold text-foreground">
            Lingua Codex
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button
            variant={location.pathname === "/" ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Study</span>
            </Link>
          </Button>
          <Button
            variant={location.pathname === "/phrase-box" ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/phrase-box" className="flex items-center gap-2">
              <Library className="h-4 w-4" />
              <span className="hidden sm:inline">Phrase Box</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
