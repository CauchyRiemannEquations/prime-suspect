#!/usr/bin/env python3
"""Original procedural Prime Suspect prototypes. Python 3 + NumPy; no sampled audio."""
from pathlib import Path
import hashlib, json, math, wave
import numpy as np

SR = 48000
ROOT = Path(__file__).resolve().parent
RNG = np.random.default_rng(20261024)

def time(duration):
    return np.arange(round(duration * SR), dtype=np.float64) / SR

def noise(n):
    return RNG.standard_normal(n)

def highpass(x, hz=45):
    a = math.exp(-2 * math.pi * hz / SR)
    y = np.zeros_like(x)
    for i in range(1, len(x)):
        y[i] = a * (y[i-1] + x[i] - x[i-1])
    return y

def soften(x, samples=5):
    return np.convolve(x, np.ones(samples) / samples, mode='same')

def add(dst, src, delay):
    start = round(delay * SR)
    n = min(len(src), len(dst)-start)
    if n > 0:
        dst[start:start+n] += src[:n]

def ring(duration, frequencies, decay=.06):
    t = time(duration)
    y = np.zeros_like(t)
    for k, f in enumerate(frequencies):
        y += (0.7 ** k) * np.sin(2*np.pi*f*t) * np.exp(-t / (decay/(1+.15*k)))
    y *= np.minimum(t/.0015, 1)
    return y

def finish(x, peak_db):
    x = highpass(x)
    # Raised-cosine endpoints prevent sample discontinuity; no dynamics maximizer.
    n = min(round(.006*SR), len(x)//4)
    x[:n] *= .5-.5*np.cos(np.linspace(0,np.pi,n))
    tail = min(round(.045*SR),len(x)//4)
    x[-tail:] *= .5+.5*np.cos(np.linspace(0,np.pi,tail))
    x[0] = x[-1] = 0
    peak = np.max(np.abs(x))
    if peak:
        x *= (10**(peak_db/20))/peak
    return x

def card_swipe():
    t = time(.48)
    x = np.zeros_like(t)
    # Physical latch, textured swipe, second small latch. No real card recording.
    add(x, .23*ring(.10,[740,1631,2840],.018), .025)
    tt=time(.24)
    friction=soften(noise(len(tt)),5)
    envelope=np.sin(np.pi*np.arange(len(tt))/(len(tt)-1))**1.5
    friction *= envelope*(.58+.12*np.sin(2*np.pi*91*tt))
    add(x,.55*friction,.065)
    add(x,.28*ring(.14,[1080,2273,3510],.022),.305)
    return finish(x,-8)

def factor_split():
    t=time(.66)
    x=np.zeros_like(t)
    for onset, fundamental in [(.025,580),(.155,730),(.285,920)]:
        strike=ring(.24,[fundamental,fundamental*2.31,fundamental*3.87],.055)
        tt=time(.035)
        click=soften(noise(len(tt)),3)*np.exp(-tt/.006)
        add(x,.70*strike,onset)
        add(x,.16*click,onset)
    add(x,.16*ring(.19,[460,920],.045),.405)
    return finish(x,-7)

def logic_break():
    t=time(1.35)
    x=np.zeros_like(t)
    # Original inharmonic resonators + noise grains evoke glass; not sampled glass.
    tt=time(.72)
    freq=52+112*np.exp(-tt/.045)
    phase=2*np.pi*np.cumsum(freq)/SR
    impact=np.sin(phase)*np.exp(-tt/.13)
    # Upper harmonic makes impact audible on small phone speakers.
    impact += .30*np.sin(2*phase)*np.exp(-tt/.075)
    impact *= np.minimum(tt/.003,1)
    add(x,1.05*impact,.025)
    burst_t=time(.15)
    burst=soften(noise(len(burst_t)),4)*np.exp(-burst_t/.027)
    add(x,.37*burst,.026)
    for i in range(14):
        onset=.035 + (i/13)**1.45*.35
        f=float(RNG.uniform(1450,5100))
        grain=ring(.65,[f,f*1.417,f*1.913],float(RNG.uniform(.06,.13)))
        add(x,(.13 if i<5 else .075)*grain,onset)
    return finish(x,-7)

def write_wav(name, x):
    pcm=np.rint(np.clip(x,-1,1)*32767).astype('<i2')
    path=ROOT/name
    with wave.open(str(path),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
    return path

def validate(path):
    with wave.open(str(path),'rb') as w:
        params={'sample_rate':w.getframerate(),'channels':w.getnchannels(),'bits':w.getsampwidth()*8,'frames':w.getnframes()}
        y=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
    peak=float(np.max(np.abs(y)));rms=float(np.sqrt(np.mean(y*y)))
    result={**params,'duration_seconds':params['frames']/params['sample_rate'],'peak_dbfs':20*math.log10(peak),'rms_dbfs':20*math.log10(rms),'dc_mean':float(np.mean(y)),'clipped_samples':int(np.sum(np.abs(y)>=32767/32768)),'first_sample':float(y[0]),'last_sample':float(y[-1]),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    assert params['channels']==1 and params['sample_rate']==SR and params['bits']==16
    assert result['clipped_samples']==0 and peak<.51 and abs(result['dc_mean'])<.001
    assert y[0]==0 and y[-1]==0
    return result

def main():
    sounds={'sfx_card_swipe.wav':card_swipe(),'sfx_factor_split_ok.wav':factor_split(),'sfx_logic_break.wav':logic_break()}
    stats={name:validate(write_wav(name,y)) for name,y in sounds.items()}
    sequence=[]
    for y in sounds.values():
        sequence.extend([np.zeros(SR//2),y,np.zeros(SR)])
    preview=np.concatenate(sequence)
    stats['PREVIEW_sequence.wav']=validate(write_wav('PREVIEW_sequence.wav',preview))
    (ROOT/'VALIDATION.json').write_text(json.dumps({'generator':'original deterministic NumPy synthesis','seed':20261024,'auditioned':False,'files':stats},indent=2)+'\n')
    print(json.dumps(stats,indent=2))

if __name__=='__main__':
    main()
