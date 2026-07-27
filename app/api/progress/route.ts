import { env } from "cloudflare:workers";

type ProgressEvent = {
  eventType?: "mission" | "bonus" | "spent";
  activity?: string;
  points?: number;
  day?: string;
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
  ]);
  return env.DB;
}

export async function GET() {
  try {
    const db = await ensureSchema();
    const [dailyResult, activityResult] = await db.batch([
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
    ]);

    return Response.json({ daily: dailyResult.results, activities: activityResult.results });
  } catch {
    return Response.json({ daily: [], activities: [], message: "Histórico temporariamente indisponível" });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ProgressEvent;
    const eventType = body.eventType;
    const points = Math.round(Number(body.points));
    const activity = body.activity?.trim().slice(0, 100) || null;
    const day = body.day?.match(/^\d{4}-\d{2}-\d{2}$/)?.[0];

    if (!eventType || !["mission", "bonus", "spent"].includes(eventType) || !day || !Number.isFinite(points) || points < 0 || points > 10000) {
      return Response.json({ message: "Evento inválido" }, { status: 400 });
    }

    const db = await ensureSchema();
    await db.prepare(`
      INSERT INTO activity_events (id, event_type, activity, points, day, occurred_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), eventType, activity, points, day, new Date().toISOString()).run();

    return Response.json({ ok: true });
  } catch {
    return Response.json({ message: "Não foi possível salvar o progresso" }, { status: 503 });
  }
}
