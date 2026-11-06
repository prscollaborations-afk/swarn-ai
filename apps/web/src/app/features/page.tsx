"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ShieldCheck, 
  Camera, 
  Cpu, 
  Palette, 
  Layers, 
  Eye, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Globe2,
  Lock,
  Flame,
  Award,
  Sliders,
  Maximize2
} from "lucide-react";

const ALL_30_FEATURES = [
  {
    num: "01",
    title: "100% Design Lock & Hallmarking Fidelity",
    desc: "Strict multi-point pixel validation guarantees exact stone counts, filigree patterns, and gold purity highlights without AI hallucinations.",
    category: "Core Fidelity"
  },
  {
    num: "02",
    title: "6-Tone Indian Fitzpatrick Skin Calibration",
    desc: "From Very Fair porcelain undertones to Radiant Wheatish and Deep Brown complexion palettes curated specifically for Indian jewellery.",
    category: "Cultural Authenticity"
  },
  {
    num: "03",
    title: "Anatomical Landmark Auto-Fitting",
    desc: "Vision-based detection automatically maps neck hollows, earlobes, wrists, and fingers with sub-millimeter precision.",
    category: "Fitting Engine"
  },
  {
    num: "04",
    title: "Dual-Layer Contact & Diffuse Shadows",
    desc: "Casts deep ambient occlusion directly under jewellery links and soft diffuse drop shadows across silks and skin for lifelike depth.",
    category: "Photorealism"
  },
  {
    num: "05",
    title: "Multi-Angle Auto-Generation (Front, Left, Right, Closeup)",
    desc: "One raw photo transforms into a complete 4-shot commercial catalogue suite in front, 45° profile, and macro detail views.",
    category: "Studio Automation"
  },
  {
    num: "06",
    title: "Ethnic Indian Model Catalog (Male & Female)",
    desc: "Features authentic Indian male and female models with natural skin textures, regional attire, and graceful high-fashion expressions.",
    category: "Cultural Authenticity"
  },
  {
    num: "07",
    title: "Traditional Attire Styling (Banarasi, Kanjeevaram, Nehru)",
    desc: "Pair jewellery with ruby-red Banarasi silk sarees, emerald lehengas, temple border drapes, or royal Nehru jackets.",
    category: "Styling"
  },
  {
    num: "08",
    title: "High-Resolution 4K & Ultra-HD Export",
    desc: "Lossless crisp image exports ready for print hoardings, luxury digital lookbooks, Instagram feeds, and ecommerce catalogs.",
    category: "Export & Delivery"
  },
  {
    num: "09",
    title: "Specular Gold & Diamond Caustic Reflections",
    desc: "Ray-marched metallic sheen highlights yellow gold, rose gold, uncut polki, and faceted solitaire sparkle under studio light.",
    category: "Photorealism"
  },
  {
    num: "10",
    title: "AI Fidelity Judge Scorecard (Stones, Metal, Shape)",
    desc: "Automated pre-delivery audit providing confidence percentages across stone settings, metal tone, and link symmetry.",
    category: "Quality Assurance"
  },
  {
    num: "11",
    title: "Instant Background Auto-Isolation",
    desc: "Eliminates velvet display necks, jewelers' ring clips, white boxes, and price tags with anti-aliased edge alpha feathering.",
    category: "Smart Pre-processing"
  },
  {
    num: "12",
    title: "Regional Cultural Presets (North, South, East, West)",
    desc: "Preset aesthetic conventions for Rajasthani Kundan, Tamil Temple jewellery, Bengali Filigree, and Maharashtrian Kolhapuri Saaj.",
    category: "Cultural Authenticity"
  },
  {
    num: "13",
    title: "Occasion Lighting Environments",
    desc: "Choose between Grand Indian Wedding warm chandeliers, Royal Sangeet night glow, or Clean White Commercial Studio flash.",
    category: "Studio Lighting"
  },
  {
    num: "14",
    title: "Sub-2-Second Ultra Fast Pipeline",
    desc: "Optimized tensor inference engines deliver initial previews in under 1.6 seconds for rapid in-store customer presentations.",
    category: "Performance"
  },
  {
    num: "15",
    title: "Token-Bucket API Rate Limiter",
    desc: "Guarantees server stability and uninterrupted multi-seat shop usage with intelligent sliding-window rate protection.",
    category: "Security & Scale"
  },
  {
    num: "16",
    title: "Cloud Database Persistence (MongoDB Atlas)",
    desc: "Reliable enterprise cloud storage keeps shop assets, client waitlists, and custom model choices permanently synchronized.",
    category: "Cloud Infrastructure"
  },
  {
    num: "17",
    title: "Automated SMTP Access Approval Alerts",
    desc: "Instant transactional email notifications dispatched to approved retail partners with allocated try-on credits.",
    category: "Notifications"
  },
  {
    num: "18",
    title: "SuperAdmin Terminal & Credit Allocation",
    desc: "Comprehensive dashboard for reviewing retailer verification requests, controlling waitlist queues, and gifting credits.",
    category: "Admin Suite"
  },
  {
    num: "19",
    title: "Lifetime Dynamic Waitlist Engine",
    desc: "Displays real-time increasing reservation queues (3,234+ verified shops) with viral referral tracking.",
    category: "Growth & Virality"
  },
  {
    num: "20",
    title: "One-Click Google OAuth & Passwordless Sign-in",
    desc: "Instant friction-free onboarding for store owners using Google Workspace accounts or verified mobile OTP.",
    category: "Authentication"
  },
  {
    num: "21",
    title: "Boutique Brand Watermarking & Hallmarking Badges",
    desc: "Automatic placement of high-resolution shop logos and BIS 916 hallmarking trust banners on final generated photos.",
    category: "Branding"
  },
  {
    num: "22",
    title: "Selfie Upload Calibration (Under-Maintenance Guard)",
    desc: "Interactive user photo try-on with automated maintenance warnings and smooth transitions to dedicated AI models.",
    category: "Safety & UX"
  },
  {
    num: "23",
    title: "Dynamic Neckline & Collar Lapel Occlusion",
    desc: "Jewellery naturally slides beneath saree pallus and Nehru collars with realistic depth layering and anti-floating masks.",
    category: "Fitting Engine"
  },
  {
    num: "24",
    title: "Earring & Jhumka Symmetrical Auto-Mirroring",
    desc: "Accurately detects earlobe orientation and creates realistic left-and-right hanging physics with gravity hang lines.",
    category: "Fitting Engine"
  },
  {
    num: "25",
    title: "Solitaire & Cocktail Ring Finger Alignment",
    desc: "Places rings naturally onto the ring or middle finger with knuckles, skin creases, and manicured hand gestures.",
    category: "Fitting Engine"
  },
  {
    num: "26",
    title: "Kada & Bangle Wrist Articulation",
    desc: "Snaps bangles and royal kadas naturally onto the wrist line with realistic wrist angle rotation and cuff styling.",
    category: "Fitting Engine"
  },
  {
    num: "27",
    title: "WhatsApp Shareable Lookbooks",
    desc: "Export generated lookbook sheets formatted specifically for quick WhatsApp messaging to VIP clients during bridal season.",
    category: "Sales Tools"
  },
  {
    num: "28",
    title: "Bilingual Hindi & English UI",
    desc: "Complete native Hindi (हिन्दी) interface designed for showroom sales staff across Mumbai, Jaipur, Delhi, and Rajkot.",
    category: "Accessibility"
  },
  {
    num: "29",
    title: "Zero Data-Loss Asset Vault",
    desc: "Encrypted asset storage ensures raw high-value jewellery photos are never publicly exposed or used for unauthorized training.",
    category: "Security & Privacy"
  },
  {
    num: "30",
    title: "Enterprise Multi-Store Role Delegation",
    desc: "Allows flagship owners to manage multiple showroom branches, floor staff logins, and pooled credit wallets seamlessly.",
    category: "Enterprise Scale"
  }
];

export default function FeaturesPage() {
  return (
    <div className="py-12 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-semibold text-amber-300 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Complete Platform Capabilities</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
          30 Groundbreaking Features Engineered for Indian Jewellery
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
          From pixel-perfect gold link locking to authentic Indian Fitzpatrick skin tones, explore the enterprise capabilities built exclusively for retail jewellers.
        </p>
      </div>

      {/* Grid of 30 Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {ALL_30_FEATURES.map((feat) => (
          <div 
            key={feat.num}
            className="p-6 rounded-2xl bg-[#161521] border border-white/10 hover:border-amber-400/30 transition-all hover:-translate-y-1 group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-amber-400/60 group-hover:text-amber-400 transition-colors">
                FEATURE {feat.num}
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                {feat.category}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
              {feat.title}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {feat.desc}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 text-center relative overflow-hidden">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-4">
          Experience the Difference with Aabhushan AI
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto mb-8">
          Join 3,234+ verified Indian jewellery shop owners who are generating catalogue lookbooks in minutes without expensive studio photoshoots.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/studio"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm hover:brightness-110 shadow-lg shadow-amber-500/25 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Launch Studio Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
