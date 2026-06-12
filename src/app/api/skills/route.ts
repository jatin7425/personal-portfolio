import { NextResponse } from "next/server";
import { getPortfolioService } from "@/backend/factory";

export async function GET() {
  try {
    const service = getPortfolioService();
    const skills = await service.getSkills();
    return NextResponse.json(skills);
  } catch (error) {
    console.error("GET /api/skills error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
