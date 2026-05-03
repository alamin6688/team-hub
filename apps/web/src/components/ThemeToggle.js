"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className = "" }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 ${className}`} />
    );
  }

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  const getIcon = () => {
    if (theme === "system") return <Monitor size={18} />;
    if (theme === "dark") return <Sun size={18} />;
    return <Moon size={18} />;
  };

  const getLabel = () => {
    if (theme === "system") return "System Mode";
    if (theme === "dark") return "Light Mode";
    return "Dark Mode";
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all duration-300 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400 ${className}`}
      aria-label={getLabel()}
      title={getLabel()}
    >
      <div className="transition-transform duration-500 group-hover:rotate-12">
        {getIcon()}
      </div>
      
      {theme === "system" && (
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
          {resolvedTheme === "dark" ? "D" : "L"}
        </span>
      )}
    </button>
  );
}
