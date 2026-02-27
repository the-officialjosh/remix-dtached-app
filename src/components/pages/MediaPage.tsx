import React from 'react';
import { Shield, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import PremiumPaywall from '../team/PremiumPaywall';

interface MediaPageProps {
  isPremium: boolean;
  onUnlock: () => void;
}

export default function MediaPage({ isPremium, onUnlock }: MediaPageProps) {
  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase mb-2">Media Gallery</h2>
          <p className="text-zinc-500 font-medium">Capture the intensity of the tournament.</p>
        </div>
        {isPremium && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs font-bold text-yellow-500">
            <Shield className="w-4 h-4" />
            Premium Active
          </div>
        )}
      </div>

      {!isPremium ? (
        <PremiumPaywall onUnlock={onUnlock} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group relative cursor-pointer"
            >
              <img 
                src={`https://picsum.photos/seed/sports-${i}/800/800`} 
                alt="Tournament"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white w-8 h-8" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
