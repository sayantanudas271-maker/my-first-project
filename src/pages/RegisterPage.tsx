import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, ShieldCheck, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';
import { UserRole } from '../types.ts';

export const RegisterPage: React.FC = () => {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('AGENT_OPERATOR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch {
      // error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px] shadow-xl shadow-indigo-500/20 mb-2">
            <div className="h-full w-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <Cpu className="h-6 w-6 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create AutoOps Account</h1>
          <p className="text-xs text-slate-400">Join the enterprise multi-agent workflow network</p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Name</label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    clearError();
                    setName(e.target.value);
                  }}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Enterprise Email</label>
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
                  minLength={6}
                  value={password}
                  onChange={(e) => {
                    clearError();
                    setPassword(e.target.value);
                  }}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Organizational Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="AGENT_OPERATOR">Agent Operator (Triggers tasks & monitors)</option>
                <option value="MANAGER">Procurement Manager (Authorizes HITL gates)</option>
                <option value="ADMIN">System Administrator (Full access)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Registering...' : 'Complete Registration'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center text-[11px] text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
