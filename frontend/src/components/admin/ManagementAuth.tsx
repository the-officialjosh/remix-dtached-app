import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const ManagementAuth = ({ onAuthorize }: { onAuthorize: () => void }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === 'ADMIN2026') {
      onAuthorize();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 p-12 rounded-[40px] shadow-2xl max-w-md w-full text-center space-y-8"
      >
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-10 h-10 text-yellow-500" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Restricted Area</h3>
          <p className="text-zinc-500 text-sm">Enter the authorization code to access the management console.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="••••••••"
            className={cn(
              "w-full bg-black border rounded-2xl p-4 text-center text-xl font-mono tracking-[0.5em] focus:outline-none transition-all",
              error ? "border-red-500" : "border-zinc-800 focus:border-yellow-500"
            )}
          />
          <button type="submit" className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all">
            Authorize Access
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ManagementAuth;
