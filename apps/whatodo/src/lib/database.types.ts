export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ProfileRow = {
  id: string;
  nickname: string;
  avatar_emoji: string;
  points: number;
  visit_count: number;
  badges: string[];
  visited_places: string[];
  wishlist_places: string[];
  show_visits_to_friends: boolean;
  created_at: string;
  updated_at: string;
  last_visit_at: string | null;
};

export type FriendshipRow = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
};

export type PlaceVisitRow = {
  id: string;
  user_id: string;
  place_id: string;
  place_name: string;
  city: string;
  visited_at: string;
  note: string | null;
};

export type InviteRow = {
  id: string;
  inviter_id: string;
  invitee_id: string;
  place_id: string;
  place_name: string;
  proposed_date: string;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MessageRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          nickname: string;
          avatar_emoji?: string;
          points?: number;
          visit_count?: number;
          badges?: string[];
          visited_places?: string[];
          wishlist_places?: string[];
          show_visits_to_friends?: boolean;
          last_visit_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string;
          avatar_emoji?: string;
          points?: number;
          visit_count?: number;
          badges?: string[];
          visited_places?: string[];
          wishlist_places?: string[];
          show_visits_to_friends?: boolean;
          last_visit_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      friendships: {
        Row: FriendshipRow;
        Insert: {
          id?: string;
          requester_id: string;
          receiver_id: string;
          status?: "pending" | "accepted" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "accepted" | "rejected";
          updated_at?: string;
        };
      };
      place_visits: {
        Row: PlaceVisitRow;
        Insert: {
          id?: string;
          user_id: string;
          place_id: string;
          place_name: string;
          city: string;
          note?: string | null;
          visited_at?: string;
        };
        Update: {
          note?: string | null;
          visited_at?: string;
        };
      };
      invites: {
        Row: InviteRow;
        Insert: {
          id?: string;
          inviter_id: string;
          invitee_id: string;
          place_id: string;
          place_name: string;
          proposed_date: string;
          message?: string | null;
          status?: "pending" | "accepted" | "declined";
          calendar_event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "accepted" | "declined";
          calendar_event_id?: string | null;
          updated_at?: string;
        };
      };
      messages: {
        Row: MessageRow;
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Friendship = Database["public"]["Tables"]["friendships"]["Row"];
export type PlaceVisit = Database["public"]["Tables"]["place_visits"]["Row"];
export type Invite = Database["public"]["Tables"]["invites"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
