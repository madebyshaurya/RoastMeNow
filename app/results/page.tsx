"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  Volume2,
  VolumeX,
  ArrowLeft,
  Share2,
  RotateCcw,
  Download,
  Copy,
  Check,
  Flame,
  Skull,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";

// Meme sound effects with their descriptions
const MEME_SOUNDS = [
  { id: "airhorn", src: "/sounds/airhorn.mp3", description: "Airhorn" },
  { id: "oof", src: "/sounds/oof.mp3", description: "Oof" },
  { id: "bruh", src: "/sounds/bruh.mp3", description: "Bruh" },
  {
    id: "emotional-damage",
    src: "/sounds/emotional-damage.mp3",
    description: "Emotional Damage",
  },
  { id: "thug-life", src: "/sounds/thug-life.mp3", description: "Thug Life" },
  { id: "wow", src: "/sounds/wow.mp3", description: "Wow" },
  { id: "fatality", src: "/sounds/fatality.mp3", description: "Fatality" },
];

// Trigger phrases that might indicate a good moment for sound effects
const TRIGGER_PHRASES = [
  {
    pattern: /burn|roasted|destroyed|obliterated|wrecked|savage|brutal/i,
    sound: "airhorn",
  },
  { pattern: /fail|failure|mistake|error|bug|broken/i, sound: "oof" },
  { pattern: /seriously|really|come on|are you kidding/i, sound: "bruh" },
  {
    pattern: /devastating|painful|hurt|damage|suffering/i,
    sound: "emotional-damage",
  },
  { pattern: /cool|awesome|impressive|amazing|wow/i, sound: "thug-life" },
  { pattern: /surprising|unexpected|shocking|plot twist/i, sound: "wow" },
  { pattern: /dead|death|killed|murdered|finished/i, sound: "fatality" },
];

export default function RoastResults() {
  const searchParams = useSearchParams();
  const encodedRoast = searchParams.get("roast");
  const intensity = searchParams.get("intensity") || "medium";
  const roastText = encodedRoast ? decodeURIComponent(encodedRoast) : null;
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);
  const [soundEffectPoints, setSoundEffectPoints] = useState<
    { index: number; sound: string }[]
  >([]);
  const [lastPlayedSoundIndex, setLastPlayedSoundIndex] = useState(-1);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundEffectsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const wordTimingsRef = useRef<number[]>([]);
  const wordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load sound effects
  useEffect(() => {
    let loaded = 0;
    const total = MEME_SOUNDS.length;
    const loadTimeout = setTimeout(() => {
      if (!soundsLoaded) {
        console.warn("Sound effects loading timed out, proceeding anyway");
        setSoundsLoaded(true);
      }
    }, 5000); // Wait 5 seconds max for sounds to load

    MEME_SOUNDS.forEach((sound) => {
      const audio = new Audio(sound.src);
      audio.preload = "auto";
      soundEffectsRef.current[sound.id] = audio;

      audio.oncanplaythrough = () => {
        loaded++;
        if (loaded === total) {
          clearTimeout(loadTimeout);
          setSoundsLoaded(true);
        }
      };

      audio.onerror = () => {
        console.error(`Failed to load sound: ${sound.src}`);
        loaded++;
        if (loaded === total) {
          clearTimeout(loadTimeout);
          setSoundsLoaded(true);
        }
      };
    });

    return () => {
      clearTimeout(loadTimeout);
      // Clean up sound effects
      Object.values(soundEffectsRef.current).forEach((audio) => {
        audio.oncanplaythrough = null;
        audio.onerror = null;
      });
    };
  }, []);

  useEffect(() => {
    if (roastText) {
      // Split text into words for highlighting
      const allWords = roastText
        .replace(/\n/g, " \n ")
        .split(" ")
        .filter((word) => word.trim().length > 0);
      setWords(allWords);

      // Find potential points for sound effects
      const points: { index: number; sound: string }[] = [];

      // Analyze text for trigger phrases
      let sentence = "";
      let wordCount = 0;

      allWords.forEach((word, index) => {
        if (word === "\n") {
          // End of paragraph, reset sentence
          sentence = "";
          return;
        }

        sentence += word + " ";
        wordCount++;

        // Check for end of sentence
        if (/[.!?]$/.test(word) || wordCount > 15) {
          // Check if this sentence matches any trigger phrases
          for (const trigger of TRIGGER_PHRASES) {
            if (trigger.pattern.test(sentence)) {
              // Add sound effect point at the end of this sentence
              points.push({ index, sound: trigger.sound });
              break;
            }
          }
          sentence = "";
          wordCount = 0;
        }
      });

      // Ensure we don't have too many sound effects (max 1 every 10 seconds)
      const maxSoundEffects = Math.min(5, Math.floor(points.length / 2));
      const selectedPoints = points
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, maxSoundEffects);

      setSoundEffectPoints(selectedPoints);

      generateSpeech(roastText);
    }

    return () => {
      if (wordIntervalRef.current) {
        clearInterval(wordIntervalRef.current);
      }
    };
  }, [roastText]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [copied]);

  // Play sound effect when reaching a sound effect point
  useEffect(() => {
    if (isPlaying && currentWordIndex >= 0) {
      const soundPoint = soundEffectPoints.find(
        (point) =>
          point.index === currentWordIndex && point.index > lastPlayedSoundIndex
      );

      if (soundPoint) {
        const sound = soundEffectsRef.current[soundPoint.sound];
        if (sound) {
          // Temporarily reduce main audio volume
          if (audioRef.current) {
            audioRef.current.volume = 0.3;
          }

          // Play sound effect
          sound.currentTime = 0;
          sound.volume = 0.7;
          sound.play();

          // Restore main audio volume after sound effect
          sound.onended = () => {
            if (audioRef.current) {
              audioRef.current.volume = 1.0;
            }
          };

          setLastPlayedSoundIndex(soundPoint.index);
        }
      }
    }
  }, [currentWordIndex, isPlaying, soundEffectPoints, lastPlayedSoundIndex]);

  const generateSpeech = async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          intensity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onloadedmetadata = () => {
          if (audioRef.current) {
            const audioDuration = audioRef.current.duration * 1000;

            // Calculate word timings based on audio duration
            const totalWords = words.length;
            const avgWordDuration = audioDuration / totalWords;

            // Create array of word timings with slight variations
            const timings: number[] = [];
            let currentTime = 0;

            words.forEach((word) => {
              // Words at the end of sentences take longer to say
              const isEndOfSentence = /[.!?]$/.test(word);
              const wordLength = word.length;

              // Adjust timing based on word length and position
              let wordDuration = avgWordDuration;

              // Longer words take longer to say
              if (wordLength > 8) wordDuration *= 1.5;
              else if (wordLength > 5) wordDuration *= 1.2;

              // End of sentences have a pause
              if (isEndOfSentence) wordDuration *= 1.5;

              // New lines have a pause
              if (word === "\n") wordDuration *= 0.5;

              timings.push(currentTime);
              currentTime += wordDuration;
            });

            // Normalize timings to match audio duration
            const lastTime = timings[timings.length - 1];
            const normalizedTimings = timings.map(
              (time) => (time / lastTime) * audioDuration
            );

            wordTimingsRef.current = normalizedTimings;
            setIsLoading(false);
            audioRef.current.play();
            setIsPlaying(true);
            startWordHighlighting();
          }
        };

        audioRef.current.onended = () => {
          setIsPlaying(false);
          setCurrentWordIndex(-1);
          if (wordIntervalRef.current) {
            clearInterval(wordIntervalRef.current);
          }
        };

        audioRef.current.onerror = () => {
          setError("Error playing audio");
          setIsLoading(false);
          setIsPlaying(false);
          setCurrentWordIndex(-1);
        };
      }
    } catch (err) {
      console.error("Error generating speech:", err);
      setError("Failed to generate speech. Please try again.");
      setIsLoading(false);
    }
  };

  const startWordHighlighting = () => {
    if (!audioRef.current || wordTimingsRef.current.length === 0) return;

    // Clear any existing interval
    if (wordIntervalRef.current) {
      clearInterval(wordIntervalRef.current);
    }

    const checkWordTiming = () => {
      if (!audioRef.current) return;

      const currentTime = audioRef.current.currentTime * 1000;
      const timings = wordTimingsRef.current;

      // Find the current word based on audio position
      for (let i = 0; i < timings.length - 1; i++) {
        if (currentTime >= timings[i] && currentTime < timings[i + 1]) {
          if (currentWordIndex !== i) {
            setCurrentWordIndex(i);
          }
          return;
        }
      }

      // Handle the last word
      if (currentTime >= timings[timings.length - 1]) {
        setCurrentWordIndex(timings.length - 1);
      }
    };

    // Check word timing every 30ms for more accuracy (reduced from 50ms)
    wordIntervalRef.current = setInterval(checkWordTiming, 30);

    // Also add a timeupdate event listener for better synchronization
    audioRef.current.addEventListener("timeupdate", checkWordTiming);

    // Clean up the event listener when audio ends
    audioRef.current.addEventListener("ended", () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", checkWordTiming);
      }
    });
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (wordIntervalRef.current) {
        clearInterval(wordIntervalRef.current);
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      startWordHighlighting();
    }
  };

  const replayAudio = () => {
    if (!audioRef.current || !audioUrl) return;

    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
    setLastPlayedSoundIndex(-1);
    startWordHighlighting();
    setReplayCount((prev) => prev + 1);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "github-roast.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyToClipboard = () => {
    if (!roastText) return;

    navigator.clipboard
      .writeText(roastText)
      .then(() => {
        setCopied(true);
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
      });
  };

  const shareRoast = () => {
    if (!roastText) return;

    if (navigator.share) {
      navigator
        .share({
          title: "My GitHub Roast",
          text: roastText,
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err);
        });
    } else {
      copyToClipboard();
    }
  };

  // Render text with word-by-word highlighting
  const renderRoastText = () => {
    if (!roastText || words.length === 0) return null;

    const paragraphs: React.ReactElement[] = [];
    let currentParagraph: React.ReactElement[] = [];
    let paragraphIndex = 0;

    words.forEach((word, index) => {
      if (word === "\n") {
        if (currentParagraph.length > 0) {
          paragraphs.push(
            <p key={`p-${paragraphIndex}`} className="mb-4 text-gray-300">
              {currentParagraph}
            </p>
          );
          currentParagraph = [];
          paragraphIndex++;
        }
      } else {
        const isHighlighted = index === currentWordIndex;
        const isSoundEffect = soundEffectPoints.some(
          (point) => point.index === index
        );

        currentParagraph.push(
          <span
            key={`word-${index}`}
            className={`transition-all duration-150 ${
              isHighlighted
                ? intensity === "no_mercy"
                  ? "bg-gradient-to-r from-purple-500 to-red-500 text-white px-1 py-0.5 rounded"
                  : "bg-gradient-to-r from-orange-500 to-red-500 text-white px-1 py-0.5 rounded"
                : isSoundEffect
                ? "relative"
                : ""
            }`}
          >
            {word}{" "}
            {isSoundEffect && (
              <span className="absolute -top-2 -right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
            )}
          </span>
        );
      }
    });

    // Add the last paragraph if there's anything left
    if (currentParagraph.length > 0) {
      paragraphs.push(
        <p key={`p-${paragraphIndex}`} className="mb-4 text-gray-300">
          {currentParagraph}
        </p>
      );
    }

    return paragraphs;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <Header />

        <div className="max-w-2xl mx-auto mt-12">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 relative overflow-hidden">
            {/* Animated background effect */}
            <div className="absolute inset-0 opacity-10">
              <div
                className={`absolute -inset-[100px] ${
                  intensity === "no_mercy"
                    ? "bg-gradient-to-r from-purple-500/30 to-red-500/30 rounded-full blur-3xl animate-pulse"
                    : "bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full blur-3xl animate-pulse"
                }`}
              ></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-2xl font-bold flex items-center ${
                    intensity === "no_mercy"
                      ? "bg-gradient-to-r from-purple-500 to-red-500 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
                  }`}
                >
                  {intensity === "no_mercy" ? (
                    <Skull className="w-6 h-6 mr-2 text-purple-500" />
                  ) : (
                    <Flame className="w-6 h-6 mr-2 text-orange-500" />
                  )}
                  {intensity === "no_mercy"
                    ? "NO MERCY Roast"
                    : "Your GitHub Roast"}
                </h2>

                {replayCount > 0 && (
                  <div className="bg-gray-700 px-2 py-1 rounded-full text-xs text-gray-300">
                    Replayed {replayCount}x
                  </div>
                )}
              </div>

              {roastText ? (
                <div className="space-y-6">
                  <div className="prose prose-invert max-w-none">
                    {renderRoastText()}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                      onClick={toggleAudio}
                      disabled={isLoading || !soundsLoaded}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                        intensity === "no_mercy"
                          ? "bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700"
                          : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Loading audio...</span>
                        </>
                      ) : !soundsLoaded ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Loading sound effects...</span>
                        </>
                      ) : isPlaying ? (
                        <>
                          <VolumeX className="w-5 h-5" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-5 h-5" />
                          <span>Play Roast</span>
                        </>
                      )}
                    </button>

                    {audioUrl && !isLoading && soundsLoaded && (
                      <>
                        <button
                          onClick={replayAudio}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Replay</span>
                        </button>

                        <button
                          onClick={downloadAudio}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={copyToClipboard}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors ml-auto"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={shareRoast}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>

                    <audio ref={audioRef} className="hidden" />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm mt-4">{error}</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading your roast...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
