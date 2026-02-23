import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Play, 
  Image as ImageIcon, 
  Search,
  ChevronRight,
  Zap,
  Shield,
  Star,
  Camera,
  Settings,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import type { Player, TeamStandings, Game } from './types';

// --- Components ---
import FieldMap from './components/FieldMap';
import GameRow from './components/GameRow';
import PremiumPaywall from './components/PremiumPaywall';
import TeamModal from './components/TeamModal';
import PlayerProfileModal from './components/PlayerProfileModal';
import PlayerRegistration from './components/PlayerRegistration';
import CoachDashboard from './components/CoachDashboard';
import StandingsTable from './components/StandingsTable';
import TeamManagement from './components/TeamManagement';
import PlayerManagement from './components/PlayerManagement';
import StatsManagement from './components/StatsManagement';
import GameManagement from './components/GameManagement';
import ManagementAuth from './components/ManagementAuth';

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'stats' | 'standings' | 'schedule' | 'media' | 'live' | 'admin' | 'register'>('stats');
  const [adminSubTab, setAdminSubTab] = useState<'teams' | 'players' | 'stats' | 'matchups'>('teams');
  const [tournamentType, setTournamentType] = useState<'7v7' | 'Flag'>('7v7');
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<TeamStandings[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamStandings | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<{ id: number; msg: string }[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const socketRef = useRef<WebSocket | null>(null);

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    fetchData();
    connectWebSocket();
    return () => socketRef.current?.close();
  }, [tournamentType]);

  const fetchData = async () => {
    try {
      const [pRes, gRes, tRes] = await Promise.all([
        fetch(`/api/leaderboard?type=${tournamentType}`),
        fetch(`/api/games?type=${tournamentType}`),
        fetch(`/api/teams?type=${tournamentType}`)
      ]);

      if (!pRes.ok || !gRes.ok || !tRes.ok) {
        throw new Error(`HTTP error! status: ${pRes.status} ${gRes.status} ${tRes.status}`);
      }

      const pData = await pRes.json();
      const gData = await gRes.json();
      const tData = await tRes.json();
      setPlayers(pData);
      setGames(gData);
      setTeams(tData);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const addNotification = (msg: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'STATS_UPDATED') {
        fetchData();
        addNotification(`Stats updated for ${message.data.name}!`);
      }
    };

    socket.onclose = () => {
      setTimeout(connectWebSocket, 3000);
    };

    socketRef.current = socket;
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-yellow-500 selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="w-full px-8 py-4 grid grid-cols-[auto_1fr_auto] items-center gap-6">
          {/* Left: Logo */}
          <div className="flex items-center">
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

      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-16"
            >
              {/* Hero Section: Category Leaders */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Passing Yds', key: 'total_pass_yards', icon: Zap, color: 'text-blue-400' },
                  { label: 'Receiving Yds', key: 'total_yards', icon: Zap, color: 'text-yellow-400' },
                  { label: 'Touchdowns', key: 'total_touchdowns', icon: Trophy, color: 'text-amber-400' },
                  { label: 'Receptions', key: 'total_catches', icon: Star, color: 'text-pink-400' },
                  { label: 'Interceptions', key: 'total_interceptions', icon: Shield, color: 'text-purple-400' },
                  { label: 'Sacks', key: 'total_sacks', icon: Zap, color: 'text-red-400' },
                ].map((cat) => {
                  const leader = [...players].sort((a, b) => (b[cat.key as keyof Player] as number || 0) - (a[cat.key as keyof Player] as number || 0))[0];
                  return (
                    <div 
                      key={cat.key}
                      onClick={() => leader && setSelectedPlayer(leader)}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-yellow-500/50 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <cat.icon className="w-12 h-12" />
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">{cat.label}</p>
                      {leader ? (
                        <div className="flex items-center gap-2 relative z-10">
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-800">
                            <img src={leader.photo || `https://picsum.photos/seed/${leader.id}/100/100`} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-white italic uppercase tracking-tighter truncate w-16">{leader.name}</p>
                            <p className={cn("text-lg font-mono font-black", cat.color)}>{leader[cat.key as keyof Player] as number || 0}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-zinc-600 italic text-[8px]">No data</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Categorized Leaderboard Sections */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Stat Leaders</h2>
                  <div className="flex gap-2">
                    <div className="px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800 flex items-center gap-2">
                      <Search className="w-4 h-4 text-zinc-500" />
                      <input 
                        type="text" 
                        placeholder="Search athletes..." 
                        className="bg-transparent border-none outline-none text-xs text-white w-32 md:w-48" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {[
                    { title: 'Passing Leaders', key: 'total_pass_yards', icon: Zap, isQB: true },
                    { title: 'Receiving Leaders', key: 'total_yards', icon: Zap },
                    { title: 'Touchdown Leaders', key: 'total_touchdowns', icon: Trophy },
                    { title: 'Reception Leaders', key: 'total_catches', icon: Star },
                    { title: 'Interception Leaders', key: 'total_interceptions', icon: Shield },
                    { title: 'Sacks Leaders', key: 'total_sacks', icon: Zap },
                  ].map((category) => {
                    const isExpanded = expandedCategories[category.key];
                    const displayedPlayers = [...players]
                      .sort((a, b) => (b[category.key as keyof Player] as number || 0) - (a[category.key as keyof Player] as number || 0))
                      .slice(0, isExpanded ? 20 : 3);

                    return (
                      <div key={category.key} className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/20">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tighter italic">
                            <category.icon className="w-5 h-5 text-yellow-500" />
                            {category.title}
                          </h3>
                          <button 
                            onClick={() => toggleCategory(category.key)}
                            className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] hover:text-yellow-400 transition-colors"
                          >
                            {isExpanded ? 'Show Less' : 'View All'}
                          </button>
                        </div>
                        <div className="divide-y divide-zinc-800">
                          {displayedPlayers.map((player, idx) => {
                            const cmpPct = player.total_pass_attempts ? Math.round((player.total_pass_completions || 0) / player.total_pass_attempts * 100) : 0;
                            return (
                              <div 
                                key={player.id} 
                                className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group cursor-pointer" 
                                onClick={() => setSelectedPlayer(player)}
                              >
                                <div className="flex items-center gap-4">
                                  <span className="text-xl font-black text-zinc-800 italic w-6">{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                                  <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-800 group-hover:border-yellow-500/50 transition-all">
                                    <img 
                                      src={player.photo || `https://picsum.photos/seed/${player.id}/100/100`} 
                                      alt={player.name}
                                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white group-hover:text-yellow-400 transition-colors">{player.name}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{player.team_name}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono text-lg font-black text-yellow-400">
                                    {player[category.key as keyof Player] as number || 0}
                                  </div>
                                  {category.isQB && (
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase">
                                      {player.total_pass_completions}/{player.total_pass_attempts} • {cmpPct}%
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Team Rankings / Seeds */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Team Rankings & Seeds</h3>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sorted by Points & Differential</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...teams]
                    .sort((a, b) => b.pts - a.pts || b.pd - a.pd)
                    .map((team, idx) => (
                      <motion.div 
                        key={team.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedTeam(team)}
                        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-yellow-500/50 transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Trophy className="w-24 h-24" />
                        </div>
                        
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-xl font-black text-white border border-zinc-700 group-hover:border-yellow-500/50 transition-all">
                              {team.name[0]}
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">{team.name}</h4>
                              <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">{team.division} Division</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-zinc-800 italic group-hover:text-yellow-500/20 transition-colors">
                              {idx + 1}{idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50 text-center">
                            <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Record</p>
                            <p className="text-sm font-mono text-white font-bold">{team.wins}-{team.losses}</p>
                          </div>
                          <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50 text-center">
                            <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">PTS</p>
                            <p className="text-sm font-mono text-yellow-400 font-bold">{team.pf}</p>
                          </div>
                          <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50 text-center">
                            <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Allowed</p>
                            <p className="text-sm font-mono text-red-400 font-bold">{team.pa}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'standings' && (
            <motion.div
              key="standings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div>
                <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase mb-2">League Standings</h2>
                <p className="text-zinc-500 font-medium">Official tournament rankings and scoring differential.</p>
              </div>

              <div className="space-y-16">
                {['Elite', '16U', '14U'].map((div) => {
                  const divTeams = teams.filter(t => t.division === div);
                  if (divTeams.length === 0) return null;
                  return (
                    <StandingsTable 
                      key={div} 
                      teams={divTeams} 
                      title={div} 
                      onTeamClick={setSelectedTeam} 
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {!isAdmin ? (
                <ManagementAuth onAuthorize={() => setIsAdmin(true)} />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Management Console</h2>
                      <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">
                        Authorized Access
                      </span>
                    </div>
                    <div className="flex gap-2 bg-zinc-900 p-1 rounded-full border border-zinc-800">
                      {(['teams', 'players', 'stats', 'matchups'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setAdminSubTab(tab)}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                            adminSubTab === tab ? "bg-yellow-500 text-black" : "text-zinc-500 hover:text-white"
                          )}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                    {adminSubTab === 'teams' && (
                      <TeamManagement teams={teams} onUpdate={fetchData} />
                    )}
                    {adminSubTab === 'players' && (
                      <PlayerManagement players={players} teams={teams} onUpdate={fetchData} />
                    )}
                    {adminSubTab === 'stats' && (
                      <StatsManagement players={players} onUpdate={fetchData} />
                    )}
                    {adminSubTab === 'matchups' && (
                      <GameManagement teams={teams} games={games} onUpdate={fetchData} />
                    )}
                    <div className="mt-12 border-t border-zinc-800 pt-12">
                      <CoachDashboard onUpdate={fetchData} players={players} />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PlayerRegistration onComplete={() => {
                setActiveTab('stats');
                fetchData();
              }} />
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase mb-2">Tournament Schedule</h2>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-bold uppercase tracking-widest">Saturday, Feb 21</span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Central Park Fields</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2">Field Map & Assignments</h3>
                <FieldMap tournamentType={tournamentType} activeField={games.find(g => g.status === 'live')?.field} />
              </div>

              <div className="max-w-3xl mx-auto space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2">Upcoming & Live Games</h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                  {games.length > 0 ? (
                    games.map((game) => (
                      <GameRow key={game.id} game={game} />
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                      <p className="text-zinc-500 font-medium">No games scheduled for this category yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
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
                <PremiumPaywall onUnlock={() => setIsPremium(true)} />
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
            </motion.div>
          )}

          {activeTab === 'live' && (
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {games.filter(g => g.status === 'live').map((game, i) => (
                  <div key={game.id} className="space-y-4">
                    <div className="aspect-video w-full bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 relative group">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-6">
                          <div className="relative">
                            <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 animate-pulse" />
                            <button className="relative w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform group">
                              <Play className="w-8 h-8 text-black fill-current ml-1" />
                            </button>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">{game.field} Livestream</h3>
                            <p className="text-zinc-500 text-sm">{game.home_team} vs {game.away_team}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute top-6 left-6 flex items-center gap-3">
                        <div className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          Live
                        </div>
                        <div className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded border border-white/10">
                          {Math.floor(Math.random() * 500) + 500} Watching
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
                      <div className="flex-1 text-center">
                        <p className="text-xs font-bold text-zinc-500 uppercase mb-1">{game.home_team}</p>
                        <p className="text-3xl font-mono font-black text-white">{game.home_score}</p>
                      </div>
                      <div className="px-6 border-x border-zinc-800 text-center">
                        <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                          {game.current_down}st & {game.distance}
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">{game.yard_line}</p>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-xs font-bold text-zinc-500 uppercase mb-1">{game.away_team}</p>
                        <p className="text-3xl font-mono font-black text-white">{game.away_score}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-zinc-900/50 rounded-3xl border border-zinc-800 p-8">
                  <h3 className="text-xl font-bold text-white mb-6 italic uppercase tracking-tight">Live Game Feed</h3>
                  <div className="space-y-6">
                    {games.filter(g => g.status === 'live').map(game => (
                      <div key={game.id} className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-500">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                          {game.field} Update
                        </div>
                        <div className="flex gap-4">
                          <span className="text-xs font-mono text-zinc-500 mt-1">14:22</span>
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            <span className="font-bold text-white">{game.possession_team_id === game.home_team_id ? game.home_team : game.away_team}</span> has the ball at the {game.yard_line}. 
                            It's {game.current_down}st down and {game.distance} to go.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800 p-8">
                  <h3 className="text-xl font-bold text-white mb-6 italic uppercase tracking-tight">Field Map</h3>
                  <div className="space-y-6">
                    <FieldMap tournamentType={tournamentType} activeField={games.find(g => g.status === 'live')?.field} />
                    <div className="p-4 bg-zinc-800 rounded-2xl border border-zinc-700">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Active Possession</p>
                      {games.filter(g => g.status === 'live').map(g => (
                        <div key={g.id} className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">{g.field}</span>
                          <span className="font-bold text-yellow-400">{g.possession_team_id === g.home_team_id ? g.home_team : g.away_team}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
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

      {/* Team Modal */}
      <AnimatePresence>
        {selectedTeam && (
          <TeamModal 
            team={selectedTeam} 
            onClose={() => setSelectedTeam(null)} 
            onPlayerClick={(p) => {
              setSelectedTeam(null);
              setSelectedPlayer(p);
            }}
          />
        )}
      </AnimatePresence>

      {/* Player Profile Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <PlayerProfileModal 
            player={selectedPlayer} 
            onClose={() => setSelectedPlayer(null)} 
            isPremium={isPremium}
            onUnlock={() => {
              setIsPremium(true);
              addNotification("Premium Unlocked! Enjoy full media access.");
            }}
          />
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="fixed top-24 right-6 z-[200] space-y-2">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="bg-zinc-900 border border-yellow-500/50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
            >
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <p className="text-sm font-bold text-white">{n.msg}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
