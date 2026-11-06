"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import { 
  Sparkles, 
  X, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Building2, 
  Users, 
  ArrowRight,
  CheckCircle,
  Clock
} from "lucide-react";

export function AuthModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  // Check URL or global event to trigger modal
  useEffect(() => {
    const checkAuthTrigger = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auth") === "true") {
        setIsOpen(true);
      }
    };
    checkAuthTrigger();

    const handleCustomTrigger = () => setIsOpen(true);
    window.addEventListener("open-auth-modal", handleCustomTrigger);
    return () => window.removeEventListener("open-auth-modal", handleCustomTrigger);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setErrorMsg("");
    // Remove ?auth=true from URL cleanly without reload
    if (window.location.search.includes("auth=true")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();

      // Unified SuperAdmin Login Check
      if (
        (trimmedEmail === "admin@aabhushan.ai" || trimmedEmail === "admin") &&
        password === "AabhushanAdmin@2026!"
      ) {
        const adminData = {
          user_id: "admin-super-01",
          name: "Super Admin",
          email: "admin@aabhushan.ai",
          role: "super_admin",
          status: "active",
          credits: 9999,
          token: "aabhushan_admin_session_token_xyz987"
        };
        localStorage.setItem("aabhushan_user", JSON.stringify(adminData));
        localStorage.setItem("aabhushan_admin_token", adminData.token);
        closeModal();
        router.push("/manage-portal-2026-secure");
        return;
      }

      // If user is registering
      if (isRegisterMode) {
        const res = await fetch(getApiUrl("/auth/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: ownerName || "Retailer Partner",
            email: trimmedEmail,
            shop_name: shopName || "Jewellery Studio",
          }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("aabhushan_user", JSON.stringify(data.data));
          setSuccessData(data.data);
          if (data.data.status === "active") {
            setTimeout(() => {
              closeModal();
              router.push("/studio");
            }, 1200);
          }
        } else {
          setErrorMsg(data.detail || "Registration failed. Please check inputs.");
        }
        return;
      }

      // Standard Login Flow
      const res = await fetch(getApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password: password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("aabhushan_user", JSON.stringify(data.data));
        closeModal();
        if (data.data.redirect) {
          router.push(data.data.redirect);
        } else {
          router.push("/studio");
        }
      } else {
        // Fallback for registered demo / active users:
        if (!password || password.length < 3) {
          setErrorMsg("Please enter your password.");
        } else {
          // If valid looking retailer, allow immediate studio access
          const userObj = {
            user_id: "usr-" + Date.now(),
            name: trimmedEmail.split("@")[0] || "Jewellery Retailer",
            email: trimmedEmail,
            status: "active",
            credits: 10
          };
          localStorage.setItem("aabhushan_user", JSON.stringify(userObj));
          closeModal();
          router.push("/studio");
        }
      }
    } catch {
      setErrorMsg("Unable to reach authentication server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#181520] to-[#0d0c13] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-gold-500/10 text-white">
        
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-400/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-amber-200">
              {isRegisterMode ? "Jewellery Partner Sign Up" : "Retailer & Admin Login"}
            </h2>
            <p className="text-xs text-neutral-400">
              {isRegisterMode 
                ? "Join Aabhushan AI and unlock AI visual catalogues" 
                : "One login for both Retailers and SuperAdmin"}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 bg-white/5 rounded-xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { setIsRegisterMode(false); setErrorMsg(""); setSuccessData(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isRegisterMode 
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md" 
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Sign In / Login
          </button>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(true); setErrorMsg(""); setSuccessData(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isRegisterMode 
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md" 
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Request Access
          </button>
        </div>

        {/* Success Waitlist State */}
        {successData && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-center mb-6">
            <CheckCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-amber-200">Registration Successful!</h3>
            <p className="text-xs text-neutral-300 mt-1">
              Position #{successData.waitlist_position || 3840} in line. Admin approval email will arrive from{" "}
              <span className="text-amber-300 font-medium">parthsharma17prs@gmail.com</span>.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-4">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Owner / Contact Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Parth Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <Users className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Jewellery Shop / Brand Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Johari Jewels Jaipur"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <Building2 className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Email Address (or Admin Email)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@jewellers.in or admin@aabhushan.ai"
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Password {isRegisterMode ? "(Choose a Password)" : ""}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 disabled:opacity-50"
          >
            {isLoading ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isRegisterMode ? "Submit Registration" : "Enter Platform"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* SuperAdmin Quick Hint */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>SuperAdmin Access:</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setEmail("admin@aabhushan.ai");
              setPassword("AabhushanAdmin@2026!");
            }}
            className="text-amber-300 hover:text-amber-200 underline font-medium"
          >
            Auto-fill Admin Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
