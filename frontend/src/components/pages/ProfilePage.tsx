import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/AuthContext';
import {
  Camera,
  Save,
  User,
  Mail,
  Shield,
  MapPin,
  Ruler,
  Weight,
  Hash,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { cn, formatRole } from '../../lib/utils';
import { API_URL as API } from '../../lib/api';

const POSITIONS = ['QB', 'WR', 'RB', 'TE', 'DB', 'LB', 'DL', 'OL', 'K', 'P', 'ATH'];

export default function ProfilePage() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    position: '',
    height: '',
    weight: '',
    city: '',
    province: '',
    jerseyNumber: '',
    bio: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API}/my/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setForm({
            firstName: data.first_name || data.firstName || '',
            lastName: data.last_name || data.lastName || '',
            position: data.position || '',
            height: data.height || '',
            weight: data.weight || '',
            city: data.city || '',
            province: data.province || '',
            jerseyNumber: data.jersey_number?.toString() || data.jerseyNumber?.toString() || '',
            bio: data.bio || '',
          });
          if (data.photo_url || data.photoUrl) {
            setPhotoPreview(data.photo_url || data.photoUrl);
          }
        }
      } catch (err) {
        // Silently fail — form already has defaults from user context
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [token]);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`${API}/my/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          position: form.position || null,
          height: form.height || null,
          weight: form.weight || null,
          city: form.city || null,
          province: form.province || null,
          jerseyNumber: form.jerseyNumber ? parseInt(form.jerseyNumber) : null,
          photoUrl: photoPreview || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save profile');
      }
      setSaved(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">My Profile</h1>
        <p className="text-zinc-500 mt-1">Set up your player profile</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Photo */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Profile Photo</label>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-zinc-600">
                    <span className="text-2xl font-black text-yellow-500/40">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Upload a photo</p>
              <p className="text-xs text-zinc-500 mt-1">JPG, PNG or WEBP. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Account Info (read-only) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-4">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Account</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Email</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-sm text-zinc-400">
                <Mail className="w-4 h-4 text-zinc-600" />
                {user?.email}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Role</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-sm text-zinc-400">
                <Shield className="w-4 h-4 text-zinc-600" />
                {formatRole(user?.role)}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-4">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Personal Info</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">First Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:border-yellow-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:border-yellow-500/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">City</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                  placeholder="e.g. Toronto"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Province / State</label>
              <input
                type="text"
                value={form.province}
                onChange={(e) => update('province', e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                placeholder="e.g. ON"
              />
            </div>
          </div>
        </div>

        {/* Player Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-4">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Player Details</label>

          {/* Position */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Position</label>
            <div className="flex flex-wrap gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => update('position', pos)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold border transition-all',
                    form.position === pos
                      ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  )}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Height</label>
              <div className="relative">
                <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={form.height}
                  onChange={(e) => update('height', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                  placeholder={`6'0"`}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Weight</label>
              <div className="relative">
                <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={form.weight}
                  onChange={(e) => update('weight', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                  placeholder="180 lbs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Jersey #</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={form.jerseyNumber}
                  onChange={(e) => update('jerseyNumber', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                  placeholder="7"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Status messages */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Profile saved successfully!
          </div>
        )}

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </motion.div>
  );
}
