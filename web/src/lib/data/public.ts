import { cache } from "react";

import { DEFAULT_REVIEW_LIMIT } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import type { OfficialResponse, Place, Review } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const getApprovedPlaces = cache(async () => {
  if (!isSupabaseConfigured()) {
    return [] as Place[];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Place[];
});

export const getApprovedPlace = cache(async (placeId: string) => {
  if (!isSupabaseConfigured()) {
    return null as Place | null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("id", placeId)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Place | null) ?? null;
});

export const getApprovedReviewsForPlace = cache(async (placeId: string) => {
  if (!isSupabaseConfigured()) {
    return [] as Review[];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("place_id", placeId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(DEFAULT_REVIEW_LIMIT);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Review[];
});

export const getApprovedResponsesForPlace = cache(async (placeId: string) => {
  if (!isSupabaseConfigured()) {
    return [] as OfficialResponse[];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("official_responses")
    .select("*")
    .eq("place_id", placeId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as OfficialResponse[];
});

export const getHomeSummary = cache(async () => {
  if (!isSupabaseConfigured()) {
    return {
      placeCount: 0,
      reviewCount: 0,
      responseCount: 0,
    };
  }

  const supabase = await createServerSupabaseClient();
  const [{ count: placeCount }, { count: reviewCount }, { count: responseCount }] =
    await Promise.all([
      supabase
        .from("places")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved"),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved"),
      supabase
        .from("official_responses")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved"),
    ]);

  return {
    placeCount: placeCount ?? 0,
    reviewCount: reviewCount ?? 0,
    responseCount: responseCount ?? 0,
  };
});
