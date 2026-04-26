"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Activity, Terminal } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Force router refresh so middleware catches the new cookie and renders the dashboard.
        router.refresh();
        router.push("/");
      } else {
        setError(data.error || "Hatalı şifre.");
      }
    } catch (err) {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-terminal-bg selection:bg-terminal-accent selection:text-black">
      <div className="w-full max-w-sm px-6">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="h-16 w-16 bg-terminal-surface border border-terminal-surface-high flex items-center justify-center rounded-xl mb-6 shadow-[0_0_40px_rgba(255,184,0,0.1)]">
            <Terminal className="h-8 w-8 text-terminal-accent" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-neutral-900 dark:text-white">
            Personal OS
          </h1>
          <p className="mt-2 text-[10px] font-bold tracking-[0.3em] uppercase text-terminal-accent/70">
            Secure Access Terminal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-terminal-dim group-focus-within:text-terminal-accent transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                placeholder="Şifreyi girin..."
                className="w-full bg-terminal-surface border border-terminal-surface-high py-4 pl-12 pr-4 text-sm font-bold text-neutral-900 dark:text-white placeholder:text-neutral-500 placeholder:font-medium focus:outline-none focus:border-terminal-accent transition-all rounded-none"
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest pl-1">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full relative flex items-center justify-center gap-3 bg-terminal-accent px-6 py-4 text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-terminal-accent/90 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(255,184,0,0.2)]"
          >
            {isLoading ? (
              <Activity className="h-4 w-4 animate-spin" />
            ) : (
              <>
                AUTHENTICATE
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-12 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
            CONNECTION_SECURE // AES-256
          </p>
        </div>
      </div>
    </div>
  );
}
