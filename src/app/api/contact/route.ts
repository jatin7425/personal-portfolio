import { NextResponse } from "next/server";
import { getPortfolioService } from "@/backend/factory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, message } = body;

    const service = getPortfolioService();
    const result = await service.submitContactMessage(email, message);

    return NextResponse.json({
      success: true,
      message: "Message received successfully!",
      data: result,
    });
  } catch (error: any) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit message" },
      { status: 400 }
    );
  }
}
