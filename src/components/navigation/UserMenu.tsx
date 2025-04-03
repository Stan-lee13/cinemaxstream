
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuthState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Settings, User as UserIcon, History } from "lucide-react";
import ThemeSwitcher from "../ThemeSwitcher"; // Import ThemeSwitcher

export const UserMenu = () => {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <ThemeSwitcher /> {/* Add ThemeSwitcher for non-authenticated users */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/auth')}
          className="hidden md:flex"
        >
          Sign In
        </Button>
        <Button 
          size="sm"
          onClick={() => navigate('/auth')}
          className="bg-cinemax-500 hover:bg-cinemax-600"
        >
          Sign Up
        </Button>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "U";

  return (
    <div className="flex items-center gap-3">
      <ThemeSwitcher /> {/* Add ThemeSwitcher for authenticated users */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative flex items-center gap-2 h-8 rounded-full pr-1 bg-secondary/50 hover:bg-secondary/70"
          >
            <Avatar className="h-7 w-7 border border-primary/10">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt="User avatar" />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline-block font-medium text-sm max-w-[100px] truncate mr-1">
              {user?.email?.split('@')[0]}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.email?.split('@')[0]}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/watch-history')}>
              <History className="mr-2 h-4 w-4" />
              <span>Watch History</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
