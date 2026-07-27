import { env } from "cloudflare:workers";
import { readParentSession } from "../../../lib/parent-session";

type ProgressEvent = {
  action?: "set-balance";
  eventType?: "mission" | "bonus" | "spent";
  activity?: string;
  points?: number;
  day?: string;
  balance?: number;
};

async function ensureSchema() {
  if (!env.DB) throw new Error("Banco de progresso indisponível");
  await env.DB.batch([
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS activity_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        activity TEXT,
        points INTEGER NOT NULL DEFAULT 0,
        day TEXT NOT NULL,
        occurred_at TEXT NOT NULL
      )
    `),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS activity_events_day_idx ON activity_events(day)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS activity_events_activity_idx ON activity_events(activity)"),
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS game_state (
        id INTEGER PRIMARY KEY,
        balance INTEGER NOT NULL DEFAULT 245,
        updated_at TEXT NOT NULL
      )
    `),
    env.DB.prepare(`
      INSERT OR IGNORE INTO game_state (id, balance, updated_at)
      VALUES (1, 245, ?)
    `).bind(new Date().toISOString()),
  ]);
  return env.DB;
}

export async function GET() {
  try {
    const db = await ensureSchema();
    const [dailyResult, activityResult, balanceResult] = await db.batch([
      db.prepare(`
        SELECT
          day,
          SUM(CASE WHEN event_type IN ('mission', 'bonus') THEN points ELSE 0 END) AS earned,
          SUM(CASE WHEN event_type = 'spent' THEN points ELSE 0 END) AS spent
        FROM activity_events
        GROUP BY day
        ORDER BY day ASC
      `),
      db.prepare(`
        SELECT activity, COUNT(*) AS count
        FROM activity_events
        WHERE event_type = 'mission' AND activity IS NOT NULL
        GROUP BY activity
        ORDER BY count DESC, activity ASC
        LIMIT 12
      `),
      db.prepare("SELECT balance FROM game_state WHERE id = 1"),
    ]);

    return Response.json({
      daily: dailyResult.results,
      activities: activityResult.results,
      balance: Number(balanceResult.results[0]?.balance ?? 245),
    });
  } catch {
    return Response.json({ daily: [], activities: [], message: "Histórico temporariamente indisponível" });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ProgressEvent;
    if (body.action === "set-balance") {
      if (!(await readParentSession(request))) {
        return Response.json({ message: "Acesso de responsável necessário" }, { status: 401 });
      }
      const balance = Math.round(Number(body.balance));
      if (!Number.isFinite(balance) || balance < 0 || balance > 999999) {
        return Response.json({ message: "Informe um saldo entre 0 e 999.999" }, { status: 400 });
      }
      const db = await ensureSchema();
      await db.prepare(`
        UPDATE game_state SET balance = ?, updated_at = ? WHERE id = 1
      `).bind(balance, new Date().toISOString()).run();
      return Response.json({ ok: true, balance });
    }

    const eventType = body.eventType;
    const points = Math.round(Number(body.points));
    const activity = body.activity?.trim().slice(0, 100) || null;
    const day = body.day?.match(/^\d{4}-\d{2}-\d{2}$/)?.[0];

    if (!eventType || !["mission", "bonus", "spent"].includes(eventType) || !day || !Number.isFinite(points) || points < 0 || points > 10000) {
      return Response.json({ message: "Evento inválido" }, { status: 400 });
    }

    const db = await ensureSchema();
    const now = new Date().toISOString();

    if (eventType === "spent") {
      const [debit] = await db.batch([
        db.prepare(`
          UPDATE game_state
          SET balance = balance - ?, updated_at = ?
          WHERE id = 1 AND balance >= ?
          RETURNING balance
        `).bind(points, now, points),
        db.prepare(`
          INSERT INTO activity_events (id, event_type, activity, points, day, occurred_at)
          SELECT ?, 'spent', ?, ?, ?, ?
          WHERE changes() > 0
        `).bind(crypto.randomUUID(), activity, points, day, now),
      ]);
      const remainingBalance = debit.results[0] as { balance?: number } | undefined;

      if (remainingBalance?.balance === undefined) {
        return Response.json({ message: "Saldo insuficiente para este desbloqueio" }, { status: 409 });
      }

      return Response.json({ ok: true, balance: Number(remainingBalance.balance) });
    }

    await db.batch([
      db.prepare(`
        INSERT INTO activity_events (id, event_type, activity, points, day, occurred_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(crypto.randomUUID(), eventType, activity, points, day, now),
      db.prepare(`
        UPDATE game_state
        SET balance = MAX(0, balance + ?), updated_at = ?
        WHERE id = 1
      `).bind(points, now),
    ]);
    const balance = await db.prepare("SELECT balance FROM game_state WHERE id = 1").first<{ balance: number }>();

    return Response.json({ ok: true, balance: Number(balance?.balance ?? 0) });
  } catch {
    return Response.json({ message: "Não foi possível salvar o progresso" }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!(await readParentSession(request))) {
    return Response.json({ message: "Acesso de responsável necessário" }, { status: 401 });
  }

  try {
    const db = await ensureSchema();
    await db.prepare("DELETE FROM activity_events").run();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ message: "Não foi possível limpar o histórico" }, { status: 503 });
  }
}
