import { env } from "cloudflare:workers";
import { readParentSession } from "../../../lib/parent-session";

type ApprovalRequest = {
  id?: string;
  activity?: string;
  routineId?: string;
  points?: number;
  day?: string;
  decision?: "approve" | "reject";
};

async function ensureSchema() {
  if (!env.DB) throw new Error("Banco de progresso indisponível");
  await env.DB.batch([
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS activity_approvals (
        id TEXT PRIMARY KEY,
        activity TEXT NOT NULL,
        routine_id TEXT NOT NULL,
        points INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        requested_day TEXT NOT NULL,
        requested_at TEXT NOT NULL,
        resolved_at TEXT
      )
    `),
    env.DB.prepare(`
      CREATE UNIQUE INDEX IF NOT EXISTS activity_approvals_once_per_day_idx
      ON activity_approvals(routine_id, activity, requested_day)
    `),
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

export async function POST(request: Request) {
  try {
    const body = await request.json() as ApprovalRequest;
    const activity = body.activity?.trim().slice(0, 100);
    const routineId = body.routineId?.trim().slice(0, 80);
    const points = Math.round(Number(body.points));
    const day = body.day?.match(/^\d{4}-\d{2}-\d{2}$/)?.[0];
    if (!activity || !routineId || !day || !Number.isFinite(points) || points < 1 || points > 10000) {
      return Response.json({ message: "Atividade inválida" }, { status: 400 });
    }
    const db = await ensureSchema();
    const id = crypto.randomUUID();
    await db.prepare(`
      INSERT OR IGNORE INTO activity_approvals
        (id, activity, routine_id, points, status, requested_day, requested_at)
      VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `).bind(id, activity, routineId, points, day, new Date().toISOString()).run();
    const saved = await db.prepare(`
      SELECT id, status FROM activity_approvals
      WHERE routine_id = ? AND activity = ? AND requested_day = ?
    `).bind(routineId, activity, day).first<{ id: string; status: string }>();
    return Response.json({ ok: true, id: saved?.id ?? id, status: saved?.status ?? "pending" });
  } catch {
    return Response.json({ message: "Não foi possível enviar a atividade para revisão" }, { status: 503 });
  }
}

export async function GET(request: Request) {
  if (!(await readParentSession(request))) {
    return Response.json({ message: "Acesso de responsável necessário" }, { status: 401 });
  }
  try {
    const db = await ensureSchema();
    const result = await db.prepare(`
      SELECT id, activity, routine_id, points, status, requested_day, requested_at
      FROM activity_approvals
      ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, requested_at DESC
      LIMIT 100
    `).all();
    return Response.json({ approvals: result.results });
  } catch {
    return Response.json({ message: "Não foi possível carregar as revisões" }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!(await readParentSession(request))) {
    return Response.json({ message: "Acesso de responsável necessário" }, { status: 401 });
  }
  try {
    const body = await request.json() as ApprovalRequest;
    if (!body.id || !body.decision || !["approve", "reject"].includes(body.decision)) {
      return Response.json({ message: "Decisão inválida" }, { status: 400 });
    }
    const db = await ensureSchema();
    const now = new Date().toISOString();

    if (body.decision === "reject") {
      const rejected = await db.prepare(`
        UPDATE activity_approvals SET status = 'rejected', resolved_at = ?
        WHERE id = ? AND status = 'pending'
        RETURNING id
      `).bind(now, body.id).first();
      if (!rejected) return Response.json({ message: "Esta atividade já foi revisada" }, { status: 409 });
    } else {
      const [approved] = await db.batch([
        db.prepare(`
          UPDATE activity_approvals SET status = 'approved', resolved_at = ?
          WHERE id = ? AND status = 'pending'
          RETURNING activity, points, requested_day
        `).bind(now, body.id),
        db.prepare(`
          INSERT INTO activity_events (id, event_type, activity, points, day, occurred_at)
          SELECT ?, 'mission', activity, points, requested_day, ?
          FROM activity_approvals WHERE id = ? AND changes() > 0
        `).bind(crypto.randomUUID(), now, body.id),
        db.prepare(`
          UPDATE game_state
          SET balance = balance + (SELECT points FROM activity_approvals WHERE id = ?), updated_at = ?
          WHERE id = 1 AND changes() > 0
        `).bind(body.id, now),
      ]);
      if (!approved.results.length) {
        return Response.json({ message: "Esta atividade já foi revisada" }, { status: 409 });
      }
    }

    const balance = await db.prepare("SELECT balance FROM game_state WHERE id = 1").first<{ balance: number }>();
    return Response.json({ ok: true, balance: Number(balance?.balance ?? 0) });
  } catch {
    return Response.json({ message: "Não foi possível concluir a revisão" }, { status: 503 });
  }
}
