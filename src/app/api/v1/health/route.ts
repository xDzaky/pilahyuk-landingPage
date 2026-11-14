import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  const start = Date.now();
  let dbStatus = "healthy";
  let dbLatency = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
  } catch (error) {
    dbStatus = "unhealthy";
    console.error("Health check DB error:", error);
  }

  const isHealthy = dbStatus === "healthy";
  const status = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      service: "pilahyuk-api",
      version: "2.0.0",
      uptime_ms: Date.now() - start,
      database: {
        status: dbStatus,
        latency_ms: dbLatency,
      },
    },
    { status }
  );
}
