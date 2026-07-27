type AttemptRecord = {
  count: number;
  blockedUntil: number;
};

const globalAuth = globalThis as typeof globalThis & {
  __kikeParentAttempts?: Map<string, AttemptRecord>;
};

const attempts = globalAuth.__kikeParentAttempts ?? new Map<string, AttemptRecord>();
globalAuth.__kikeParentAttempts = attempts;

const COOKIE_NAME = "kike_parent_session";
const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60;
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

function sessionSecret() {
  return process.env.PARENT_SESSION_SECRET
    ?? (process.env.NODE_ENV !== "production" ? "rotina-do-kike-local-development" : "");
}

function parentPin() {
  return process.env.PARENT_ACCESS_PIN
    ?? (process.env.NODE_ENV !== "production" ? "2468" : "");
}

function visitorKey(request: Request) {
  return request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "local";
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

async function readSession(request: Request) {
  const value = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  if (!value || !sessionSecret()) return false;
  const [expiresText] = value.split(".");
  const expiresAt = Number(expiresText);
  if (!expiresAt || expiresAt < Date.now()) return false;
  return await signSession(expiresAt) === value;
}

async function pinsMatch(received: string, expected: string) {
  const encoder = new TextEncoder();
  const [receivedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(received)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const a = new Uint8Array(receivedHash);
  const b = new Uint8Array(expectedHash);
  return a.every((value, index) => value === b[index]);
}

export async function GET(request: Request) {
  return Response.json({ authenticated: await readSession(request) });
}

export async function DELETE() {
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
      },
    },
  );
}

export async function POST(request: Request) {
  const configuredPin = parentPin();
  if (!configuredPin || !sessionSecret()) {
    return Response.json(
      { message: "O acesso dos responsáveis ainda não foi configurado" },
      { status: 503 },
    );
  }

  const body = await request.json() as { pin?: string };
  const pin = body.pin?.replace(/\D/g, "") ?? "";
  if (pin.length !== 4) {
    return Response.json({ message: "Digite os 4 números do PIN" }, { status: 400 });
  }

  const key = visitorKey(request);
  const record = attempts.get(key);
  if (record?.blockedUntil && record.blockedUntil > Date.now()) {
    return Response.json(
      { message: "Acesso temporariamente bloqueado. Tente novamente em 15 minutos." },
      { status: 429 },
    );
  }

  if (!(await pinsMatch(pin, configuredPin))) {
    const nextCount = (record?.count ?? 0) + 1;
    attempts.set(key, {
      count: nextCount,
      blockedUntil: nextCount >= MAX_ATTEMPTS ? Date.now() + BLOCK_DURATION_MS : 0,
    });
    return Response.json(
      {
        message: nextCount >= MAX_ATTEMPTS
          ? "Muitas tentativas. Acesso bloqueado por 15 minutos."
          : `PIN incorreto. Restam ${MAX_ATTEMPTS - nextCount} tentativas.`,
      },
      { status: 401 },
    );
  }

  attempts.delete(key);
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const session = await signSession(expiresAt);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": `${COOKIE_NAME}=${session}; Path=/; HttpOnly; SameSite=Strict${secure}; Max-Age=${SESSION_DURATION_SECONDS}`,
      },
    },
  );
}
