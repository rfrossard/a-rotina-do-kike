type CodeRecord = {
  code: string;
  expiresAt: number;
  attempts: number;
};

const globalCodes = globalThis as typeof globalThis & {
  __kikeParentCodes?: Map<string, CodeRecord>;
};

const codes = globalCodes.__kikeParentCodes ?? new Map<string, CodeRecord>();
globalCodes.__kikeParentCodes = codes;
const COOKIE_NAME = "kike_parent_session";

function sessionSecret() {
  return process.env.PARENT_SESSION_SECRET ?? (process.env.NODE_ENV !== "production" ? "rotina-do-kike-local-development" : "");
}

async function signSession(email: string, expiresAt: number) {
  const payload = `${email}|${expiresAt}`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(sessionSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const encoded = btoa(String.fromCharCode(...new Uint8Array(signature))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  return `${encodeURIComponent(email)}.${expiresAt}.${encoded}`;
}

async function readSession(request: Request) {
  const value = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!value || !sessionSecret()) return null;
  const [encodedEmail, expiresText, signature] = value.split(".");
  const email = decodeURIComponent(encodedEmail ?? "");
  const expiresAt = Number(expiresText);
  if (!email || !expiresAt || expiresAt < Date.now()) return null;
  const expected = await signSession(email, expiresAt);
  return expected === value ? { email, expiresAt } : null;
}

export async function GET(request: Request) {
  const session = await readSession(request);
  return session ? Response.json({ authenticated: true, email: session.email }) : Response.json({ authenticated: false });
}

export async function DELETE() {
  return Response.json({ ok: true }, {
    headers: { "Set-Cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0` },
  });
}

export async function POST(request: Request) {
  const body = await request.json() as {
    action?: "request" | "verify";
    email?: string;
    code?: string;
  };
  const email = body.email?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ message: "Informe um e-mail válido" }, { status: 400 });
  }

  if (body.action === "request") {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    codes.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 });

    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.PARENT_CODE_FROM_EMAIL;

    if (resendKey && from) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: "Código de acesso — A Rotina do Kike",
          html: `<div style="font-family:Arial,sans-serif;color:#15355f"><h1>A Rotina do Kike</h1><p>Seu código de acesso de responsável é:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px">${code}</p><p>Ele expira em 10 minutos.</p></div>`,
        }),
      });

      if (!response.ok) {
        codes.delete(email);
        return Response.json({ message: "Não foi possível enviar o e-mail agora" }, { status: 502 });
      }
    } else if (process.env.NODE_ENV === "production") {
      codes.delete(email);
      return Response.json({ message: "O serviço de e-mail ainda não foi configurado" }, { status: 503 });
    }

    return Response.json({
      ok: true,
      message: "Código enviado",
      ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {}),
    });
  }

  if (body.action === "verify") {
    const record = codes.get(email);
    if (!record || record.expiresAt < Date.now()) {
      codes.delete(email);
      return Response.json({ message: "Código expirado. Solicite outro." }, { status: 401 });
    }
    if (record.attempts >= 5) {
      codes.delete(email);
      return Response.json({ message: "Muitas tentativas. Solicite outro código." }, { status: 429 });
    }
    record.attempts += 1;
    if (record.code !== body.code) {
      return Response.json({ message: "Código incorreto" }, { status: 401 });
    }
    codes.delete(email);
    if (!sessionSecret()) {
      return Response.json({ message: "A chave de sessão dos responsáveis não foi configurada" }, { status: 503 });
    }
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const session = await signSession(email, expiresAt);
    return Response.json({ ok: true }, {
      headers: {
        "Set-Cookie": `${COOKIE_NAME}=${session}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`,
      },
    });
  }

  return Response.json({ message: "Ação inválida" }, { status: 400 });
}
