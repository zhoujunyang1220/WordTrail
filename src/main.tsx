import React, { StrictMode, useState, useEffect } from "react";
import { createRoot } from 'react-dom/client';
import App from "./App.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import "./index.css";

function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-indigo-950/10 dark:to-slate-950">
      <div className="text-center" style={{ animation: "fadeIn 0.4s ease-out" }}>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="mx-auto mb-5">
          <rect width="72" height="72" rx="18" fill="#4F46E5" />
          <path d="M18 48V20L36 28L54 20V48L36 56L18 48Z" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M36 28V56" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4"/>
          <circle cx="26" cy="38" r="2.5" fill="#A5B4FC"/>
          <circle cx="46" cy="38" r="2.5" fill="#A5B4FC"/>
        </svg>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">¥ º£</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 animate-pulse">WordTrail °§ º”‘ÿ÷–...</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 animate-pulse" />
        </div>
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto animate-pulse" />
        <div className="space-y-3">
          <div className="h-12 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
          <div className="h-12 w-2/3 bg-slate-100 dark:bg-slate-800/60 rounded-xl mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function RootApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authPage, setAuthPage] = useState("login");
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 1000);
    const loadTimer = setTimeout(() => {
      const user = localStorage.getItem("wordtrail_user");
      if (user) setIsLoggedIn(true);
      setInitialLoading(false);
    }, 400);
    return () => { clearTimeout(splashTimer); clearTimeout(loadTimer); };
  }, []);

  if (showSplash) return <SplashScreen />;
  if (initialLoading) return <LoadingSkeleton />;

  if (!isLoggedIn) {
    if (authPage === "register") {
      return <RegisterPage
        lang={(localStorage.getItem("lang") as "zh" | "en") === "en" ? "en" : "zh"}
        onRegister={() => setIsLoggedIn(true)}
        onSwitchToLogin={() => setAuthPage("login")}
      />;
    }
    return <LoginPage
      lang={(localStorage.getItem("lang") as "zh" | "en") === "en" ? "en" : "zh"}
      onLogin={() => setIsLoggedIn(true)}
      onSwitchToRegister={() => setAuthPage("register")}
    />;
  }

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<RootApp />);
