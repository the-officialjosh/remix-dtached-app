import React, { useState, useRef } from 'react';
import { Camera, Shield, Play, Trophy, Tent } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../lib/LanguageContext';

const PlayerRegistration = ({ onComplete, initialEventType }: { onComplete: () => void; initialEventType?: 'camp' | 'tournament' }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(initialEventType ? 2 : 1);
  const [formData, setFormData] = useState({
    event_type: (initialEventType || '') as '' | 'camp' | 'tournament',
    first_name: '', middle_name: '', last_name: '', dob: '', gender: '', height: '', weight: '', city: '', province_state: '', position: '', photo: '', player_photo: '',
    has_team: false, team_name: '', category: '', number: '', video_url: '', plan_package: '' as '' | '$45' | '$90' | '$100' | 'team_paid' | 'registration_paid',
    jersey_size: '', shorts_size: '', current_program: '',
    order_number: '', purchase_email: '', paid_by: ''
  });
  const [verifying, setVerifying] = useState(false);
  const [videoDragging, setVideoDragging] = useState(false);
  const [videoFileName, setVideoFileName] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const playerPhotoRef = useRef<HTMLInputElement>(null);

  const handleRegister = async () => {
    const res = await fetch('/api/players/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, name: `${formData.first_name} ${formData.middle_name} ${formData.last_name}`.replace(/  +/g, ' ').trim(), linked_user_id: 'current-user-id' })
    });
    const data = await res.json();
    if (data.success) {
      setStep(6);
      // Simulate Face Rec + ID Scan
      setVerifying(true);
      setTimeout(async () => {
        await fetch('/api/players/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player_id: data.playerId })
        });
        setVerifying(false);
        setStep(7);
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
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">{t('reg.select_event')}</h2>
              <p className="text-zinc-500">{t('reg.select_subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button type="button" onClick={() => setFormData({...formData, event_type: 'camp'})} className={cn("relative overflow-hidden rounded-3xl border-2 transition-all aspect-[4/3] group", formData.event_type === 'camp' ? "border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.25)]" : "border-zinc-800 hover:border-zinc-600")}>
                <img src="/camp.png" alt="Camp Retour à l'Origine 2026" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className={cn("absolute inset-0 transition-all", formData.event_type === 'camp' ? "bg-yellow-500/10" : "bg-black/40 group-hover:bg-black/30")} />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <p className="text-lg font-black text-white uppercase tracking-wider drop-shadow-lg">Camp Retour à l'Origine 2026</p>
                </div>
                {formData.event_type === 'camp' && <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center"><svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>}
              </button>
              <button type="button" onClick={() => setFormData({...formData, event_type: 'tournament'})} className={cn("relative overflow-hidden rounded-3xl border-2 transition-all aspect-[4/3] group", formData.event_type === 'tournament' ? "border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.25)]" : "border-zinc-800 hover:border-zinc-600")}>
                <img src="/tournoi.png" alt="Tournoi Dtached 2026" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className={cn("absolute inset-0 transition-all", formData.event_type === 'tournament' ? "bg-yellow-500/10" : "bg-black/40 group-hover:bg-black/30")} />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <p className="text-lg font-black text-white uppercase tracking-wider drop-shadow-lg">Tournoi Dtached 2026</p>
                </div>
                {formData.event_type === 'tournament' && <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center"><svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>}
              </button>
            </div>
            <button onClick={() => setStep(2)} disabled={!formData.event_type} className={cn("w-full py-4 font-black uppercase tracking-widest rounded-2xl transition-all", formData.event_type ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-zinc-800 text-zinc-600 cursor-not-allowed")}>{t('reg.next_step')}</button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step-photos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">{t('reg.photos_title')}</h2>
              <p className="text-zinc-500">{t('reg.photos_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Photo (1:1) */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-bold text-white">{t('reg.profile_photo')} <span className="text-zinc-500 font-normal">({t('reg.profile_photo_ratio')})</span></p>
                  <p className="text-[10px] text-zinc-500 mt-1">{t('reg.profile_photo_desc')}</p>
                </div>
                <div
                  onClick={() => profilePhotoRef.current?.click()}
                  className={cn(
                    "relative aspect-square rounded-full border-2 border-dashed cursor-pointer transition-all overflow-hidden flex items-center justify-center",
                    formData.photo ? "border-yellow-500/30 bg-yellow-500/5" : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                  )}
                >
                  <input
                    ref={profilePhotoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFormData({...formData, photo: URL.createObjectURL(file)});
                    }}
                  />
                  {formData.photo ? (
                    <>
                      <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({...formData, photo: ''}); }} className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-zinc-400 hover:text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors">Remove</button>
                    </>
                  ) : (
                    <div className="text-center space-y-2">
                      <Camera className="w-8 h-8 text-zinc-600 mx-auto" />
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{t('reg.tap_upload')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Player Photo (9:16) */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-bold text-white">{t('reg.player_photo')} <span className="text-zinc-500 font-normal">({t('reg.player_photo_ratio')})</span></p>
                  <p className="text-[10px] text-zinc-500 mt-1">{t('reg.player_photo_desc')}</p>
                </div>
                <div
                  onClick={() => playerPhotoRef.current?.click()}
                  className={cn(
                    "relative aspect-[4/5] rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden flex items-center justify-center",
                    formData.player_photo ? "border-yellow-500/30 bg-yellow-500/5" : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                  )}
                >
                  <input
                    ref={playerPhotoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFormData({...formData, player_photo: URL.createObjectURL(file)});
                    }}
                  />
                  {formData.player_photo ? (
                    <>
                      <img src={formData.player_photo} alt="Player" className="w-full h-full object-cover" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({...formData, player_photo: ''}); }} className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-zinc-400 hover:text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors">Remove</button>
                    </>
                  ) : (
                    <div className="text-center space-y-2">
                      <Camera className="w-8 h-8 text-zinc-600 mx-auto" />
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{t('reg.tap_upload')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 py-4 text-zinc-500 font-bold uppercase">{t('reg.back')}</button>
              <button onClick={() => setStep(formData.event_type === 'camp' ? 5 : 4)} className="flex-[2] py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all">{t('reg.next_step')}</button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
                {formData.event_type === 'camp' ? t('reg.camp_title') : formData.event_type === 'tournament' ? t('reg.tournament_title') : t('reg.player_title')}
              </h2>
              <p className="text-zinc-500">
                {formData.event_type === 'camp' ? t('reg.camp_subtitle') : t('reg.tournament_subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder={t('reg.first_name')} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.first_name || ''} onChange={e => setFormData({...formData, first_name: e.target.value})} />
              <input placeholder={t('reg.middle_name')} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.middle_name || ''} onChange={e => setFormData({...formData, middle_name: e.target.value})} />
              <input placeholder={t('reg.last_name')} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.last_name || ''} onChange={e => setFormData({...formData, last_name: e.target.value})} />
              <input type={formData.dob ? 'date' : 'text'} placeholder={t('reg.dob')} onFocus={e => { e.target.type = 'date'; }} onBlur={e => { if (!e.target.value) e.target.type = 'text'; }} className={cn("bg-zinc-900 border border-zinc-800 p-4 rounded-2xl", formData.dob ? "text-white" : "text-zinc-500")} value={formData.dob || ''} onChange={e => setFormData({...formData, dob: e.target.value})} />
              <select className={cn("bg-zinc-900 border border-zinc-800 p-4 rounded-2xl", formData.gender ? "text-white" : "text-zinc-500")} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="" disabled>{t('reg.gender.select')}</option>
                <option value="Boy">{t('reg.gender.male')}</option>
                <option value="Girl">{t('reg.gender.female')}</option>
              </select>
              <select className={cn("bg-zinc-900 border border-zinc-800 p-4 rounded-2xl", formData.position ? "text-white" : "text-zinc-500")} value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
                <option value="" disabled>{t('reg.position.select')}</option>
                <option value="QB">QB</option>
                <option value="WR">WR</option>
                <option value="RB">RB</option>
                <option value="DB">DB</option>
                <option value="LB">LB</option>
              </select>
              {formData.event_type === 'tournament' && (
                <>
                  <input placeholder="Height (e.g. 6'1'')" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.height || ''} onChange={e => setFormData({...formData, height: e.target.value})} />
                  <input placeholder="Weight (e.g. 185 lbs)" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.weight || ''} onChange={e => setFormData({...formData, weight: e.target.value})} />
                </>
              )}
              {formData.event_type === 'camp' && (
                <>
                  <select className={cn("bg-zinc-900 border border-zinc-800 p-4 rounded-2xl", formData.jersey_size ? "text-white" : "text-zinc-500")} value={formData.jersey_size} onChange={e => setFormData({...formData, jersey_size: e.target.value})}>
                    <option value="" disabled>Jersey Size</option>
                    <option value="YS">Youth Small (YS)</option>
                    <option value="YM">Youth Medium (YM)</option>
                    <option value="YL">Youth Large (YL)</option>
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">X-Large (XL)</option>
                    <option value="2XL">2X-Large (2XL)</option>
                    <option value="3XL">3X-Large (3XL)</option>
                  </select>
                  <select className={cn("bg-zinc-900 border border-zinc-800 p-4 rounded-2xl", formData.shorts_size ? "text-white" : "text-zinc-500")} value={formData.shorts_size} onChange={e => setFormData({...formData, shorts_size: e.target.value})}>
                    <option value="" disabled>Shorts Size</option>
                    <option value="YS">Youth Small (YS)</option>
                    <option value="YM">Youth Medium (YM)</option>
                    <option value="YL">Youth Large (YL)</option>
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">X-Large (XL)</option>
                    <option value="2XL">2X-Large (2XL)</option>
                    <option value="3XL">3X-Large (3XL)</option>
                  </select>
                </>
              )}
              <input placeholder={t('reg.city')} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
              <input placeholder={t('reg.province')} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.province_state || ''} onChange={e => setFormData({...formData, province_state: e.target.value})} />
              {formData.event_type === 'tournament' && (
                <input type="number" placeholder="Jersey Number" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.number || ''} onChange={e => setFormData({...formData, number: e.target.value})} />
              )}
              <input placeholder={t('reg.current_program')} className={cn("bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white", formData.event_type === 'camp' && "md:col-span-2")} value={formData.current_program || ''} onChange={e => setFormData({...formData, current_program: e.target.value})} />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 text-zinc-500 font-bold uppercase">{t('reg.back')}</button>
              <button onClick={() => setStep(3)} className="flex-[2] py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all">{t('reg.next_step')}</button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">{t('reg.team_title')}</h2>
              <p className="text-zinc-500">{t('reg.team_subtitle')}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setFormData({...formData, has_team: true})} className={cn("flex-1 p-6 rounded-3xl border-2 transition-all", formData.has_team ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900")}>
                <p className="text-xl font-bold text-white">{t('reg.has_team')}</p>
              </button>
              <button onClick={() => setFormData({...formData, has_team: false})} className={cn("flex-1 p-6 rounded-3xl border-2 transition-all", !formData.has_team ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900")}>
                <p className="text-xl font-bold text-white">{t('reg.free_agent')}</p>
              </button>
            </div>

            {formData.has_team && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder={t('reg.team_name')} className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.team_name} onChange={e => setFormData({...formData, team_name: e.target.value})} />
                <div>
                  <select className={cn("w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl", formData.category ? "text-white" : "text-zinc-500")} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="" disabled>{t('reg.category.select')}</option>
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
                  <select className={cn("w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl", formData.category ? "text-white" : "text-zinc-500")} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="" disabled>{t('reg.category.select')}</option>
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
              <button onClick={() => setStep(3)} className="flex-1 py-4 text-zinc-500 font-bold uppercase">{t('reg.back')}</button>
              <button onClick={() => setStep(5)} className="flex-[2] py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all">{t('reg.next_step')}</button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">{t('reg.plan_title')}</h2>
              <p className="text-zinc-500">{t('reg.plan_subtitle')}</p>
            </div>

            {formData.event_type === 'camp' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, plan_package: '$100'})}
                    className={cn(
                      "p-5 rounded-3xl border-2 transition-all text-left space-y-2",
                      formData.plan_package === '$100' ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                    )}
                  >
                    <p className="text-2xl font-black text-yellow-400">$100</p>
                    <p className="text-sm font-bold text-white">Camp Registration</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest leading-relaxed">Camp Access + Jersey + Shorts + Gift Bag</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({...formData, plan_package: 'registration_paid'})}
                    className={cn(
                      "p-5 rounded-3xl border-2 transition-all text-left space-y-2",
                      formData.plan_package === 'registration_paid' ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                    )}
                  >
                    <p className="text-2xl font-black text-yellow-400">✓</p>
                    <p className="text-sm font-bold text-white">Registration Paid</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest leading-relaxed">I've already paid for registration</p>
                  </button>
                </div>

                {formData.plan_package === 'registration_paid' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Order # / Access Code" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.order_number || ''} onChange={e => setFormData({...formData, order_number: e.target.value})} />
                      <input type="email" placeholder="Email Used on Purchase" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.purchase_email || ''} onChange={e => setFormData({...formData, purchase_email: e.target.value})} />
                    </div>
                    <p className="text-xs text-zinc-400 italic mt-2">Your registration will be confirmed once verified.</p>
                  </motion.div>
                )}
              </>
            ) : (
              <>
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
              {formData.plan_package === 'team_paid' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <input placeholder="Team Access Code" className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" value={formData.order_number || ''} onChange={e => setFormData({...formData, order_number: e.target.value})} />
                </motion.div>
              )}
              </>
            )}
            <div className="flex gap-4">
              <button onClick={() => setStep(formData.event_type === 'camp' ? 3 : 4)} className="flex-1 py-4 text-zinc-500 font-bold uppercase">{t('reg.back')}</button>
              <button onClick={handleRegister} disabled={!formData.plan_package} className={cn("flex-[2] py-4 font-black uppercase tracking-widest rounded-2xl transition-all", formData.plan_package ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-zinc-800 text-zinc-600 cursor-not-allowed")}>{t('reg.submit')}</button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-12">
            <div className="relative w-48 h-48 mx-auto">
              <div className="absolute inset-0 border-4 border-yellow-500 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-0 border-4 border-yellow-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-16 h-16 text-yellow-500" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">{t('reg.verifying_title')}</h2>
              <p className="text-zinc-500">{t('reg.verifying_subtitle')}</p>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }} className="bg-yellow-500 h-full" />
            </div>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-12">
            <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.4)]">
              <Shield className="w-12 h-12 text-black" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">{t('reg.success_title')}</h2>
              <p className="text-zinc-500">{t('reg.success_subtitle')}</p>
            </div>
            <button onClick={onComplete} className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all">{t('reg.success_done')}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerRegistration;
