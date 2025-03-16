"use client";

import { useEffect } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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

          <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-red-800">
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-xl font-medium text-gray-300">
                Something went wrong
              </h2>
              <p className="text-gray-400 mt-2 text-center mb-6">
                We encountered an error while generating your roast.
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Try again
                </button>
                <Link
                  href="/"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Go home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
