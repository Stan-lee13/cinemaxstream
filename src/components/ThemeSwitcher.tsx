
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme("default")}
          className="flex items-center justify-between"
        >
          Default Dark
          {theme === "default" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("midnight")}
          className="flex items-center justify-between"
        >
          Midnight Gradient
          {theme === "midnight" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("neon")}
          className="flex items-center justify-between"
        >
          Neon Cyberpunk
          {theme === "neon" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
