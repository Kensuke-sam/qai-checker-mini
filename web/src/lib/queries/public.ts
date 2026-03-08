import { cache } from "react";
import { DEMO_PLACE_DETAILS, DEMO_PLACES } from "@/lib/demo-data";
import type { Place, PlaceWithCounts, PublicPlaceDetail } from "@/lib/types";
import { getPublicSupabaseClient } from "@/lib/supabase/public";

export const listApprovedPlaces = cache(async (): Promise<PlaceWithCounts[]> => {
  const supabase = getPublicSupabaseClient();
  if (!supabase) {
    return DEMO_PLACES;
  }

  const { data: places, error } = await supabase
    .from("places")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !places) {
    return DEMO_PLACES;
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, place_id, created_at")
    .eq("status", "approved");

  const reviewMap = new Map<
    string,
    { count: number; latestReviewAt: string | null }
  >();

  (reviews ?? []).forEach((review) => {
    const current = reviewMap.get(review.place_id) ?? {
      count: 0,
      latestReviewAt: null,
    };

    reviewMap.set(review.place_id, {
      count: current.count + 1,
      latestReviewAt:
        !current.latestReviewAt || review.created_at > current.latestReviewAt
          ? review.created_at
          : current.latestReviewAt,
    });
  });

  return (places as Place[]).map((place) => ({
    ...place,
    approved_review_count: reviewMap.get(place.id)?.count ?? 0,
    latest_review_at: reviewMap.get(place.id)?.latestReviewAt ?? null,
  }));
});

export const getPublicPlaceDetail = cache(
  async (placeId: string): Promise<PublicPlaceDetail> => {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return DEMO_PLACE_DETAILS[placeId] ?? {
        place: DEMO_PLACES[0] ?? null,
        reviews: [],
        officialResponses: [],
      };
    }

    const { data: place } = await supabase
      .from("places")
      .select("*")
      .eq("id", placeId)
      .eq("status", "approved")
      .maybeSingle();

    if (!place) {
      return {
        place: null,
        reviews: [],
        officialResponses: [],
      };
    }

    const [{ data: reviews }, { data: officialResponses }] = await Promise.all([
      supabase
        .from("reviews")
        .select("*")
        .eq("place_id", placeId)
        .eq("status", "approved")
        .order("created_at", { ascending: false }),
      supabase
        .from("official_responses")
        .select("*")
        .eq("place_id", placeId)
        .eq("status", "approved")
        .order("created_at", { ascending: false }),
    ]);

    return {
      place: place as Place,
      reviews: (reviews ?? []) as PublicPlaceDetail["reviews"],
      officialResponses:
        (officialResponses ?? []) as PublicPlaceDetail["officialResponses"],
    };
  },
);
