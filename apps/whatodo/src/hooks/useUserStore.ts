"use client";

import { useState, useEffect, useCallback } from "react";
import { missions, badges, type Mission, type Badge } from "@/data/missions";
import { places } from "@/data/places";

export interface Review {
  id: string;
  placeId: string;
  placeName: string;
  content: string;
  rating: number;
  date: string;
  nickname: string;
}

export interface UserState {
  nickname: string;
  wishlist: string[];      // place IDs
  visited: string[];       // place IDs
  completedMissions: string[];
  earnedBadges: string[];
  points: number;
  reviews: Review[];
}

const DEFAULT_STATE: UserState = {
  nickname: "",
  wishlist: [],
  visited: [],
  completedMissions: [],
  earnedBadges: [],
  points: 0,
  reviews: [],
};

function loadState(): UserState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem("cangaza_user");
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: UserState) {
  if (typeof window === "undefined") return;
  localStorage.setItem("cangaza_user", JSON.stringify(state));
}

export function useUserStore() {
  const [state, setState] = useState<UserState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  const update = useCallback((updater: (prev: UserState) => UserState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  // ── Wishlist ──
  const toggleWishlist = useCallback((placeId: string) => {
    update((prev) => ({
      ...prev,
      wishlist: prev.wishlist.includes(placeId)
        ? prev.wishlist.filter((id) => id !== placeId)
        : [...prev.wishlist, placeId],
    }));
  }, [update]);

  // ── Visited ──
  const toggleVisited = useCallback((placeId: string) => {
    update((prev) => {
      const alreadyVisited = prev.visited.includes(placeId);
      const nextVisited = alreadyVisited
        ? prev.visited.filter((id) => id !== placeId)
        : [...prev.visited, placeId];

      // Check mission completion
      const { completedMissions, earnedBadges, points } = checkMissions(
        nextVisited,
        prev.reviews.length,
        prev.completedMissions,
        prev.earnedBadges,
        prev.points
      );

      return { ...prev, visited: nextVisited, completedMissions, earnedBadges, points };
    });
  }, [update]);

  // ── Reviews ──
  const addReview = useCallback((review: Omit<Review, "id" | "date">) => {
    update((prev) => {
      const newReview: Review = {
        ...review,
        id: `r_${Date.now()}`,
        date: new Date().toLocaleDateString("ko-KR"),
      };
      const nextReviews = [newReview, ...prev.reviews];

      // community mission check
      const { completedMissions, earnedBadges, points } = checkMissions(
        prev.visited,
        nextReviews.length,
        prev.completedMissions,
        prev.earnedBadges,
        prev.points
      );

      return { ...prev, reviews: nextReviews, completedMissions, earnedBadges, points };
    });
  }, [update]);

  const setNickname = useCallback((nickname: string) => {
    update((prev) => ({ ...prev, nickname }));
  }, [update]);

  return {
    ...state,
    hydrated,
    toggleWishlist,
    toggleVisited,
    addReview,
    setNickname,
  };
}

function checkMissions(
  visited: string[],
  reviewCount: number,
  prevCompleted: string[],
  prevBadges: string[],
  prevPoints: number
): { completedMissions: string[]; earnedBadges: string[]; points: number } {
  let completedMissions = [...prevCompleted];
  let earnedBadges = [...prevBadges];
  let points = prevPoints;

  for (const mission of missions) {
    if (completedMissions.includes(mission.id)) continue;

    let done = false;

    if (mission.id === "first-visit") {
      done = visited.length >= 1;
    } else if (mission.id === "write-review-3") {
      done = reviewCount >= 3;
    } else if (mission.id === "korean-food-3") {
      const koreanIds = places.filter((p) => p.tags.includes("한식") || p.tags.includes("한인타운")).map((p) => p.id);
      done = visited.filter((id) => koreanIds.includes(id)).length >= 3;
    } else if (mission.id === "foodie-5") {
      const foodIds = places.filter((p) => p.category === "맛집").map((p) => p.id);
      done = visited.filter((id) => foodIds.includes(id)).length >= 5;
    } else if (mission.id === "nature-3") {
      const natureIds = places.filter((p) => p.category === "자연").map((p) => p.id);
      done = visited.filter((id) => natureIds.includes(id)).length >= 3;
    } else if (mission.id === "toronto-master") {
      const featuredIds = places.filter((p) => p.featured).map((p) => p.id);
      done = featuredIds.every((id) => visited.includes(id));
    } else if (mission.id === "activity-3") {
      const actIds = places.filter((p) => p.category === "액티비티").map((p) => p.id);
      done = visited.filter((id) => actIds.includes(id)).length >= 3;
    } else if (mission.requiredPlaceIds) {
      done = mission.requiredPlaceIds.every((id) => visited.includes(id));
    }

    if (done) {
      completedMissions = [...completedMissions, mission.id];
      points += mission.points;
      if (mission.badge && !earnedBadges.includes(mission.badge)) {
        earnedBadges = [...earnedBadges, mission.badge];
      }
    }
  }

  return { completedMissions, earnedBadges, points };
}
