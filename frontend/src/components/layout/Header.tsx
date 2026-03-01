import React, { useState, useRef, useEffect } from 'react';
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
  UserCircle,
  LayoutDashboard,
  ChevronDown,
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems = [
    {id: 'stats', label: t('nav.leaderboard'), icon: Trophy},
    {id: 'standings', label: t('nav.standings'), icon: Users},
    {id: 'schedule', label: t('nav.schedule'), icon: Calendar},
    {id: 'media', label: t('nav.media'), icon: ImageIcon},
    {id: 'live', label: t('nav.livestream'), icon: Play},
    {id: 'register', label: t('nav.register'), icon: Plus},
    ...((isAdmin || isCoach) ? [{id: 'admin', label: t('nav.management'), icon: Settings}] : []),
  ];

  const handleDropdownNav = (tab: string) => {
    setActiveTab(tab);
    setDropdownOpen(false);
  };

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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-full hover:border-zinc-600 transition-all"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                  <span className="text-xs font-black text-yellow-500">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-bold text-white leading-tight">{user?.firstName}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider leading-tight">{user?.role || 'Member'}</span>
                </div>
                <ChevronDown className={cn("w-3 h-3 text-zinc-500 transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden py-2 z-[100]">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <p className="text-sm font-bold text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{user?.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-yellow-500/20">
                      {user?.role || 'Member'}
                    </span>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => handleDropdownNav('dashboard')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => handleDropdownNav('profile')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
                    >
                      <UserCircle className="w-4 h-4 text-zinc-500" />
                      My Profile
                    </button>
                  </div>

                  <div className="border-t border-zinc-800 py-1">
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                        setActiveTab('home');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
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
