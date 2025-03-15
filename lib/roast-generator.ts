export async function generateRoast(
  handle: string,
  platform: string,
  intensity: string
): Promise<string> {
  // In a production app, you would call an AI API here
  // For now, we'll use prewritten roasts for demonstration

  // Remove @ if it's included in the handle
  const cleanHandle = handle.startsWith("@") ? handle.substring(1) : handle;

  // Platform-specific roasts
  const platformRoasts = {
    twitter: {
      mild: [
        `I checked out your Twitter and it seems your tweets are about as impactful as a feather falling in an empty forest.`,
        `Your Twitter bio says a lot about you, mainly that you spent way too much time crafting something nobody reads.`,
        `@${cleanHandle} tweets like they're trying to win a participation award in the social media Olympics.`,
      ],
      medium: [
        `@${cleanHandle}'s Twitter feed is what you'd get if mediocrity and desperation had a digital baby.`,
        `I scrolled through your timeline and had to check if I accidentally enabled sleep mode - your tweets are that exciting.`,
        `Your Twitter presence is like elevator music - present in the background but everyone's desperately trying to ignore it.`,
      ],
      spicy: [
        `@${cleanHandle}'s Twitter account is like a digital landfill where original thoughts go to die.`,
        `Your Twitter ratio is so bad even bots are embarrassed to engage with your content.`,
        `I've seen more engaging content from randomly generated text algorithms than your sad excuse for a Twitter presence.`,
      ],
    },
    github: {
      mild: [
        `Your GitHub profile suggests you think "pushing to master" is a personality trait.`,
        `I see you have a lot of forks. Too bad none of them are actually your original work.`,
        `Your commit messages read like someone with commitment issues wrote them.`,
      ],
      medium: [
        `@${cleanHandle}'s GitHub repositories are like museum exhibits: looked at occasionally but never actually used.`,
        `Your code has so many commented-out sections, it's like a digital graveyard of abandoned ideas.`,
        `Your GitHub contributions graph has more gaps than Swiss cheese. Taking breaks or just lacking inspiration?`,
      ],
      spicy: [
        `Your GitHub profile is the digital equivalent of a participation trophy.`,
        `I've seen more meaningful contributions from people who accidentally pushed lorem ipsum to production.`,
        `Your code is so DRY that all moisture within a 10-mile radius evaporates when you open your IDE.`,
      ],
    },
    instagram: {
      mild: [
        `Your Instagram aesthetic is about as consistent as my internet connection during a thunderstorm.`,
        `Those filters aren't hiding what you think they're hiding.`,
        `@${cleanHandle}'s captions suggest you think you're much deeper than you actually are.`,
      ],
      medium: [
        `Your Instagram feed looks like it was curated by an algorithm programmed to detect and amplify mediocrity.`,
        `Those aren't candid shots, and we all know it. Your "authentic" content is about as genuine as a $3 bill.`,
        `Your Instagram stories should come with a warning label: "Caution: Content may induce immediate scrolling."`,
      ],
      spicy: [
        `@${cleanHandle}'s Instagram is where original content goes to be murdered by filters and desperation.`,
        `Your selfie angles are more carefully calculated than NASA's rocket trajectories, yet somehow still fail to launch.`,
        `Your Instagram aesthetic is so bland it makes vanilla ice cream look exotic.`,
      ],
    },
    linkedin: {
      mild: [
        `Your LinkedIn profile reads like it was written by a bot trained exclusively on corporate buzzwords.`,
        `Calling yourself an "innovator" doesn't make it true, @${cleanHandle}.`,
        `Your professional headshot says "I'm approachable" but your eyes scream "I'll steal your lunch from the break room."`,
      ],
      medium: [
        `@${cleanHandle} posts on LinkedIn like someone whose personality has been replaced with a corporate values statement.`,
        `Your LinkedIn "achievements" are so vague I'm convinced you're actually in witness protection.`,
        `You're the human embodiment of "synergy" - nobody knows what you actually do, but you sure sound important.`,
      ],
      spicy: [
        `Your LinkedIn profile has more empty buzzwords than a startup pitch deck after five rounds of tequila.`,
        `@${cleanHandle}'s career trajectory is flatter than day-old soda.`,
        `Your "thought leadership" posts have all the depth of a puddle in the Sahara.`,
      ],
    },
  };

  // Select a random roast based on platform and intensity
  const roasts =
    platformRoasts[platform as keyof typeof platformRoasts][
      intensity as keyof typeof platformRoasts.twitter
    ];
  const randomIndex = Math.floor(Math.random() * roasts.length);

  // Add a custom intro and outro based on intensity
  let intro = "";
  let outro = "";

  switch (intensity) {
    case "mild":
      intro = "Let me gently point out that ";
      outro = " But hey, you seem nice otherwise!";
      break;
    case "medium":
      intro = "I don't want to be mean, but ";
      outro = " Maybe it's time to reconsider your social media strategy?";
      break;
    case "spicy":
      intro = "Brace yourself because ";
      outro = " Might be time to delete your account and start over.";
      break;
  }

  // For demo purposes, simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return `${intro}${roasts[randomIndex]}${outro}`;
}
