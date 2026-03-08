import { cookies, headers } from "next/headers";

export const getRequestFingerprint = async () => {
  const requestHeaders = await headers();
  const cookieStore = await cookies();

  const ipHeader =
    requestHeaders.get("x-forwarded-for") ||
    requestHeaders.get("x-real-ip") ||
    "0.0.0.0";
  const authorIp = ipHeader.split(",")[0]?.trim() || "0.0.0.0";
  const authorUa = requestHeaders.get("user-agent") || "unknown";

  let visitorId = cookieStore.get("visitor_id")?.value;
  if (!visitorId) {
    visitorId = crypto.randomUUID();
  }

  return { authorIp, authorUa, visitorId };
};

export function getClientIp(headersList: Headers) {
  const ipHeader =
    headersList.get("x-forwarded-for") ||
    headersList.get("x-real-ip") ||
    "0.0.0.0";

  return ipHeader.split(",")[0]?.trim() || "0.0.0.0";
}

export function getClientUserAgent(headersList: Headers) {
  return headersList.get("user-agent") || "unknown";
}
