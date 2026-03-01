import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/AuthContext';
import { Shield, AlertCircle, Users, Dribbble, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';

const ROLES = [
  { id: 'PLAYER', label: 'Player', desc: 'Join a team and compete in tournaments', icon: Dribbble },
  { id: 'COACH', label: 'Coach', desc: 'Manage and coach your team', icon: Users },
  { id: 'TEAM_MANAGER', label: 'Team Manager', desc: 'Handle team operations and logistics', icon: Briefcase },
];

export default function RoleSelectionPage() {
  const { selectRole, user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setError('');
    setLoading(true);
    try {
      await selectRole(selected);
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
          <p className="text-zinc-500 mt-2">Choose how you'll use Dtached</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all',
                  selected === r.id
                    ? 'bg-yellow-500/10 border-yellow-500/50'
                    : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    selected === r.id
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-zinc-700 text-zinc-400'
                  )}
                >
                  <r.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div
                    className={cn(
                      'font-bold text-sm',
                      selected === r.id ? 'text-yellow-500' : 'text-white'
                    )}
                  >
                    {r.label}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">{r.desc}</div>
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    selected === r.id
                      ? 'border-yellow-500 bg-yellow-500'
                      : 'border-zinc-600'
                  )}
                >
                  {selected === r.id && (
                    <div className="w-2 h-2 rounded-full bg-black" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selected || loading}
            className="w-full py-3 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Continue'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
