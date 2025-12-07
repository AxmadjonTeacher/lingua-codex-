import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { User as UserIcon, Mail, Gamepad2 } from "lucide-react";
import { migrateLocalSessions } from "@/lib/storage";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        // Force re-render on user update events
        if (event === 'USER_UPDATED') {
          setUser({ ...session!.user });
        }
        // Migrate local sessions when user logs in
        if (session?.user) {
          setTimeout(() => {
            migrateLocalSessions();
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-lg font-bold text-primary-foreground">
            L
          </div>
          <span className="text-lg font-semibold text-foreground">
            Lingua Codex
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <a href="https://aljeopardy.vercel.app" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200">
              <Gamepad2 className="h-4 w-4" />
              Fun & Games
            </Button>
          </a>

          {user ? (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/profile")}>
              <UserIcon className="h-4 w-4" />
              {user.user_metadata?.full_name || "Profile"}
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/auth")}>
              <Mail className="h-4 w-4" />
              Email
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
