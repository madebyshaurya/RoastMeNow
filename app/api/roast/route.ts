import { NextRequest, NextResponse } from "next/server";
import { generateRoast } from "@/lib/roast-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle, platform, intensity } = body;

    if (!handle || !platform || !intensity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique ID for this roast
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);

    // Generate the roast based on handle, platform and intensity
    const roast = await generateRoast(handle, platform, intensity);

    // In a real app, you might store this in a database
    // For now, we'll return it directly and use URL params
    return NextResponse.json({
      id,
      handle,
      platform,
      intensity,
      roast,
    });
  } catch (error) {
    console.error("Error generating roast:", error);
    return NextResponse.json(
      { error: "Failed to generate roast" },
      { status: 500 }
    );
  }
}
