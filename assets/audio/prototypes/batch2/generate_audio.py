#!/usr/bin/env python3
"""Prime Suspect: original procedural music sketches and SFX. No external samples."""
from pathlib import Path
import json, hashlib, wave, subprocess
import numpy as np
from scipy.signal import butter, sosfilt
SR=48000
ROOT=Path(__file__).resolve().parent
rng=np.random.default_rng(20261025)
records=[]
def hz(m):return 440*2**((m-69)/12)
def tone(m,d,kind='soft',vel=1):
 n=max(1,round(d*SR));t=np.arange(n)/SR;f=hz(m)
 if kind=='piano':
  y=sum(a*np.sin(2*np.pi*f*k*t)*np.exp(-t*(1.7+.8*k)) for k,a in [(1,1),(2,.40),(3,.16),(4,.07),(6,.025)])
  attack=.008
 elif kind=='pad':
  y=(np.sin(2*np.pi*f*t)+.32*np.sin(2*np.pi*(f*1.002)*t)+.12*np.sin(2*np.pi*2*f*t));attack=.16
 elif kind=='bass':
  y=np.sin(2*np.pi*f*t)+.23*np.sin(2*np.pi*2*f*t)+.09*np.sin(2*np.pi*3*f*t);attack=.012
 elif kind=='lead':
  y=sum(np.sin(2*np.pi*f*k*t)/k**1.8 for k in range(1,6));attack=.016
 else:y=np.sin(2*np.pi*f*t)+.08*np.sin(2*np.pi*2*f*t);attack=.008
 a=np.minimum(1,t/attack);r=np.minimum(1,(d-t)/min(.22,d*.35));env=np.clip(a*r,0,1)
 if kind in ('bass','lead','soft'):env*=np.exp(-t/max(d,.1)*1.4)
 return y*env*vel

def noise(d,lo=800,hi=7000):
 y=rng.standard_normal(round(d*SR));return sosfilt(butter(2,[lo,hi],fs=SR,btype='band',output='sos'),y)
def hit(d=.15,kind='tick'):
 t=np.arange(round(d*SR))/SR
 if kind=='kick':y=np.sin(2*np.pi*(72*t+60*.025*(1-np.exp(-t/.025))))*np.exp(-t/0.065)+.04*noise(d,500,2500)*np.exp(-t/.009)
 elif kind=='snare':y=.5*noise(d,700,6500)*np.exp(-t/.045)+.12*np.sin(2*np.pi*180*t)*np.exp(-t/.035)
 elif kind=='hat':y=noise(d,4500,10500)*np.exp(-t/.018)
 else:y=.45*noise(d,900,5000)*np.exp(-t/.009)+.12*np.sin(2*np.pi*1700*t)*np.exp(-t/.012)
 y*=np.minimum(1,t/.0015)*np.minimum(1,(d-t)/.005)
 return y

def add(buf,y,sec,gain=1):
 idx=round(sec*SR)%len(buf);end=idx+len(y)
 if end<=len(buf):buf[idx:end]+=y*gain
 else:
  # All notes shorter than loop.
  k=len(buf)-idx;buf[idx:]+=y[:k]*gain;buf[:len(y)-k]+=y[k:]*gain

def wav_write(path,y):
 pcm=np.round(np.clip(y,-.999,.999)*32767).astype('<i2')
 with wave.open(str(path),'wb') as w:w.setnchannels(1 if y.ndim==1 else y.shape[1]);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
 return pcm

def save(name,y,peak=-8,loop=False,meta=None):
 y=np.asarray(y,dtype=float);y-=y.mean(axis=0)
 if not loop:
  n=min(round(.004*SR),len(y)//3);y[:n]*=np.linspace(0,1,n)[:,None] if y.ndim==2 else np.linspace(0,1,n);y[-n:]*=np.linspace(1,0,n)[:,None] if y.ndim==2 else np.linspace(1,0,n)
 y*=10**(peak/20)/max(np.max(abs(y)),1e-9)
 path=ROOT/(name+'.wav');pcm=wav_write(path,y);dec=pcm.astype(float)/32768
 rec={'id':name,'wav':path.name,'duration_seconds':len(y)/SR,'channels':1 if y.ndim==1 else y.shape[1],'sample_rate':SR,'format':'PCM16','peak_dbfs':float(20*np.log10(np.max(abs(dec)))),'rms_dbfs':float(20*np.log10(np.sqrt(np.mean(dec**2)))),'dc':np.mean(dec,axis=0).tolist(),'clipped_samples':int(np.count_nonzero(abs(pcm.astype(np.int32))>=32767)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'listening_review':'not_performed','loop':loop,**(meta or {})}
 if loop:
  jump=np.max(abs(dec[0]-dec[-1]));diff=np.max(abs(np.diff(dec,axis=0)))
  rec.update(seam_step=float(jump),max_adjacent_step=float(diff),seam_step_dbfs=float(20*np.log10(max(jump,1e-12))))
  ogg=ROOT/(name+'.ogg');subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(path),'-c:a','libvorbis','-q:a','5',str(ogg)],check=True)
  decoded=subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-i',str(ogg),'-f','f32le','-acodec','pcm_f32le','-'])
  od=np.frombuffer(decoded,dtype='<f4').reshape(-1,2)
  rec.update(ogg=ogg.name,ogg_sha256=hashlib.sha256(ogg.read_bytes()).hexdigest(),ogg_decoded_samples=len(od),ogg_seam_step=float(np.max(abs(od[0]-od[-1]))),ogg_decoded_peak_dbfs=float(20*np.log10(np.max(abs(od)))))
 records.append(rec)

# SFX: 10 remaining categories; three light typing variants.
def sfx(name,d,events,peak=-10):
 b=np.zeros(round(d*SR))
 for sec,y,g in events:add(b,y,sec,g)
 save(name,b,peak)
sfx('sfx_factor_computing',.5,[(s,hit(.025),.22) for s in np.arange(.015,.35,.045)]+[(.35,tone(84,.11),.2)],-12)
sfx('sfx_odd_exponent_focus',.26,[(0,tone(79,.23),.3),(.07,tone(86,.15),.08)],-13)
sfx('sfx_prime_lock',.42,[(.01,hit(.08,'snare'),.18),(.025,tone(48,.32,'bass'),.33),(.02,tone(73,.12),.08)],-10)
sfx('sfx_noise_adjust',.38,[(.01,hit(.04),.4),(.045,noise(.14,1100,5000)*np.exp(-np.arange(round(.14*SR))/SR*35),.14),(.16,tone(67,.17),.12)],-11)
for i in range(3):sfx('sfx_text_type'+('' if i==0 else '_v'+str(i+1)),.045,[(0,hit(.04),.15)],-23)
sfx('sfx_statement_lock',.17,[(.005,hit(.035),.3),(.045,tone(76,.09),.13)],-13)
sfx('sfx_damage_suspect',.35,[(.005,hit(.25,'kick'),.5),(.015,hit(.12,'snare'),.17)],-9)
sfx('sfx_penalty_wrong',.42,[(.01,tone(51,.34,'soft'),.28),(.01,tone(52,.34,'soft'),.18),(.01,tone(58,.34,'soft'),.08)],-13)
sfx('sfx_snapshot_match',.36,[(s,hit(.045),.2) for s in [.015,.11,.205]]+[(.22,tone(79,.10),.12)],-13)
sfx('sfx_card_swap',.50,[(.01,noise(.16,550,2600)*np.sin(np.linspace(0,np.pi,round(.16*SR))),.16),(.18,noise(.16,750,3200)*np.sin(np.linspace(0,np.pi,round(.16*SR))),.16),(.32,hit(.055),.25),(.39,hit(.055),.25)],-12)

# Original D-centred chord/motif material, explicitly composed here; no imported melodies.
chords=[[50,57,60,64],[46,53,57,62],[43,50,53,57],[45,52,55,62]]
def music(name,bpm,bars,mode):
 beat=60/bpm;duration=bars*4*beat;b=np.zeros(round(duration*SR))
 for bar in range(bars):
  c=chords[bar%4];start=bar*4*beat
  # Slow chord bed extends across the loop boundary via wrapped accumulation.
  for note in c[1:]:add(b,tone(note+12,4.3*beat,'pad'),start,.022 if mode=='pursuit' else .036)
  if mode=='investigation':
   add(b,tone(c[0],2.8*beat,'bass'),start,.065)
   if bar%2==0:
    add(b,tone(86 if bar%4==0 else 81,.7,'soft'),start+2.25*beat,.05)
   motif=[74,69,72,76] if bar%4<2 else [69,65,67,74]
   if bar%2: 
    for j in [0,2]:add(b,tone(motif[j],.8,'piano'),start+(j+.5)*beat,.055)
  elif mode=='interrogation':
   for k in range(4):
    add(b,hit(.055),start+k*beat,.08 if k%2==0 else .05)
    add(b,tone(c[0] if k%2==0 else c[0]+7,.55*beat,'bass'),start+(k+.5)*beat,.11)
   if bar%2==1:add(b,tone(c[2]+24,.9*beat,'soft'),start+2.5*beat,.035)
  elif mode=='pursuit':
   for k in range(4):
    add(b,hit(.20,'kick'),start+k*beat,.27)
    if k%2:add(b,hit(.17,'snare'),start+k*beat,.20)
    add(b,hit(.065,'hat'),start+(k+.5)*beat,.10)
   # Offbeat harmonic bass and hand-written 8-note motifs, varied across sections.
   for k in range(8):add(b,tone(c[0]+(12 if k in [3,7] else 0),.38*beat,'bass'),start+(k*.5+.125)*beat,.15)
   motifs=[[74,77,76,72,74,81,79,76],[77,74,72,69,74,77,81,79],[79,77,74,72,70,74,77,74],[76,73,69,72,73,76,81,73]]
   if bar%8>=2:
    for k,note in enumerate(motifs[bar%4]):add(b,tone(note,.38*beat,'lead'),start+k*.5*beat,.075 if bar<16 else .095)
  else:
   # Sparse broken voicings, resolving melodic suspensions every four bars.
   for k,note in enumerate(c):add(b,tone(note+12,2.5*beat,'piano'),start+k*.5*beat,.15)
   mel=[[77,76],[74,72],[74,69],[73,74]][bar%4]
   for k,note in enumerate(mel):add(b,tone(note,1.8*beat,'piano'),start+(2+k)*beat,.095)
 # Periodic room reflections preserve wrapped note tails; modest stereo width.
 dry=b.copy();b+=.13*np.roll(dry,round(.173*SR))+.08*np.roll(dry,round(.347*SR))
 left=b+.035*np.roll(dry,round(.009*SR));right=b+.035*np.roll(dry,round(.014*SR))
 save(name,np.stack([left,right],axis=1),-9 if mode=='pursuit' else -12,True,{'bpm':bpm,'bars':bars,'meter':'4/4','key_material':'D minor / modal mixture','composition':'original explicit chord/motif score in generate_audio.py','tail_handling':'periodic wrapped event tails and room delay'})
for args in [('bgm_deep_sea_investigation',72,12,'investigation'),('bgm_interrogation_base',96,16,'interrogation'),('bgm_prime_pursuit',140,24,'pursuit'),('bgm_trick_revealed',72,12,'reveal')]:music(*args)
(ROOT/'VALIDATION.json').write_text(json.dumps({'seed':20261025,'sample_source':'none; generated oscillators, seeded noise, original score','auditioned':False,'assets':records},indent=2))
print(json.dumps([{'id':r['id'],'seconds':r['duration_seconds'],'peak':round(r['peak_dbfs'],2),'seam':r.get('seam_step')} for r in records],indent=2))
