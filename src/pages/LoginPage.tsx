import React, { useState } from "react";
import { Sparkles, User, Lock, LogIn, Eye, EyeOff, BookOpen } from "lucide-react";

interface LoginPageProps {
  lang: "zh" | "en";
  onLogin: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginPage({ lang, onLogin, onSwitchToRegister }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username) { setError(lang === "zh" ? "请输入用户名" : "Enter Username"); return; }
    if (password.length < 6) { setError(lang === "zh" ? "密码至少6位" : "Password too short"); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json();
      if (r.ok) { localStorage.setItem("wordtrail_user", JSON.stringify(d.user)); onLogin(); }
      else { setError(d.error || (lang === "zh" ? "登录失败" : "Login failed")); }
    } catch { setError(lang === "zh" ? "网络错误" : "Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-indigo-950/10 dark:to-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4 mx-auto shadow-lg"><Sparkles className="w-8 h-8" /></div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{lang === "zh" ? "词迹" : "WordTrail"}</h1>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
          <h2 className="text-xl font-bold text-center mb-2">{lang === "zh" ? "欢迎回来" : "Welcome Back"}</h2>
          <p className="text-sm text-center text-slate-500 mb-6">{lang === "zh" ? "登录以继续词汇学习之旅" : "Sign in to continue"}</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{lang === "zh" ? "用户名" : "Username"}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={lang === "zh" ? "请输入用户名" : "Enter Username"} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{lang === "zh" ? "密码" : "Password"}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={lang === "zh" ? "请输入密码" : "Enter password"} className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            {error && <div className="bg-red-50 dark:bg-red-950/30 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-100">{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? (lang === "zh" ? "登录中..." : "Signing in...") : (lang === "zh" ? "登录" : "Sign In")}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-500">
            {lang === "zh" ? "还没有账号？" : "No account?"} <button onClick={onSwitchToRegister} className="text-indigo-600 font-semibold hover:underline">{lang === "zh" ? "立即注册" : "Register"}</button>
          </div>
          <div className="mt-4 flex items-center gap-3"><div className="flex-1 h-px bg-slate-200"></div><span className="text-xs text-slate-400">{(lang === "zh" ? "或者" : "Or")}</span><div className="flex-1 h-px bg-slate-200"></div></div>
          <button onClick={onLogin} className="mt-4 w-full py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"><BookOpen className="w-4 h-4" />{lang === "zh" ? "游客模式" : "Guest Mode"}</button>
        </div>
      </div>
    </div>
  );
}
