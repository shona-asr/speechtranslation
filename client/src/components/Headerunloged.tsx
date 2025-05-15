import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react"; // Or use your preferred icon library
import { Button } from "@/components/ui/button"; // Adjust import to match your structure


export default function Header({ user }) {
 
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="container mx-auto py-4 px-4 flex items-center justify-between sticky top-0 bg-white z-10 shadow-md">
      <div className="flex items-center space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-primary"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
        <span className="text-xl font-bold">Speech AI</span>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
        <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
          Features
        </a>
        <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
          About
        </Link>
      </nav>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden focus:outline-none"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Auth Buttons (Always Visible) */}
      <div className="hidden md:flex items-center space-x-4">
        {user ? (
          <Link href="/dashboard">
            <Button variant="default">Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/login">
              <Button variant="default">Sign up</Button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md p-4 flex flex-col items-start space-y-4 md:hidden z-20">
          <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          {user ? (
            <Link href="/dashboard">
              <Button variant="default" className="w-full">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="w-full">Sign in</Button>
              </Link>
              <Link href="/login">
                <Button variant="default" className="w-full">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
