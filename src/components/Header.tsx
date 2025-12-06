import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { User as UserIcon, Mail } from "lucide-react";
import { migrateLocalSessions } from "@/lib/storage";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
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

        {user ? (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/profile")}>
            <UserIcon className="h-4 w-4" />
            Profile
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/auth")}>
            <Mail className="h-4 w-4" />
            Email
          </Button>
        )}
      </div>
    </header>
  );
}
