import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

const useTheme = () => {
  const getInitialTheme = useCallback((): Theme => {
    if (typeof window !== "undefined" && window.localStorage) {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme) {
        return savedTheme;
      }
      const prefersDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      return prefersDarkMode ? "dark" : "light";
    }
    return "light";
  }, []);

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("theme", theme);
      const isDark = theme === "dark";
      document.documentElement.classList[isDark ? "add" : "remove"]("dark");
    }
  }, [theme]);

  const isDarkMode = useCallback((): boolean => {
    return theme === "dark";
  }, [theme]);

  return { theme, setTheme, isDarkMode };
};

export default useTheme;
