import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';

interface AdminLoginProps {
  onLoginSuccess: (user: { id: string; username: string }) => void;
  onBackToStore: () => void;
}

export function AdminLogin({ onLoginSuccess, onBackToStore }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.login(username.trim(), password);
      if (res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8DFC8] shadow-xl p-8 sm:p-10 space-y-6 relative overflow-hidden">
        {/* Decorative subtle background gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#BFA36D]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#421C2D]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#421C2D] text-[#BFA36D] flex items-center justify-center font-serif text-2xl font-bold mx-auto shadow-md">
            M
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#421C2D] tracking-tight">
            MARYAM TRADE CENTER
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E5DDD0] text-[11px] font-sans uppercase font-bold tracking-widest text-[#BFA36D]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Store Admin Portal</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-sans flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#A896A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                autoComplete="username"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A896A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A896A0] hover:text-[#421C2D]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#421C2D] hover:bg-[#331523] text-white text-xs font-sans font-bold tracking-widest uppercase transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
          </button>
        </form>

        <div className="pt-2 border-t border-[#F0EAE1] flex justify-start items-center text-xs">
          <button
            onClick={onBackToStore}
            className="text-[#7A6B74] hover:text-[#421C2D] flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Store</span>
          </button>
        </div>
      </div>
    </div>
  );
}
