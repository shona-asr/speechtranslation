import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const UserProfile = () => {
  const { user, logout } = useAuth();

  // Get first character of email or display name for avatar
  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="mt-auto p-4 border-t border-muted">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center cursor-pointer">
            <Avatar className="w-8 h-8 bg-primary">
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.displayName || user?.email?.split('@')[0] || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || "Free Plan"}</p>
            </div>
            <Settings className="h-4 w-4 ml-auto opacity-60" />
          </div>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <Link href="/profile-settings">
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfile;
