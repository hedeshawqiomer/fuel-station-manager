import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { User, Lock, ArrowLeft, AlertCircle } from "lucide-react";

export default function Login() {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // --- CREDENTIALS FROM ENVIRONMENT VARIABLES ---
    // This keeps the password safe while keeping the code public
    const correctUser = import.meta.env.VITE_ADMIN_USER;
    const correctPass = import.meta.env.VITE_ADMIN_PASS;

    if (username === correctUser && password === correctPass) {
      dispatch(login());
    } else {
      setError("ناوی بەکارهێنەر یان وشەی تێپەڕ هەڵەیە");
    }
  };

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="card-base w-full max-w-sm shadow-2xl relative overflow-hidden border border-border/50">
        {/* Top Gradient Line */}
        <div className="h-1 w-full bg-gradient-to-l from-primary via-primary/50 to-transparent absolute top-0 right-0"></div>

        <div className="p-8 space-y-8">
          {/* Logo / Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mx-auto mb-4 border border-border text-primary shadow-lg shadow-primary/5">
              <User size={32} />
            </div>
            <h1 className="text-2xl font-black text-text-main tracking-tight">
              بەخێربێیتەوە
            </h1>
            <p className="text-text-muted text-xs font-medium">
              سیستەمی فرۆشتنی گاز و نەوت
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted mr-1 block">
                ناوی بەکارهێنەر
              </label>
              <div className="relative group">
                <User
                  className="absolute top-3.5 right-3 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none"
                  size={18}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full py-3 pr-10 pl-4 bg-surface border border-border rounded-lg text-text-main focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted"
                  placeholder="admin"
                  autoFocus
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted mr-1 block">
                وشەی تێپەڕ
              </label>
              <div className="relative group">
                <Lock
                  className="absolute top-3.5 right-3 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none"
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 pr-10 pl-4 bg-surface border border-border rounded-lg text-text-main focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted font-sans"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 mt-4 group flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
            >
              <span>چوونەژوورەوە</span>
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-surface-hover p-4 text-center border-t border-border">
          <p className="text-[10px] text-text-muted font-mono">
            © {new Date().getFullYear()} هەموو مافەکان پارێزراوە
          </p>
        </div>
      </div>
    </div>
  );
}
