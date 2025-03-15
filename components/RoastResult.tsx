import { useState } from "react";

type RoastResultProps = {
  roastData: {
    handle: string;
    platform: string;
    intensity: string;
    roast: string;
  };
};

export default function RoastResult({ roastData }: RoastResultProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "𝕏";
      case "github":
        return "🐙";
      case "instagram":
        return "📸";
      case "linkedin":
        return "💼";
      default:
        return "🌐";
    }
  };

  // Get intensity emoji and color
  const getIntensityDetails = (intensity: string) => {
    switch (intensity) {
      case "mild":
        return { emoji: "🙂", color: "bg-green-500" };
      case "medium":
        return { emoji: "😬", color: "bg-yellow-500" };
      case "spicy":
        return { emoji: "🔥", color: "bg-red-500" };
      default:
        return { emoji: "😐", color: "bg-blue-500" };
    }
  };

  const intensityDetails = getIntensityDetails(roastData.intensity);

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full ${intensityDetails.color} flex items-center justify-center text-2xl`}
            >
              {getPlatformIcon(roastData.platform)}
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold">@{roastData.handle}</h3>
              <p className="text-gray-400 text-sm capitalize">
                {roastData.platform} • {roastData.intensity} Roast{" "}
                {intensityDetails.emoji}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-900 rounded-b-xl">
        <blockquote className="text-xl font-medium leading-relaxed border-l-4 border-red-500 pl-4 py-2">
          &quot;{roastData.roast}&quot;
        </blockquote>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-400 hover:text-blue-300 focus:outline-none"
          >
            {isExpanded ? "Show less" : "How this roast was generated"}
          </button>

          {isExpanded && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg text-left">
              <p className="mb-2">This roast was generated based on:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Your {roastData.platform} handle</li>
                <li>Your selected intensity level ({roastData.intensity})</li>
                <li>
                  AI analysis of common {roastData.platform} user behaviors
                </li>
                <li>Comedic patterns optimized for humorous criticism</li>
              </ul>
              <p className="mt-4 text-xs">
                Note: This roast is meant for entertainment purposes only and is
                not based on actual analysis of your social media account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
