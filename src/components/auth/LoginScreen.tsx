import React, { useState, useEffect } from 'react';
import { Shield, Lock, Mail, KeyRound, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff, CheckSquare, Square, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login, resetAdminPasswordWithMasterKey } = useAuth();

  const [email, setEmail] = useState(() => {
    return localStorage.getItem('digicore_saved_email') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return sessionStorage.getItem('digicore_remember_me') === 'true';
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password / Master Key Reset Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await login(email, password, rememberMe);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login encountered an unexpected error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMasterResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (newAdminPassword !== confirmAdminPassword) {
      setResetError('New passwords do not match.');
      return;
    }

    const res = resetAdminPasswordWithMasterKey(masterKeyInput, newAdminPassword);
    if (res.success) {
      setResetSuccess('Admin password successfully reset! You can now log in.');
      setPassword(newAdminPassword);
      setEmail('digicorepak@gmail.com');
      setTimeout(() => {
        setShowForgotModal(false);
        setMasterKeyInput('');
        setNewAdminPassword('');
        setConfirmAdminPassword('');
        setResetSuccess(null);
      }, 1500);
    } else {
      setResetError(res.error || 'Invalid Master Reset Key.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-slate-100 flex flex-col justify-between items-center relative overflow-hidden font-sans select-none">
      {/* Dynamic Background Glowing Accents */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#FFC700]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="w-full max-w-6xl px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFC700] text-black font-black text-lg flex items-center justify-center shadow-lg shadow-[#FFC700]/25">
            D
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              DigiCore <span className="text-[#FFC700]">CRM</span>
            </span>
            <p className="text-[11px] text-slate-400">digicorepak.com · Agency Operating System</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121217] border border-[#23232c] text-xs text-slate-300">
          <Shield className="w-3.5 h-3.5 text-[#FFC700]" />
          <span>Public Access Shield Protected</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-md px-6 py-8 z-10">
        <div className="bg-[#121217] border border-[#23232c] rounded-3xl p-8 shadow-2xl shadow-black/80 backdrop-blur-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex p-3 rounded-2xl bg-[#FFC700]/15 border border-[#FFC700]/30 text-[#FFC700] mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Agency Sign In
            </h2>
            <p className="text-xs text-slate-400">
              Enter your credentials to access the DigiCore Operating System
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@digicorepak.com"
                  className="w-full bg-[#181820] border border-[#2a2a36] focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-[#FFC700] hover:underline cursor-pointer font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#181820] border border-[#2a2a36] focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-200 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="pt-1 flex items-center justify-between">
              <label
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none group"
              >
                <button
                  type="button"
                  aria-checked={rememberMe}
                  className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                    rememberMe
                      ? 'bg-[#FFC700] text-black'
                      : 'border border-[#3a3a48] bg-[#181820] text-transparent group-hover:border-slate-400'
                  }`}
                >
                  {rememberMe && <CheckSquare className="w-3.5 h-3.5" />}
                </button>
                <span className="font-medium">Remember Me</span>
              </label>

              <span className="text-[11px] text-slate-400">
                {rememberMe ? 'Retain on refresh (auto-clears on tab close)' : 'In-memory only (clears on refresh & tab close)'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#FFC700] hover:bg-[#ffcf1a] active:scale-[0.99] text-black font-bold text-sm rounded-xl shadow-lg shadow-[#FFC700]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl px-6 py-6 text-center text-xs text-slate-400 z-10 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#1a1a24]">
        <span>© {new Date().getFullYear()} DigiCore Pakistan. All rights reserved.</span>
        <span className="font-mono text-[11px] text-slate-400">Master Key Shield v2.4</span>
      </footer>

      {/* Forgot Password / Master Reset Key Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#121217] border border-[#FFC700]/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-[#23232c]">
              <div className="w-10 h-10 rounded-2xl bg-[#FFC700]/15 text-[#FFC700] flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Master Key Password Reset
                </h3>
                <p className="text-xs text-slate-400">
                  Authenticate with the Master Key (<code className="text-[#FFC700] font-mono">aliraza983</code>) to reset Admin password.
                </p>
              </div>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleMasterResetSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Master Security Key *
                </label>
                <input
                  type="password"
                  required
                  value={masterKeyInput}
                  onChange={e => setMasterKeyInput(e.target.value)}
                  placeholder="Enter Master Key (aliraza983)"
                  className="w-full mt-1 bg-[#181820] border border-[#2a2a36] focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">
                  New Admin Password *
                </label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full mt-1 bg-[#181820] border border-[#2a2a36] focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmAdminPassword}
                  onChange={e => setConfirmAdminPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full mt-1 bg-[#181820] border border-[#2a2a36] focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-[#1a1a24] hover:bg-[#252533] text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#FFC700] hover:bg-[#ffcf1a] text-black rounded-xl shadow-md cursor-pointer"
                >
                  Update Admin Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
