import { NextResponse } from "next/server";
import { getPortfolioService } from "@/backend/factory";

export const dynamic = "force-static";

export async function GET() {
  try {
    const service = getPortfolioService();
    const blogPosts = await service.getBlogPosts();
    return NextResponse.json(blogPosts);
  } catch (error) {
    console.error("GET /api/blog error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
