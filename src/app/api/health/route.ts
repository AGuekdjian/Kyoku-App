import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  const started = Date.now();
  try {
    const db = await connectDb();
    await db.connection.db?.admin().ping();
    return NextResponse.json({
      status: "healthy",
      database: "available",
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - started,
    });
  } catch (error) {
    logger.error({ err: error }, "Health check database failure");
    return NextResponse.json(
      {
        status: "degraded",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
