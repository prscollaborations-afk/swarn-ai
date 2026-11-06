import type { Metadata } from "next";
import "./globals.css";
import GlassNavbar from "@/components/GlassNavbar";
import { AuthModal } from "@/components/AuthModal";

export const metadata: Metadata = {
  title: "Aabhushan AI | AI Studio for Indian Jewellery Shops",
  description: "Next-gen AI visual catalogue and model try-on platform tailored for Indian jewellery retailers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen relative selection:bg-amber-400 selection:text-black">
        {/* Dynamic mesh gradient background with ruby, gold, indigo glow */}
        <div className="mesh-gradient-bg" aria-hidden="true" />
        
        {/* Glass sticky pill navbar */}
        <GlassNavbar />

        {/* Global Single-Entrance Auth Modal */}
        <AuthModal />

        {/* Main application body with top padding for navbar */}
        <main className="pt-24 pb-20 lg:pb-12 min-h-screen px-4 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}

