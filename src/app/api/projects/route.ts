import { NextResponse } from "next/server";
import { getPortfolioService } from "@/backend/factory";

export const dynamic = "force-static";

export async function GET() {
  try {
    const service = getPortfolioService();
    const projects = await service.getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
