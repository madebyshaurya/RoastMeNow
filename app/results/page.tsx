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
    pattern:
      /burn|roasted|destroyed|obliterated|wrecked|savage|brutal|fire|flame|hot/i,
    sound: "airhorn",
  },
  {
    pattern: /fail|failure|mistake|error|bug|broken|oops|yikes|oof/i,
    sound: "oof",
  },
  {
    pattern: /seriously|really|come on|are you kidding|bruh|bro|dude|what/i,
    sound: "bruh",
  },
  {
    pattern:
      /devastating|painful|hurt|damage|suffering|emotional|feelings|ouch|burn/i,
    sound: "emotional-damage",
  },
  {
    pattern: /cool|awesome|impressive|amazing|wow|nice|sick|rad|thug|gangsta/i,
    sound: "thug-life",
  },
  {
    pattern: /surprising|unexpected|shocking|plot twist|twist|wow|whoa|oh my/i,
    sound: "wow",
  },
  {
    pattern: /dead|death|killed|murdered|finished|fatality|over|done|rip|end/i,
    sound: "fatality",
  },
];

// Analyze text for trigger phrases with improved detection
const findSoundEffectPoints = (words: string[]) => {
  const points: { index: number; sound: string }[] = [];
  let sentence = "";
  let wordCount = 0;

  words.forEach((word, index) => {
    if (word === "\n") {
      // End of paragraph, reset sentence
      sentence = "";
      wordCount = 0;
      return;
    }

    sentence += word + " ";
    wordCount++;

    // Check for end of sentence or long enough phrase
    if (/[.!?]$/.test(word) || wordCount > 12) {
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

  return points;
};

// Process text to extract sound effect markers and create clean text
const processSoundEffectMarkers = (text: string) => {
  console.log(
    "Processing text for sound effect markers:",
    text.substring(0, 100) + "..."
  );
  const soundEffectRegex =
    /\[(AIRHORN|OOF|BRUH|EMOTIONAL-DAMAGE|THUG-LIFE|WOW|FATALITY)\]/gi;
  const soundMarkers: { index: number; sound: string }[] = [];

  // Find all sound effect markers and their positions
  let match;
  let cleanText = text;
  let offset = 0;

  // First pass: collect all markers and their positions
  const matches = text.match(soundEffectRegex);
  if (matches) {
    console.log(`Found ${matches.length} sound effect markers:`, matches);
  } else {
    console.log("No sound effect markers found in text");
  }

  // Reset regex
  const regex = new RegExp(soundEffectRegex);

  while ((match = regex.exec(text)) !== null) {
    const soundType = match[1].toLowerCase();
    const position = match.index - offset;

    console.log(`Found sound marker: ${soundType} at position ${match.index}`);

    // Map the marker to the sound file name
    let soundFile = "";
    switch (soundType.toLowerCase()) {
      case "airhorn":
        soundFile = "airhorn";
        break;
      case "oof":
        soundFile = "oof";
        break;
      case "bruh":
        soundFile = "bruh";
        break;
      case "emotional-damage":
        soundFile = "emotional-damage";
        break;
      case "thug-life":
        soundFile = "thug-life";
        break;
      case "wow":
        soundFile = "wow";
        break;
      case "fatality":
        soundFile = "fatality";
        break;
      default:
        continue;
    }

    soundMarkers.push({
      index: position,
      sound: soundFile,
    });

    // Update offset for next marker position calculation
    offset += match[0].length;
  }

  // Second pass: remove all markers from text
  cleanText = text.replace(soundEffectRegex, "");

  console.log(
    `Processed ${soundMarkers.length} sound markers, clean text length: ${cleanText.length}`
  );

  return { cleanText, soundMarkers };
};

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
  const [cleanRoastText, setCleanRoastText] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundEffectsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const wordTimingsRef = useRef<number[]>([]);
  const wordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load sound effects
  useEffect(() => {
    console.log("Loading sound effects...");
    let loaded = 0;
    const total = MEME_SOUNDS.length;
    const loadTimeout = setTimeout(() => {
      if (!soundsLoaded) {
        console.warn("Sound effects loading timed out, proceeding anyway");
        setSoundsLoaded(true);
      }
    }, 5000); // Wait 5 seconds max for sounds to load

    MEME_SOUNDS.forEach((sound) => {
      console.log(`Loading sound: ${sound.id} from ${sound.src}`);
      const audio = new Audio();
      audio.src = sound.src;
      audio.preload = "auto";

      // Store in ref even before loaded
      soundEffectsRef.current[sound.id] = audio;

      audio.oncanplaythrough = () => {
        console.log(`Sound loaded successfully: ${sound.id}`);
        loaded++;
        if (loaded === total) {
          clearTimeout(loadTimeout);
          setSoundsLoaded(true);
          console.log("All sounds loaded successfully!");
        }
      };

      audio.onerror = (e) => {
        console.error(`Failed to load sound: ${sound.src}`, e);
        loaded++;
        if (loaded === total) {
          clearTimeout(loadTimeout);
          setSoundsLoaded(true);
        }
      };

      // Force load attempt
      audio.load();
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

  // Add a debug function to test sound playback
  const testSoundEffect = (soundId: string) => {
    console.log(`Testing sound effect: ${soundId}`);
    const sound = soundEffectsRef.current[soundId];
    if (sound) {
      sound.currentTime = 0;
      sound.volume = 0.2;
      sound
        .play()
        .then(() => console.log(`Successfully played ${soundId}`))
        .catch((err) => console.error(`Failed to play ${soundId}:`, err));
    } else {
      console.error(`Sound not found: ${soundId}`);
    }
  };

  useEffect(() => {
    if (roastText) {
      // Process the text to extract sound effect markers
      const { cleanText, soundMarkers } = processSoundEffectMarkers(roastText);
      setCleanRoastText(cleanText);

      // Split clean text into words for highlighting
      const allWords = cleanText
        .replace(/\n/g, " \n ")
        .split(" ")
        .filter((word) => word.trim().length > 0);
      setWords(allWords);

      // Convert sound markers to word indices
      const wordBasedMarkers: { index: number; sound: string }[] = [];

      if (soundMarkers.length > 0) {
        // Map character positions to word indices
        let charCount = 0;
        allWords.forEach((word, wordIndex) => {
          const wordLength = word.length + 1; // +1 for space

          // Check if any sound markers fall within this word's range
          soundMarkers.forEach((marker) => {
            if (
              marker.index >= charCount &&
              marker.index < charCount + wordLength
            ) {
              wordBasedMarkers.push({
                index: wordIndex,
                sound: marker.sound,
              });
            }
          });

          charCount += wordLength;
        });
      }

      // If we have explicit markers, use those; otherwise fall back to pattern detection
      if (wordBasedMarkers.length > 0) {
        console.log("Using explicit sound markers:", wordBasedMarkers);
        setSoundEffectPoints(wordBasedMarkers);
      } else {
        // Fall back to the pattern detection method
        console.log("No explicit markers found, using pattern detection");
        const points = findSoundEffectPoints(allWords);
        const maxSoundEffects = Math.min(7, Math.floor(points.length / 2));
        const selectedPoints = points
          .sort(() => Math.random() - 0.5) // Shuffle
          .slice(0, maxSoundEffects);
        setSoundEffectPoints(selectedPoints);
      }

      generateSpeech(cleanText);
    }

    return () => {
      if (wordIntervalRef.current) {
        clearInterval(wordIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", () => {});
        audioRef.current.removeEventListener("seeking", () => {});
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
        console.log(
          `ATTEMPTING to play sound effect: ${soundPoint.sound} at word index ${currentWordIndex}`
        );
        const sound = soundEffectsRef.current[soundPoint.sound];
        if (sound) {
          try {
            // Play sound effect with lower volume
            sound.currentTime = 0;
            sound.volume = 0.2; // Further reduced volume for sound effects

            // Show visual effect
            setActiveEffect(soundPoint.sound);

            // Hide visual effect after 1.5 seconds
            setTimeout(() => {
              setActiveEffect(null);
            }, 1500);

            // Force play with multiple attempts
            const playSound = () => {
              console.log(`PLAYING sound: ${soundPoint.sound}`);
              const playPromise = sound.play();

              if (playPromise !== undefined) {
                playPromise.catch((error) => {
                  console.error(`Error playing sound effect: ${error}`);
                  // Try again after a short delay
                  setTimeout(() => {
                    console.log(`Retrying sound: ${soundPoint.sound}`);
                    sound
                      .play()
                      .catch((e) => console.error("Still failed to play:", e));
                  }, 100);
                });
              }
            };

            playSound();
            setLastPlayedSoundIndex(soundPoint.index);
          } catch (error) {
            console.error(`Error playing sound effect: ${error}`);
          }
        } else {
          console.error(`Sound effect not found: ${soundPoint.sound}`);
        }
      }
    }
  }, [currentWordIndex, isPlaying, soundEffectPoints, lastPlayedSoundIndex]);

  // Add a function to manually play a test sound when the page loads
  useEffect(() => {
    // Add a click handler to enable audio on first user interaction
    const enableAudio = () => {
      console.log("User interaction detected, enabling audio");

      // Try to play a test sound to unlock audio
      const testSound = soundEffectsRef.current["airhorn"];
      if (testSound) {
        testSound.volume = 0.01; // Very quiet
        testSound
          .play()
          .then(() => {
            console.log("Audio context unlocked successfully");
            testSound.pause();
            testSound.currentTime = 0;
          })
          .catch((err) => {
            console.error("Failed to unlock audio context:", err);
          });
      }

      // Remove the event listener after first interaction
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
    };

    // Add event listeners for user interaction
    document.addEventListener("click", enableAudio);
    document.addEventListener("touchstart", enableAudio);

    return () => {
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
    };
  }, []);

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

      // First check the content type to determine how to handle the response
      const contentType = response.headers.get("Content-Type") || "";

      if (contentType.includes("application/json")) {
        // This is a JSON response (error or fallback)
        const responseData = await response.json();

        if (responseData.fallback) {
          console.log("Using browser TTS fallback");
          handleBrowserTTS(responseData.text);
          return;
        }

        // If we got here, it's an error
        throw new Error(
          responseData.details || responseData.error || "Unknown error"
        );
      }

      // If we get here, it's an audio response
      if (!contentType.includes("audio/")) {
        // Try to read as JSON first in case it's an error response with wrong content type
        try {
          const errorData = await response.clone().json();
          if (errorData.error) {
            throw new Error(errorData.details || errorData.error);
          }
        } catch {
          // Not JSON, so just throw the content type error
          throw new Error(`Unexpected content type: ${contentType}`);
        }
      }

      const audioBlob = await response.blob();
      if (audioBlob.size === 0) {
        throw new Error("Received empty audio data");
      }

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
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
          }, 5000); // Show confetti for 5 seconds
        };

        audioRef.current.onerror = (e) => {
          console.error("Error playing audio:", e);
          setError("Error playing audio. Please try again.");
          setIsLoading(false);
          setIsPlaying(false);
          setCurrentWordIndex(-1);
        };
      }
    } catch (err) {
      console.error("Error generating speech:", err);
      setError(
        `Failed to generate speech: ${
          err instanceof Error ? err.message : "Please try again."
        }`
      );
      setIsLoading(false);
    }
  };

  // Use browser's built-in TTS as fallback
  const handleBrowserTTS = (text: string) => {
    // Clear loading state immediately
    setIsLoading(false);

    if (!window.speechSynthesis) {
      setError(
        "Browser speech synthesis not supported. Please try again later."
      );
      return;
    }

    // Create a new SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Set properties based on intensity
    utterance.rate = intensity === "no_mercy" ? 1.1 : 1.0;
    utterance.pitch = intensity === "no_mercy" ? 1.2 : 1.0;

    // Try to find a good voice
    let voices = window.speechSynthesis.getVoices();

    // If voices array is empty, wait for voices to load
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        setupVoiceAndSpeak();
      };
    } else {
      setupVoiceAndSpeak();
    }

    function setupVoiceAndSpeak() {
      // Prefer these voices if available
      const preferredVoices = [
        "Google US English",
        "Microsoft David",
        "Alex",
        "Samantha",
        "Microsoft Mark",
        "Microsoft Zira",
      ];

      let selectedVoice = null;

      // First try to find a preferred voice
      for (const preferredVoice of preferredVoices) {
        const voice = voices.find((v) => v.name.includes(preferredVoice));
        if (voice) {
          selectedVoice = voice;
          break;
        }
      }

      // If no preferred voice found, try to find any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang.startsWith("en"));
      }

      // If still no voice, use the first available
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`Using voice: ${selectedVoice.name}`);
      }

      // Calculate word timings based on estimated speech rate
      const totalWords = words.length;
      const estimatedDuration =
        text.length * (intensity === "no_mercy" ? 50 : 60); // ~60ms per character
      const avgWordDuration = estimatedDuration / totalWords;

      // Create array of word timings with variations
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

      wordTimingsRef.current = timings;

      // Set up event handlers
      utterance.onstart = () => {
        console.log("Browser TTS started");
        setIsLoading(false);
        setIsPlaying(true);
        startWordHighlighting();
      };

      utterance.onend = () => {
        console.log("Browser TTS ended");
        setIsPlaying(false);
        setCurrentWordIndex(-1);
        if (wordIntervalRef.current) {
          clearInterval(wordIntervalRef.current);
        }
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000); // Show confetti for 5 seconds
      };

      utterance.onerror = (event) => {
        console.error("Browser TTS error:", event);
        setError("Error playing speech. Please try again.");
        setIsLoading(false);
        setIsPlaying(false);
        setCurrentWordIndex(-1);
      };

      // Store the utterance in a ref so we can cancel it later
      const utteranceRef = { current: utterance };

      // Create a fake audio element to mimic the interface
      const fakeAudio = {
        play: () => {
          window.speechSynthesis.speak(utteranceRef.current);
        },
        pause: () => {
          window.speechSynthesis.pause();
        },
        resume: () => {
          window.speechSynthesis.resume();
        },
        currentTime: 0,
        duration: estimatedDuration / 1000, // Convert to seconds
      };

      // Store the fake audio element in the ref
      audioRef.current = fakeAudio as unknown as HTMLAudioElement;

      // Start speaking
      window.speechSynthesis.speak(utterance);

      // Add a notification that we're using fallback
      setError(
        "Using browser's built-in text-to-speech as a fallback because ElevenLabs quota is exhausted."
      );
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

    // Check word timing every 20ms for more accuracy (reduced from 30ms)
    wordIntervalRef.current = setInterval(checkWordTiming, 20);

    // Also add a timeupdate event listener for better synchronization
    audioRef.current.addEventListener("timeupdate", checkWordTiming);

    // Add a seeking event listener to handle when user skips around in audio
    audioRef.current.addEventListener("seeking", checkWordTiming);

    // Clean up the event listeners when audio ends
    audioRef.current.addEventListener("ended", () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", checkWordTiming);
        audioRef.current.removeEventListener("seeking", checkWordTiming);
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

    // Reset sound effect state
    setLastPlayedSoundIndex(-1);

    // Reset audio
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
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
    if (!cleanRoastText) return;

    navigator.clipboard
      .writeText(cleanRoastText)
      .then(() => {
        setCopied(true);
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
      });
  };

  const shareRoast = () => {
    if (!cleanRoastText) return;

    if (navigator.share) {
      navigator
        .share({
          title: "My GitHub Roast",
          text: cleanRoastText,
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err);
        });
    } else {
      copyToClipboard();
    }
  };

  // Add a function to play random sounds at intervals
  useEffect(() => {
    if (isPlaying && soundsLoaded) {
      console.log("Setting up random sound effects");
      let lastSoundId = "";
      let soundCount = 0;
      const maxSounds = 12; // Increased maximum number of sounds to play
      const minInterval = 5000; // Minimum 5 seconds between sounds
      const maxInterval = 10000; // Maximum 10 seconds between sounds

      // Function to play a random sound that's different from the last one
      const playRandomSound = () => {
        if (soundCount >= maxSounds || !isPlaying) return;

        // Get all sound IDs except the last played one
        const availableSounds = MEME_SOUNDS.filter(
          (sound) => sound.id !== lastSoundId
        ).map((sound) => sound.id);
        const randomSoundId =
          availableSounds[Math.floor(Math.random() * availableSounds.length)];

        console.log(
          `Playing random sound: ${randomSoundId} (${
            soundCount + 1
          }/${maxSounds})`
        );
        const sound = soundEffectsRef.current[randomSoundId];

        if (sound) {
          // Play sound effect at lower volume without reducing main audio
          sound.currentTime = 0;
          sound.volume = 0.2; // Reduced volume for sound effects

          // Show visual effect
          setActiveEffect(randomSoundId);

          // Hide visual effect after 1.5 seconds
          setTimeout(() => {
            setActiveEffect(null);
          }, 1500);

          sound
            .play()
            .then(() => {
              console.log(`Successfully played random sound: ${randomSoundId}`);
              lastSoundId = randomSoundId;
              soundCount++;

              // Schedule next sound if we haven't reached the maximum
              if (soundCount < maxSounds && isPlaying) {
                const nextInterval =
                  Math.floor(Math.random() * (maxInterval - minInterval)) +
                  minInterval;
                console.log(
                  `Scheduling next sound in ${nextInterval / 1000} seconds`
                );
                setTimeout(playRandomSound, nextInterval);
              }
            })
            .catch((err) => {
              console.error(
                `Failed to play random sound: ${randomSoundId}`,
                err
              );
              // Try again with a different sound after a short delay
              setTimeout(playRandomSound, 1000);
            });
        }
      };

      // Start the first random sound after a short delay
      const initialDelay = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds initial delay
      console.log(`Starting random sounds in ${initialDelay / 1000} seconds`);
      const initialTimer = setTimeout(playRandomSound, initialDelay);

      return () => {
        clearTimeout(initialTimer);
      };
    }
  }, [isPlaying, soundsLoaded]);

  // Update progress when audio is playing
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      const updateProgress = () => {
        if (audioRef.current) {
          const duration = audioRef.current.duration || 1;
          const currentTime = audioRef.current.currentTime || 0;
          setProgress((currentTime / duration) * 100);
        }
      };

      const interval = setInterval(updateProgress, 100);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isPlaying]);

  // Render text with word-by-word highlighting (remove sound effect indicators)
  const renderRoastText = () => {
    if (!cleanRoastText || words.length === 0) return null;

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

        currentParagraph.push(
          <span
            key={`word-${index}`}
            className={`transition-all duration-150 ${
              isHighlighted
                ? intensity === "no_mercy"
                  ? "bg-gradient-to-r from-purple-500 to-red-500 text-white px-1 py-0.5 rounded"
                  : "bg-gradient-to-r from-orange-500 to-red-500 text-white px-1 py-0.5 rounded"
                : ""
            }`}
          >
            {word}{" "}
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

  // Add a debug section to the UI
  const renderDebugControls = () => {
    if (process.env.NODE_ENV !== "production") {
      return (
        <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            Debug Controls
          </h3>
          <div className="flex flex-wrap gap-2">
            {MEME_SOUNDS.map((sound) => (
              <button
                key={sound.id}
                onClick={() => testSoundEffect(sound.id)}
                className="px-2 py-1 bg-gray-800 text-xs rounded hover:bg-gray-700"
              >
                Play {sound.description}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Add a function to play a random sound effect on demand
  const playRandomSoundEffect = () => {
    if (!soundsLoaded) return;

    const soundIds = MEME_SOUNDS.map((sound) => sound.id);
    const randomSoundId = soundIds[Math.floor(Math.random() * soundIds.length)];

    console.log(`Playing manual random sound: ${randomSoundId}`);
    const sound = soundEffectsRef.current[randomSoundId];

    if (sound) {
      // Play sound effect with lower volume
      sound.currentTime = 0;
      sound.volume = 0.2; // Reduced volume for sound effects

      // Show visual effect
      setActiveEffect(randomSoundId);

      // Hide visual effect after 1.5 seconds
      setTimeout(() => {
        setActiveEffect(null);
      }, 1500);

      sound
        .play()
        .then(() => {
          console.log(`Successfully played manual sound: ${randomSoundId}`);
        })
        .catch((err) => {
          console.error(`Failed to play manual sound: ${randomSoundId}`, err);
        });
    }
  };

  // Render visual effect overlay
  const renderVisualEffect = () => {
    if (!activeEffect) return null;

    switch (activeEffect) {
      case "airhorn":
        return (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-yellow-500 opacity-20 animate-pulse"></div>
            <div className="text-9xl animate-bounce">📢</div>
          </div>
        );
      case "oof":
        return (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse"></div>
            <div className="text-9xl animate-bounce">💥</div>
          </div>
        );
      case "bruh":
        return (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-500 opacity-20 animate-pulse"></div>
            <div className="text-9xl animate-bounce">🤨</div>
          </div>
        );
      case "emotional-damage":
        return (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-purple-500 opacity-20 animate-pulse"></div>
            <div className="text-9xl animate-bounce">💔</div>
          </div>
        );
      case "thug-life":
        return (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-gray-800 opacity-30 animate-pulse"></div>
            <div className="text-9xl animate-bounce">😎</div>
          </div>
        );
      case "wow":
        return (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-green-500 opacity-20 animate-pulse"></div>
            <div className="text-9xl animate-bounce">😲</div>
          </div>
        );
      case "fatality":
        return (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-red-800 opacity-30 animate-pulse"></div>
            <div className="text-9xl animate-bounce">💀</div>
          </div>
        );
      default:
        return null;
    }
  };

  // Render confetti effect
  const renderConfetti = () => {
    if (!showConfetti) return null;

    return (
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => {
          const size = Math.random() * 10 + 5;
          const left = Math.random() * 100;
          const animationDuration = Math.random() * 3 + 2;
          const delay = Math.random() * 5;
          const color = [
            "bg-red-500",
            "bg-blue-500",
            "bg-green-500",
            "bg-yellow-500",
            "bg-purple-500",
            "bg-pink-500",
          ][Math.floor(Math.random() * 6)];

          return (
            <div
              key={i}
              className={`absolute ${color} rounded-full`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: "-20px",
                animation: `confetti ${animationDuration}s ease-in ${delay}s forwards`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          );
        })}

        <style jsx>{`
          @keyframes confetti {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  };

  // Render progress bar
  const renderProgressBar = () => {
    return (
      <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden mt-4">
        <div
          className={`h-full ${
            intensity === "no_mercy"
              ? "bg-gradient-to-r from-purple-500 to-red-500"
              : "bg-gradient-to-r from-orange-500 to-red-500"
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
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

              {cleanRoastText ? (
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

                        <button
                          onClick={playRandomSoundEffect}
                          className="flex items-center space-x-2 px-4 py-2 bg-yellow-700 rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          <span>🔊 Add Sound</span>
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

                  {renderDebugControls()}
                  {soundsLoaded && (
                    <button
                      onClick={playRandomSoundEffect}
                      className="mt-4 flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-red-600 rounded-lg hover:from-yellow-700 hover:to-red-700 transition-colors"
                    >
                      <span>🔊 Add Random Sound Effect</span>
                    </button>
                  )}

                  {renderProgressBar()}
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

      {renderVisualEffect()}
      {renderConfetti()}
    </main>
  );
}
