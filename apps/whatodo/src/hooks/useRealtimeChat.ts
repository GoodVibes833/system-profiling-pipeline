"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Message, Profile } from "@/lib/database.types";

export function useRealtimeChat(myId: string | undefined, friendId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendProfile, setFriendProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadMessages = useCallback(async () => {
    if (!myId || !friendId) return;
    const { data } = await (supabase.from("messages") as any)
      .select("*")
      .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
      .or(`sender_id.eq.${friendId},receiver_id.eq.${friendId}`)
      .order("created_at", { ascending: true });

    const filtered = ((data ?? []) as Message[]).filter(
      (m) =>
        (m.sender_id === myId && m.receiver_id === friendId) ||
        (m.sender_id === friendId && m.receiver_id === myId)
    );
    setMessages(filtered);

    // Mark unread messages as read
    const unreadIds = filtered
      .filter((m) => m.receiver_id === myId && !m.read)
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      await (supabase.from("messages") as any)
        .update({ read: true })
        .in("id", unreadIds);
    }
  }, [myId, friendId]);

  const loadFriendProfile = useCallback(async () => {
    if (!friendId) return;
    const { data } = await (supabase.from("profiles") as any)
      .select("*")
      .eq("id", friendId)
      .single();
    setFriendProfile((data as unknown) as Profile);
  }, [friendId]);

  useEffect(() => {
    if (!myId || !friendId) {
      setLoading(false);
      return;
    }

    Promise.all([loadMessages(), loadFriendProfile()]).then(() =>
      setLoading(false)
    );

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`chat-${[myId, friendId].sort().join("-")}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === myId && newMsg.receiver_id === friendId) ||
            (newMsg.sender_id === friendId && newMsg.receiver_id === myId)
          ) {
            setMessages((prev) => [...prev, newMsg]);
            // Auto-mark as read if received
            if (newMsg.receiver_id === myId) {
              (supabase.from("messages") as any)
                .update({ read: true })
                .eq("id", newMsg.id)
                .then(() => {});
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId, friendId, loadMessages, loadFriendProfile]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!myId || !friendId || !content.trim()) return;
      await (supabase.from("messages") as any).insert({
        sender_id: myId,
        receiver_id: friendId,
        content: content.trim(),
      });
    },
    [myId, friendId]
  );

  return { messages, friendProfile, loading, sendMessage };
}
