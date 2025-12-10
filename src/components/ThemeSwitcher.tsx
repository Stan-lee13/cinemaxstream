import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

const ThemeSwitcher = () => {
  // Theme switching removed; app uses default theme.
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled
      className="opacity-50"
      title="Theme locked to default"
    >
      <Palette className="h-5 w-5" />
    </Button>
  );
};

export default ThemeSwitcher;
