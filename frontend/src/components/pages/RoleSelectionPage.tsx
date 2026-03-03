import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/AuthContext';
import { Shield, AlertCircle, Dribbble, ClipboardCheck } from 'lucide-react';

export default function RoleSelectionPage({ onApplyAsCoach }: { onApplyAsCoach?: () => void }) {
  const { selectRole, user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectPlayer = async () => {
    setError('');
    setLoading(true);
    try {
      await selectRole('PLAYER');
    } catch (err: any) {
      setError(err.message || 'Failed to select role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
            <Shield className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-zinc-500 mt-2">Get started on the Dtached platform</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Player — direct access */}
          <button
            type="button"
            onClick={handleSelectPlayer}
            disabled={loading}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border bg-yellow-500/10 border-yellow-500/50 text-left transition-all hover:bg-yellow-500/15 disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-yellow-500/20 text-yellow-500">
              <Dribbble className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-yellow-500">Join as Player</div>
              <div className="text-xs text-zinc-500 mt-0.5">Create your player profile and join teams</div>
            </div>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-3 bg-zinc-900 text-zinc-600 uppercase tracking-widest font-bold">or</span>
            </div>
          </div>

          {/* Coach application link */}
          <button
            type="button"
            onClick={onApplyAsCoach}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border bg-zinc-800/50 border-zinc-700 text-left transition-all hover:border-zinc-600"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-zinc-700 text-zinc-400">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-white">Apply as Coach / Team Manager</div>
              <div className="text-xs text-zinc-500 mt-0.5">Submit an application for review — requires admin approval</div>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
