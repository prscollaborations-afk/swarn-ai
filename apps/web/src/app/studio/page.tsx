"use client";

import { getApiUrl } from "@/lib/api";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  UploadCloud,
  Sparkles,
  Camera,
  Check,
  CheckCircle2,
  ShieldCheck,
  Download,
  User,
  Image as ImageIcon,
  Layers,
  Wrench,
  AlertTriangle,
  Lock,
} from "lucide-react";

const JEWELLERY_TYPES = [
  { id: "necklace", name: "Necklace / Haar", desc: "Chokers, bridal haar, pendants" },
  { id: "ring", name: "Ring (अंगूठी)", desc: "Solitaire, cocktail, band rings" },
  { id: "earrings", name: "Earrings / Jhumka", desc: "Jhumkas, studs, drops, chandbalis" },
  { id: "bangles", name: "Bangles / Kada", desc: "Gold kadas, polki bangles, bracelets" },
];

const SKIN_TONES = [
  { id: "tone_1", name: "Very Fair", color: "#f7e3d2" },
  { id: "tone_2", name: "Fair", color: "#eed0b6" },
  { id: "tone_3", name: "Light Wheatish", color: "#deba9d" },
  { id: "tone_4", name: "Wheatish", color: "#cda585" },
  { id: "tone_5", name: "Medium Brown", color: "#b38461" },
  { id: "tone_6", name: "Deep Brown", color: "#8a5c3d" },
];

const FACE_SHAPES = [
  { id: "oval", name: "Oval (अंडाकार)" },
  { id: "round", name: "Round (गोल)" },
  { id: "square", name: "Square (चौकोर)" },
  { id: "heart", name: "Heart (दिल)" },
  { id: "long", name: "Long (लंबा)" },
];

const ANGLES = [
  { id: "front", name: "Front Shot", desc: "Symmetrical catalogue chest-up" },
  { id: "left", name: "Left 45°", desc: "Left angle profile" },
  { id: "right", name: "Right 45°", desc: "Right angle profile" },
  { id: "closeup", name: "Macro Close-Up", desc: "Tight gemstone focus" },
  { id: "three_quarter", name: "Three-Quarter", desc: "Regal slight tilt" },
];

export default function StudioPage() {
  const jewelInputRef = useRef<HTMLInputElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);

  // Jewellery State
  const [jewelFile, setJewelFile] = useState<File | null>(null);
  const [jewelPreview, setJewelPreview] = useState<string | null>(null);
  const [jewelAssetId, setJewelAssetId] = useState<string | null>(null);
  const [isJewelUploading, setIsJewelUploading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedJewelType, setSelectedJewelType] = useState("necklace");

  // Model Mode: AI Model vs User Own Photo
  const [modelMode, setModelMode] = useState<"ai_model" | "user_photo">("ai_model");
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [personAssetId, setPersonAssetId] = useState<string | null>(null);
  const [isPersonUploading, setIsPersonUploading] = useState(false);

  // AI Model Controls
  const [gender, setGender] = useState<"female" | "male">("female");
  const [skinTone, setSkinTone] = useState("tone_4");
  const [faceShape, setFaceShape] = useState("oval");
  const [ageGroup, setAgeGroup] = useState("late_20s");
  const [selectedAngles, setSelectedAngles] = useState<string[]>([
    "front",
    "left",
    "right",
    "closeup",
  ]);
  const [resolution, setResolution] = useState<"HD" | "4K">("HD");

  // Job Execution State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState<any | null>(null);

  // Handle Jewellery Photo Upload
  const handleJewelleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJewelFile(file);
    setJewelPreview(URL.createObjectURL(file));
    setIsJewelUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(getApiUrl("/assets/upload"), {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setJewelAssetId(data.data.id);
        setAnalysis(data.data.analysis);
        if (data.data.analysis?.jewellery_type) {
          const detected = data.data.analysis.jewellery_type.toLowerCase();
          if (["necklace", "ring", "earrings", "bangles"].includes(detected)) {
            setSelectedJewelType(detected);
          } else if (detected.includes("chain") || detected.includes("haar") || detected.includes("choker")) {
            setSelectedJewelType("necklace");
          }
        }
      }
    } catch (err) {
      console.error("Jewellery upload error:", err);
    } finally {
      setIsJewelUploading(false);
    }
  };

  // Maintenance pop-up for user-photo upload
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("aabhushan_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.status === "active" || u.credits > 0) {
          setIsUserLoggedIn(true);
        }
      } catch {}
    }
  }, []);

  const handlePersonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowMaintenanceModal(true);
    if (e.target) e.target.value = "";
  };

  const toggleAngle = (id: string) => {
    if (selectedAngles.includes(id)) {
      if (selectedAngles.length > 1) {
        setSelectedAngles(selectedAngles.filter((a) => a !== id));
      }
    } else {
      setSelectedAngles([...selectedAngles, id]);
    }
  };

  const [showLoginModal, setShowLoginModal] = useState(false);

  // Trigger Try-On Generation
  const handleGenerate = async () => {
    // If not logged in yet, prompt global single-entrance Auth modal
    if (!isUserLoggedIn) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-auth-modal"));
      }
      return;
    }

    if (!jewelAssetId) return;
    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const res = await fetch(getApiUrl("/jobs"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: jewelAssetId,
          model_source: modelMode,
          user_person_asset_id: personAssetId,
          jewellery_type: selectedJewelType,
          target_angles: selectedAngles,
          gender,
          skin_tone: skinTone,
          face_shape: faceShape,
          age_group: ageGroup,
          resolution,
        }),
      });
      const resData = await res.json();
      const currentJobId = resData.data.job_id;

      // Poll until generation completes
      const poll = setInterval(async () => {
        try {
          const pollRes = await fetch(getApiUrl(`/jobs/${currentJobId}`));
          const pollData = await pollRes.json();
          if (pollData.data.status === "completed") {
            clearInterval(poll);
            setIsGenerating(false);
            setGeneratedImages(pollData.data.images);
            setActiveImage(pollData.data.images[0]);
          } else if (pollData.data.status === "failed") {
            clearInterval(poll);
            setIsGenerating(false);
          }
        } catch {
          clearInterval(poll);
          setIsGenerating(false);
        }
      }, 1000);
    } catch (err) {
      console.error("Generation error:", err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="py-6 space-y-10">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Virtual Try-On Studio</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-amber-100">
            Aabhushan Try-On Platform
          </h1>
          <p className="text-xs text-neutral-300 mt-1">
            Upload your jewellery photo. Try it on an authentic AI model OR upload your own photo to wear it instantly.
          </p>
        </div>

        {/* Resolution selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">Resolution:</span>
          <div className="inline-flex rounded-full p-1 bg-black/40 border border-white/10">
            <button
              onClick={() => setResolution("HD")}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                resolution === "HD" ? "bg-amber-400 text-black shadow" : "text-neutral-400"
              }`}
            >
              HD (1 Credit)
            </button>
            <button
              onClick={() => setResolution("4K")}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                resolution === "4K" ? "bg-amber-400 text-black shadow" : "text-neutral-400"
              }`}
            >
              4K Ultra (2 Credits)
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Steps */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Jewellery Category Selector (4+ types) */}
          <div className="glass-panel p-6 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Step 1: Choose Jewellery Category
            </span>
            <div className="grid grid-cols-2 gap-2">
              {JEWELLERY_TYPES.map((type) => {
                const active = selectedJewelType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedJewelType(type.id)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      active
                        ? "bg-amber-400/20 border-amber-400 text-amber-100 ring-1 ring-amber-400/50"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{type.name}</span>
                      {active && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                      {type.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Upload Jewellery Photo */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Step 2: Upload Jewellery Photo
              </span>
              {analysis && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Quality: {analysis.quality_score}/100
                </span>
              )}
            </div>

            <div
              onClick={() => jewelInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-amber-400/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white/5 group"
            >
              <input
                ref={jewelInputRef}
                type="file"
                accept="image/*"
                onChange={handleJewelleryUpload}
                className="hidden"
              />
              {jewelPreview ? (
                <div className="relative w-full aspect-square max-h-48 overflow-hidden rounded-xl">
                  <img
                    src={jewelPreview}
                    alt="Uploaded Jewellery"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-medium text-white">
                    Click to change jewellery photo
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <UploadCloud className="w-10 h-10 text-amber-300 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold text-white">
                    Upload photo of {selectedJewelType.toUpperCase()}
                  </p>
                  <p className="text-xs text-neutral-400 font-light">
                    Clicks of pure jewellery on any surface or background
                  </p>
                </div>
              )}
            </div>

            {/* AI Vision Analysis Details */}
            {analysis && (
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-amber-200">
                  <span className="font-bold">Detected: {analysis.jewellery_type.toUpperCase()}</span>
                  <span>{analysis.metal_colour}</span>
                </div>
                <p className="text-neutral-300 text-[11px]">
                  <strong>Stones:</strong> {analysis.stones}
                </p>
                <div className="text-[10px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  <span className="font-bold">DESIGN LOCK (Preserved):</span> {analysis.design_lock}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Choose Try-On Target (AI Model vs User's Own Photo) */}
          <div className="glass-panel p-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Step 3: Wear On (Who wears the jewellery?)
            </span>

            {/* Toggle Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setModelMode("ai_model")}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  modelMode === "ai_model"
                    ? "bg-amber-400 text-slate-950 shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Indian Model</span>
              </button>

              <button
                type="button"
                onClick={() => setModelMode("user_photo")}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  modelMode === "user_photo"
                    ? "bg-amber-400 text-slate-950 shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Upload My Photo / Selfie</span>
              </button>
            </div>

            {/* Tab 1: AI Model Customization */}
            {modelMode === "ai_model" ? (
              <div className="space-y-4 pt-2">
                {/* Gender Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-200">Model Gender</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        gender === "female"
                          ? "bg-amber-400 text-black border-amber-400"
                          : "border-white/15 text-neutral-300"
                      }`}
                    >
                      Female Model
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("male")}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        gender === "male"
                          ? "bg-amber-400 text-black border-amber-400"
                          : "border-white/15 text-neutral-300"
                      }`}
                    >
                      Male Model
                    </button>
                  </div>
                </div>

                {/* 6-Step Skin Tone Scale */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-200">
                    Indian Skin Tone (Scale 1 to 6)
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => setSkinTone(tone.id)}
                        className={`h-9 rounded-xl border flex items-center justify-center transition-all ${
                          skinTone === tone.id
                            ? "border-amber-400 ring-2 ring-amber-400/30 scale-105"
                            : "border-white/15 hover:border-white/40"
                        }`}
                        style={{ backgroundColor: tone.color }}
                        title={tone.name}
                      >
                        {skinTone === tone.id && (
                          <Check className="w-3.5 h-3.5 text-slate-900 drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Face Shape */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-200">Face Shape</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {FACE_SHAPES.map((shape) => (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => setFaceShape(shape.id)}
                        className={`p-1.5 rounded-lg text-[10px] font-medium border text-center transition-all ${
                          faceShape === shape.id
                            ? "bg-amber-400/20 border-amber-400 text-amber-200"
                            : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                        }`}
                      >
                        {shape.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Tab 2: User Upload Their Own Photo / Selfie */
              <div className="space-y-3 pt-2">
                <div
                  onClick={() => setShowMaintenanceModal(true)}
                  className="border-2 border-dashed border-amber-500/30 hover:border-amber-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-amber-500/5 hover:bg-amber-500/10 group relative"
                >
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                    Maintenance
                  </div>
                  <Wrench className="w-8 h-8 text-amber-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-white">
                    Upload your photo, portrait or customer selfie
                  </p>
                  <p className="text-[10px] text-amber-200/80 mt-1">
                    Click to view neural calibration maintenance schedule
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Angles to Generate & Action Button */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Step 4: Angles to Generate
              </span>
              <span className="text-xs font-semibold text-amber-300">
                Cost: {selectedAngles.length * (resolution === "4K" ? 2 : 1)} Credits
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ANGLES.map((angle) => {
                const active = selectedAngles.includes(angle.id);
                return (
                  <button
                    key={angle.id}
                    type="button"
                    onClick={() => toggleAngle(angle.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      active
                        ? "bg-amber-500/15 border-amber-400 text-white"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{angle.name}</span>
                      {active && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <span className="text-[9px] text-neutral-400 block mt-0.5">
                      {angle.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleGenerate}
              disabled={
                !jewelAssetId ||
                isGenerating ||
                (modelMode === "user_photo" && !personAssetId)
              }
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-black" />
                  <span>Generating AI Try-On...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-black" />
                  <span>
                    Generate {selectedJewelType.toUpperCase()} Try-On Now
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Try-On Stage & Lightbox */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 min-h-[680px] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-heading text-lg font-bold text-white">
                  Virtual Try-On Result (Fidelity Verified)
                </h3>
              </div>
              {activeImage && (
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  Score: {activeImage.fidelity_score}/100 (Pass)
                </span>
              )}
            </div>

            {/* Main Stage Image */}
            <div className="my-6 flex-1 flex items-center justify-center">
              {activeImage ? (
                <div className="relative group max-w-md w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                  <img
                    src={getApiUrl(activeImage.url.replace('/api/backend', ''))}
                    alt="Try-On Result"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-amber-300 border border-white/10">
                    {selectedJewelType.toUpperCase()} | Shot: {activeImage.angle.toUpperCase()}
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <a
                      href={getApiUrl(activeImage.url.replace('/api/backend', ''))}
                      download={`aabhushan_${selectedJewelType}_${activeImage.angle}.png`}
                      className="px-4 py-2 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg hover:brightness-110"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {activeImage.resolution}</span>
                    </a>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="text-center space-y-4 py-16">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin mx-auto" />
                  <p className="font-heading text-xl text-amber-200">
                    Applying {selectedJewelType.toUpperCase()} onto {modelMode === "user_photo" ? "your photo" : "the Indian model"}...
                  </p>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Precise placement, perspective alignment, and stone-for-stone fidelity preservation.
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-3 py-20 text-neutral-400">
                  <Camera className="w-12 h-12 mx-auto text-neutral-500" />
                  <p className="text-sm font-medium">Select a jewellery category, upload photo & generate.</p>
                  <p className="text-xs font-light max-w-xs mx-auto">
                    Supports Necklaces, Rings, Earrings/Jhumkas, and Bangles/Kadas.
                  </p>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {generatedImages.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                  Generated Angles ({generatedImages.length})
                </span>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {generatedImages.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-28 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImage?.id === img.id
                          ? "border-amber-400 scale-105 shadow-lg shadow-amber-500/20"
                          : "border-white/10 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getApiUrl(img.url.replace('/api/backend', ''))}
                        alt={img.angle}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-center text-amber-300 font-semibold py-0.5 truncate">
                        {img.angle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Under Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-8 rounded-3xl bg-[#161521] border border-amber-500/30 shadow-2xl text-center relative">
            <button
              onClick={() => setShowMaintenanceModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 mx-auto">
              <Wrench className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold font-heading text-white mb-2">
              Feature Under Maintenance
            </h3>

            <p className="text-xs text-neutral-300 leading-relaxed mb-6">
              Our <b>Customer Photo Neural Inpainting Pipeline</b> is undergoing scheduled calibration upgrades to guarantee 100% realistic multi-image lighting and collar drape.
            </p>

            <div className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 text-left text-xs mb-6 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Recommended: Use AI Indian Models</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                You can generate instant catalogue lookbooks using our <b>AI Indian Model</b> engine with 6 Fitzpatrick skin tones and Banarasi sarees right now!
              </p>
            </div>

            <button
              onClick={() => {
                setShowMaintenanceModal(false);
                setModelMode("ai_model");
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all"
            >
              Switch to AI Indian Model Mode &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md p-8 rounded-3xl bg-[#161521] border border-amber-500/30 shadow-2xl text-center relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold font-heading text-white mb-2">
              Authentication Required
            </h3>

            <p className="text-xs text-neutral-300 leading-relaxed mb-6">
              AI Try-On studio is strictly reserved for verified Indian jewellery retail partners. You must register or sign in to access your free try-on credits.
            </p>

            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all"
              >
                Sign In / Request Access (5 Free Credits) &rarr;
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="block w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs border border-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
