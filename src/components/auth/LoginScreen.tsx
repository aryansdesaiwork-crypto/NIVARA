import React, { useState } from 'react';
import { useStation } from '../../context/StationContext';
import { InteractivePenguin } from './InteractivePenguin';
import {
  Compass,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, navigateTo } = useStation();
  const [email, setEmail] = useState('polar.lead@ncpor.res.in');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email || 'polar.lead@ncpor.res.in', 'Senior Polar Research Lead');
    }, 600);
  };

  const handleDemoSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('NIVARA-CHIEF-SCIENTIST', 'Expedition Commander');
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#CFE2F7] via-[#E2EDF9] to-[#F0F5FC] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      {/* Soft Background Cloud Shapes */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-[500px] h-[500px] bg-white/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-white/70 rounded-full blur-3xl pointer-events-none" />

      {/* Return to Public Landing Link */}
      <div className="w-full max-w-5xl mb-3 flex items-center justify-between z-10 px-2">
        <button
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-600 hover:text-[#17213A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← BACK TO NIVARA HOME</span>
        </button>

        <div className="text-[11px] font-mono text-slate-500">
          INDIAN ANTARCTIC EXPEDITION (ISEA 44)
        </div>
      </div>

      {/* Master Authentication Card */}
      <div className="w-full max-w-5xl bg-white rounded-[32px] p-4 sm:p-5 lg:p-6 shadow-2xl shadow-slate-400/20 border border-white/80 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Visual Panel with Interactive 3D Polar Penguin */}
          <div className="lg:col-span-6 relative rounded-[24px] overflow-hidden min-h-[380px] lg:min-h-[540px] bg-[#bfe0f7] shadow-inner group">
            {/* Interactive 3D Canvas */}
            <InteractivePenguin />

            {/* Subtle Gradient Vignette at Bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

            {/* Bold Typography at Bottom Left */}
            <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                DISCOVER.
                <br />
                SIMULATE.
                <br />
                PROTECT.
              </h2>
              <p className="text-[11px] font-mono text-cyan-200 mt-1 uppercase tracking-wider font-semibold drop-shadow-sm">
                NIVARA LIVING DIGITAL TWIN
              </p>
            </div>

            {/* Top Badge */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md text-[10px] font-mono font-bold text-slate-800 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>POLAR OPERATIONS CONSOLE</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Authentication Form */}
          <div className="lg:col-span-6 flex flex-col justify-between p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Institutional Gateway Header */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#17213A] text-white flex items-center justify-center font-black text-sm shadow-sm">
                    N
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#17213A] tracking-tight">
                      NIVARA GATEWAY
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      ISEA 44 · POLAR OPERATIONS
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                  NCPOR GOA
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17213A] tracking-tight">
                NIVARA AUTHENTICATION
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Authorized access to Indian Antarctic station intelligence.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase font-bold text-slate-600">
                  Institutional Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@ncpor.res.in"
                    className="w-full px-4 py-3 rounded-xl bg-[#F4F8FE] border border-[#D5E1F2] focus:border-[#617FF2] focus:bg-white text-sm text-[#17213A] font-medium outline-hidden transition-all shadow-2xs"
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase font-bold text-slate-600">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F4F8FE] border border-[#D5E1F2] focus:border-[#617FF2] focus:bg-white text-sm text-[#17213A] font-medium outline-hidden transition-all shadow-2xs"
                  />
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Options row */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-[#17213A] cursor-pointer"
                  />
                  <span>Remember session</span>
                </label>

                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="text-xs text-[#617FF2] hover:underline font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Sign In Button */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-[#17213A] hover:bg-[#0B1220] active:scale-[0.99] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-slate-900/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>AUTHENTICATING WITH POLAR BASE...</span>
                  ) : (
                    <>
                      <span>SIGN IN</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Secondary Google Sign In Button (From Reference Image) */}
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 border border-[#D5E1F2] text-xs font-mono font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            </form>

            {/* Quick Demo Access pill */}
            <div className="pt-2 border-t border-[#D5E1F2]/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Operator quick access:
              </span>
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="text-xs font-mono font-bold text-[#617FF2] hover:underline cursor-pointer"
              >
                Launch Demo Console →
              </button>
            </div>

            {/* Footer Institutional Notice */}
            <div className="pt-2 text-center text-[10px] font-mono text-slate-500">
              Authorized personnel only · Indian Polar Research Operations
              <br />
              National Centre for Polar and Ocean Research (NCPOR / MoES)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
