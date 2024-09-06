import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

import useTheme from "@/hooks/useTheme";

export const ThemeToggle = () => {
  const { theme, setTheme, isDarkMode } = useTheme();

  const toggleDarkMode = () => {
    if (isDarkMode()) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4  w-4" />
      <Switch
        id="dark-mode"
        checked={isDarkMode()}
        onCheckedChange={toggleDarkMode}
      />
      <Moon className="h-4 w-4" />
      <span className="sr-only">Toggle dark mode</span>
    </div>
  );
};
