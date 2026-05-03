"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function FloatingThemeToggle() {
  const pathname = usePathname();
  
  // Don't show the floating toggle in the dashboard, as it has its own in the header
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <div className="fixed right-6 top-6 z-[999]">
      <ThemeToggle className="!h-11 !w-11 !rounded-full shadow-xl bg-white/90 backdrop-blur dark:bg-slate-900/90" />
    </div>
  );
}
