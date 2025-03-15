import Header from "@/components/Header";
import RoastForm from "../components/RoastForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <Header />
        <div className="max-w-2xl mx-auto mt-12 p-6 bg-gray-800 rounded-xl shadow-lg">
          <RoastForm />
        </div>
      </div>
    </main>
  );
}
