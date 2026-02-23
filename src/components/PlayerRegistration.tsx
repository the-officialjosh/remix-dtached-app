import React, { useState, useRef } from 'react';
import { Camera, Shield, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const PlayerRegistration = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', dob: '', gender: 'Boy', height: '', weight: '', city: '', province_state: '', position: 'WR', photo: '',
    has_team: false, team_name: '', category: 'Elite', number: '', video_url: '', plan_package: '' as '' | '$45' | '$90' | 'team_paid'
  });
  const [verifying, setVerifying] = useState(false);
  const [videoDragging, setVideoDragging] = useState(false);
  const [videoFileName, setVideoFileName] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleRegister = async () => {
    const res = await fetch('/api/players/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, linked_user_id: 'current-user-id' })
    });
    const data = await res.json();
    if (data.success) {
      setStep(4);
      // Simulate Face Rec + ID Scan
      setVerifying(true);
      setTimeout(async () => {
        await fetch('/api/players/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player_id: data.playerId })
        });
        setVerifying(false);
        setStep(5);
      }, 3000);
    }
  };

  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) return;
    setVideoFileName(file.name);
    // Create a temporary object URL for preview purposes
    const url = URL.createObjectURL(file);
    setFormData({ ...formData, video_url: url });
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setVideoDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleVideoFile(file);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleVideoFile(file);
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Player Registration</h2>
              <p className="text-zinc-500">Create your official Dtached player profile.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Full Name" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="date" placeholder="Date of Birth" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.dob || ''} onChange={e => setFormData({...formData, dob: e.target.value})} />
              <select className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.gender || 'Boy'} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
              </select>
              <select className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.position || 'WR'} onChange={e => setFormData({...formData, position: e.target.value})}>
                <option value="QB">QB</option>
                <option value="WR">WR</option>
                <option value="RB">RB</option>
                <option value="DB">DB</option>
                <option value="LB">LB</option>
              </select>
              <input placeholder="Height (e.g. 6'1'')" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.height || ''} onChange={e => setFormData({...formData, height: e.target.value})} />
              <input placeholder="Weight (e.g. 185 lbs)" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.weight || ''} onChange={e => setFormData({...formData, weight: e.target.value})} />
              <input placeholder="City" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
              <input placeholder="Province/State" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.province_state || ''} onChange={e => setFormData({...formData, province_state: e.target.value})} />
              <input type="number" placeholder="Jersey Number" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.number || ''} onChange={e => setFormData({...formData, number: e.target.value})} />
            </div>
            <button onClick={() => setStep(2)} className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all">Next Step</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Team Information</h2>
              <p className="text-zinc-500">Are you already part of a team?</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setFormData({...formData, has_team: true})} className={cn("flex-1 p-6 rounded-3xl border-2 transition-all", formData.has_team ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900")}>
                <p className="text-xl font-bold text-white">Yes, I have a team</p>
              </button>
              <button onClick={() => setFormData({...formData, has_team: false})} className={cn("flex-1 p-6 rounded-3xl border-2 transition-all", !formData.has_team ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900")}>
                <p className="text-xl font-bold text-white">No, I'm a free agent</p>
              </button>
            </div>

            {formData.has_team && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Team Name</label>
                  <input placeholder="Team Name" className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.team_name} onChange={e => setFormData({...formData, team_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Category / Division</label>
                  <select className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Elite">Elite</option>
                    <option value="16U">16U</option>
                    <option value="14U">14U</option>
                  </select>
                </div>
              </div>
            )}

            {!formData.has_team && (
              <div className="space-y-4">
                {/* Category dropdown — same as "has team" path */}
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Category / Division</label>
                  <select className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Elite">Elite</option>
                    <option value="16U">16U</option>
                    <option value="14U">14U</option>
                  </select>
                </div>

                {/* Optional video upload */}
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Upload Highlight Video (Optional)</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setVideoDragging(true); }}
                    onDragLeave={() => setVideoDragging(false)}
                    onDrop={handleVideoDrop}
                    onClick={() => videoInputRef.current?.click()}
                    className={cn(
                      "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
                      videoDragging
                        ? "border-yellow-500 bg-yellow-500/10"
                        : formData.video_url
                          ? "border-yellow-500/30 bg-yellow-500/5"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                    )}
                  >
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoSelect}
                    />
                    {formData.video_url ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                          <Play className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white truncate max-w-[200px]">{videoFileName}</p>
                          <p className="text-[10px] text-yellow-500 uppercase font-bold tracking-widest">Video uploaded</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, video_url: '' });
                            setVideoFileName('');
                          }}
                          className="ml-4 text-[10px] text-zinc-500 hover:text-red-400 font-bold uppercase tracking-widest transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto border border-zinc-700">
                          <Play className="w-7 h-7 text-zinc-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-400">Drag & drop your highlight video</p>
                          <p className="text-[10px] text-zinc-600 mt-1">or click to browse • MP4, MOV, WEBM</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Or paste a link */}
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">or</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Paste a Video Link (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=... or Hudl link"
                      className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white placeholder:text-zinc-600"
                      value={formData.video_url.startsWith('blob:') ? '' : formData.video_url}
                      onChange={e => {
                        setFormData({ ...formData, video_url: e.target.value });
                        setVideoFileName('');
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 text-zinc-500 font-bold uppercase">Back</button>
              <button onClick={() => setStep(3)} className="flex-[2] py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all">Next Step</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Pick a Plan</h2>
              <p className="text-zinc-500">Select your registration package to continue.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, plan_package: '$45'})}
                className={cn(
                  "p-5 rounded-3xl border-2 transition-all text-left space-y-2",
                  formData.plan_package === '$45' ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                )}
              >
                <p className="text-2xl font-black text-yellow-400">$45</p>
                <p className="text-sm font-bold text-white">Starter Pack</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest leading-relaxed">Dtached Gloves + Admission</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({...formData, plan_package: '$90'})}
                className={cn(
                  "p-5 rounded-3xl border-2 transition-all text-left space-y-2 relative overflow-hidden",
                  formData.plan_package === '$90' ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                )}
              >
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500 text-black text-[8px] font-black uppercase tracking-widest rounded-full">Best Value</div>
                <p className="text-2xl font-black text-yellow-400">$90</p>
                <p className="text-sm font-bold text-white">Complete Pack</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest leading-relaxed">Team Uniform + Dtached Gloves + Admission</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({...formData, plan_package: 'team_paid'})}
                className={cn(
                  "p-5 rounded-3xl border-2 transition-all text-left space-y-2",
                  formData.plan_package === 'team_paid' ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                )}
              >
                <p className="text-2xl font-black text-yellow-400">✓</p>
                <p className="text-sm font-bold text-white">Team Paid Already</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest leading-relaxed">My team has covered registration</p>
              </button>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 py-4 text-zinc-500 font-bold uppercase">Back</button>
              <button onClick={handleRegister} disabled={!formData.plan_package} className={cn("flex-[2] py-4 font-black uppercase tracking-widest rounded-2xl transition-all", formData.plan_package ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-zinc-800 text-zinc-600 cursor-not-allowed")}>Submit Registration</button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-12">
            <div className="relative w-48 h-48 mx-auto">
              <div className="absolute inset-0 border-4 border-yellow-500 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-0 border-4 border-yellow-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-16 h-16 text-yellow-500" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Biometric Verification</h2>
              <p className="text-zinc-500">Scanning face and ID for official Dtached certification...</p>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }} className="bg-yellow-500 h-full" />
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-12">
            <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.4)]">
              <Shield className="w-12 h-12 text-black" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Verified Successfully!</h2>
              <p className="text-zinc-500">Your Dtached Player Card is now active. {formData.has_team ? "Your coach has been notified to accept you into the roster." : "You are now listed as a verified free agent."}</p>
            </div>
            <button onClick={onComplete} className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all">Go to Profile</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerRegistration;
