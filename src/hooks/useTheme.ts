import { useState, useEffect } from "react";

type Theme = "theme-light" | "dark" | "system";

const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("theme-light");

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setTheme(isDarkMode ? "dark" : "theme-light");
  }, []);

  useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList[isDark ? "add" : "remove"]("dark");
  }, [theme]);

  return { theme, setTheme };
};

export default useTheme;