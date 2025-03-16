import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client with proper error handling
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai: OpenAI;

try {
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not defined in environment variables");
  }

  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  console.log("OpenAI client initialized successfully");
} catch (error) {
  console.error("Error initializing OpenAI client:", error);
}

// Fetch GitHub user data
async function fetchGitHubUserData(username: string) {
  try {
    console.log(`Fetching GitHub user data for: ${username}`);

    // Use unauthenticated requests with proper error handling
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "RoastMeNow-App",
      },
    });

    if (
      response.status === 403 &&
      response.headers.get("X-RateLimit-Remaining") === "0"
    ) {
      console.error("GitHub API rate limit exceeded");
      throw new Error(
        "GitHub API rate limit exceeded. Please try again later."
      );
    }

    if (!response.ok) {
      console.error(
        `GitHub API error: ${response.status} - ${response.statusText}`
      );
      if (response.status === 404) {
        throw new Error(`GitHub user '${username}' not found`);
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched GitHub user data for: ${username}`);
    return data;
  } catch (error) {
    console.error("Error fetching GitHub user data:", error);
    throw error;
  }
}

// Fetch GitHub repository data
async function fetchGitHubRepoData(username: string) {
  try {
    console.log(`Fetching GitHub repo data for: ${username}`);

    // Use unauthenticated requests with proper error handling
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "RoastMeNow-App",
        },
      }
    );

    if (
      response.status === 403 &&
      response.headers.get("X-RateLimit-Remaining") === "0"
    ) {
      console.error("GitHub API rate limit exceeded");
      throw new Error(
        "GitHub API rate limit exceeded. Please try again later."
      );
    }

    if (!response.ok) {
      console.error(
        `GitHub API error: ${response.status} - ${response.statusText}`
      );
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      `Successfully fetched ${data.length} repositories for: ${username}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching GitHub repo data:", error);
    // Return empty array instead of throwing to allow partial data
    return [];
  }
}

// Prepare user info for OpenAI
function prepareUserInfo(userData: GitHubUser, repoData: GitHubRepo[]): string {
  let userInfo = `GitHub Username: ${userData.login}\n`;
  userInfo += `Name: ${userData.name || "Not provided"}\n`;
  userInfo += `Bio: ${userData.bio || "Not provided"}\n`;
  userInfo += `Public Repos: ${userData.public_repos}\n`;
  userInfo += `Followers: ${userData.followers}\n`;
  userInfo += `Following: ${userData.following}\n`;
  userInfo += `Account created: ${new Date(
    userData.created_at
  ).toLocaleDateString()}\n`;
  userInfo += `Location: ${userData.location || "Not provided"}\n\n`;

  userInfo += "Recent Repositories:\n";
  repoData.forEach((repo) => {
    userInfo += `- ${repo.name} (${
      repo.language || "No language specified"
    }): ${repo.description || "No description"}\n`;
    userInfo += `  Stars: ${repo.stargazers_count}, Forks: ${
      repo.forks_count
    }, Last updated: ${new Date(repo.updated_at).toLocaleDateString()}\n`;
  });

  return userInfo;
}

// Define GitHub data types
interface GitHubUser {
  login: string;
  name?: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  location?: string;
}

interface GitHubRepo {
  name: string;
  language?: string;
  description?: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

// Generate roast using OpenAI
async function generateRoast(
  userInfo: string,
  systemPrompt: string,
  temperature: number
): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI client is not initialized");
  }

  try {
    console.log("Sending request to OpenAI API...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Roast this GitHub user based on their profile information:\n\n${userInfo}`,
        },
      ],
      temperature: temperature,
      max_tokens: 500,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("OpenAI API returned no choices");
    }

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI API returned empty content");
    }

    console.log("Successfully generated roast from OpenAI");
    return content;
  } catch (error) {
    console.error("Error in generateRoast function:", error);
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    } else {
      throw new Error("Unknown error in OpenAI API call");
    }
  }
}

// Add sound effect markers to the text
function addSoundEffectMarkers(text: string): string {
  // Split text into sentences
  const sentences = text.split(/(?<=[.!?])\s+/);

  // Sound effects available
  const soundEffects = [
    "[AIRHORN]",
    "[OOF]",
    "[BRUH]",
    "[EMOTIONAL-DAMAGE]",
    "[THUG-LIFE]",
    "[WOW]",
    "[FATALITY]",
  ];

  // Add a sound effect to approximately every 2-3 sentences
  let result = "";
  for (let i = 0; i < sentences.length; i++) {
    // Add the sentence
    result += sentences[i];

    // Add space if not the last sentence
    if (i < sentences.length - 1) {
      result += " ";
    }

    // Add sound effect after every 1-2 sentences (increased frequency)
    if (i > 0 && (i % 2 === 0 || (i % 3 === 0 && Math.random() > 0.5))) {
      // Select a random sound effect
      const randomEffect =
        soundEffects[Math.floor(Math.random() * soundEffects.length)];
      result += " " + randomEffect + " ";
    }
  }

  // Ensure we have at least one sound effect
  if (!soundEffects.some((effect) => result.includes(effect))) {
    // Add a random sound effect at the beginning
    const randomEffect =
      soundEffects[Math.floor(Math.random() * soundEffects.length)];
    result = randomEffect + " " + result;
  }

  // Add a final sound effect for dramatic ending if not already present
  if (!soundEffects.some((effect) => result.endsWith(effect))) {
    const endingEffects = ["[FATALITY]", "[EMOTIONAL-DAMAGE]", "[AIRHORN]"];
    const randomEndEffect =
      endingEffects[Math.floor(Math.random() * endingEffects.length)];
    result += " " + randomEndEffect;
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { username, intensity = "medium" } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "GitHub username is required" },
        { status: 400 }
      );
    }

    console.log(
      `Generating roast for GitHub user: ${username} with intensity: ${intensity}`
    );

    try {
      // Fetch GitHub profile data
      const userData = await fetchGitHubUserData(username);
      const repoData = await fetchGitHubRepoData(username);

      // Prepare data for OpenAI
      const userInfo = prepareUserInfo(userData, repoData);

      // Base system prompt
      let systemPrompt = `You are a comedy roast bot analyzing a GitHub profile. Create a funny, clever roast based on the GitHub data provided. Be witty and creative, focusing on their coding habits, repository choices, and activity patterns. The roast should be humorous but not excessively mean.`;

      // Set temperature based on intensity
      let temperature = 0.7; // Default temperature

      // Adjust system prompt based on intensity
      switch (intensity) {
        case "mild":
          systemPrompt +=
            " Keep it light and playful, with gentle teasing. Focus more on silly observations than criticism.";
          temperature = 0.5; // More deterministic for mild roasts
          break;
        case "medium":
          // Default prompt is already medium intensity
          temperature = 0.7; // Balanced creativity
          break;
        case "no_mercy":
          systemPrompt = `You are a brutal roast comedian analyzing a GitHub profile. 
          ABSOLUTELY OBLITERATE THEM WITH NO MERCY, but always use proper English and avoid gibberish.
          
          Focus on specific details from their GitHub profile to create a personalized, savage roast:
          
          1. Coding style: Tear apart any inconsistencies, poor practices, or outdated methods
          2. Project choices: Mock their project selection, especially abandoned repositories
          3. Commit history: Point out irregular commit patterns or long periods of inactivity
          4. Language preferences: Make fun of their language choices or limited language range
          5. Documentation: Criticize poor or missing documentation
          6. Code quality: Highlight any obvious code smells or anti-patterns
          
          Be extremely specific - use real details from their profile. Don't make up fake information.
          Keep your roast under 150 words maximum.
          Use simple, direct language that's easy to understand but absolutely devastating.
          
          IMPORTANT: Always use proper English sentences. DO NOT use gibberish, random characters, or nonsensical text.
          
          Make this the most savage, specific roast possible while remaining coherent and readable.`;

          temperature = 0.9;
          break;
        default:
          // Use default medium intensity
          break;
      }

      console.log(`Generating roast with temperature: ${temperature}`);

      try {
        // Generate roast using OpenAI
        const roastContent = await generateRoast(
          userInfo,
          systemPrompt,
          temperature
        );

        // Add sound effect markers to the roast
        const roastWithSoundEffects = addSoundEffectMarkers(roastContent);

        return NextResponse.json({ roast: roastWithSoundEffects });
      } catch (openaiError) {
        console.error("OpenAI API error:", openaiError);
        return NextResponse.json(
          {
            error: "Failed to generate roast with OpenAI",
            details:
              openaiError instanceof Error
                ? openaiError.message
                : "Unknown OpenAI error",
          },
          { status: 500 }
        );
      }
    } catch (githubError) {
      console.error("GitHub API error:", githubError);
      return NextResponse.json(
        {
          error: "Failed to fetch GitHub data",
          details:
            githubError instanceof Error
              ? githubError.message
              : "Unknown GitHub error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating roast:", error);
    return NextResponse.json(
      {
        error: "Failed to generate roast",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
