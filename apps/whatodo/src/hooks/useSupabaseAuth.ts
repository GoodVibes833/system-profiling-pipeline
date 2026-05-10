"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/database.types";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

export function useSupabaseAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await (supabase.from("profiles") as any)
      .select("*")
      .eq("id", userId)
      .single();
    return (data as unknown) as Profile | null;
  }, []);

  const createProfile = useCallback(
    async (user: User, nickname: string, avatarEmoji: string) => {
      const { data } = await (supabase.from("profiles") as any)
        .insert({
          id: user.id,
          nickname,
          avatar_emoji: avatarEmoji,
          points: 0,
          visit_count: 0,
          badges: [],
          visited_places: [],
          wishlist_places: [],
          show_visits_to_friends: true,
        })
        .select()
        .single();
      return (data as unknown) as Profile | null;
    },
    []
  );

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({ user: session.user, session, profile, loading: false });
      } else {
        setState({ user: null, session: null, profile: null, loading: false });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({ user: session.user, session, profile, loading: false });
        } else {
          setState({ user: null, session: null, profile: null, loading: false });
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [fetchProfile]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) return;
    const { data } = await (supabase.from("profiles") as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", state.user.id)
      .select()
      .single();
    if (data) setState((s) => ({ ...s, profile: (data as unknown) as Profile }));
  };

  return {
    ...state,
    signInWithGoogle,
    signOut,
    updateProfile,
    createProfile,
    fetchProfile,
  };
}
