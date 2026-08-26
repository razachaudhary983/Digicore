import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, ArrowRight, Eye, EyeOff, AlertCircle, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LockScreenOverlay: React.FC = () => {
  const { currentUser, unlockSession, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setErrorMsg(null);
    setIsVerifying(true);

    try {
      const res = await unlockSession(password);
      if (!res.success) {
        setErrorMsg(res.error || 'Incorrect password.');
        setPassword('');
        inputRef.current?.focus();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to verify credentials.');
    } finally {
      setIsVerifying(false);
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      id="digicore-idle-lockscreen"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0a0c]/90 backdrop-blur-xl animate-in fade-in duration-200 select-none"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-[#FFC700]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-amber-600/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#121217] border border-[#2a2a36] rounded-3xl p-8 shadow-2xl shadow-black/90 relative z-10 space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-[#FFC700]/15 border border-[#FFC700]/30 text-[#FFC700] mb-1 shadow-lg shadow-[#FFC700]/20">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Session Auto-Locked
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FFC700]" />
            <span>Protected after 3 minutes of inactivity</span>
          </div>
        </div>

        {/* User Card */}
        {currentUser && (
          <div className="p-3.5 rounded-2xl bg-[#181820] border border-[#2a2a36] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FFC700] text-black font-bold text-base flex items-center justify-center shadow-md">
              {getUserInitials(currentUser.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-white truncate">{currentUser.name}</span>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold ${
                  currentUser.role === 'admin'
                    ? 'bg-[#FFC700]/20 text-[#FFC700] border border-[#FFC700]/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Password Unlock Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Enter Password to Resume</span>
              <span className="text-[11px] text-slate-400 font-normal">Active session preserved</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full bg-[#181820] border border-[#2a2a36] focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying || !password}
            className="w-full py-3 bg-[#FFC700] hover:bg-[#ffcf1a] active:scale-[0.99] text-black font-bold text-sm rounded-xl shadow-lg shadow-[#FFC700]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Unlocking...
              </span>
            ) : (
              <>
                <span>Resume Workspace Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-[#1e1e28] flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Account / Sign Out</span>
          </button>

          <span className="text-[11px] text-slate-400">3m Inactivity Shield</span>
        </div>
      </div>
    </div>
  );
};
