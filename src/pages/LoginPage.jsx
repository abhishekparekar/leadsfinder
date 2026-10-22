import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import loginBg from '../assest/loginbg1.jpg';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ displayName, email, password, companyName });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen min-h-[100dvh] w-full flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white relative overflow-y-auto bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Subtle atmospheric tint to preserve rich geometric blue colors of loginbg1.jpg while ensuring text contrast */}
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px] pointer-events-none"></div>

      {/* Main Container - Fully Responsive */}
      <div className="relative z-10 w-full max-w-[450px] my-auto py-6">
        {/* Header / Brand Logo */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/80 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-200 mb-3 shadow-lg">
            <span className="w-2 h-2 bg-blue-500"></span>
            <span className="tracking-wider uppercase text-[11px] font-bold text-white">LeadPilot CRM</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400 font-mono text-[10px]">Enterprise v2.4</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-lg">
            {mode === 'login' ? 'Sign in to your account' : 'Create an enterprise account'}
          </h1>
          <p className="text-xs text-slate-200 mt-1.5 leading-relaxed max-w-sm mx-auto drop-shadow-sm">
            {mode === 'login' 
              ? 'Enter your work credentials to access your B2B leads and sales pipeline.' 
              : 'Set up your team workspace to discover prospects and launch outreach campaigns.'}
          </p>
        </div>

        {/* Sharp Glassmorphism Authentication Card letting loginbg1.jpg shine through */}
        <div className="bg-slate-900/75 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-slate-950/80 p-5 sm:p-8 relative">
          {/* Segmented Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/70 border border-slate-700/60 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-2 text-xs font-semibold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`py-2 text-xs font-semibold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Register New Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 bg-rose-950/70 border border-rose-600/80 flex items-start gap-2.5 text-xs text-rose-200 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Smith"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Company / Organization Name
                  </label>
                  <div className="relative flex items-center">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Acme Technologies Pvt Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Work Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="alex.smith@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Password <span className="text-rose-400">*</span>
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={mode === 'register' ? 6 : undefined}
                  placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            {mode === 'login' ? (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 bg-slate-950 border border-slate-700 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-[11px] text-slate-400">Secure Session</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 active:translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{mode === 'login' ? 'Authenticating...' : 'Creating Workspace...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create My Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher Footer */}
          <div className="mt-5 text-center text-xs text-slate-300">
            {mode === 'login' ? (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer ml-1"
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
