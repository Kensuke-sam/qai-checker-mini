export type ModerationStatus = "approved" | "pending" | "rejected";
export type CaseStatus = "received" | "investigating" | "resolved";
export type AdminRole = "moderator" | "admin";

export type Place = {
  id: string;
  name: string;
  address: string | null;
  nearest_station: string | null;
  lat: number | null;
  lng: number | null;
  area_tag: string;
  status: ModerationStatus;
  moderation_note: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  place_id: string;
  title: string;
  body: string;
  tags: string[];
  rating: number | null;
  status: ModerationStatus;
  author_id: string;
  author_ip: string;
  author_ua: string;
  moderation_note: string | null;
  created_at: string;
};

export type Report = {
  id: string;
  target_type: "place" | "review";
  target_id: string;
  reason: string;
  detail: string | null;
  reporter_ip: string;
  reporter_ua: string;
  status: CaseStatus;
  created_at: string;
  admin_notes: string | null;
};

export type TakedownRequest = {
  id: string;
  target_url: string;
  contact_name: string;
  contact_email: string;
  reason: string;
  evidence_url: string | null;
  created_at: string;
  status: CaseStatus;
  admin_notes: string | null;
};

export type OfficialResponse = {
  id: string;
  place_id: string;
  body: string;
  status: ModerationStatus;
  moderation_note: string | null;
  contact_name: string | null;
  contact_email: string | null;
  created_at: string;
};

export type AdminRecord = {
  user_id: string;
  role: AdminRole;
};

export type AuditLog = {
  id: string;
  actor_user_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  detail: Record<string, string | number | boolean | null | undefined | string[]>;
  created_at: string;
};

export type PlaceWithCounts = Place & {
  approved_review_count: number;
  latest_review_at: string | null;
};

export type PublicPlaceDetail = {
  place: Place | null;
  reviews: Review[];
  officialResponses: OfficialResponse[];
};
