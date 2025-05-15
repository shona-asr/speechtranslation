import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Mic, 
  Languages, 
  Volume2, 
  RotateCcw, 
  History, 
  LayoutDashboard,
  AlarmClock,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import UserProfile from "./UserProfile";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Menu } from "lucide-react";

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Determine which nav items to show based on user role
  const baseNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Transcribe",
      href: "/transcribe",
      icon: <Mic className="w-5 h-5" />,
    },
    {
      title: "Real-time Transcribe",
      href: "/realtime-transcribe",
      icon: <AlarmClock className="w-5 h-5" />,
    },
    {
      title: "Translate",
      href: "/translate",
      icon: <Languages className="w-5 h-5" />,
    },
    {
      title: "Text to Speech",
      href: "/text-to-speech",
      icon: <Volume2 className="w-5 h-5" />,
    },
    {
      title: "Speech to Speech",
      href: "/speech-to-speech",
      icon: <RotateCcw className="w-5 h-5" />,
    },
    {
      title: "History",
      href: "/history",
      icon: <History className="w-5 h-5" />,
    },
  ];

  // Admin-only nav items
  const adminNavItems = [
    {
      title: "Admin Dashboard",
      href: "/admin/dashboard",
      icon: <ShieldCheck className="w-5 h-5" />,
    }
  ];

  // Combine nav items based on user role
  const navItems = user?.role === 'admin' 
    ? [...baseNavItems, ...adminNavItems] 
    : baseNavItems;

  // Mobile menu toggle button
  const MobileMenuButton = () => (
    <Button 
      variant="ghost" 
      size="icon" 
      className="md:hidden fixed top-4 right-4 z-50 bg-primary text-primary-foreground" 
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    >
      {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );

  return (
    <>
      <MobileMenuButton />

      <aside 
        className={cn(
          "bg-card border-r border-muted fixed h-full z-40 transition-all duration-300",
          isMobile ? (isMobileMenuOpen ? "w-64 left-0" : "w-64 -left-64") : "w-64 left-0",
          "flex flex-col"
        )}
      >
        <div className="p-4 border-b border-muted">
          <div className="flex items-center mb-1">
            <Mic className="text-primary text-xl mr-2" />
            <h1 className="text-xl font-semibold">Speech AI</h1>
          </div>
          {user && (
            <p className="text-xs text-muted-foreground">
              Welcome back, {user.displayName || user.email?.split('@')[0] || 'User'}
            </p>
          )}
        </div>

        <div className="p-4 flex-grow overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-4 py-3 rounded-md transition",
                    location === item.href
                      ? "text-primary-foreground bg-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </a>
              </Link>
            ))}
          </nav>
        </div>

        {user && <UserProfile />}
      </aside>

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
