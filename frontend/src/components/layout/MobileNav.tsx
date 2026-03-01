import React from 'react';
import {
  Trophy,
  Users,
  Calendar,
  Play,
  Image as ImageIcon,
  Settings,
  Plus,
  LogIn,
  UserCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const { isAuthenticated, isAdmin, isCoach } = useAuth();

  const tabs = [
    { id: 'stats', icon: Trophy },
    { id: 'standings', icon: Users },
    { id: 'schedule', icon: Calendar },
    { id: 'media', icon: ImageIcon },
    { id: 'live', icon: Play },
    { id: 'register', icon: Plus },
    // Profile/login as last item
    ...(isAuthenticated
      ? [{ id: 'profile', icon: UserCircle }]
      : [{ id: 'login', icon: LogIn }]),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-zinc-800 px-4 h-20 flex items-center justify-around">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={cn(
            "p-3 rounded-xl transition-all",
            activeTab === tab.id ? "bg-yellow-500 text-black" : "text-zinc-500"
          )}
          aria-label={tab.id}
        >
          <tab.icon className="w-6 h-6" />
        </button>
      ))}
    </nav>
  );
}
