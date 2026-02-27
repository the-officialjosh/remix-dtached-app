import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../lib/LanguageContext';
import { cn } from '../../lib/utils';

export default function LanguagePicker() {
  const { language, setLanguage, hasChosen, setHasChosen, t } = useLanguage();

  if (hasChosen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full mx-4 text-center space-y-6"
        >
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">🥷</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">{t('lang.title')}</h2>
            <p className="text-zinc-500 text-sm mt-1">{t('lang.subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setLanguage('fr'); setHasChosen(true); }}
              className={cn(
                "py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border-2",
                language === 'fr'
                  ? "bg-yellow-500 text-black border-yellow-500"
                  : "bg-zinc-800 text-white border-zinc-700 hover:border-yellow-500/50"
              )}
            >
              {t('lang.fr')}
            </button>
            <button
              onClick={() => { setLanguage('en'); setHasChosen(true); }}
              className={cn(
                "py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border-2",
                language === 'en'
                  ? "bg-yellow-500 text-black border-yellow-500"
                  : "bg-zinc-800 text-white border-zinc-700 hover:border-yellow-500/50"
              )}
            >
              {t('lang.en')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
