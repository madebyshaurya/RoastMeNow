import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Extract more detailed information from GitHub data
function extractDetailedInfo(userInfo: string): string {
  // Extract commit messages for analysis
  const commitRegex = /Pushed (\d+) commits to ([^\s]+) on/g;
  let match;
  let commitInfo = "";
  let matches = 0;

  while ((match = commitRegex.exec(userInfo)) !== null && matches < 5) {
    commitInfo += `- Made ${match[1]} commits to ${match[2]}\n`;
    matches++;
  }

  // Extract language preferences
  const languagesMatch = userInfo.match(/Most Used Languages: ([^\n]+)/);
  const languages = languagesMatch ? languagesMatch[1] : "Unknown languages";

  // Extract activity level
  const activityMatch = userInfo.match(/Contribution Level:\s*([^\n]+)/);
  const activity = activityMatch ? activityMatch[1] : "Unknown activity level";

  // Extract repository info
  const repoCountMatch = userInfo.match(/Public Repositories: (\d+)/);
  const repoCount = repoCountMatch ? repoCountMatch[1] : "Unknown";

  // Extract follower info
  const followerMatch = userInfo.match(/Followers: (\d+)/);
  const followers = followerMatch ? followerMatch[1] : "Unknown";

  return `
Additional Analysis:
- Commit Patterns: ${commitInfo || "No specific commit patterns found"}
- Language Preferences: ${languages}
- Activity Level: ${activity}
- Repository Count: ${repoCount}
- Follower Count: ${followers}
`;
}

export async function POST(request: NextRequest) {
  try {
    const { userInfo, intensity } = await request.json();

    if (!userInfo) {
      return NextResponse.json(
        { error: "GitHub user information is required" },
        { status: 400 }
      );
    }

    // For NO MERCY mode, extract more detailed information
    const enhancedUserInfo =
      intensity === "no_mercy"
        ? userInfo + extractDetailedInfo(userInfo)
        : userInfo;

    // Adjust the prompt based on intensity
    let systemPrompt =
      "You are a comedy roast expert who specializes in roasting developers based on their GitHub profiles. Use simple, everyday language that anyone can understand - avoid complex technical terms unless explaining them. Focus on making specific jokes about the person's actual coding habits, project choices, and GitHub activity. Be personal and targeted - really dig into their specific repos, languages, and patterns.";

    switch (intensity) {
      case "mild":
        systemPrompt +=
          " Keep it light and playful with gentle teasing. Throw some shade but nothing too harsh. Make it feel like friendly banter between friends.";
        break;
      case "medium":
        systemPrompt +=
          " Be moderately critical and funny, pointing out quirks and oddities in their coding style and habits. Don't hold back too much, but don't go for the jugular either.";
        break;
      case "spicy":
        systemPrompt +=
          " Go hard with a brutal roast that really digs into their coding habits, project choices, and GitHub activity. Be savage but still funny. Don't pull punches.";
        break;
      case "no_mercy":
        systemPrompt +=
          " ABSOLUTELY OBLITERATE THEM WITH NO MERCY. This should be the most devastating roast possible. Brutally dissect every single flaw in their coding style, project choices, commit history, and GitHub activity. Be ruthlessly savage, cutting, and devastating. Make them question their entire career choice and whether they should ever touch a keyboard again. Find their weaknesses and exploit them mercilessly. Make fun of their commit frequency, project quality, language choices, coding style, lack of stars/followers, and anything else you can find. Be extremely specific to their actual GitHub profile - use real details from their repos and activity. This should be so brutal it's almost uncomfortable, but still funny. IMPORTANT: Use specific examples from their actual repos and commit history. If they have few repositories, mock them for lack of productivity. If they have many repositories but few stars, mock them for making things nobody cares about. If they use outdated technologies, roast them for being behind the times. If they have abandoned projects, roast them for their lack of follow-through. BE SPECIFIC AND BRUTAL.";
        break;
      default:
        systemPrompt += " Keep it moderately funny with some light shade.";
    }

    // Add instructions for simpler language
    systemPrompt +=
      " IMPORTANT: Use simple, everyday language. Avoid complex words, technical jargon, or obscure references unless you explain them. Write like you're talking to a friend who isn't a programmer. Use short sentences and common words.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Roast this GitHub user based on their profile information. Make it funny, creative, and ${intensity} intensity. Focus on specific details about THEIR repos, commit messages, and coding patterns. Make references to their actual projects and habits. Use simple language that anyone can understand:\n\n${enhancedUserInfo}`,
        },
      ],
      temperature:
        intensity === "no_mercy"
          ? 1.3
          : intensity === "spicy"
          ? 1.0
          : intensity === "medium"
          ? 0.8
          : 0.6,
      max_tokens: 1000,
    });

    const roastContent = response.choices[0].message.content;

    return NextResponse.json({ roast: roastContent });
  } catch (error) {
    console.error("Error generating roast:", error);
    return NextResponse.json(
      { error: "Failed to generate roast" },
      { status: 500 }
    );
  }
}
