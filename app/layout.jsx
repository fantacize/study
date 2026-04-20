import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "Study Studio",
  description:
    "Study app with flashcards, MCQs, free response, matching, and cram tools.",
};

export default function RootLayout({ children }) {
  // Inline script to prevent dark mode flash — only reads a boolean from localStorage
  // No user input involved, static hardcoded string, no XSS risk
  const darkModeScript = `try{if(localStorage.getItem("study-dark-mode")==="true")document.documentElement.classList.add("dark")}catch(e){}`;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geist.variable,
          geistMono.variable
        )}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
