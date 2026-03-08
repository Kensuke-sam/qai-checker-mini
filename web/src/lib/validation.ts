import { z } from "zod";
import { REPORT_REASONS, REVIEW_TAGS, TAKEDOWN_REASONS } from "@/lib/constants";
import {
  containsAssertiveLanguage,
  containsBlockedPersonalInfo,
  sanitizePlainText,
} from "@/lib/text";

const stringOrEmpty = z
  .string()
  .trim()
  .transform((value) => value || undefined);

const neutralText = z
  .string()
  .trim()
  .refine((value) => !containsBlockedPersonalInfo(value), {
    message: "個人の連絡先や特定情報は入力できません。",
  })
  .refine((value) => !containsAssertiveLanguage(value), {
    message: "断定的な表現ではなく、体験ベースの中立な書き方にしてください。",
  });

export const reviewInputSchema = z
  .object({
    placeId: stringOrEmpty,
    placeName: stringOrEmpty,
    placeAddress: stringOrEmpty,
    placeNearestStation: stringOrEmpty,
    title: neutralText.min(8, "見出しは8文字以上で入力してください。").max(80),
    body: neutralText
      .min(60, "本文は60文字以上で入力してください。")
      .max(2000),
    tags: z.array(z.enum(REVIEW_TAGS)).min(1).max(4),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    confirmSubjective: z.literal(true),
    confirmGuideline: z.literal(true),
  })
  .superRefine((value, ctx) => {
    if (!value.placeId && !value.placeName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["placeName"],
        message: "既存の勤務先を選ぶか、新しい勤務先名を入力してください。",
      });
    }
  });

const optionalText = z
  .string()
  .transform((value) => sanitizePlainText(value))
  .transform((value) => value || undefined)
  .optional();

const optionalUuid = z.string().uuid().optional().or(z.literal(""));

export const reviewSubmissionSchema = z
  .object({
    existingPlaceId: optionalUuid,
    newPlaceName: optionalText,
    newPlaceAddress: optionalText,
    newPlaceNearestStation: optionalText,
    newPlaceLat: optionalText,
    newPlaceLng: optionalText,
    newPlaceAreaTag: optionalText,
    title: neutralText.min(8, "見出しは8文字以上で入力してください。").max(80),
    body: neutralText.min(60, "本文は60文字以上で入力してください。").max(2000),
    tags: z.array(z.enum(REVIEW_TAGS)).min(1, "タグを1つ以上選んでください。").max(4),
    rating: z
      .string()
      .optional()
      .transform((value) => {
        if (!value) {
          return null;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      })
      .pipe(z.number().int().min(1).max(5).nullable()),
    acceptedSubjective: z.literal("on"),
    acceptedGuidelines: z.literal("on"),
  })
  .superRefine((value, ctx) => {
    const hasExistingPlace = Boolean(value.existingPlaceId);
    const hasNewPlace = Boolean(value.newPlaceName);

    if (!hasExistingPlace && !hasNewPlace) {
      ctx.addIssue({
        code: "custom",
        path: ["newPlaceName"],
        message: "既存の勤務先を選ぶか、新しい勤務先名を入力してください。",
      });
    }

    if (hasNewPlace) {
      if (!value.newPlaceAreaTag) {
        ctx.addIssue({
          code: "custom",
          path: ["newPlaceAreaTag"],
          message: "都道府県またはエリア名を入力してください。",
        });
      }

      if (!value.newPlaceAddress && !value.newPlaceNearestStation) {
        ctx.addIssue({
          code: "custom",
          path: ["newPlaceAddress"],
          message: "住所または最寄り駅を入力してください。",
        });
      }

      if (!value.newPlaceLat || Number.isNaN(Number(value.newPlaceLat))) {
        ctx.addIssue({
          code: "custom",
          path: ["newPlaceLat"],
          message: "緯度を入力してください。",
        });
      }

      if (!value.newPlaceLng || Number.isNaN(Number(value.newPlaceLng))) {
        ctx.addIssue({
          code: "custom",
          path: ["newPlaceLng"],
          message: "経度を入力してください。",
        });
      }
    }
  });

export const reportInputSchema = z.object({
  targetType: z.enum(["place", "review"]),
  targetId: z.string().min(1, "通報対象が不正です。"),
  reason: z.enum(REPORT_REASONS),
  detail: neutralText.min(10, "補足は10文字以上で入力してください。").max(1000),
});

export const reportSubmissionSchema = z.object({
  targetType: z.enum(["place", "review"]),
  targetId: z.string().min(1, "通報対象が不正です。"),
  reason: z.enum(REPORT_REASONS),
  detail: neutralText.max(1000).optional().or(z.literal("")),
});

export const takedownInputSchema = z.object({
  targetUrl: z.string().trim().url("対象URLを正しく入力してください。"),
  contactName: z.string().trim().min(2).max(80),
  contactEmail: z.string().trim().email("メールアドレスを正しく入力してください。"),
  reason: neutralText.min(20, "理由は20文字以上で入力してください。").max(1500),
  evidenceUrl: stringOrEmpty.refine(
    (value) => !value || /^https?:\/\//.test(value),
    "URL形式で入力してください。",
  ),
});

export const takedownSubmissionSchema = z.object({
  targetUrl: z.string().trim().url("対象URLを正しく入力してください。"),
  contactName: z.string().trim().min(2).max(80),
  contactEmail: z.string().trim().email("メールアドレスを正しく入力してください。"),
  reason: z.enum(TAKEDOWN_REASONS),
  evidenceUrl: z
    .union([z.string().trim().url("URL形式で入力してください。"), z.literal(""), z.undefined()])
    .transform((value) => value || null),
});

export const officialResponseInputSchema = z.object({
  placeId: z.string().min(1, "勤務先IDが不正です。"),
  body: neutralText.min(40, "コメント本文は40文字以上で入力してください。").max(1500),
  contactName: stringOrEmpty,
  contactEmail: stringOrEmpty.refine(
    (value) => !value || z.string().email().safeParse(value).success,
    "メールアドレスを正しく入力してください。",
  ),
});

export const officialResponseSubmissionSchema = z.object({
  placeId: z.string().min(1, "勤務先IDが不正です。"),
  contactName: z.string().trim().min(2).max(80),
  contactEmail: z
    .union([z.string().trim().email("メールアドレスを正しく入力してください。"), z.literal(""), z.undefined()])
    .transform((value) => value || null),
  body: neutralText.min(40, "コメント本文は40文字以上で入力してください。").max(1500),
  acceptedGuidelines: z.literal("on"),
});

export const flattenFieldErrors = (
  parseResult:
    | { success: true }
    | { success: false; error: z.ZodError<Record<string, unknown>> },
) => {
  if (parseResult.success) {
    return {};
  }

  return parseResult.error.flatten().fieldErrors;
};

export function normalizeReviewInput(input: z.infer<typeof reviewSubmissionSchema>) {
  return {
    existingPlaceId: input.existingPlaceId || null,
    newPlaceName: input.newPlaceName ?? null,
    newPlaceAddress: input.newPlaceAddress ?? null,
    newPlaceNearestStation: input.newPlaceNearestStation ?? null,
    newPlaceLat: input.newPlaceLat ? Number(input.newPlaceLat) : null,
    newPlaceLng: input.newPlaceLng ? Number(input.newPlaceLng) : null,
    newPlaceAreaTag: input.newPlaceAreaTag ?? null,
    title: input.title,
    body: input.body,
    tags: input.tags,
    rating: input.rating,
  };
}

export function normalizeReportInput(input: z.infer<typeof reportSubmissionSchema>) {
  return {
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason,
    detail: input.detail || null,
  };
}

export function normalizeTakedownInput(
  input: z.infer<typeof takedownSubmissionSchema>,
) {
  return {
    targetUrl: input.targetUrl,
    contactName: sanitizePlainText(input.contactName),
    contactEmail: input.contactEmail,
    reason: input.reason,
    evidenceUrl: input.evidenceUrl,
  };
}

export function normalizeOfficialResponseInput(
  input: z.infer<typeof officialResponseSubmissionSchema>,
) {
  return {
    placeId: input.placeId,
    contactName: sanitizePlainText(input.contactName),
    contactEmail: input.contactEmail,
    body: input.body,
  };
}
