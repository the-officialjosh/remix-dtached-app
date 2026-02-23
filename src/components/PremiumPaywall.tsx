import { Lock, CreditCard, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const PremiumPaywall = ({ onUnlock }: { onUnlock: () => void }) => (
  <div className="flex items-center justify-center py-16">
    <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-[40px] shadow-2xl text-center max-w-lg space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-yellow-500/10 blur-3xl rounded-full" />
        <div className="w-24 h-24 relative bg-zinc-800 rounded-full flex items-center justify-center mx-auto border border-zinc-700">
          <Lock className="w-12 h-12 text-yellow-500" />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-3">Premium Media Access</h3>
        <p className="text-zinc-500 max-w-sm mx-auto text-sm leading-relaxed">
          Unlock exclusive tournament photos and videos with a premium pass. 
          Get full access to all media content.
        </p>
      </div>
      <div className="space-y-3">
        <button 
          onClick={onUnlock}
          className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-3 group shadow-[0_0_30px_rgba(16,185,129,0.2)]"
        >
          <CreditCard className="w-5 h-5" />
          Unlock for $9.99
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-xs text-zinc-500">One-time payment for full tournament access</p>
      </div>
    </div>
  </div>
);

export default PremiumPaywall;
