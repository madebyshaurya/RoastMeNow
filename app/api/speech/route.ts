import { NextRequest, NextResponse } from "next/server";

// Define constants for ElevenLabs API
const ELEVEN_LABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVEN_LABS_VOICE_ID = "ErXwobaYiN019PkySvjV"; // Antoni voice

// Optimize text for ElevenLabs
function optimizeTextForElevenLabs(text: string): string {
  let optimized = text;

  // Remove markdown formatting
  optimized = optimized.replace(/\*\*/g, "");
  optimized = optimized.replace(/\*/g, "");
  optimized = optimized.replace(/```[\s\S]*?```/g, "");
  optimized = optimized.replace(/`([^`]+)`/g, "$1");

  // Remove excessive newlines
  optimized = optimized.replace(/\n{3,}/g, "\n\n");

  // Remove common filler phrases to reduce token count
  const fillerPhrases = [
    "I have to say",
    "to be honest",
    "let me tell you",
    "I must admit",
    "I would like to point out",
    "it's worth noting that",
    "I can't help but notice",
    "it's important to mention",
    "I feel compelled to say",
    "I should mention that",
    "I want to emphasize",
    "I'd like to highlight",
    "it's clear that",
    "needless to say",
    "as you can see",
    "it goes without saying",
    "it should be noted",
    "I'd like to point out",
    "I think it's fair to say",
    "I believe",
    "in my opinion",
    "from my perspective",
    "as I see it",
    "in my view",
    "from where I stand",
    "if you ask me",
    "to my mind",
    "as far as I'm concerned",
    "in my estimation",
    "to my way of thinking",
    "according to my observations",
    "based on what I've seen",
    "from my standpoint",
    "in my judgment",
    "to the best of my knowledge",
    "as I understand it",
    "from my vantage point",
    "in my humble opinion",
    "if I may say so",
    "speaking for myself",
    "personally speaking",
    "in my experience",
    "from my experience",
    "based on my experience",
    "in my humble estimation",
    "to put it bluntly",
    "frankly speaking",
    "to be perfectly frank",
    "to be perfectly honest",
    "to be completely honest",
    "to be fair",
    "to be clear",
    "to be precise",
    "to be exact",
    "to be specific",
    "to be truthful",
    "to be candid",
    "to be straightforward",
    "to be direct",
    "to be blunt",
    "to be forthright",
    "to be upfront",
    "to be sincere",
    "to be genuine",
    "to be transparent",
    "to be open",
    "to be real",
    "to be authentic",
    "to be serious",
    "to be honest with you",
    "to tell you the truth",
    "to be perfectly transparent",
    "to put it simply",
    "to put it plainly",
    "to put it mildly",
    "to put it candidly",
    "to put it frankly",
    "to put it briefly",
    "to put it succinctly",
    "to put it concisely",
    "to put it directly",
    "to put it straightforwardly",
    "to put it bluntly",
    "to put it crudely",
    "to put it in simple terms",
    "to put it in plain language",
    "to put it in layman's terms",
    "to put it in a nutshell",
    "to sum it up",
    "to summarize",
    "to conclude",
    "to wrap it up",
    "to finish up",
    "to end with",
    "to close with",
    "to finalize",
    "to complete my thoughts",
    "to complete my analysis",
    "to complete my assessment",
    "to complete my evaluation",
    "to complete my review",
    "to complete my critique",
    "to complete my feedback",
    "to complete my commentary",
    "to complete my observations",
    "to complete my remarks",
    "to complete my statement",
    "to complete my argument",
    "to complete my case",
    "to complete my point",
    "to complete my reasoning",
    "to complete my logic",
    "to complete my thinking",
    "to complete my perspective",
    "to complete my view",
    "to complete my opinion",
    "to complete my judgment",
    "to complete my verdict",
    "to complete my conclusion",
    "to complete my summary",
    "to complete my wrap-up",
    "to complete my closing",
    "to complete my ending",
    "to complete my finale",
    "to complete my last words",
    "to complete my parting thoughts",
    "to complete my final remarks",
    "to complete my final statement",
    "to complete my final assessment",
    "to complete my final evaluation",
    "to complete my final analysis",
    "to complete my final judgment",
    "to complete my final verdict",
    "to complete my final conclusion",
    "to complete my final summary",
    "to complete my final wrap-up",
    "to complete my final closing",
    "to complete my final ending",
    "to complete my final finale",
    "to complete my final words",
    "to complete my final thoughts",
    "to complete my final observations",
    "to complete my final commentary",
    "to complete my final feedback",
    "to complete my final critique",
    "to complete my final review",
    "to complete my final point",
    "to complete my final argument",
    "to complete my final case",
    "to complete my final reasoning",
    "to complete my final logic",
    "to complete my final thinking",
    "to complete my final perspective",
    "to complete my final view",
    "to complete my final opinion",
  ];

  for (const phrase of fillerPhrases) {
    optimized = optimized.replace(new RegExp(phrase, "gi"), "");
  }

  // Limit to 150 words max (reduced from 300)
  const words = optimized.split(/\s+/);
  if (words.length > 150) {
    optimized = words.slice(0, 150).join(" ");
  }

  return optimized;
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Optimize the text for ElevenLabs to reduce token usage
    const optimizedText = optimizeTextForElevenLabs(text);

    try {
      // Generate speech using ElevenLabs API
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_LABS_VOICE_ID}`,
        {
          method: "POST",
          headers: {
            accept: "audio/mpeg",
            "content-type": "application/json",
            "xi-api-key": ELEVEN_LABS_API_KEY,
          },
          body: JSON.stringify({
            text: optimizedText,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API error:", errorText);

        // Check if error is related to quota exhaustion
        if (
          errorText.includes("quota") ||
          errorText.includes("limit") ||
          response.status === 429
        ) {
          console.log(
            "ElevenLabs quota exhausted, falling back to browser TTS"
          );
          return NextResponse.json({
            fallback: true,
            text: optimizedText,
          });
        }

        return NextResponse.json(
          { error: "Failed to generate speech" },
          { status: 500 }
        );
      }

      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
        },
      });
    } catch (error) {
      console.error("Error generating speech:", error);

      // If there's any error with ElevenLabs, fall back to browser TTS
      return NextResponse.json({
        fallback: true,
        text: optimizedText,
      });
    }
  } catch (error) {
    console.error("Error in speech generation:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
