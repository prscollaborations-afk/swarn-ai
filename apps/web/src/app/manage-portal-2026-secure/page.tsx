"use client";

import { getApiUrl } from "@/lib/api";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Users, 
  CheckCircle, 
  Mail, 
  Lock, 
  PlusCircle, 
  Search, 
  ExternalLink,
  Coins,
  LogOut
} from "lucide-react";

export default function AdminDashboardPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [grantingId, setGrantingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("aabhushan_admin_token");
    if (token) {
      setIsAdminLoggedIn(true);
      fetchWaitlist();
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(getApiUrl("/auth/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("aabhushan_admin_token", data.data.token);
        setIsAdminLoggedIn(true);
        fetchWaitlist();
      } else {
        setLoginError("Invalid credentials. Please verify your SuperAdmin password.");
      }
    } catch {
      setLoginError("Failed to reach authentication server.");
    }
  };

  const fetchWaitlist = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl("/auth/admin/waitlist"));
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantAccess = async (userId: string, credits: number = 5) => {
    setGrantingId(userId);
    try {
      const res = await fetch(getApiUrl("/auth/admin/grant-access"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, credits_to_add: credits }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Access granted to user! Notification email sent via prstechie7@gmail.com with ${credits} credits.`);
        fetchWaitlist();
      }
    } catch (e) {
      alert("Failed to grant access.");
    } finally {
      setGrantingId(null);
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#161521] border border-amber-500/20 shadow-2xl shadow-amber-500/10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-center text-white mb-2">
            SuperAdmin Terminal
          </h2>
          <p className="text-xs text-neutral-400 text-center mb-6">
            Review waitlist requests, grant platform access, and allocate try-on credits.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@aabhushan.ai"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Master Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-400 text-center">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all"
            >
              Authenticate & Unlock Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.shop_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-semibold text-amber-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SuperAdmin Terminal</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-white">
            Waitlist & Access Control
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Connected to Cloud Database (MongoDB Atlas) • SMTP Notifications: prstechie7@gmail.com
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-neutral-200 border border-white/10"
          >
            <span>View Studio</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("aabhushan_admin_token");
              setIsAdminLoggedIn(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-300 border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-[#161521] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Total Waitlist Requests</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {users.length} <span className="text-xs text-neutral-500 font-normal">(Mock live 3,234+)</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#161521] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Active Approved Retailers</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {users.filter(u => u.status === "active").length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#161521] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Total Credits Allocated</span>
            <Coins className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-2">
            {users.reduce((acc, u) => acc + (u.credits || 0), 0)} Credits
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-[#161521] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search partner by name, email or shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            onClick={fetchWaitlist}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 border border-white/10"
          >
            Refresh List
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-neutral-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Retailer / Partner</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Waitlist Pos</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Credits</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    No waitlist requests found matching filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div>{u.name}</div>
                      <div className="text-[11px] text-amber-400/80">{u.shop_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300">
                      <div>{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-400">
                      #{u.waitlist_position}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          <span>Active / Granted</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
                          <span>Pending Review</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-300">
                      {u.credits || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.status !== "active" ? (
                        <button
                          disabled={grantingId === u.id}
                          onClick={() => handleGrantAccess(u.id, 5)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                        >
                          {grantingId === u.id ? "Granting..." : "Grant Access (+5 Credits)"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGrantAccess(u.id, 5)}
                          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-400/30 text-[11px] font-semibold"
                        >
                          + Add 5 Credits
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
