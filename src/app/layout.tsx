import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/sections/navigation";
import Footer from "@/components/sections/footer";
import Analytics from "@/components/analytics";
import AIAssistant from "@/components/ai-assistant";
import ConditionalAIAssistant from "@/components/conditional-ai-assistant";
import PageTransition from "@/components/page-transition";
import SmoothScroll from "@/components/smooth-scroll";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider } from "@/contexts/auth-context";

// Fallback fonts for production reliability
const fontVariables = "--font-sans --font-accent --font-mono";

export const metadata: Metadata = {
  title: "Lumora Pro - Building the Future of Freelance Tech",
  description: "AI-powered developer and tech innovator creating cutting-edge solutions. Specializing in AI integration, full-stack development, and futuristic web experiences.",
  keywords: ["AI developer", "full-stack developer", "web developer", "React", "Next.js", "AI integration", "freelancer", "tech innovation"],
  authors: [{ name: "Lumora Pro" }],
  icons: {
    icon: '/favicon.jpg',
    shortcut: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
  openGraph: {
    title: "Lumora Pro - Building the Future of Freelance Tech",
    description: "AI-powered developer creating cutting-edge solutions and futuristic web experiences.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased bg-space-gray text-silver-glow min-h-screen"
        style={{ backgroundColor: '#0f0f1a', color: '#ffffff' }}
      >
        <ThemeProvider>
          <AuthProvider>
            <Analytics />
            <SmoothScroll />
            <Navigation />
            <PageTransition>
              {children}
            </PageTransition>
            <Footer />
            <ConditionalAIAssistant />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
