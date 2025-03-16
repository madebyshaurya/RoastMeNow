import { NextRequest, NextResponse } from "next/server";

// Function to optimize text for ElevenLabs to reduce token usage
function optimizeTextForSpeech(text: string): string {
  // Remove any sound effect markers that might still be present
  let optimized = text.replace(
    /\[(AIRHORN|OOF|BRUH|EMOTIONAL-DAMAGE|THUG-LIFE|WOW|FATALITY)\]/gi,
    ""
  );

  // Remove any markdown formatting that might be present
  optimized = optimized.replace(/\*\*(.*?)\*\*/g, "$1"); // Remove bold
  optimized = optimized.replace(/\*(.*?)\*/g, "$1"); // Remove italic

  // Remove code blocks (without using 's' flag)
  const codeBlockRegex = /```[\s\S]*?```/g;
  optimized = optimized.replace(codeBlockRegex, "");

  // Remove excessive newlines (replace 3+ newlines with 2)
  optimized = optimized.replace(/\n{3,}/g, "\n\n");

  // Remove common filler phrases to reduce token count
  const fillerPhrases = [
    /I have to say,/gi,
    /to be honest,/gi,
    /honestly speaking,/gi,
    /let me tell you,/gi,
    /I must say,/gi,
    /it's worth noting that/gi,
    /it's important to mention that/gi,
    /I couldn't help but notice/gi,
    /as I was looking through/gi,
    /after reviewing your profile/gi,
    /after taking a look at your GitHub/gi,
    /looking at your repositories/gi,
    /I noticed that/gi,
    /I see that/gi,
    /I observed that/gi,
    /it appears that/gi,
    /it seems like/gi,
    /from what I can tell/gi,
    /based on your profile/gi,
    /judging by your activity/gi,
    /according to your GitHub/gi,
  ];

  fillerPhrases.forEach((phrase) => {
    optimized = optimized.replace(phrase, "");
  });

  // Remove redundant punctuation
  optimized = optimized.replace(/\.{2,}/g, "."); // Replace multiple periods with single
  optimized = optimized.replace(/\s+\./g, "."); // Remove spaces before periods
  optimized = optimized.replace(/\s+,/g, ","); // Remove spaces before commas

  // Limit to 250 words max to save tokens (reduced from 300)
  const words = optimized.split(/\s+/);
  if (words.length > 250) {
    optimized = words.slice(0, 250).join(" ") + "...";
  }

  return optimized;
}

export async function POST(request: NextRequest) {
  try {
    const { text, intensity = "medium" } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Optimize text to reduce token usage
    const optimizedText = optimizeTextForSpeech(text);

    // Select voice based on intensity
    let voiceId = "ErXwobaYiN019PkySvjV"; // Default voice (Antoni)

    // For NO MERCY mode, use a more aggressive voice
    if (intensity === "no_mercy") {
      voiceId = "VR6AewLTigWG4xSOukaG"; // Josh voice - more intense
    }

    // ElevenLabs API endpoint
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    // Adjust voice settings based on intensity
    const stability = intensity === "no_mercy" ? 0.25 : 0.35;
    const similarity = intensity === "no_mercy" ? 0.55 : 0.65;
    const style = intensity === "no_mercy" ? 0.8 : 0.7;
    const speakingRate = intensity === "no_mercy" ? 1.25 : 1.15;

    // Request body with adjusted settings
    const body = JSON.stringify({
      text: optimizedText,
      model_id: "eleven_turbo_v2", // Use most efficient model to save tokens
      voice_settings: {
        stability,
        similarity_boost: similarity,
        style,
        use_speaker_boost: true,
        speaking_rate: speakingRate,
      },
    });

    try {
      // Make request to ElevenLabs API
      console.log("Sending request to ElevenLabs API...");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
        },
        body,
      });

      console.log(`ElevenLabs API response status: ${response.status}`);

      // Check if response is ok before trying to read the body
      if (!response.ok) {
        // Clone the response before reading it as JSON to avoid "body stream already read" error
        const errorResponse = response.clone();
        let errorData;

        try {
          errorData = await errorResponse.json();
          console.error("ElevenLabs API error:", JSON.stringify(errorData));
        } catch (e) {
          console.error("Failed to parse error response:", e);
          errorData = { detail: `HTTP error ${response.status}` };
        }

        // Check if error is related to quota
        if (
          errorData.detail?.status === "quota_exceeded" ||
          errorData.detail?.includes?.("quota") ||
          errorData.detail?.includes?.("limit") ||
          response.status === 429
        ) {
          console.log("ElevenLabs quota exceeded, falling back to browser TTS");
          return NextResponse.json(
            {
              error: "ElevenLabs quota exceeded",
              fallback: true,
              text: optimizedText,
            },
            { status: 200 }
          );
        }

        return NextResponse.json(
          {
            error: "Failed to generate speech",
            details: errorData.detail || "Unknown error",
          },
          { status: response.status }
        );
      }

      // Get audio data - only read the body if response is ok
      console.log("Reading audio data from ElevenLabs response...");
      const audioData = await response.arrayBuffer();
      console.log(`Received audio data: ${audioData.byteLength} bytes`);

      // Return audio as response
      return new NextResponse(audioData, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": audioData.byteLength.toString(),
        },
      });
    } catch (error) {
      console.error("Error with ElevenLabs API:", error);

      // Fallback to browser TTS
      return NextResponse.json(
        {
          error: "ElevenLabs API error",
          fallback: true,
          text: optimizedText,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
      {
        error: "Failed to generate speech",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
