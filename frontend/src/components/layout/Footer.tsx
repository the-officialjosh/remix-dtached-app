import { Trophy, Instagram, Mail, Calendar, MapPin, Globe } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { cn } from '../../lib/utils';

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 mt-20 pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <img src="/logo.png" alt="Dtached" style={{ width: '140px', height: 'auto' }} />
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black text-zinc-500 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black text-zinc-500 transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">{t('footer.quick_links')}</h4>
            <ul className="space-y-2">
              {[
                { key: 'nav.leaderboard' },
                { key: 'nav.standings' },
                { key: 'nav.schedule' },
                { key: 'nav.livestream' },
                { key: 'nav.register' },
              ].map(link => (
                <li key={link.key}>
                  <span className="text-sm text-zinc-500 hover:text-yellow-500 transition-colors cursor-pointer">{t(link.key)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">{t('footer.event_info')}</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li className="flex items-center gap-2"><Calendar className="w-4 h-4 text-yellow-500" /> {t('footer.date')}</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-yellow-500" /> {t('footer.location')}</li>
              <li className="flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> {t('footer.divisions')}</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full p-1">
              <Globe className="w-3 h-3 text-zinc-500 ml-2" />
              <button
                onClick={() => setLanguage('fr')}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  language === 'fr' ? "bg-yellow-500 text-black" : "text-zinc-500 hover:text-white"
                )}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  language === 'en' ? "bg-yellow-500 text-black" : "text-zinc-500 hover:text-white"
                )}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
