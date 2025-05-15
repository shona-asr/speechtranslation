import React from 'react';
import { Link } from 'wouter';
import { Github, Globe, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card border-t border-border mt-auto py-6 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-2">Speech AI</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Advanced speech recognition and translation with real-time processing, 
              supporting multiple languages and formats.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github size={20} />
              </a>
              <a href="https://example.com" target="_blank" rel="noopener noreferrer" aria-label="Website" className="text-muted-foreground hover:text-foreground transition-colors">
                <Globe size={20} />
              </a>
              <a href="mailto:info@example.com" aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          {/* Features */}
          <div className="col-span-1">
            <h4 className="font-semibold mb-3">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/transcribe" className="text-muted-foreground hover:text-foreground transition-colors">
                  Transcription
                </Link>
              </li>
              <li>
                <Link href="/translate" className="text-muted-foreground hover:text-foreground transition-colors">
                  Translation
                </Link>
              </li>
              <li>
                <Link href="/text-to-speech" className="text-muted-foreground hover:text-foreground transition-colors">
                  Text to Speech
                </Link>
              </li>
              <li>
                <Link href="/speech-to-speech" className="text-muted-foreground hover:text-foreground transition-colors">
                  Speech to Speech
                </Link>
              </li>
              <li>
                <Link href="/realtime-transcribe" className="text-muted-foreground hover:text-foreground transition-colors">
                  Real-time Processing
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="col-span-1">
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-muted-foreground hover:text-foreground transition-colors">
                  History
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} SpeechAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;