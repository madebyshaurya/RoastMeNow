import { SparklesIcon } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="relative flex flex-col md:flex-row items-center justify-between py-4 px-6 bg-gray-900 shadow-lg border-b-4 border-orange-500">
      <div className="flex items-center space-x-3">
        <SparklesIcon className="w-8 h-8 text-orange-400 animate-pulse" />
        <Link href="/">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-500 to-orange-400 text-transparent bg-clip-text transition-transform transform hover:scale-110 drop-shadow-lg">
            🔥 RoastMeNow 🤖
          </h1>
        </Link>
      </div>

      <nav className="mt-4 md:mt-0">
        <ul className="flex space-x-6 text-lg font-medium">
          <li>
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-orange-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              🏠 Home
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/yourusername/roastme-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-orange-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              🛠 GitHub
            </a>
          </li>
        </ul>
      </nav>

      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-30 pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#FF4500"
            d="M40.3,-69.4C51.2,-62,58.3,-50.8,66.3,-39.6C74.3,-28.4,83.1,-17.2,84.3,-5.1C85.4,7.1,78.9,19.9,71.2,31.7C63.5,43.5,54.6,54.4,43.5,63.7C32.3,73,19,80.7,5.3,76.5C-8.5,72.3,-17,56.2,-27.5,47C-38,37.7,-50.4,35.2,-57.4,27.7C-64.4,20.2,-66,7.7,-70.4,-7.3C-74.8,-22.2,-82,-39.6,-75.2,-46.8C-68.4,-54.1,-47.6,-51,-32.1,-56.4C-16.6,-61.7,-8.3,-75.5,1.5,-78.4C11.2,-81.2,22.4,-73.1,40.3,-69.4Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
    </header>
  );
}
