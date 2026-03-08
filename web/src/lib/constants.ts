export const SITE_NAME = "Shift Notes";
export const SITE_TAGLINE =
  "アルバイト体験談を中立的に共有する、承認制の口コミプラットフォーム。";

export const DEFAULT_AREA_LABEL =
  process.env.NEXT_PUBLIC_AREA_LABEL ?? "日本全国";
export const DEFAULT_AREA_TAG =
  process.env.NEXT_PUBLIC_AREA_TAG ?? "nationwide";
export const DEFAULT_MAP_CENTER = {
  lat: Number(process.env.NEXT_PUBLIC_MAP_CENTER_LAT ?? 36.2048),
  lng: Number(process.env.NEXT_PUBLIC_MAP_CENTER_LNG ?? 138.2529),
  zoom: Number(process.env.NEXT_PUBLIC_MAP_CENTER_ZOOM ?? 5),
};

export const REVIEW_TAGS = [
  "給与",
  "シフト",
  "人間関係",
  "研修",
  "残業",
  "安全",
  "接客",
  "休憩",
] as const;

export const REPORT_REASONS = [
  "個人特定につながる",
  "差別・脅迫表現がある",
  "断定的すぎる",
  "事実誤認のおそれ",
  "スパム・宣伝",
  "その他",
] as const;

export const TAKEDOWN_REASONS = [
  "事実誤認がある",
  "個人が特定される",
  "権利侵害のおそれ",
  "訂正を求めたい",
  "その他",
] as const;

export const PROHIBITED_ITEMS = [
  "個人名・電話番号・メールアドレスなど、個人を特定できる情報",
  "差別・脅迫・暴力を助長する表現",
  "虚偽の投稿や、真偽不明な断定表現の羅列",
  "勤務先や個人を一方的に断定するレッテル貼り",
];

export const SUBJECTIVE_NOTICE =
  "ここは体験談（主観）を共有する場所です。断定表現や個人特定は書かないでください。";
export const FACTUAL_NOTICE =
  "未払い・違法などの断定は避け、事実として体験したことを時系列で書いてください。";
export const DETAIL_DISCLAIMER =
  "投稿内容の正確性は保証しません。削除申請/訂正は所定フォームから。";
export const TAKEDOWN_NOTICE =
  "内容確認のため連絡することがあります。虚偽申請はお控えください。";

export const DEFAULT_REVIEW_LIMIT = 24;
