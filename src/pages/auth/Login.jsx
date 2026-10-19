import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import {
  FileText,
  ShoppingCart,
  PieChart,
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage('');

  if (!email.trim() || !email.includes('@')) {
    setErrorMessage('Please enter a valid email address.');
    return;
  }

  if (!password.trim() || password.length < 4) {
    setErrorMessage('Password must be at least 4 characters long.');
    return;
  }

  try {
    setIsLoading(true);

    const response = await login(email, password);

    if (response.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(response.message || 'Login failed.');
    }
  } catch (error) {
    setErrorMessage(
      error.response?.data?.message ||
      'Something went wrong. Please try again.'
    );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen w-full bg-bg-page flex items-center justify-center p-4 relative overflow-hidden text-text-main font-sans">

      {/* Background dot grid */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(var(--color-brand-gold)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      {/* Ambient glow (Soft & Subtle for light theme) */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-brand-gold/3 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-brand-gold/3 blur-3xl pointer-events-none"></div>

      {/* Book-style floating card */}
      <div className="w-full max-w-md lg:max-w-5xl flex rounded-3xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.05)] border border-border-subtle bg-white relative z-10">

          {/* LEFT PANEL */}
          <div className="hidden lg:flex lg:w-1/2 bg-white py-8 px-10 xl:py-10 xl:px-14 flex-col justify-between relative overflow-hidden border-r border-border-subtle">

            {/* Decorative circle shapes (Matches Light Theme) */}
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-brand-gold-light/20 border border-brand-gold/5 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-stone-50/80 pointer-events-none"></div>

            {/* Top: Brand */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-brand-gold-light border border-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold font-extrabold text-lg select-none">
                  S
                </div>
                <div>
                  <h3 className="text-stone-900 font-bold text-base leading-tight m-0">Stride</h3>
                  <p className="text-stone-400 text-xs m-0">Accounting Application</p>
                </div>
              </div>

              {/* Tag */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold inline-block"></span>
                <span className="text-brand-gold text-xs font-bold tracking-widest uppercase">Your Business, Organized</span>
              </div>

              {/* Heading */}
              <h1 className="text-stone-900 text-3xl xl:text-4xl font-bold leading-tight m-0 mb-3">
                Welcome <span className="text-brand-gold font-bold">back</span>
              </h1>

              {/* Accent bar */}
              <div className="w-10 h-0.5 bg-brand-gold rounded my-5"></div>

              {/* Subtitle */}
              <p className="text-stone-500 text-sm leading-relaxed m-0 mb-8">
                Manage quotations, sales, purchases, inventory, payments and reports — all in one place.
              </p>

              {/* Feature cards */}
              <div className="flex flex-col gap-3">
                {[
                  { icon: <FileText size={16} />, label: 'Quotations & Sales' },
                  { icon: <ShoppingCart size={16} />, label: 'Purchase & Inventory' },
                  { icon: <PieChart size={16} />, label: 'Payments & Reports' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-3 bg-white border border-stone-200/60 rounded-xl px-4 py-3 shadow-xs">
                    <span className="text-brand-gold">{icon}</span>
                    <span className="text-stone-700 text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: Security badge */}
            <div className="relative z-10 flex items-center gap-2.5 mt-8">
              <div className="w-7 h-7 rounded-full bg-brand-gold-light flex items-center justify-center text-brand-gold">
                <Shield size={14} />
              </div>
              <p className="text-xs text-stone-500 m-0">
                <span className="text-brand-gold font-semibold">Secure. Reliable.</span> Built for your business.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-full lg:w-1/2 bg-white py-8 px-10 xl:py-10 xl:px-14 flex flex-col justify-center">

            {/* Logo text */}
            <div className="mb-8">
              <p className="text-brand-gold text-xs font-bold tracking-widest uppercase m-0 mb-1">Stride PLATFORM</p>
              <h2 className="text-stone-900 text-2xl xl:text-3xl font-bold m-0 mb-1">Sign in to your account</h2>
              <p className="text-stone-400 text-sm m-0">Enter your credentials to continue.</p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Email */}
              <div className="flex items-center border border-border-subtle rounded-xl px-4 py-3.5 gap-3 bg-white transition-all focus-within:border-brand-gold/45 focus-within:bg-stone-50/10 shadow-xs">
                <User size={17} className="text-stone-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Username or email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-none outline-none w-full text-sm text-stone-900 placeholder:text-stone-400 bg-transparent"
                />
              </div>

              {/* Password */}
              <div className="flex items-center border border-border-subtle rounded-xl px-4 py-3.5 gap-3 bg-white transition-all focus-within:border-brand-gold/45 focus-within:bg-stone-50/10 shadow-xs">
                <Lock size={17} className="text-stone-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-none outline-none w-full text-sm text-stone-900 placeholder:text-stone-400 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-xs my-1">
                <label className="flex items-center gap-2 text-stone-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="cursor-pointer accent-brand-gold w-3.5 h-3.5"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className="text-brand-gold font-semibold hover:underline no-underline">
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-gold hover:bg-brand-gold-hover text-white rounded-xl py-3.5 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-xs cursor-pointer mt-1 disabled:opacity-70 disabled:cursor-not-allowed border-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in securely</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center gap-1.5">
                <Shield size={12} className="text-brand-gold" />
                <span>Encrypted session</span>
              </div>
              <span>© 2026 Stride Platform</span>
            </div>

            <div className="mt-4 text-center text-xs text-stone-400">
              <span>New here? </span>
              <a href="#signup" className="text-brand-gold font-semibold hover:underline no-underline">
                Create an account
              </a>
            </div>
          </div>
        </div>
    </div>
  );
}
