"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Flame, Github, Info, AlertCircle, Bot, Loader2 } from "lucide-react";

export default function RoastForm() {
  const [handle, setHandle] = useState("");
  const [intensity, setIntensity] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  // GitHub-specific validation
  const validateHandle = () => {
    if (!handle.trim()) {
      setFormError("Please enter a GitHub username");
      return false;
    }

    const cleanHandle = handle.startsWith("@") ? handle.substring(1) : handle;

    // GitHub usernames must be between 1-39 characters and can contain alphanumeric and hyphens
    if (
      !/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(cleanHandle)
    ) {
      setFormError(
        "GitHub usernames must be 1-39 characters and can only contain letters, numbers, and hyphens (not at the start/end)"
      );
      return false;
    }

    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateHandle()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          handle,
          platform: "github", // Always set to github
          intensity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate roast");
      }

      // Redirect to results page with the roast data
      router.push(`/results?id=${data.id}`);
    } catch (error) {
      console.error("Error:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to generate roast. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          Ready to Get Roasted?
        </h2>
        <p className="text-gray-400">
          Prepare your GitHub profile for a good roasting! 🔥
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 backdrop-blur-sm bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700"
      >
        <div className="space-y-2">
          <label
            htmlFor="handle"
            className="block text-sm font-medium flex items-center space-x-2"
          >
            <Github className="w-5 h-5 text-gray-400" />
            <span>GitHub Username</span>
          </label>
          <div className="relative group">
            <input
              id="handle"
              type="text"
              placeholder="username"
              value={handle}
              onChange={(e) => {
                setHandle(e.target.value);
                if (formError) setFormError(null);
              }}
              onBlur={validateHandle}
              className={`w-full px-4 py-2 bg-gray-700/50 rounded-lg focus:ring-2 focus:outline-none transition-all duration-300 pl-10 ${
                formError
                  ? "border border-red-500 focus:ring-red-500"
                  : "focus:ring-orange-500 group-hover:bg-gray-700/70"
              }`}
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">@</span>
            </div>
          </div>
          {!formError && (
            <p className="text-xs text-gray-400 flex items-center space-x-1">
              <Info className="w-4 h-4" />
              <span>Enter your GitHub username</span>
            </p>
          )}
          {formError && (
            <p className="text-xs text-red-400 mt-1 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{formError}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="intensity"
            className="block text-sm font-medium flex items-center space-x-2"
          >
            <Flame className="w-5 h-5 text-gray-400" />
            <span>Roast Intensity</span>
          </label>
          <select
            id="intensity"
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700/50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-300 hover:bg-gray-700/70"
          >
            <option value="mild">🌶️ Mild (I&apos;m sensitive)</option>
            <option value="medium">🌶️🌶️ Medium (I can handle it)</option>
            <option value="spicy">🌶️🌶️🌶️ Spicy (Destroy me)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
              <span>Preparing Your Roast...</span>
            </div>
          ) : (
            <>
              <Flame className="w-6 h-6" />
              <span>Roast Me</span>
            </>
          )}
        </button>

        <div className="text-xs text-center text-gray-400 mt-4 space-y-1">
          <p className="flex items-center justify-center space-x-1">
            <Info className="w-4 h-4" />
            <span>
              By submitting, you agree that we&apos;ll analyze public
              information from your GitHub profile.
            </span>
          </p>
          <p className="flex items-center justify-center space-x-1">
            <Bot className="w-4 h-4" />
            <span>
              All roasts are AI-generated for entertainment purposes only. 🤖
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}
