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

  while ((match = commitRegex.exec(userInfo)) !== null && matches < 10) {
    commitInfo += `- Made ${match[1]} commits to ${match[2]}\n`;
    matches++;
  }

  // Extract specific commit messages if available
  const commitMessageRegex = /Recent commit: "([^"]+)"/g;
  let commitMessages = "";
  matches = 0;

  while ((match = commitMessageRegex.exec(userInfo)) !== null && matches < 8) {
    commitMessages += `- "${match[1]}"\n`;
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

  // Extract repository names
  const repoNamesRegex = /Repository: ([^\n]+)/g;
  let repoNames = "";
  matches = 0;

  while ((match = repoNamesRegex.exec(userInfo)) !== null && matches < 5) {
    repoNames += `- ${match[1]}\n`;
    matches++;
  }

  // Extract stars info
  const starsMatch = userInfo.match(/Total Stars: (\d+)/);
  const stars = starsMatch ? starsMatch[1] : "Unknown";

  // Extract fork info
  const forksMatch = userInfo.match(/Total Forks: (\d+)/);
  const forks = forksMatch ? forksMatch[1] : "Unknown";

  return `
Additional Analysis:
- Commit Patterns: ${commitInfo || "No specific commit patterns found"}
- Recent Commit Messages: ${
    commitMessages || "No specific commit messages found"
  }
- Repository Names: ${repoNames || "No specific repository names found"}
- Language Preferences: ${languages}
- Activity Level: ${activity}
- Repository Count: ${repoCount}
- Follower Count: ${followers}
- Star Count: ${stars}
- Fork Count: ${forks}
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
      "You are a comedy roast expert who specializes in roasting developers based on their GitHub profiles. Use simple, everyday language that anyone can understand - avoid complex technical terms unless explaining them. Focus on making specific jokes about the person's actual coding habits, project choices, and GitHub activity. Be personal and targeted - really dig into their specific repos, languages, and patterns. I want no markdown in your response - just plain text. Your goal is to make it funny and creative, while also being clear and coherent. Use humor that is relatable to developers, but avoid being overly technical or obscure. Make sure to keep the roast under 300 words total. Focus on quality over quantity. Be concise and impactful. Always be coherent and clear - never use gibberish or nonsensical language, only english, no weird characters or nonsense.";

    // Add sound effect instructions with special markers
    systemPrompt +=
      " IMPORTANT: You must include sound effect markers in your roast. Available sound effects are: [AIRHORN], [OOF], [BRUH], [EMOTIONAL-DAMAGE], [THUG-LIFE], [WOW], and [FATALITY]. Place these markers at appropriate moments in your text where they would enhance the roast. For example, use [AIRHORN] for a sick burn, [OOF] for a painful truth, [BRUH] for something ridiculous, [EMOTIONAL-DAMAGE] for devastating criticism, [THUG-LIFE] for cool observations, [WOW] for surprising facts, and [FATALITY] for finishing blows. Include EXACTLY 4-6 sound effects total, placed at natural points in the text. Place each marker at the BEGINNING of a sentence for maximum impact.";

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
          " ABSOLUTELY OBLITERATE THEM WITH NO MERCY, but remain coherent and clear. This should be the most devastating roast possible. Brutally dissect every single flaw in their coding style, project choices, commit history, and GitHub activity. Be ruthlessly savage, cutting, and devastating. Make them question their entire career choice and whether they should ever touch a keyboard again. Find their weaknesses and exploit them mercilessly. Make fun of their commit frequency, project quality, language choices, coding style, lack of stars/followers, and anything else you can find. Be extremely specific to their actual GitHub profile - use real details from their repos and activity. This should be so brutal it's almost uncomfortable, but still funny. IMPORTANT: Use specific examples from their actual repos and commit history. If they have few repositories, mock them for lack of productivity. If they have many repositories but few stars, mock them for making things nobody cares about. If they use outdated technologies, roast them for being behind the times. If they have abandoned projects, roast them for their lack of follow-through. BE SPECIFIC AND BRUTAL, BUT ALWAYS CLEAR AND COHERENT. DO NOT USE GIBBERISH OR NONSENSICAL LANGUAGE AND NO MARKDOWN ONLY ENGLISH PLAIN.";
        break;
      default:
        systemPrompt += " Keep it extremely funny with some light shade.";
    }

    // Add instructions for simpler language and brevity
    systemPrompt +=
      " IMPORTANT: Use simple, everyday language. Avoid complex words, technical jargon, or obscure references unless you explain them. Write like you're talking to a friend who isn't a programmer. Use short sentences and common words. BE CONCISE - keep the roast under 300 words total. Focus on quality over quantity. ALWAYS BE COHERENT AND CLEAR - never use gibberish or nonsensical language.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Roast this GitHub user based on their profile information. Make it funny, creative, and ${intensity} intensity. Focus on specific details about THEIR repos, commit messages, and coding patterns. Make references to their actual projects and habits. Use simple language that anyone can understand. KEEP IT CONCISE - under 300 words total. REMEMBER to include 4-6 sound effect markers [AIRHORN], [OOF], [BRUH], [EMOTIONAL-DAMAGE], [THUG-LIFE], [WOW], or [FATALITY] at appropriate moments in your roast. Place each marker at the BEGINNING of a sentence for maximum impact:\n\n${enhancedUserInfo}`,
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
      max_tokens: 800,
    });

    let roastContent = response.choices[0].message.content || "";

    // Process the roast content to ensure sound effects are properly formatted
    // This ensures the markers are properly spaced and formatted
    roastContent = roastContent.replace(
      /\[(AIRHORN|OOF|BRUH|EMOTIONAL-DAMAGE|THUG-LIFE|WOW|FATALITY)\]/gi,
      (match) => {
        // Ensure there's a space after the marker
        return match + " ";
      }
    );

    return NextResponse.json({ roast: roastContent });
  } catch (error) {
    console.error("Error generating roast:", error);
    return NextResponse.json(
      { error: "Failed to generate roast" },
      { status: 500 }
    );
  }
}
