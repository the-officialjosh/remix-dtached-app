import {
  Trophy,
  Users,
  Calendar,
  Play,
  Image as ImageIcon,
  Settings,
  Plus,
  Star,
  LogIn,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  tournamentType: '7v7' | 'Flag';
  setTournamentType: (type: '7v7' | 'Flag') => void;
  isPremium: boolean;
}

export default function Header({ activeTab, setActiveTab, tournamentType, setTournamentType, isPremium }: HeaderProps) {
  const { t } = useLanguage();
  const { user, isAuthenticated, isAdmin, isCoach, logout } = useAuth();

  const navItems = [
    {id: 'stats', label: t('nav.leaderboard'), icon: Trophy},
    {id: 'standings', label: t('nav.standings'), icon: Users},
    {id: 'schedule', label: t('nav.schedule'), icon: Calendar},
    {id: 'media', label: t('nav.media'), icon: ImageIcon},
    {id: 'live', label: t('nav.livestream'), icon: Play},
    {id: 'register', label: t('nav.register'), icon: Plus},
    // Only show Management if user is admin or coach
    ...((isAdmin || isCoach) ? [{id: 'admin', label: t('nav.management'), icon: Settings}] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl">
      <div className="w-full px-8 py-4 grid grid-cols-[auto_1fr_auto] items-center gap-6">
        {/* Left: Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('home')}>
          <img src="/logo.png" alt="Dtached Logo" style={{ width: '150px', height: 'auto' }} />
        </div>

        {/* Center: Nav links */}
        <nav className="hidden md:flex items-center justify-center gap-6">
          {navItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 text-sm font-bold transition-all hover:text-white",
                activeTab === tab.id ? "text-yellow-500" : "text-zinc-500"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right: Tournament toggle + Auth */}
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900 p-1 rounded-full border border-zinc-800">
            <button 
              onClick={() => setTournamentType('7v7')}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                tournamentType === '7v7' ? "bg-yellow-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {t('header.7v7')}
            </button>
            <button 
              onClick={() => setTournamentType('Flag')}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                tournamentType === 'Flag' ? "bg-yellow-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {t('header.flag')}
            </button>
          </div>

          {!isPremium && (
            <button 
              onClick={() => setActiveTab('media')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-white hover:border-yellow-500/50 transition-all"
            >
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              {t('header.premium')}
            </button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-white">{user?.firstName}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{user?.role}</span>
              </div>
              <button
                onClick={logout}
                className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:border-red-500/50 transition-all group"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('login')}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-yellow-400 transition-all"
            >
              <LogIn className="w-3 h-3" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
