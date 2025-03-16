import { NextRequest, NextResponse } from "next/server";

// Function to optimize text for ElevenLabs to reduce token usage
function optimizeTextForSpeech(text: string): string {
  // Remove any markdown formatting that might be present
  let optimized = text.replace(/\*\*(.*?)\*\*/g, "$1"); // Remove bold
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
  ];

  fillerPhrases.forEach((phrase) => {
    optimized = optimized.replace(phrase, "");
  });

  // Limit to 300 words max to save tokens (reduced from 400)
  const words = optimized.split(/\s+/);
  if (words.length > 300) {
    optimized = words.slice(0, 300).join(" ") + "...";
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
      model_id: "eleven_monolingual_v1", // Use more efficient model to save tokens
      voice_settings: {
        stability,
        similarity_boost: similarity,
        style,
        use_speaker_boost: true,
        speaking_rate: speakingRate,
      },
    });

    // Make request to ElevenLabs API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
      },
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ElevenLabs API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate speech" },
        { status: response.status }
      );
    }

    // Get audio data
    const audioData = await response.arrayBuffer();

    // Return audio as response
    return new NextResponse(audioData, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioData.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
