import { Moon, Sun } from "lucide-react";

import useTheme from "@/hooks/useTheme";
import { Button } from "./ui/button.tsx";

export function ModeToggle() {
  const { isDarkMode, setTheme } = useTheme();

  const toggleDarkMode = () => setTheme(isDarkMode() ? "light" : "dark");

  return (
    <div className="flex items-center space-x-2">
      <Button
        className="bg-background hover:bg-accent focus:bg-accent text-primary"
        onClick={toggleDarkMode}
      >
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      </Button>
    </div>
  );
}
