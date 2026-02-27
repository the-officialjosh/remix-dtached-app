import {
  Home,
  Trophy,
  Users,
  Calendar,
  Play,
  Image as ImageIcon,
  Settings,
  Plus,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-zinc-800 px-4 h-20 flex items-center justify-around">
      {[
        { id: 'stats', icon: Trophy },
        { id: 'standings', icon: Users },
        { id: 'schedule', icon: Calendar },
        { id: 'media', icon: ImageIcon },
        { id: 'live', icon: Play },
        { id: 'register', icon: Plus },
        { id: 'admin', icon: Settings },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={cn(
            "p-3 rounded-xl transition-all",
            activeTab === tab.id ? "bg-yellow-500 text-black" : "text-zinc-500"
          )}
        >
          <tab.icon className="w-6 h-6" />
        </button>
      ))}
    </nav>
  );
}
