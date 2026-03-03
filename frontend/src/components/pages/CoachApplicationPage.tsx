import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/AuthContext';
import {
  ClipboardCheck, Send, CheckCircle, XCircle, Clock,
  User, Mail, Phone, MapPin, Globe, FileText, Trophy, ArrowLeft
} from 'lucide-react';
import { API_URL as API } from '../../lib/api';

interface Props {
  onBack: () => void;
}

export default function CoachApplicationPage({ onBack }: Props) {
  const { user } = useAuth();
  const token = localStorage.getItem('dtached_token');
  const [appStatus, setAppStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    phone: '',
    teamName: '',
    leagueOrOrg: '',
    city: '',
    socialOrWebsite: '',
    notes: '',
  });

  useEffect(() => {
    fetch(`${API}/coach-applications/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : { status: 'NONE' })
      .then(data => {
        setAppStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/coach-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setAppStatus({ status: 'APPLIED' });
      } else {
        const data = await res.json();
        setError(data.message || data.error || 'Failed to submit application');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Already submitted — show status
  if (appStatus && appStatus.status !== 'NONE') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md text-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
            {appStatus.status === 'APPLIED' && (
              <>
                <Clock className="w-16 h-16 text-yellow-500 mx-auto" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Application Submitted</h2>
                <p className="text-sm text-zinc-400">Your application is being reviewed. We'll contact you to verify your team details.</p>
                {appStatus.teamName && (
                  <p className="text-xs text-zinc-500">Team: <strong className="text-white">{appStatus.teamName}</strong></p>
                )}
              </>
            )}
            {appStatus.status === 'UNDER_REVIEW' && (
              <>
                <Clock className="w-16 h-16 text-blue-400 mx-auto" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Under Review</h2>
                <p className="text-sm text-zinc-400">We're verifying your information. You'll be notified once approved.</p>
              </>
            )}
            {appStatus.status === 'APPROVED' && (
              <>
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Approved!</h2>
                <p className="text-sm text-zinc-400">Your coach access has been activated. Please log in again to access your dashboard.</p>
              </>
            )}
            {appStatus.status === 'REJECTED' && (
              <>
                <XCircle className="w-16 h-16 text-red-400 mx-auto" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Application Declined</h2>
                <p className="text-sm text-zinc-400">Unfortunately, your application was not approved at this time.</p>
                {appStatus.adminNotes && (
                  <p className="text-xs text-zinc-500 bg-zinc-800 p-3 rounded-xl">{appStatus.adminNotes}</p>
                )}
              </>
            )}

            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-yellow-500 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to role selection
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Application form
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-3">
            <ClipboardCheck className="w-7 h-7 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Apply as Coach / Team Manager</h1>
          <p className="text-zinc-500 mt-1 text-sm">We'll review your application and contact you to verify your team</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <FormInput icon={User} label="Full Name" value={form.fullName} onChange={v => update('fullName', v)} required />
          <FormInput icon={Mail} label="Email" type="email" value={form.email} onChange={v => update('email', v)} required />
          <FormInput icon={Phone} label="Phone Number" value={form.phone} onChange={v => update('phone', v)} />
          <FormInput icon={Trophy} label="Team Name" value={form.teamName} onChange={v => update('teamName', v)} required placeholder="The team you represent" />
          <FormInput icon={FileText} label="League / Organization" value={form.leagueOrOrg} onChange={v => update('leagueOrOrg', v)} placeholder="e.g. Quebec 7v7 League" />
          <FormInput icon={MapPin} label="City" value={form.city} onChange={v => update('city', v)} />
          <FormInput icon={Globe} label="Social Media / Website" value={form.socialOrWebsite} onChange={v => update('socialOrWebsite', v)} placeholder="Instagram, website, etc." />

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              What do you want to use Dtached for?
            </label>
            <textarea
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 resize-none focus:border-yellow-500/50 focus:outline-none transition-colors"
              placeholder="Brief description of how you plan to use the platform..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-center text-sm text-zinc-500 hover:text-yellow-500 transition-colors"
          >
            ← Back to role selection
          </button>
        </form>
      </div>
    </motion.div>
  );
}

function FormInput({ icon: Icon, label, value, onChange, type = 'text', required, placeholder }: {
  icon: any; label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
}
