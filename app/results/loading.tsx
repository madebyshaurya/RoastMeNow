import { Loader2 } from "lucide-react";
import Header from "@/components/Header";

export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <Header />

        <div className="max-w-2xl mx-auto mt-12">
          <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
              <h2 className="text-xl font-medium text-gray-300">
                Preparing your roast...
              </h2>
              <p className="text-gray-400 mt-2 text-center">
                We&apos;re analyzing your GitHub profile and crafting the
                perfect roast.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
