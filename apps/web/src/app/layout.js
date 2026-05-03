import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingThemeToggle } from "@/components/FloatingThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Team Hub",
  description: "All-in-one platform for team collaboration",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <FloatingThemeToggle />
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
