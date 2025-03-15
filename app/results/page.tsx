"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import RoastResult from "@/components/RoastResult";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [roastData, setRoastData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you would fetch the roast data from an API or database
    // For this demo, we'll parse it from the URL or session storage
    const fetchRoastData = async () => {
      try {
        // Simulating data fetch
        // In a real app you would do: const response = await fetch(`/api/roast/${id}`);

        // For demo, we'll use the data passed in URL or fallback to mock data
        const mockData = {
          handle: "demouser",
          platform: "twitter",
          intensity: "medium",
          roast:
            "I don't want to be mean, but @demouser's Twitter feed is what you'd get if mediocrity and desperation had a digital baby. Maybe it's time to reconsider your social media strategy?",
        };

        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        setRoastData(mockData);
      } catch (err) {
        console.error("Error fetching roast:", err);
        setError("Failed to load your roast. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRoastData();
    } else {
      setError("No roast ID provided");
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <Header />
          <div className="max-w-2xl mx-auto mt-12 p-6 bg-gray-800 rounded-xl shadow-lg text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-24 bg-gray-700 rounded mb-6"></div>
            </div>
            <p className="text-gray-400">Preparing your roast...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <Header />
          <div className="max-w-2xl mx-auto mt-12 p-6 bg-gray-800 rounded-xl shadow-lg text-center">
            <p className="text-red-400 mb-6">{error}</p>
            <Link
              href="/"
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <Header />
        <div className="max-w-2xl mx-auto mt-12">
          <RoastResult roastData={roastData} />
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/"
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Roast Again
            </Link>
            <button
              onClick={() => {
                // Share functionality would go here
                // For now, just copy to clipboard
                navigator.clipboard.writeText(
                  `I got roasted by AI! "${roastData.roast}" - Try it yourself at roast-ai-website.com`
                );
                alert("Roast copied to clipboard!");
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Share Roast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
