import { NextResponse } from "next/server";
import { getPortfolioService } from "@/backend/factory";

export const dynamic = "force-static";

export async function GET() {
  try {
    const service = getPortfolioService();
    const experiences = await service.getExperiences();
    return NextResponse.json(experiences);
  } catch (error) {
    console.error("GET /api/experience error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
