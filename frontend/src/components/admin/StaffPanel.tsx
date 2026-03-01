import React, { useState } from 'react';
import { Video, Camera, Link, Upload, Gamepad2 } from 'lucide-react';
import { API_URL as API } from '../../lib/api';
import type { Game } from '../../types';

interface Props {
  games: Game[];
  onUpdate: () => void;
}

export default function StaffPanel({ games, onUpdate }: Props) {
  const token = localStorage.getItem('token');
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Livestream state
  const [selectedGameId, setSelectedGameId] = useState<number | ''>('');
  const [streamUrl, setStreamUrl] = useState('');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [currentDown, setCurrentDown] = useState(1);
  const [yardLine, setYardLine] = useState('');
  const [streamSaved, setStreamSaved] = useState(false);

  // Media upload state
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [mediaPlayerId, setMediaPlayerId] = useState('');
  const [mediaTeamId, setMediaTeamId] = useState('');
  const [mediaSaved, setMediaSaved] = useState(false);

  const handleStreamUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameId) return;
    setStreamSaved(false);
    const res = await fetch(`${API}/staff/games/${selectedGameId}/livestream`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        streamUrl,
        homeScore,
        awayScore,
        currentDown,
        yardLine,
      }),
    });
    if (res.ok) {
      setStreamSaved(true);
      onUpdate();
    }
  };

  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setMediaSaved(false);
    const body: any = { url: mediaUrl, type: mediaType };
    if (mediaPlayerId) body.playerId = parseInt(mediaPlayerId);
    if (mediaTeamId) body.teamId = parseInt(mediaTeamId);

    const res = await fetch(`${API}/staff/media`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setMediaSaved(true);
      setMediaUrl('');
      setMediaPlayerId('');
      setMediaTeamId('');
      onUpdate();
    }
  };

  const selectedGame = games.find(g => g.id === selectedGameId);

  return (
    <div className="space-y-12">
      {/* Livestream Management */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter flex items-center gap-2">
          <Video className="w-5 h-5 text-red-500" /> Livestream & Scores
        </h3>

        <form onSubmit={handleStreamUpdate} className="space-y-4">
          <select
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-sm text-white"
            value={selectedGameId}
            onChange={e => {
              const id = parseInt(e.target.value);
              setSelectedGameId(id || '');
              const game = games.find(g => g.id === id);
              if (game) {
                setStreamUrl(game.stream_url || '');
                setHomeScore(game.home_score || 0);
                setAwayScore(game.away_score || 0);
              }
            }}
            required
          >
            <option value="">Select Game</option>
            {games.map(g => (
              <option key={g.id} value={g.id}>
                {g.home_team} vs {g.away_team} — {g.field} ({g.status})
              </option>
            ))}
          </select>

          {selectedGameId && (
            <>
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <input
                  placeholder="Stream URL (YouTube, Twitch, etc.)"
                  value={streamUrl}
                  onChange={e => setStreamUrl(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">
                    {selectedGame?.home_team || 'Home'} Score
                  </label>
                  <input
                    type="number"
                    value={homeScore}
                    onChange={e => setHomeScore(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">
                    {selectedGame?.away_team || 'Away'} Score
                  </label>
                  <input
                    type="number"
                    value={awayScore}
                    onChange={e => setAwayScore(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Down</label>
                  <select
                    value={currentDown}
                    onChange={e => setCurrentDown(parseInt(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
                  >
                    {[1, 2, 3, 4].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Yard Line</label>
                  <input
                    placeholder="e.g. OPP 35"
                    value={yardLine}
                    onChange={e => setYardLine(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
                  />
                </div>
              </div>

              {streamSaved && <p className="text-green-400 text-sm">Livestream updated!</p>}

              <button
                type="submit"
                className="w-full py-3 bg-red-500 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-5 h-5" /> Update Livestream
              </button>
            </>
          )}
        </form>
      </div>

      {/* Media Upload */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter flex items-center gap-2">
          <Camera className="w-5 h-5 text-yellow-500" /> Upload Media
        </h3>

        <form onSubmit={handleMediaUpload} className="space-y-4">
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <input
              placeholder="Media URL (image or video link)"
              value={mediaUrl}
              onChange={e => setMediaUrl(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <select
              value={mediaType}
              onChange={e => setMediaType(e.target.value as 'photo' | 'video')}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
            <input
              type="number"
              placeholder="Player ID (optional)"
              value={mediaPlayerId}
              onChange={e => setMediaPlayerId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
            />
            <input
              type="number"
              placeholder="Team ID (optional)"
              value={mediaTeamId}
              onChange={e => setMediaTeamId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
            />
          </div>

          {mediaSaved && <p className="text-green-400 text-sm">Media uploaded!</p>}

          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" /> Upload Media
          </button>
        </form>
      </div>
    </div>
  );
}
