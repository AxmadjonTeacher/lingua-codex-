import { Session, Phrase } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
const STORAGE_KEY = "lingua-codex-sessions";

// Local storage functions (for non-authenticated users)
function getLocalSessions(): Session[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalSession(session: Session): void {
  const sessions = getLocalSessions();
  const existingIndex = sessions.findIndex((s) => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = { ...session, updatedAt: Date.now() };
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function deleteLocalSession(id: string): void {
  const sessions = getLocalSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function getLocalSession(id: string): Session | undefined {
  return getLocalSessions().find((s) => s.id === id);
}

// Database functions (for authenticated users)
interface DbSession {
  id: string;
  user_id: string;
  title: string;
  youtube_url: string;
  youtube_id: string;
  notes: string;
  phrases: unknown;
  created_at: string;
  updated_at: string;
}

function dbToSession(db: DbSession): Session {
  return {
    id: db.id,
    title: db.title,
    youtubeUrl: db.youtube_url,
    youtubeId: db.youtube_id,
    notes: db.notes || "",
    phrases: (db.phrases as Phrase[]) || [],
    createdAt: new Date(db.created_at).getTime(),
    updatedAt: new Date(db.updated_at).getTime(),
  };
}

export async function getSessions(): Promise<Session[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return getLocalSessions();
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }

  return (data as unknown as DbSession[]).map(dbToSession);
}

export async function saveSession(session: Session): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    saveLocalSession(session);
    return;
  }

  // Check if session exists
  const { data: existing } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", session.id)
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from("sessions")
      .update({
        title: session.title,
        youtube_url: session.youtubeUrl,
        youtube_id: session.youtubeId,
        notes: session.notes,
        phrases: session.phrases as unknown as Json,
      })
      .eq("id", session.id);

    if (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  } else {
    // Insert new
    const { error } = await supabase
      .from("sessions")
      .insert([{
        id: session.id,
        user_id: user.id,
        title: session.title,
        youtube_url: session.youtubeUrl,
        youtube_id: session.youtubeId,
        notes: session.notes,
        phrases: session.phrases as unknown as Json,
      }]);

    if (error) {
      console.error("Error inserting session:", error);
      throw error;
    }
  }
}

export async function deleteSession(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    deleteLocalSession(id);
    return;
  }

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
}

export async function getSession(id: string): Promise<Session | undefined> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return getLocalSession(id);
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching session:", error);
    return undefined;
  }

  return dbToSession(data as unknown as DbSession);
}

// Migration function to move local sessions to database
export async function migrateLocalSessions(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return;

  const localSessions = getLocalSessions();
  if (localSessions.length === 0) return;

  for (const session of localSessions) {
    try {
      await saveSession(session);
    } catch (error) {
      console.error("Error migrating session:", error);
    }
  }

  // Clear local storage after successful migration
  localStorage.removeItem(STORAGE_KEY);
}
