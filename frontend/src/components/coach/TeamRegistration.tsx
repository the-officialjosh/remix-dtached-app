import React, { useState } from 'react';
import { Save, Trophy, MapPin } from 'lucide-react';
import { API_URL as API } from '../../lib/api';

interface Props {
  onComplete: () => void;
}

export default function TeamRegistration({ onComplete }: Props) {
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({
    name: '',
    type: '7v7' as '7v7' | 'Flag',
    division: 'Elite',
    city: '',
    provinceState: '',
    bio: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/teams/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => onComplete(), 1500);
      } else {
        const data = await res.json();
        setError(data.message || data.error || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Team Registered!</h3>
        <p className="text-zinc-400 mt-2">Your team is pending admin approval. You'll get an invite code once approved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Register Your Team</h3>
        <p className="text-xs text-zinc-500 mt-1">Submit your team for admin approval</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Team Name *"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value as '7v7' | 'Flag' })}
            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white"
          >
            <option value="7v7">7v7</option>
            <option value="Flag">Flag Football</option>
          </select>

          <select
            value={form.division}
            onChange={e => setForm({ ...form, division: e.target.value })}
            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white"
          >
            <option value="Elite">Elite</option>
            <option value="16U">16U</option>
            <option value="14U">14U</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-zinc-600" />
            <input
              placeholder="City"
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600"
            />
          </div>
          <input
            placeholder="Province/State"
            value={form.provinceState}
            onChange={e => setForm({ ...form, provinceState: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600"
          />
        </div>

        <textarea
          placeholder="Team bio / description"
          value={form.bio}
          onChange={e => setForm({ ...form, bio: e.target.value })}
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 resize-none"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {submitting ? 'Submitting...' : 'Register Team'}
        </button>
      </form>
    </div>
  );
}
