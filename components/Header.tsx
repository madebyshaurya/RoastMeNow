import Link from "next/link";

export default function Header() {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between">
      <Link href="/" className="text-center md:text-left">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-500 to-orange-400 text-transparent bg-clip-text">
          RoastMeNow
        </h1>
      </Link>

      <nav className="mt-4 md:mt-0">
        <ul className="flex space-x-6">
          <li>
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/yourusername/roastme-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
