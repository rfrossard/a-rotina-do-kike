export const PARENT_COOKIE_NAME = "kike_parent_session";
export const PARENT_SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60;

function sessionSecret() {
  return process.env.PARENT_SESSION_SECRET
    ?? (process.env.NODE_ENV !== "production" ? "rotina-do-kike-local-development" : "");
}

async function signSession(expiresAt: number) {
  const payload = `parent|${expiresAt}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const encoded = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return `${expiresAt}.${encoded}`;
}

export async function readParentSession(request: Request) {
  const value = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${PARENT_COOKIE_NAME}=`))
    ?.slice(PARENT_COOKIE_NAME.length + 1);

  if (!value || !sessionSecret()) return false;
  const [expiresText] = value.split(".");
  const expiresAt = Number(expiresText);
  if (!expiresAt || expiresAt < Date.now()) return false;
  return await signSession(expiresAt) === value;
}

export async function createParentSessionCookie() {
  const expiresAt = Date.now() + PARENT_SESSION_DURATION_SECONDS * 1000;
  const session = await signSession(expiresAt);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${PARENT_COOKIE_NAME}=${session}; Path=/; HttpOnly; SameSite=Strict${secure}; Max-Age=${PARENT_SESSION_DURATION_SECONDS}`;
}

export function clearParentSessionCookie() {
  return `${PARENT_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export function hasParentSessionSecret() {
  return Boolean(sessionSecret());
}
