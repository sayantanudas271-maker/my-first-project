import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { UserRole } from '../types.ts';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, loginWithGoogle, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch {
      // error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setIsSubmitting(true);
    try {
      await quickLogin(role);
      navigate('/');
    } catch {
      // error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px] shadow-xl shadow-indigo-500/20 mb-2">
            <div className="h-full w-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <Cpu className="h-6 w-6 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            AutoOps AI
          </h1>
          <p className="text-xs text-slate-400">
            Autonomous Enterprise Workflow Agent & Procurement Orchestrator
          </p>
        </div>

        {/* Login Box */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Work Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    clearError();
                    setEmail(e.target.value);
                  }}
                  placeholder="name@enterprise.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    clearError();
                    setPassword(e.target.value);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In with Password'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Google Sign-In with Firebase Auth */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              id="google-signin-btn"
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs shadow-md flex items-center justify-center space-x-2.5 transition active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google (Firebase Auth)</span>
            </button>
          </div>

          {/* Quick Demo Logins Section */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 block text-center font-semibold">
              Instant 1-Click Demo Profiles (Pre-Seeded)
            </span>

            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                disabled={isSubmitting}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/20 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-purple-300 transition text-[11px]">
                    Sarah Chen (System Admin)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">admin@autoops.ai</div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ADMIN
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('MANAGER')}
                disabled={isSubmitting}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-950/20 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-blue-300 transition text-[11px]">
                    Marcus Vance (Procurement Manager)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">manager@autoops.ai</div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  MANAGER (HITL Signer)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('AGENT_OPERATOR')}
                disabled={isSubmitting}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-emerald-300 transition text-[11px]">
                    Elena Rostova (Agent Operator)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">operator@autoops.ai</div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  OPERATOR
                </span>
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400">
            Need an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:underline font-medium">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
