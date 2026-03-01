import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/AuthContext';
import { UserPlus, LogIn, Mail, Lock, User, AlertCircle } from 'lucide-react';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export default function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      // After register → AuthContext redirects to role selection / confirmation
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
            <UserPlus className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-zinc-500 mt-2">Join the Dtached platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-yellow-500/50 focus:outline-none transition-colors"
                  placeholder="First"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-yellow-500/50 focus:outline-none transition-colors"
                placeholder="Last"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-yellow-500/50 focus:outline-none transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-yellow-500/50 focus:outline-none transition-colors"
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-zinc-400 hover:text-yellow-500 transition-colors inline-flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" />
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
