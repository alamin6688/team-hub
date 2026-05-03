"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: Cookies.get("remembered_email") || "",
    password: "",
    rememberMe: !!Cookies.get("remembered_email"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8020/api/v1'}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Success
      const token = data.data?.accessToken;
      if (token) {
        // Set expiry: 30 days if rememberMe is checked, else 1 day
        const expiry = formData.rememberMe ? 30 : 1;
        Cookies.set("token", token, { expires: expiry, path: "/" });
        
        // Also remember the email if requested
        if (formData.rememberMe) {
          Cookies.set("remembered_email", formData.email, { expires: 30, path: "/" });
        } else {
          Cookies.remove("remembered_email", { path: "/" });
        }
      }
      localStorage.setItem("show_login_toast", "true");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message || "Invalid credentials");
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-slate-500 mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#e94560]/20 focus:border-[#e94560] outline-none transition-all"
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <a href="#" className="text-xs font-semibold text-[#e94560] hover:underline">Forgot?</a>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#e94560]/20 focus:border-[#e94560] outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            className="w-4 h-4 rounded border-slate-300 text-[#e94560] focus:ring-[#e94560]"
            checked={formData.rememberMe}
            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
          />
          <label htmlFor="rememberMe" className="text-sm text-slate-600 select-none cursor-pointer">
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#e94560] text-white rounded-xl font-bold shadow-lg shadow-[#e94560]/20 hover:bg-[#d83a54] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Sign in"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link href="/register" className="text-[#e94560] font-bold hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
