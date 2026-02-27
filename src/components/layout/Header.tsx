import {
  Home,
  Trophy,
  Users,
  Calendar,
  Play,
  Image as ImageIcon,
  Settings,
  Plus,
  Star,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  tournamentType: '7v7' | 'Flag';
  setTournamentType: (type: '7v7' | 'Flag') => void;
  isPremium: boolean;
}

export default function Header({ activeTab, setActiveTab, tournamentType, setTournamentType, isPremium }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl">
      <div className="w-full px-8 py-4 grid grid-cols-[auto_1fr_auto] items-center gap-6">
        {/* Left: Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('home')}>
          <img src="/logo.png" alt="Dtached Logo" style={{ width: '150px', height: 'auto' }} />
        </div>

        {/* Center: Nav links */}
        <nav className="hidden md:flex items-center justify-center gap-6">
          {[
            {id: 'stats', label: 'Leaderboard', icon: Trophy},
            {id: 'standings', label: 'Standings', icon: Users},
            {id: 'schedule', label: 'Schedule', icon: Calendar},
            {id: 'media', label: 'Media', icon: ImageIcon},
            {id: 'live', label: 'Livestream', icon: Play},
            {id: 'register', label: 'Register', icon: Plus},
            {id: 'admin', label: 'Management', icon: Settings},
          ].map((tab) => (
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

        {/* Right: Tournament toggle + Premium */}
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900 p-1 rounded-full border border-zinc-800">
            <button 
              onClick={() => setTournamentType('7v7')}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                tournamentType === '7v7' ? "bg-yellow-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              7v7 Boys
            </button>
            <button 
              onClick={() => setTournamentType('Flag')}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                tournamentType === 'Flag' ? "bg-yellow-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Flag Girls
            </button>
          </div>

          {!isPremium && (
            <button 
              onClick={() => setActiveTab('media')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-white hover:border-yellow-500/50 transition-all"
            >
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              Go Premium
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
            <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
    </header>
  );
}
