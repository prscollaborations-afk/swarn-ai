"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Camera,
  Layers,
  ShieldCheck,
  Check,
  UploadCloud,
  Eye,
  Sliders,
  Maximize2,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function DesignSystemPage() {
  const [selectedTone, setSelectedTone] = useState("tone_4");
  const [selectedShape, setSelectedShape] = useState("oval");
  const [selectedAngle, setSelectedAngle] = useState("front");
  const [toastVisible, setToastVisible] = useState(false);

  const skinTones = [
    { id: "tone_1", name: "1. Very Fair", color: "#f7e3d2", desc: "Porcelain warm fair" },
    { id: "tone_2", name: "2. Fair", color: "#eed0b6", desc: "Classic golden fair" },
    { id: "tone_3", name: "3. Light Wheatish", color: "#deba9d", desc: "Versatile golden" },
    { id: "tone_4", name: "4. Wheatish", color: "#cda585", desc: "Radiant Indian wheatish" },
    { id: "tone_5", name: "5. Medium Brown", color: "#b38461", desc: "Warm honeyed brown" },
    { id: "tone_6", name: "6. Deep Brown", color: "#8a5c3d", desc: "Deep bronze richness" },
  ];

  const faceShapes = [
    { id: "oval", name_en: "Oval", name_hi: "अंडाकार", desc: "Classic balanced proportions" },
    { id: "round", name_en: "Round", name_hi: "गोल", desc: "Soft gentle facial curves" },
    { id: "square", name_en: "Square", name_hi: "चौकोर", desc: "Defined jawline structure" },
    { id: "heart", name_en: "Heart", name_hi: "दिल के आकार", desc: "Delicate tapered chin" },
    { id: "long", name_en: "Long", name_hi: "लंबा", desc: "Slender elongated grace" },
  ];

  const angles = [
    { id: "front", name: "Front View", desc: "Symmetrical chest-up shot" },
    { id: "left", name: "Left 45°", desc: "Profile highlighting left side" },
    { id: "right", name: "Right 45°", desc: "Profile highlighting right side" },
    { id: "closeup", name: "Macro Close-Up", desc: "Tight focus on gemstones" },
    { id: "three_quarter", name: "3/4 View", desc: "Graceful head tilt portrait" },
  ];

  return (
    <div className="py-8 space-y-16">
      {/* Header */}
      <div className="border-b border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold mb-4">
          <Layers className="w-3.5 h-3.5" />
          <span>Aabhushan AI Design System & Living Component Library</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-amber-100">
          Glassmorphic Tokens & Components
        </h1>
        <p className="text-neutral-300 text-sm sm:text-base mt-2 max-w-2xl font-light">
          Built with Cormorant Garamond headings, Manrope body, CSS backdrop blur tokens,
          and WCAG 4.5:1 accessible contrast against dynamic ruby-gold-indigo mesh gradients.
        </p>
      </div>

      {/* 1. Glass Panels & Containers */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-bold text-amber-200">
          1. Glass Panels & Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 space-y-3">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Standard Glass Panel</span>
            <h3 className="font-heading text-xl font-semibold text-white">Authentic Craftsmanship</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Standard glass panel with 22px blur, 160% saturation boost, and an inner top highlight reflection.
            </p>
          </div>

          <div className="glass-panel p-6 border-amber-400/30 bg-amber-500/10 space-y-3">
            <span className="text-xs uppercase tracking-wider text-amber-300 font-bold">Accent Gold Glass</span>
            <h3 className="font-heading text-xl font-semibold text-amber-100">Pure 22K Gold Finish</h3>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Tinted glass panel emphasizing high-priority luxury selections and premium tiers.
            </p>
          </div>

          <div className="glass-panel p-6 border-ruby-500/30 bg-ruby-900/20 space-y-3">
            <span className="text-xs uppercase tracking-wider text-ruby-400 font-bold">Fidelity Warning Glass</span>
            <h3 className="font-heading text-xl font-semibold text-rose-100">Stone & Motif Lock</h3>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Used for critical fidelity score callouts and AI analysis recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Indian 6-Step Skin Tone Scale Picker */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="font-heading text-2xl font-bold text-amber-200">
            2. 6-Step Indian Skin Tone Scale
          </h2>
          <span className="text-xs text-neutral-400">Respectful, inclusive tone grading</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {skinTones.map((tone) => {
            const active = selectedTone === tone.id;
            return (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`glass-panel p-4 flex flex-col items-center text-center transition-all duration-200 ${
                  active
                    ? "border-amber-400 ring-2 ring-amber-400/30 scale-102 bg-white/15"
                    : "hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full mb-3 shadow-md border-2 border-white/20 flex items-center justify-center"
                  style={{ backgroundColor: tone.color }}
                >
                  {active && <Check className="w-5 h-5 text-slate-900 drop-shadow" />}
                </div>
                <span className="text-xs font-semibold text-white">{tone.name}</span>
                <span className="text-[10px] text-neutral-400 mt-1">{tone.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Face Shapes & Proportions */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-bold text-amber-200">
          3. Indian Model Face Shapes
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {faceShapes.map((shape) => {
            const active = selectedShape === shape.id;
            return (
              <button
                key={shape.id}
                onClick={() => setSelectedShape(shape.id)}
                className={`glass-panel p-4 flex flex-col items-start text-left transition-all duration-200 ${
                  active
                    ? "border-amber-400 ring-2 ring-amber-400/30 bg-amber-400/10"
                    : "hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-sm font-bold text-amber-100">{shape.name_en}</span>
                  <span className="text-xs text-amber-400 font-sans">{shape.name_hi}</span>
                </div>
                <p className="text-xs text-neutral-300 font-light">{shape.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Multi-Angle Catalogue Selectors */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-bold text-amber-200">
          4. 5 Essential Camera Angles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {angles.map((angle) => {
            const active = selectedAngle === angle.id;
            return (
              <button
                key={angle.id}
                onClick={() => setSelectedAngle(angle.id)}
                className={`glass-panel p-4 flex flex-col justify-between h-32 text-left transition-all ${
                  active
                    ? "border-amber-400 bg-amber-500/15 shadow-glass-hover"
                    : "hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Camera className={`w-4 h-4 ${active ? "text-amber-300" : "text-neutral-400"}`} />
                  {active && <span className="text-[10px] font-bold text-amber-400">SELECTED</span>}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{angle.name}</h4>
                  <p className="text-[10px] text-neutral-300 mt-0.5">{angle.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Buttons, Inputs & Interactive States */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-bold text-amber-200">
          5. Buttons, Badges, & Action States
        </h2>
        <div className="glass-panel p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all">
              Primary Gold CTA
            </button>
            <button className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs uppercase tracking-wider transition-all">
              Secondary Glass Button
            </button>
            <button className="px-6 py-2.5 rounded-full bg-ruby-600 hover:bg-ruby-500 text-white font-bold text-xs uppercase tracking-wider transition-all">
              Fidelity Action
            </button>
            <button
              onClick={() => {
                setToastVisible(true);
                setTimeout(() => setToastVisible(false), 3000);
              }}
              className="px-4 py-2 rounded-full border border-amber-400/40 text-amber-300 text-xs font-semibold hover:bg-amber-400/10 transition-colors"
            >
              Trigger Feedback Toast
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              Fidelity Score: 96 / 100 (Pass)
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 border border-amber-500/30 text-amber-300">
              Model: gemini-3.1-flash-image
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-ruby-500/15 border border-ruby-500/30 text-ruby-300">
              Gold Purity: 22K Hallmarked
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-neutral-300">
              Latency: 1.84s
            </span>
          </div>
        </div>
      </section>

      {/* Toast Notification Simulation */}
      {toastVisible && (
        <div className="fixed bottom-16 right-6 z-50 glass-panel border-amber-400/50 bg-slate-900/90 p-4 shadow-2xl flex items-center gap-3 max-w-sm animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <div className="text-xs">
            <p className="font-bold text-white">Preset Applied</p>
            <p className="text-neutral-300">Tone {selectedTone.replace("tone_", "")} & {selectedShape} shape configured.</p>
          </div>
        </div>
      )}
    </div>
  );
}

