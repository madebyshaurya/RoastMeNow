"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  Github,
  Info,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
  Skull,
} from "lucide-react";
import { encodeText } from "@/lib/utils";

export default function RoastForm() {
  const [handle, setHandle] = useState("");
  const [intensity, setIntensity] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const router = useRouter();

  // GitHub-specific validation
  const validateHandle = () => {
    if (!handle.trim()) {
      setFormError("Please enter a GitHub username");
      shakeForm();
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
      shakeForm();
      return false;
    }

    setFormError(null);
    return true;
  };

  const shakeForm = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 820);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateHandle()) {
      return;
    }
    setIsLoading(true);

    const cleanHandle = handle.startsWith("@") ? handle.substring(1) : handle;

    try {
      // Just check if the GitHub user exists
      const userRes = await fetch(
        `https://api.github.com/users/${cleanHandle}`
      );
      if (!userRes.ok) {
        setFormError("GitHub user not found");
        setIsLoading(false);
        shakeForm();
        return;
      }

      // Send username to our API
      const roastResponse = await fetch("/api/roast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanHandle,
          intensity,
        }),
      });

      if (!roastResponse.ok) {
        const errorData = await roastResponse.json();
        console.error("Roast API error:", errorData);
        throw new Error(errorData.error || "Failed to generate roast");
      }

      const roastData = await roastResponse.json();

      // Navigate to results page with the roast content and intensity
      router.push(
        `/results?roast=${encodeText(roastData.roast)}&intensity=${intensity}`
      );
    } catch (error) {
      console.error("Error:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to generate roast. Please try again."
      );
      setIsLoading(false);
      shakeForm();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent flex items-center justify-center">
          <Sparkles className="w-6 h-6 mr-2 text-orange-400" />
          Ready to Get Roasted?
          <Sparkles className="w-6 h-6 ml-2 text-orange-400" />
        </h2>
        <p className="text-gray-400">
          Prepare your GitHub profile for a good roasting! 🔥
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`space-y-6 backdrop-blur-sm bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700 transition-all ${
          isShaking ? "animate-shake" : ""
        }`}
      >
        <div className="space-y-2">
          <label
            htmlFor="handle"
            className="text-sm font-medium flex items-center space-x-2"
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
            className="text-sm font-medium flex items-center space-x-2"
          >
            <Flame className="w-5 h-5 text-gray-400" />
            <span>Roast Intensity</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIntensity("mild")}
              className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                intensity === "mild"
                  ? "bg-gradient-to-r from-green-600/70 to-green-500/70 border border-green-400"
                  : "bg-gray-700/50 hover:bg-gray-700/70 border border-transparent"
              }`}
            >
              <span className="text-lg mb-1">🌶️</span>
              <span className="text-sm font-medium">Mild</span>
              <span className="text-xs text-gray-400 mt-1">
                I&apos;m sensitive
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIntensity("medium")}
              className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                intensity === "medium"
                  ? "bg-gradient-to-r from-yellow-600/70 to-yellow-500/70 border border-yellow-400"
                  : "bg-gray-700/50 hover:bg-gray-700/70 border border-transparent"
              }`}
            >
              <span className="text-lg mb-1">🌶️🌶️</span>
              <span className="text-sm font-medium">Medium</span>
              <span className="text-xs text-gray-400 mt-1">
                I can handle it
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIntensity("spicy")}
              className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                intensity === "spicy"
                  ? "bg-gradient-to-r from-red-600/70 to-red-500/70 border border-red-400"
                  : "bg-gray-700/50 hover:bg-gray-700/70 border border-transparent"
              }`}
            >
              <span className="text-lg mb-1">🌶️🌶️🌶️</span>
              <span className="text-sm font-medium">Spicy</span>
              <span className="text-xs text-gray-400 mt-1">Destroy me</span>
            </button>

            <button
              type="button"
              onClick={() => setIntensity("no_mercy")}
              className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                intensity === "no_mercy"
                  ? "bg-gradient-to-r from-purple-600/70 to-red-600/70 border border-purple-400 animate-pulse"
                  : "bg-gray-700/50 hover:bg-gray-700/70 border border-transparent"
              }`}
            >
              <span className="text-lg mb-1">💀</span>
              <span className="text-sm font-medium">NO MERCY</span>
              <span className="text-xs text-gray-400 mt-1">End my career</span>
            </button>
          </div>

          {/* Hidden select for form submission */}
          <select
            id="intensity"
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            className="hidden"
          >
            <option value="mild">Mild</option>
            <option value="medium">Medium</option>
            <option value="spicy">Spicy</option>
            <option value="no_mercy">NO MERCY</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full px-6 py-3 text-lg font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 relative overflow-hidden group
            ${
              intensity === "no_mercy"
                ? "bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700"
                : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            }`}
        >
          <span
            className={`absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity
            ${
              intensity === "no_mercy"
                ? "bg-gradient-to-r from-purple-700 to-red-700"
                : "bg-gradient-to-r from-red-600 to-orange-600"
            }`}
          ></span>

          <span className="relative flex items-center justify-center">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                <span>Preparing Your Roast...</span>
              </>
            ) : (
              <>
                {intensity === "no_mercy" ? (
                  <Skull className="w-6 h-6 mr-2" />
                ) : (
                  <Zap className="w-6 h-6 mr-2" />
                )}
                <span>
                  {intensity === "no_mercy" ? "Obliterate Me" : "Roast Me"}
                </span>
              </>
            )}
          </span>
        </button>

        {intensity === "no_mercy" && (
          <p className="text-xs text-red-400 text-center mt-2 animate-pulse">
            ⚠️ Warning: NO MERCY mode will be extremely brutal. Proceed at your
            own risk!
          </p>
        )}
      </form>
    </div>
  );
}
