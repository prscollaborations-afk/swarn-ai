"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Layers,
  FolderKanban,
  Crown,
  CreditCard,
  BarChart3,
  Languages,
  UserCircle,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  name_en: string;
  name_hi: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name_en: "Home", name_hi: "होम", href: "/", icon: Sparkles },
  { name_en: "Features", name_hi: "सुविधाएं", href: "/features", icon: Layers },
  { name_en: "Verify / KYC", name_hi: "सत्यापन", href: "/verification", icon: ShieldCheck },
  { name_en: "Studio", name_hi: "स्टूडियो", href: "/studio", icon: Crown },
];

export default function GlassNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [credits, setCredits] = useState<number>(3);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  return (
    <>
      {/* Desktop & Tablet Sticky Pill Glass Navbar */}
      <header
        className={`fixed top-4 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300 pointer-events-none ${
          scrolled ? "top-2" : "top-4"
        }`}
      >
        <nav
          className={`pointer-events-auto flex items-center justify-between gap-4 md:gap-8 rounded-full px-5 py-2.5 transition-all duration-300 glass-nav ${
            scrolled ? "py-2 scale-98 shadow-2xl" : "py-3"
          }`}
          aria-label="Main Navigation"
        >
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-ruby-500 via-gold-400 to-amber-300 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg md:text-xl tracking-wide bg-gradient-to-r from-amber-200 via-yellow-100 to-white bg-clip-text text-transparent">
                आभूषण <span className="text-amber-300 font-sans text-sm tracking-normal">AI</span>
              </span>
            </div>
          </Link>

          {/* Nav Items (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 bg-black/20 p-1 rounded-full border border-white/5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-amber-400/20 to-ruby-500/20 text-amber-300 border border-amber-400/30 shadow-inner"
                      : "text-neutral-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-amber-400" : "text-neutral-400"}`} />
                  <span>{lang === "en" ? item.name_en : item.name_hi}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Credits Pill */}
            <Link
              href="/billing"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/10 to-amber-500/20 border border-amber-400/30 text-amber-300 hover:border-amber-400/60 transition-colors text-xs font-semibold"
              title="Available Credits"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{credits}</span>
              <span className="text-[10px] text-amber-400/80 uppercase font-sans">
                {lang === "en" ? "Credits" : "क्रेडिट्स"}
              </span>
            </Link>

            {/* Language Switch */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-200 transition-colors"
              title="Switch Language"
            >
              <Languages className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === "en" ? "हिन्दी" : "EN"}</span>
            </button>

            {/* Login / Auth Button */}
            <Link
              href="/?auth=true"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-md shadow-amber-500/20 transition-all"
              title="Retailer Login / Register"
            >
              <UserCircle className="w-4 h-4" />
              <span>{lang === "en" ? "Login / Sign In" : "लॉगिन"}</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile Bottom Glass Tab Bar */}
      <div className="lg:hidden fixed bottom-3 left-4 right-4 z-50">
        <nav className="glass-nav rounded-2xl py-2 px-3 flex items-center justify-around shadow-2xl">
          {navItems.slice(0, 5).map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                  active ? "text-amber-300 scale-105" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium tracking-tight">
                  {lang === "en" ? item.name_en : item.name_hi}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

