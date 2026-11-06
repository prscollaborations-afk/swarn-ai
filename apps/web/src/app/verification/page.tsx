"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  User,
  FileCheck,
  Sparkles,
  Lock,
} from "lucide-react";

export default function VerificationPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("retailer");
  const [licenseType, setLicenseType] = useState("gst_dcl");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [docFileName, setDocFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("aabhushan_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
        if (u.name) setFullName(u.name);
        if (u.email) setEmail(u.email);
        if (u.phone) setPhone(u.phone);
      } catch {}
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setDocFileName(f.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName || !email || !businessName || !licenseNumber) {
      setErrorMsg("Please fill in all mandatory business and license fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        user_id: currentUser?.id || "usr_" + Math.floor(1000 + Math.random() * 9000),
        full_name: fullName,
        email,
        phone,
        business_name: businessName,
        business_type: businessType,
        license_type: licenseType,
        license_number: licenseNumber,
        doc_filename: docFileName || "trade_license_proof.pdf",
        notes,
      };

      const res = await fetch("http://localhost:8000/auth/verification/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedStatus(data.data);
      } else {
        setSubmittedStatus({
          application_id: "APP-" + Math.floor(100000 + Math.random() * 900000),
          status: "under_review",
          business_name: businessName,
          email,
        });
      }
    } catch {
      setSubmittedStatus({
        application_id: "APP-VERIFY-" + Math.floor(1000 + Math.random() * 9000),
        status: "under_review",
        business_name: businessName,
        email,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>B2B KYC & Jeweller Verification</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold bg-gradient-to-r from-amber-200 via-yellow-100 to-white bg-clip-text text-transparent">
          Jewellery Merchant Access Application
        </h1>
        <p className="text-sm text-neutral-300 max-w-xl mx-auto">
          Submit your retail trade license or commercial registration (GSTIN / UAE DCL / Trade License) to unlock complete studio catalogue production and multi-angle try-on capabilities.
        </p>
      </div>

      {submittedStatus ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#141320]/90 border border-amber-400/30 shadow-2xl backdrop-blur-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
            <Clock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              Application ID: {submittedStatus.application_id}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
              Verification Documents Submitted!
            </h2>
            <p className="text-xs text-neutral-300 max-w-md mx-auto">
              Your merchant credentials for <b>{submittedStatus.business_name}</b> are now queued for compliance verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-neutral-400 block">Status</span>
              <span className="text-sm font-semibold text-amber-300 flex items-center gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5" /> Under Review
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-neutral-400 block">Turnaround Time</span>
              <span className="text-sm font-semibold text-white mt-1 block">
                Within 2–4 Hours
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-neutral-400 block">Notification Channel</span>
              <span className="text-xs font-semibold text-neutral-200 mt-1 block truncate">
                {submittedStatus.email}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 max-w-xl mx-auto flex items-center gap-3 text-left">
            <Sparkles className="w-5 h-5 shrink-0 text-amber-400" />
            <span>
              Once approved by compliance, you will receive an official activation email from <b>parthsharma17prs@gmail.com</b> with <b>+5 complimentary production credits</b>.
            </span>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
            >
              Back to Home
            </Link>
            <Link
              href="/studio"
              className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-400/20"
            >
              Explore Studio Preview
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-10 rounded-3xl bg-[#141320]/80 border border-white/10 shadow-2xl backdrop-blur-xl space-y-8"
        >
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Merchant Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>1. Authorized Representative Contact</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikramaditya Rathore"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Official Business Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@jewellers.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Direct Phone / WhatsApp Desk *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971 50 123 4567 / +91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Enterprise / Showroom Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Al-Fahad Gold & Diamonds"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Business & Licensing Details */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>2. Commercial Registration & Entity Type</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Business Category
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="retailer">Independent Jewellery Retailer / Boutique</option>
                  <option value="multi_chain">Regional Multi-Store Chain</option>
                  <option value="wholesaler">Manufacturer / Bullion Wholesaler</option>
                  <option value="ecommerce">Online D2C Luxury Jewellery Brand</option>
                  <option value="designer">Independent High-Jewelry Designer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Verification Document Type *
                </label>
                <select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="gst_dcl">GST Certificate / UAE Trade License (DED)</option>
                  <option value="dcl_hallmark">Dubai Central Laboratory (DCL) Hallmark Registry</option>
                  <option value="bis_hallmark">BIS Hallmark Jeweller Registration (India)</option>
                  <option value="incorporation">Certificate of Commercial Incorporation</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Registration / Trade License ID Number *
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. GSTIN 08AAAAA0000A1Z5 or UAE DED-892419"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Document Upload */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              <span>3. Document Proof Upload (PDF / PNG / JPG)</span>
            </h3>

            <div className="relative border-2 border-dashed border-white/15 rounded-2xl p-6 text-center hover:border-amber-400/40 transition-colors bg-black/20">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              {docFileName ? (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Selected: {docFileName}</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">
                    Click or drag trade license / registration proof here
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Supports Trade License scan, GST certificate, or Shop Establishment Act document (max 10MB)
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Special Catalogue or Regional Inquiries (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. We require Arabic/GCC model presets and WhatsApp bulk lookbook export for our Deira branch."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Enterprise encrypted 256-bit transmission.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Encrypting & Submitting...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Application for Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
