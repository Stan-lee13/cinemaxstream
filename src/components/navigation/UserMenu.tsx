
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PremiumPromoModal } from "@/components/PremiumPromoModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Settings, User as UserIcon, History, Crown } from "lucide-react";
import ThemeSwitcher from "../ThemeSwitcher";

export const UserMenu = () => {
  const { user, signOut, isAuthenticated, isPremium: authPremium } = useAuth();
  const { profileData } = useUserProfile();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [initials, setInitials] = useState("U");
  const [displayName, setDisplayName] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (user) {
      // Set display name based on profile data or email
      const name = profileData?.username || user.email?.split('@')[0] || 'User';
      setDisplayName(name);
      
      // Create initials from user's email or username
      const source = profileData?.username || user.email || 'User';
      const parts = source.includes('@') ? source.split('@')[0].split(/[^a-zA-Z]/) : source.split(/[^a-zA-Z]/);
      const filtered = parts.filter(part => part.length > 0);
      
      if (filtered.length >= 2) {
        setInitials((filtered[0][0] + filtered[1][0]).toUpperCase());
      } else if (filtered.length === 1) {
        setInitials(filtered[0].substring(0, 2).toUpperCase());
      } else {
        setInitials("U");
      }

      // Check premium status from database
      const premiumStatus = authPremium || profileData?.subscription_tier !== 'free';
      setIsPremium(premiumStatus);
    }
  }, [user, profileData, authPremium]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
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

  return (
    <div className="flex items-center gap-3">
      <ThemeSwitcher />
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative flex items-center gap-2 h-8 rounded-full pr-1 bg-secondary/50 hover:bg-secondary/70"
            data-tour-id="profile-button"
          >
            <Avatar className="h-7 w-7 border border-primary/10">
              <AvatarImage src={profileData?.avatar_url || user?.user_metadata?.avatar_url} alt="User avatar" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline-block font-medium text-sm max-w-[100px] truncate mr-1">
              {displayName}
            </span>
            {isPremium && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1 flex items-center justify-center w-4 h-4">
                <Crown className="h-2 w-2 text-black" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
              {isPremium && (
                <div className="flex items-center gap-1 mt-1">
                  <Crown className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-yellow-500 font-medium">Premium Member</span>
                </div>
              )}
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
            {!isPremium && (
              <DropdownMenuItem>
                <PremiumPromoModal>
                  <div className="flex items-center w-full cursor-pointer">
                    <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>Activate Premium</span>
                  </div>
                </PremiumPromoModal>
              </DropdownMenuItem>
            )}
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
