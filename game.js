/* Prime Suspect — buildless, offline, no remote services. */
(function () {
  'use strict';
  const C = window.PSCore, cases = window.PS_CASES, assets = window.PS_ASSETS;
  const SAVE_KEY = 'prime-suspect-save-v1';
  const app = document.getElementById('app'), dialog = document.getElementById('dialog');
  const fmt = n => Number(n).toLocaleString('en-US');
  const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    arrow:'M4 12h16m-6-6 6 6-6 6', scan:'M4 8V4h4m8 0h4v4m0 8v4h-4M8 20H4v-4M3 12h18',
    sound:'M4 9h4l5-4v14l-5-4H4zM17 8c3 2 3 6 0 8', mute:'M4 9h4l5-4v14l-5-4H4zM17 9l5 6m0-6-5 6',
    help:'M9 8a3 3 0 0 1 6 0c0 3-3 2-3 5m0 4v.1M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0',
    book:'M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3zM12 6v15', lock:'M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4',
    close:'M6 6l12 12M18 6 6 18', target:'M4 4h5M4 4v5m16-5h-5m5 0v5M4 20h5m-5 0v-5m16 5h-5m5 0v-5M9 12h6m-3-3v6',
    chevron:'m9 5 7 7-7 7', settings:'M12 3v3m0 12v3M3 12h3m12 0h3M6 6l2 2m8 8 2 2M6 18l2-2M16 8l2-2M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    check:'m5 12 4 4L19 6', clue:'M8 3h8l5 5v13H3V3h5m11 6h-5V4M7 13h10M7 17h7'
  };
  const icon = (name, extra='') => `<svg class="icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.target}"/></svg>`;
  function blankCase(i) {
    return { step:0, solved:false, suspect:cases[i].suspects[0].id, speaker:cases[i].suspects[0].id, line:0, opening:0, openingDone:false, matchIndex:0, scanned:[], clues:[], flags:[], evidence:[], claim:'', module:'factor', offsets:{}, assignments:{}, hints:{}, qPerson:cases[i].suspects[0].id, qSnapshot:150, qResult:null, feedback:'', log:[] };
  }
  function initial() { return {version:1,started:false,current:0,unlocked:0,sound:false,cases:cases.map((_,i)=>blankCase(i))}; }
  let storageOK = true, state = initial();
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (saved && saved.version === 1 && Array.isArray(saved.cases) && saved.cases.length === 4) {
      state.started = saved.started === true; state.sound = saved.sound === true;
      state.current = Number.isInteger(saved.current) ? Math.min(3,Math.max(0,saved.current)) : 0;
      state.unlocked = Number.isInteger(saved.unlocked) ? Math.min(3,Math.max(0,saved.unlocked)) : 0;
      state.cases = saved.cases.map((v,i) => {
        const b = blankCase(i);
        if (!v || typeof v !== 'object') return b;
        for (const field of ['scanned','clues','flags','evidence','log']) if (Array.isArray(v[field])) b[field] = v[field].filter(x=>typeof x==='string');
        b.step = Number.isInteger(v.step) ? Math.min(cases[i].steps.length,Math.max(0,v.step)) : 0;
        b.solved = b.step === cases[i].steps.length;
        b.suspect = cases[i].suspects.some(p=>p.id===v.suspect) ? v.suspect : b.suspect;
        b.speaker = cases[i].suspects.some(p=>p.id===v.speaker) ? v.speaker : b.suspect;
        b.line = Number.isInteger(v.line) ? Math.max(0,Math.min(1,v.line)) : Math.max(0,cases[i].suspects.find(p=>p.id===b.speaker).lines.findIndex(l=>l.id===v.claim));
        b.opening = Number.isInteger(v.opening) ? Math.max(0,Math.min(2,v.opening)) : 0;
        b.openingDone = v.openingDone===true || b.step>0 || b.scanned.length>0;
        b.matchIndex = Number.isInteger(v.matchIndex) ? Math.max(0,Math.min(2,v.matchIndex)) : 0;
        b.claim = typeof v.claim === 'string' ? v.claim : '';
        b.module = ['factor','timeline','gcd','swap','offset'].includes(v.module) ? v.module : 'factor';
        b.offsets = Object.fromEntries(cases[i].suspects.map(p=>[p.id,[-1,0,1].includes(v.offsets?.[p.id]) ? v.offsets[p.id] : 0]));
        b.assignments = Object.fromEntries((cases[i].snapshots||[]).map(s=>[s.value,cases[i].suspects.some(p=>p.id===v.assignments?.[s.value]) ? v.assignments[s.value] : '']));
        b.hints = v.hints && typeof v.hints === 'object' ? v.hints : {};
        b.qPerson = cases[i].suspects.some(p=>p.id===v.qPerson) ? v.qPerson : b.qPerson;
        b.qSnapshot = cases[i].snapshots?.some(s=>s.value===v.qSnapshot) ? v.qSnapshot : b.qSnapshot;
        b.qResult = Number.isSafeInteger(v.qResult) && v.qResult>0 ? v.qResult : null;
        return b;
      });
      state.current = Math.min(state.current, unlocked());
    }
  } catch (_) { storageOK = false; }
  function unlocked() { let n=0; while(n<3&&state.cases[n].solved)n++; return Math.max(n,state.unlocked||0); }
  const data = () => cases[state.current];
  const game = () => state.cases[state.current];
  const step = () => data().steps[Math.min(game().step,data().steps.length-1)];
  const person = () => data().suspects.find(p=>p.id===game().suspect) || data().suspects[0];
  const speaker = () => data().suspects.find(p=>p.id===game().speaker) || person();
  const ui = { panel:null, resolution:null };
  function add(list, item) { if (!list.includes(item)) list.push(item); }
  function flag(item) { add(game().flags,item); }
  function save() { try { localStorage.setItem(SAVE_KEY,JSON.stringify(state)); storageOK=true; } catch (_) { storageOK=false; } }
  let toastTimer, flash = '';
  function toast(message) {
    const node=document.getElementById('toast'); node.textContent=message; node.classList.add('visible');
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>node.classList.remove('visible'),3000);
  }
  const media = window.PSMedia.create(assets);
  function sound(kind) { media.effect(kind); }
  function syncMedia() {
    const track = ui.resolution || game().solved ? 'revealed' :
      !state.started || !game().openingDone || ['map','decoder','evidence'].includes(ui.panel) ? 'investigation' :
      game().step > 0 ? 'pursuit' : 'interrogation';
    media.sync(state.sound, track);
  }
  function expression(p) {
    const g=game(), completed=g.log.map(Number).map(i=>data().steps[i]).filter(Boolean);
    if(ui.resolution?.person===p.id)return ui.resolution.expression;
    if(g.solved)return ({han:'breakdown',kang:'breakdown',oh:'defeated',jung:'guilty',baek:'breakdown',park:'averted',yoon:'resolute'})[p.id] || 'relieved';
    if(completed.some(s=>s.type!=='matching'&&s.suspect===p.id))return p.id==='park'?'averted':p.id==='song'?'relieved':'shaken';
    return 'neutral';
  }
  function portraitPath(p, forced) {
    return assets.expressions[p.id]?.[forced || expression(p)] || assets.portraits[p.id];
  }
  function evidenceArt(id, large=false) {
    const path=assets.items[id]; if(!path)return '';
    const label=id==='backup'?'150 · 1,470 · 7,098':id==='aed'?'0%':id==='burntCard'?'1,009':'';
    return `<span class="evidence-art ${large?'large':''}"><img src="${esc(path)}" alt="" loading="lazy" decoding="async">${label?`<span class="asset-data">${label}</span>`:''}</span>`;
  }
  function portrait(p,forceFallback=false,forcedExpression) {
    const n=data().suspects.indexOf(p), unique=`portrait-${p.id}`;
    const svg=`<svg class="person" viewBox="0 0 220 210" aria-hidden="true"><defs><linearGradient id="${unique}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#677e82"/><stop offset=".6" stop-color="#2a3d47"/><stop offset="1" stop-color="#14232d"/></linearGradient></defs><path d="M22 216q3-55 54-65l13-22h42l13 22q49 8 54 65" fill="url(#${unique})"/><path d="m88 144 22 29 23-29-2-18H90z" fill="#354a54"/><path d="M71 70q0-48 39-48t39 48l-6 40q-8 28-33 29t-33-29z" fill="url(#${unique})"/><path d="M70 77q-7-32 9-50 27-29 57-3 22 12 13 53l-9-21q-27 1-44-13-11 17-26 15z" fill="#14232d"/><path d="m87 148 23 25-16 19-15-40m54-4-23 25 16 19 15-40" fill="#1c303a"/><path d="m108 174-4 36h13l-5-36" fill="#5d726b"/>${n===1?'<path d="M77 78h26v15H78zm40 0h26v15h-26zm-14 5h14" stroke="#8c9da1" fill="none"/>':''}</svg>`;
    const source=portraitPath(p,forcedExpression),hasAsset=source&&!forceFallback;
    return `<div class="portrait-stage"><div class="crosshair"></div><span class="portrait-id">SUBJECT 0${n+1} / INTERROGATION</span>${hasAsset?`<img class="portrait-asset" src="${esc(source)}" alt="${p.name}의 초상" decoding="async" data-fallback="${p.id}">`:svg}<span class="placeholder-label">${hasAsset?'':'VISUAL SIGNAL LOST'}</span><div class="person-name"><strong>${p.name}</strong><small>${p.role}</small></div><span class="emotion"><i class="status-dot"></i>${p.tone}</span></div>`;
  }
  function evidenceItems() {
    const c=data(),g=game();
    const items=c.clues.filter(x=>g.clues.includes(x.id)).map(x=>({...x,source:'현장'}));
    function push(id,title,short,text) { items.push({id,title,short,text,source:'분석'}); }
    if(c.id===1) {
      if(g.scanned.includes('park'))push('missing5','5 기록 없음','박진우 · 1,764','2² × 3² × 7². 약품 보관실의 소인수 5는 기록되어 있지 않다.');
      if(g.scanned.includes('han'))push('odd-pair','홀수 지수 쌍','한도윤 · 5¹ × 13¹','한도윤은 약품실과 소장실 게이트를 각각 한 번씩만 통과했다. 정상 왕복이라면 두 지수 모두 짝수여야 한다.');
    }
    if(c.id===2&&g.flags.includes('matched'))push('snapshot7098','강현우의 21:05 기록','7,098 = 2 × 3 × 7 × 13²','약수 소거로 주인이 확정된 스냅샷. 13번 왕복은 이미 끝났고, 7번 세척실에는 아직 들어가 있는 상태다.');
    if(c.id===3) {
      if(g.flags.includes('both-scanned'))push('cross-odd','공통 홀수 지수 쌍','두 카드 모두 3¹ × 5¹','각자 자신의 복도만 통과할 수 있는데, 두 카드 모두 서로 다른 복도의 홀수 지수를 가진다.');
      if(g.flags.includes('gcd'))push('gcd','공통 기록 2,940','2² × 3¹ × 5¹ × 7²','최대공약수로 얻은 공통 기록. 로비 외에 내부에서 온전한 왕복 기록을 공유하는 방은 7번 라운지다. 지도와 권한을 함께 확인해야 한다.');
      if(g.flags.includes('swap'))push('restored-oh','복원된 오민석 기록','298,116 · 금고실 13²','오민석의 진입 기록에 오민석의 퇴실 경로를 붙이면 2² × 3² × 7² × 13². 정하늘은 2² × 5² × 7² × 11² = 592,900이다.');
    }
    if(c.id===4) {
      if(g.flags.includes('corrected-song'))push('corrected-song','복구된 1,764','송지훈 · +1 보정','1,763 + 1 = 2² × 3² × 7². 코어 제어실에 정상적으로 들어갔다 나온 기록이다.');
      if(g.flags.includes('corrected-baek')) {push('corrected-baek','복구된 1,008','백도현 · −1 보정','1,009 − 1 = 2⁴ × 3² × 7¹. 제세동기 충격 직전의 원래 출입 기록이다.');push('lobby-four','로비 4회 통과','백도현 · 2⁴','로비 게이트 네 번 통과. 경비원의 목격은 한 차례 퇴근만 입증한다. 재침입 여부와 해치의 실제 출구를 대조해야 한다.');}
    }
    return items;
  }
  function factorHTML(value,buttons=true) {
    return C.factor(value).map(({p,k})=>{const known=data().rooms.some(r=>r.p===p),tag=buttons?'button':'span';return `<${tag} class="factor-chip ${k%2?'odd':''} ${!known?'unknown':''}" ${buttons?`data-action="factor" data-value="${p}" aria-label="소인수 ${p}, 지수 ${k}, ${!known?'미등록 소수':k%2?'홀수':'짝수'}"`:''}><span>${p}<sup>${k}</sup></span><small>${!known?'미등록':k%2?'홀수':'짝수'}</small></${tag}>`;}).join('') || '<span class="muted">1 · 출입 기록 없음</span>';
  }
  function factors() {
    const c=data(),g=game(),p=person();
    if(!g.scanned.includes(p.id))return `<div class="factor-output"><div class="factor-empty">${icon('scan')} 카드를 스캔해 출입 기록을 분해하세요.</div></div>`;
    return `<div class="factor-output ${flash==='scan'?'scan-flash':''}"><div class="output-label"><span>PRIME FACTORIZATION</span><span>${C.factor(p.card).length} FACTORS</span></div><div class="factor-row">${factorHTML(p.card)}</div><p class="factor-note">${c.id===4&&p.id==='baek'?'단일 소수 · 등록된 게이트와 일치하지 않습니다.':c.id===4&&p.id==='song'?'미등록 소수 경고 · 전자기 노이즈를 확인하세요.':'블록을 눌러 기록의 의미를 확인하세요.'}</p>${c.id===1&&p.id==='park'?'<button class="factor-action" data-action="evidence" data-value="missing5">＋ 약품 보관실의 5 기록 없음</button>':''}${c.id===1&&p.id==='han'?'<button class="factor-action" data-action="evidence" data-value="odd-pair">＋ 5¹ × 13¹ 홀수 지수 쌍 선택</button>':''}${c.id===3&&g.flags.includes('both-scanned')?'<button class="factor-action" data-action="evidence" data-value="cross-odd">＋ 공통 3¹ × 5¹ 기록 선택</button>':''}${c.id===1&&g.flags.includes('comparison')?'<div class="mini-comparison"><span>대조군 / 최유리 <b>5² · 13²</b></span><span>조사 대상 / 한도윤 <span class="red-text mono">5¹ · 13¹</span></span></div>':''}</div>`;
  }
  function gcdPanel() {
    const g=game();
    return `<div class="tool-panel"><p class="tool-description">두 카드의 공통 소인수를 추출합니다. 공통 기록의 의미는 지도 및 출입 권한과 함께 해석하세요.</p><div class="snapshot-row"><span class="muted">오민석</span><span class="mono">355,740</span></div><div class="snapshot-row"><span class="muted">정하늘</span><span class="mono">496,860</span></div><button class="primary tool-button" data-action="gcd">공통 흔적 스캔 ${icon('scan')}</button>${g.flags.includes('gcd')?`<div class="math-result">gcd = ${fmt(C.gcd(355740,496860))}<div class="factor-row" style="margin-top:12px">${factorHTML(2940,false)}</div><small>7²는 내부 구역의 공통 왕복 기록.<br>유일한 접선 구역을 지도에서 조사하세요.</small></div>`:'<p class="factor-note">두 카드를 먼저 스캔해야 합니다.</p>'}</div>`;
  }
  function swapPanel() {
    const done=game().flags.includes('swap'), values=C.restore(355740,42,496860,70);
    return `<div class="tool-panel"><p class="tool-description">라운지까지의 진입 기록은 그대로 두고, 이후 퇴실 블록을 맞교환하세요. 드래그하거나 아래 버튼을 사용할 수 있습니다.</p><div class="swap-card" data-drop="A"><p>${done?'정하늘의 실제 동선':'기록 A · 오민석이 제출한 카드'}</p><span class="prefix">2 × 5 × 11² × 7</span><button class="exit-block" ${!done?'draggable="true"':''} data-drag="A" data-action="swap-select" aria-label="기록 A 퇴실 블록">${done?'7 × 5 × 2':'7 × 3 × 2'} <small>퇴실</small></button>${done?`<div class="math-result">${fmt(values[0])}<small>2² × 5² × 7² × 11²</small></div>`:''}</div><div class="swap-arrow">⇅</div><div class="swap-card" data-drop="B"><p>${done?'오민석의 실제 동선':'기록 B · 정하늘이 제출한 카드'}</p><span class="prefix">2 × 3 × 13² × 7</span><button class="exit-block" ${!done?'draggable="true"':''} data-drag="B" data-action="swap-select" aria-label="기록 B 퇴실 블록">${done?'7 × 3 × 2':'7 × 5 × 2'} <small>퇴실</small></button>${done?`<div class="math-result">${fmt(values[1])}<small>2² × 3² × 7² × 13² · 금고 방문</small></div>`:''}</div><button class="${done?'secondary':'primary'} tool-button" data-action="swap" ${done?'disabled':''}>${done?'✓ 경로 복원 완료':'퇴실 기록 맞교환'}</button></div>`;
  }
  function offsetPanel() {
    const g=game(),p=person(),offset=g.offsets[p.id]||0,value=p.card+offset;
    return `<div class="tool-panel"><p class="tool-description">스캔 값에 보정을 적용합니다. 같은 원본 카드에 대한 보정이며, 누를 때마다 누적되지 않습니다.</p><div class="offset-controls" role="group" aria-label="오차 보정">${[-1,0,1].map(n=>`<button data-action="offset" data-value="${n}" class="${offset===n?'active':''}" aria-pressed="${offset===n}">${n>0?'+1':n===0?'원본':'−1'}</button>`).join('')}</div>${g.scanned.includes(p.id)?`<div class="offset-equation ${flash==='offset'?'spark':''}">${fmt(p.card)} ${offset===0?'→ 원본':`${offset>0?'+':'−'} 1 = <span class="lime-text">${fmt(value)}</span>`}</div><div class="factor-row">${factorHTML(value)}</div><p class="factor-note">${p.id==='baek'&&offset===-1?'복원 성공 · 로비 4회, 홀 왕복, 코어 편도 진입.':p.id==='song'&&offset===1?'복원 성공 · 제어실의 정상 왕복 기록.':offset===0?'현장 단서를 확인하고 보정 방향을 선택하세요.':'보정 결과가 현장 게이트와 일치하는지 확인하세요.'}</p>${p.id==='baek'&&offset===-1?'<button class="factor-action" data-action="evidence" data-value="lobby-four">＋ 2⁴ · 로비 4회 통과 기록 선택</button>':''}`:'<div class="factor-empty">카드를 먼저 스캔하세요.</div>'}</div>`;
  }
  const openings = [
    ['수심 1,000m. 폭풍이 연구소를 바다 밑에 가뒀다.', '22:00. 소장실에서 시신이 발견됐다.', '서버는 사라졌다. 하지만 주머니 속 카드는 남았다.'],
    ['21:00. 독성 실험실에서 윤 박사가 사망했다.', '누군가 실험실을 나와 세척실에서 시약을 씻었다.', '정전 순간의 숫자 세 개. 이번에는 시간을 되찾아야 한다.'],
    ['양자 칩이 사라졌다. 당직 주임은 돌아오지 못했다.', '갈 수 있는 사람에게 기록이 없고, 갈 수 없는 사람에게 기록이 있다.', '카드는 거짓말하지 않는다. 그렇다면, 누가 카드를 들고 있었을까.'],
    ['코어 냉각 제어실이 봉쇄됐다. 자폭 레버가 작동했다.', '총괄 이사의 카드에 남은 숫자는 1,009. 단 하나의 소수.', '완벽한 알리바이에도, 하나의 오차는 있다.']
  ];
  function header() {
    const c=data();
    return `<header class="scene-header" ${ui.panel?'inert':''}><button class="scene-brand" data-action="home" aria-label="프라임 서스펙트 홈"><span class="brand-symbol">p</span><span>PRIME SUSPECT</span></button>${state.started?`<button class="chapter-button" data-action="panel" data-value="cases"><span class="mono">CASE 0${c.id}</span><span>${c.title}</span><span class="chapter-dots">•••</span></button>`:'<span class="depth-label">ARCHIMEDES LAB / −1,000m</span>'}<div class="scene-header-actions"><button class="icon-button" data-action="sound" aria-label="${state.sound?'사운드 끄기':'사운드 켜기'}" aria-pressed="${state.sound}">${icon(state.sound?'sound':'mute')}</button><button class="icon-button" data-action="settings" aria-label="설정">${icon('settings')}</button></div></header>`;
  }
  function roomArt() {
    const background=state.started?assets.backgrounds[data().id]:assets.backgrounds.title;
    return `<div class="room-art" aria-hidden="true">${background?`<img class="scene-background" src="${esc(background)}" alt="" decoding="async" fetchpriority="high">`:""}<div class="ceiling-light"></div><div class="light-cone"></div><div class="wall-panel left-wall"></div><div class="wall-panel right-wall"></div><div class="scene-door"><span>${data().id===4?'07':'13'}</span><i></i></div><div class="wall-vent"></div><div class="room-console"><i></i><i></i><i></i></div><div class="floor-grid"></div><div class="room-vignette"></div></div>`;
  }
  function landing() {
    const progress=state.cases.some(c=>c.scanned.length||c.step);
    return `<div class="focus-game title-screen">${header()}<main class="title-stage">${roomArt()}<div class="title-copy"><p class="title-kicker">수심 1,000m. 숫자만이 진실을 기억한다.</p><h1>PRIME<br><span>SUSPECT</span></h1><p class="title-korean">유일한 흔적</p><button class="primary title-start" data-action="start">${progress?'수사를 이어간다':'수사를 시작한다'} ${icon('arrow')}</button><button class="title-guide" data-action="help">처음 수사하나요?</button></div><div class="title-bottom"><span>수학 추리 어드벤처</span><span>${storageOK?'진행은 자동으로 저장됩니다':'자동 저장을 사용할 수 없습니다'}</span></div></main></div>`;
  }
  function currentLine() {
    const p=speaker(),g=game();g.line=Math.min(g.line,p.lines.length-1);return p.lines[g.line];
  }
  function heldText() {
    const g=game(),c=data();
    return c.suspects.flatMap(p=>p.lines).find(l=>l.id===g.claim)?.text || step().options?.find(o=>o.id===g.claim)?.text || '';
  }
  function dialogue() {
    const c=data(),g=game(),s=step(),p=speaker(),line=currentLine(),held=!!g.claim;
    const deduction=s.options&&!g.solved;
    const rebuttal=c.id===1?'문으로 안 나왔다면, 내가 벽이라도 통과했단 말이오?':c.id===3?'카드가 바뀌었다 한들, 누가 금고에 갔다는 거요?':'경비원이 내가 퇴근하는 걸 봤소. 그건 어떻게 설명할 거요?';
    const text=deduction?(heldText()||rebuttal):line.text;
    return `<section class="dialogue-box ${held?'is-held':''}" aria-label="현재 증언"><div class="dialogue-name"><span>${deduction&&held?'당신의 추리':p.name}</span><small>${deduction&&held?'경로 재구성':p.role}</small><span class="speech-count">${deduction?'최종 추리':`${g.line+1} / ${p.lines.length}`}</span></div><p class="dialogue-text" id="current-speech">${text}</p><div class="dialogue-controls"><div class="dialogue-left">${!deduction?`<button class="speech-prev" data-action="speech-prev" aria-label="이전 증언" ${g.line===0||held?'disabled':''}>←</button><button class="speaker-change" data-action="panel" data-value="suspects">${icon('target')} 심문 대상</button>`:'<span class="deduction-label">이제, 동선을 설명할 차례다.</span>'}</div><div class="dialogue-right">${s.type==='matching'?'<button class="primary" data-action="start-matching">스냅샷을 확인한다 →</button>':deduction?`<button class="${held?'secondary':'primary'}" data-action="panel" data-value="deduction">${held?'추리 바꾸기':'동선을 재구성한다'} ${held?'':'→'}</button>${held?'<button class="primary" data-action="panel" data-value="evidence">증거를 제시한다 →</button>':''}`:held?'<button class="resume-button" data-action="resume">증언을 계속 듣는다</button><button class="primary" data-action="panel" data-value="evidence">증거를 고른다 →</button>':`<button class="hold-button" data-action="hold">잠깐.</button><button class="primary speech-next" data-action="speech-next">${g.line<p.lines.length-1?'다음 증언':'다시 듣기'} ${icon('chevron')}</button>`}</div></div>${held?'<div class="held-mark">증언을 멈춰 세웠습니다. 도구를 열어 모순을 찾으세요.</div>':''}</section>`;
  }
  function scene() {
    const c=data(),g=game(),p=speaker();
    if(!g.openingDone)return `<main class="scene-stage opening-stage" ${ui.panel?'inert':''}>${roomArt()}<div class="opening-copy"><span class="eyebrow">CASE 0${c.id} · ${c.time}</span><h1>${openings[state.current][g.opening]}</h1><div class="opening-progress">${openings[state.current].map((_,i)=>`<i class="${i<=g.opening?'active':''}"></i>`).join('')}</div><button class="primary" data-action="opening-next">${g.opening===2?'첫 증언을 듣는다':'계속'} ${icon('arrow')}</button></div><span class="scene-location">${c.location}</span></main>`;
    if(g.solved)return `<main class="scene-stage closed-stage" ${ui.panel?'inert':''}>${roomArt()}<div class="closed-copy"><span class="eyebrow">CASE 0${c.id} · CLOSED</span><span class="closed-symbol">∎</span><h1>${c.title}</h1><p>이번 사건의 흔적을 모두 연결했습니다.</p><div class="closed-actions"><button class="secondary" data-action="replay">다시 수사</button><button class="primary" data-action="${c.id<4?'next-case':'ending'}">${c.id<4?'다음 사건':'마지막 기록'} ${icon('arrow')}</button></div><button class="title-guide" data-action="notebook">해결 기록 읽기</button></div></main>`;
    return `<main class="scene-stage" ${ui.panel?'inert':''}>${roomArt()}<div class="scene-location"><span>${c.location.split(' · ')[0]}</span><i></i><span>${c.time}</span></div><div class="scene-caption"><span class="caption-line"></span><span>INTERROGATION</span><span class="caption-number">0${c.suspects.indexOf(p)+1}</span></div><div class="scene-figure ${g.claim?'figure-held':''}">${portrait(p)}</div>${dialogue()}<nav class="investigation-dock" aria-label="수사 도구"><button data-action="panel" data-value="map">${icon('clue')}<span>현장 조사</span></button><button data-action="panel" data-value="decoder">${icon('scan')}<span>팩터 디코더</span></button><button data-action="panel" data-value="evidence">${icon('book')}<span>증거</span>${evidenceItems().length?`<b>${evidenceItems().length}</b>`:''}</button><span class="dock-spacer"></span><button class="dock-hint" data-action="hint">${icon('help')}<span>막혔을 때</span></button></nav></main>`;
  }
  function mapPanel() {
    const c=data(),g=game(),roomBy=p=>c.rooms.find(r=>r.p===p);
    const line=(a,b,special=false)=>{const r=roomBy(a),q=roomBy(b);return `<path class="${special?'special-line':''}" d="M${r.x} ${r.y} ${special?'Q'+(r.x+20)+' '+((r.y+q.y)/2):'L'} ${q.x} ${q.y}"/>`;};
    return `<section class="scene-map" aria-label="현장 지도"><p class="tool-lead">조사할 방을 선택하세요.</p><div class="map case-${c.id}"><svg class="connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${c.edges.map(e=>line(...e)).join('')}${c.special&&g.clues.includes(c.special.clue)?line(c.special.from,c.special.to,true):''}</svg>${c.rooms.map(r=>`<button class="room ${r.crime?'crime':''} ${g.clues.includes(r.clue)?'discovered':''}" style="left:${r.x}%;top:${r.y}%" data-action="room" data-value="${r.p}" aria-label="게이트 ${r.p}, ${r.name}${r.crime?', 범행 현장':''}"><span class="room-number"><img src="assets/ui-kit/assets/ui_map_node_prime_${r.p}_${g.clues.includes(r.clue)?'active':r.crime?'attention':'default'}.svg" alt="" width="48" height="48"><span class="map-value">${r.p}</span></span><span class="room-name">${r.name}</span>${r.crime?'<span class="crime-caption">범행 현장</span>':''}</button>`).join('')}${c.special&&g.clues.includes(c.special.clue)?`<button class="special-button" data-action="clue" data-value="${c.special.clue}">${c.special.label}</button>`:''}</div><p class="map-instruction"><i class="legend-square crime"></i> 범행 현장 <i class="legend-square clue"></i> 조사 완료</p></section>`;
  }
  function cardPicker() {
    const c=data(),g=game();
    return `<div class="card-picker" aria-label="분석할 카드">${c.suspects.map(p=>`<button class="card-pick ${g.suspect===p.id?'active':''}" data-action="inspect-card" data-value="${p.id}" aria-pressed="${g.suspect===p.id}"><span>${p.name}</span><strong>${fmt(p.card)}</strong><small>${g.scanned.includes(p.id)?'분석 완료':'미확인'}</small></button>`).join('')}</div>`;
  }
  function timeline() {
    const c=data(),g=game();
    if(!g.clues.includes('backup'))return '<div class="tool-empty"><span class="large-tool-symbol">◷</span><h3>정전 순간의 기록이 필요하다.</h3><button class="primary" data-action="room" data-value="3">백업 장치를 조사한다 →</button></div>';
    if(!c.suspects.every(p=>g.scanned.includes(p.id)))return '<div class="tool-empty"><span class="large-tool-symbol">◷</span><h3>세 장의 최종 카드와 비교한다.</h3><button class="primary" data-action="scan-all">세 카드 분석하기 →</button></div>';
    if(!g.flags.includes('matched')){
      const snapshot=c.snapshots[g.matchIndex],assignment=g.assignments[snapshot.value];
      return `<div class="timeline-task"><div class="snapshot-heading"><span>21:05 · 익명 스냅샷</span><span>${g.matchIndex+1} / 3</span></div><div class="snapshot-large">${fmt(snapshot.value)}</div><div class="factor-row">${factorHTML(snapshot.value,false)}</div><h3>이 기록은 누구의 카드였을까?</h3><div class="assignment-choices">${c.suspects.map(p=>`<button class="assignment-choice ${assignment===p.id?'selected':''}" data-action="assign-snapshot" data-value="${p.id}" aria-pressed="${assignment===p.id}"><span>${p.name}</span><strong>${fmt(p.card)}</strong>${assignment===p.id?icon('check'):''}</button>`).join('')}</div><details class="divisor-help"><summary>이 스냅샷으로 약수 검사</summary><div>${c.suspects.map(p=>`<span>${p.name} <b class="${C.quotient(p.card,snapshot.value)!==null?'blue-text':'red-text'}">${C.quotient(p.card,snapshot.value)!==null?'나누어떨어짐':'불가'}</b></span>`).join('')}</div></details><div class="snapshot-navigation"><button class="secondary" data-action="snapshot-prev" ${g.matchIndex===0?'disabled':''}>이전</button><button class="primary" data-action="${g.matchIndex<2?'snapshot-next':'matching'}" ${!assignment?'disabled':''}>${g.matchIndex<2?'다음 기록 →':'매칭을 검증한다 →'}</button></div><div class="assignment-summary">${c.snapshots.map((s,i)=>`<button data-action="snapshot-page" data-value="${i}" class="${g.matchIndex===i?'active':''}"><span>${fmt(s.value)}</span><b>${c.suspects.find(p=>p.id===g.assignments[s.value])?.name||'미배정'}</b></button>`).join('')}</div></div>`;
    }
    const p=c.suspects.find(p=>p.id===g.qPerson)||person();
    return `<div class="quotient-task"><p class="tool-lead">정전 이후에 어디로 갔을까?</p>${cardPicker()}<div class="quotient-equation"><strong>${fmt(p.card)}</strong><span>÷</span><strong>${fmt(g.qSnapshot)}</strong><small>최종 카드 / 21:05 스냅샷</small></div><button class="primary tool-button" data-action="quotient">이후 기록 추출 ${icon('arrow')}</button>${g.qResult?`<div class="quotient-result"><span class="eyebrow">21:05 이후</span><strong>${fmt(g.qResult)}</strong><div class="factor-row">${factorHTML(g.qResult,false)}</div></div>`:''}</div>`;
  }
  function decoder() {
    const c=data(),g=game(),p=person(),modules=[['factor','소인수']];
    if(c.id===2)modules.push(['timeline','시간차']);
    if(c.id===3)modules.push(['gcd','공약수'],['swap','스왑']);
    if(c.id===4)modules.push(['offset','±1 보정']);
    if(!modules.some(m=>m[0]===g.module))g.module='factor';
    const individual=['factor','offset'].includes(g.module);
    return `<section class="focused-decoder" aria-label="팩터 디코더"><div class="decoder-tabs" role="tablist" aria-label="디코더 모듈">${modules.map(([id,label])=>`<button class="decoder-tab ${id===g.module?'active':''}" data-action="module" data-value="${id}" role="tab" aria-selected="${id===g.module}">${label}</button>`).join('')}</div>${individual?`${cardPicker()}<div class="focus-card-slot">${evidenceArt(c.id===4&&p.id==='baek'?'burntCard':'card')}<span class="eyebrow">${p.name}의 마그네틱 키카드</span><strong>${fmt(p.card)}</strong>${!g.scanned.includes(p.id)?'<button class="primary" data-action="scan" id="scan-button">카드를 스캔한다 →</button>':'<span class="scan-complete">✓ 분석 완료</span>'}</div>`:''}<div class="focused-tool">${{factor:factors,timeline:timeline,gcd:gcdPanel,swap:swapPanel,offset:offsetPanel}[g.module]()}</div>${evidenceItems().length&&step().type!=='matching'?'<button class="evidence-shortcut" data-action="panel" data-value="evidence">분석한 기록을 증거로 제시하기 →</button>':''}</section>`;
  }
  function evidencePanel() {
    const c=data(),g=game(),s=step(),items=evidenceItems(),held=heldText();
    if(s.type==='matching'&&!g.solved)return '<div class="tool-empty"><span class="large-tool-symbol">◷</span><h3>먼저 익명 기록의 주인을 찾자.</h3><button class="primary" data-action="start-matching">스냅샷 분석하기 →</button></div>';
    return `<section class="focused-evidence" aria-label="증거 제시">${held?`<blockquote class="held-quote"><small>반박할 ${s.options?'추리':'증언'}</small><p>“${held}”</p></blockquote>`:'<p class="tool-lead">증언을 듣고 「잠깐」으로 멈춰 세우세요.</p>'}${items.length?`<div class="evidence-grid">${items.map(e=>`<div class="evidence-tile ${g.evidence.includes(e.id)?'selected':''}"><button class="evidence-pick" data-action="evidence" data-value="${e.id}" aria-pressed="${g.evidence.includes(e.id)}"><span class="evidence-icon">${evidenceArt(e.id)||icon(e.source==='현장'?'clue':'scan')}</span><strong>${e.title}</strong><small>${e.short}</small><i>${g.evidence.includes(e.id)?'✓':'＋'}</i></button><button class="evidence-detail" data-action="evidence-info" data-value="${e.id}" aria-label="${e.title} 상세">상세</button></div>`).join('')}</div>`:'<div class="evidence-empty"><span class="large-tool-symbol">?</span><h3>아직 연결할 증거가 없다.</h3><p>카드를 분석하거나 현장을 조사해 보자.</p><div><button class="secondary" data-action="panel" data-value="map">현장 조사</button><button class="primary" data-action="panel" data-value="decoder">카드 분석</button></div></div>'}${g.feedback?`<p class="proof-feedback" role="alert">${g.feedback}</p>`:''}<div class="evidence-submit"><span>${g.solved?'해결한 사건':`증거 <b>${g.evidence.length}</b> / ${s.evidence.length}`}</span>${g.solved?'<button class="secondary" data-action="notebook">해결 기록 보기</button>':held?`<button class="primary" data-action="present" id="proof-button" ${g.evidence.length!==s.evidence.length?'disabled':''} aria-label="모순 제시!"> <span class="proof-label">모순 제시!</span></button>`:'<button class="primary" data-action="panel-close">증언을 들으러 간다 →</button>'}</div></section>`;
  }
  function peoplePanel() {
    return `<div class="people-grid">${data().suspects.map(p=>`<button class="person-choice ${speaker().id===p.id?'active':''}" data-action="speaker" data-value="${p.id}">${portrait(p)}<strong>${p.name}</strong><small>${p.role}</small><span>증언을 듣는다 →</span></button>`).join('')}</div>`;
  }
  function archivePanel() {
    return `<div class="archive-list">${cases.map((c,i)=>`<button class="archive-case" data-action="case" data-value="${i}" ${i>unlocked()?'disabled':''}><span class="mono">0${i+1}</span><div><strong>${c.title}</strong><small>${c.location}</small></div><span>${state.cases[i].solved?'해결':i>unlocked()?'잠김':'수사 중'} ${icon(i>unlocked()?'lock':'arrow')}</span></button>`).join('')}</div>`;
  }
  function deductionPanel() {
    return `<section class="focused-deduction"><p class="tool-lead">흔적을 모두 설명하는 동선은?</p>${(step().options||[]).map((o,i)=>`<button class="deduction-option ${game().claim===o.id?'selected':''}" data-action="deduce" data-value="${o.id}"><span>${String.fromCharCode(65+i)}</span><strong>${o.text}</strong>${icon('arrow')}</button>`).join('')}</section>`;
  }
  function workbench() {
    if(!ui.panel)return '';
    const titles={map:'현장 조사',decoder:'팩터 디코더',evidence:'증거를 연결한다',suspects:'누구의 증언을 들을까?',cases:'사건 기록',deduction:'동선 재구성'};
    return `<div class="workbench-backdrop"><section class="workbench workbench-${ui.panel}" role="dialog" aria-modal="true" aria-labelledby="workbench-title"><header class="workbench-header"><div><span class="eyebrow">CASE 0${data().id}</span><h2 id="workbench-title" tabindex="-1">${titles[ui.panel]}</h2></div><button class="return-scene" data-action="panel-close">심문으로 ${icon('close')}</button></header>${['map','decoder','evidence'].includes(ui.panel)?`<nav class="workbench-tabs" aria-label="조사 도구">${[['map','현장'],['decoder','디코더'],['evidence','증거']].map(([id,label])=>`<button data-action="panel" data-value="${id}" ${id===ui.panel?'aria-current="page"':''}>${label}</button>`).join('')}</nav>`:''}<div class="workbench-scroll">${{map:mapPanel,decoder:decoder,evidence:evidencePanel,suspects:peoplePanel,cases:archivePanel,deduction:deductionPanel}[ui.panel]() }${game().feedback&&ui.panel==='decoder'?`<p class="proof-feedback" role="alert">${game().feedback}</p>`:''}</div></section></div>`;
  }
  function render() {
    const active=document.activeElement,focusId=active?.id;
    const key=active?.matches('[data-action]')?{action:active.dataset.action,value:active.dataset.value}:null;
    document.body.classList.add('focus-mode');
    app.innerHTML=state.started?`<div class="focus-game">${header()}${scene()}${workbench()}</div>`:landing();
    syncMedia();
    flash='';
    const target=focusId?document.getElementById(focusId):null;
    if(target&&!target.closest('[inert]'))target.focus({preventScroll:true});
    else if(key){const next=[...app.querySelectorAll('[data-action]')].find(n=>n.dataset.action===key.action&&n.dataset.value===key.value&&!n.closest('[inert]'));if(next)next.focus({preventScroll:true});else if(ui.panel)document.getElementById('workbench-title')?.focus({preventScroll:true});}
    else if(ui.panel)document.getElementById('workbench-title')?.focus({preventScroll:true});
  }
  function openPanel(value) {
    if(!['map','decoder','evidence','suspects','cases','deduction'].includes(value))return;
    ui.panel=value;game().feedback='';render();
  }
  function nextSpeech(direction=1) {
    const g=game(),lines=speaker().lines;
    g.line=direction>0?(g.line+1)%lines.length:Math.max(0,g.line-1);g.claim='';g.feedback='';save();render();
  }
  function resolution() {
    const r=ui.resolution;if(!r)return;
    const last=r.index===r.pages.length-1;
    const subject=data().suspects.find(p=>p.id===r.person);
    showDialog(`${subject?`<div class="resolution-portrait">${portrait(subject,false,r.expression)}</div>`:""}<div class="resolution-label">${r.finished?'사건 해결':'모순 발견'}<span>${r.index+1} / ${r.pages.length}</span></div>${r.index===0?`<div class="resolution-symbol">${r.finished?'∎':'≠'}</div><h2>${r.title}</h2>`:'<h2>흔적이 이어진다.</h2>'}<p class="resolution-text">${r.pages[r.index]}</p><div class="dialog-actions">${!last?'<button class="primary" data-action="resolution-next">계속 →</button>':r.finished&&data().id<4?'<button class="secondary" data-action="close">기록에 남긴다</button><button class="primary" data-action="next-case">다음 사건 →</button>':`<button class="primary" data-action="close">${r.finished?'수사를 마친다':'심문을 계속한다'} →</button>`}</div>`,null,true);
    dialog.classList.add('resolution-dialog');
    syncMedia();
  }

  let dialogCallback = null;
  function showDialog(html, callback=null, mandatory=false) {
    if(dialog.open)dialog.close();
    dialog.classList.remove('resolution-dialog');
    dialog.innerHTML=`<div class="dialog-inner">${html}</div>`;
    const title=dialog.querySelector('h2');if(title)title.id='dialog-title';
    dialog.dataset.mandatory=mandatory?'true':'false'; dialogCallback=callback; dialog.showModal();
  }
  function closeDialog() { dialog.close(); ui.resolution=null; const callback=dialogCallback; dialogCallback=null; if(callback)callback(); render(); }
  function modalTop(label) { return `<div class="dialog-top"><span class="eyebrow">${label}</span><button class="icon-button" data-action="close" aria-label="닫기">${icon('close')}</button></div>`; }
  function help() {
    showDialog(`${modalTop('수사 가이드')}<h2>듣고, 의심하고, 제시한다.</h2><div class="help-rule"><span>01</span><p><b>다음 증언 → 잠깐.</b>한 문장씩 듣다가, 의심되는 말에서 멈춰 세우세요.</p></div><div class="help-rule"><span>02</span><p><b>필요한 도구만 열어 조사합니다.</b>현장 지도와 팩터 디코더는 아래에 있습니다. 닫으면 멈췄던 증언으로 돌아옵니다.</p></div><div class="help-rule"><span>03</span><p><b>증거를 고르고 제시합니다.</b>증언과 모순되는 기록과 현장 단서를 연결하세요. 틀려도 다시 시도할 수 있습니다.</p></div><p style="font-size:11px">문을 통과할 때마다 게이트의 소수가 곱해집니다. 왕복은 짝수 지수, 방문 순서는 추가 증거로 판단합니다.</p><div class="dialog-actions"><button class="primary" data-action="close">수사를 시작하자 ${icon('arrow')}</button></div>`);
  }
  function inspectRoom(value) {
    const r=data().rooms.find(r=>r.p===Number(value)); if(!r)return;
    const clue=data().clues.find(c=>c.id===r.clue);
    if(clue){add(game().clues,clue.id);save();render();}
    showDialog(`${modalTop(clue?'단서 발견':'현장 조사')}<h2><span class="mono lime-text">${r.p}</span> ${r.name}</h2>${clue?`${evidenceArt(clue.id,true)}<p>${clue.text}</p><div class="found-clue">${icon('check')} ${clue.title} <span>수사 노트에 기록됨</span></div>`:`<p>${r.desc}</p>`}<div class="dialog-actions"><button class="${clue?'secondary':'primary'}" data-action="close">조사 마치기</button>${clue?`<button class="primary" data-action="take-evidence" data-value="${clue.id}">증거로 선택 ${icon('check')}</button>`:''}</div>`);
  }
  function inspectClue(id) {
    const clue=data().clues.find(c=>c.id===id); if(!clue)return;
    add(game().clues,id);save();render();
    showDialog(`${modalTop('EVIDENCE RECORDED')}<h2>${clue.title}</h2>${evidenceArt(clue.id,true)}<p>${clue.text}</p><div class="dialog-pills"><span class="tag">${clue.short}</span></div><div class="dialog-actions"><button class="secondary" data-action="close">닫기</button><button class="primary" data-action="take-evidence" data-value="${id}">증거로 선택 ${icon('check')}</button></div>`);
  }
  function chooseEvidence(id) {
    const g=game(),s=step(); if(!evidenceItems().some(e=>e.id===id))return;
    if(g.solved){toast('해결 기록은 수사 노트에서 확인하세요.');return;}
    if(s.type==='matching'){toast('이 단계는 시간차 모듈에서 스냅샷을 매칭하세요.');return;}
    if(g.evidence.includes(id))g.evidence=g.evidence.filter(e=>e!==id);
    else { if(g.evidence.length>=s.evidence.length)g.evidence.shift(); g.evidence.push(id); }
    g.feedback='';ui.panel='evidence';save();render();
  }
  function scan() {
    const c=data(),g=game(),p=person();add(g.scanned,p.id);
    if(c.id===1&&g.scanned.includes('choi')&&g.scanned.includes('han'))flag('comparison');
    if(c.id===3&&c.suspects.every(q=>g.scanned.includes(q.id)))flag('both-scanned');
    if(c.id===4&&g.module==='offset')applyOffset(g.offsets[p.id]||0,false);
    flash='scan';g.feedback='';save();render();sound('scan');toast(`${p.name} · ${fmt(p.card)} 분해 완료`);
  }
  function applyOffset(value,refresh=true) {
    const g=game(),p=person();
    if(!g.scanned.includes(p.id)){toast('먼저 카드를 스캔하세요.');return;}
    g.offsets[p.id]=value;
    if(p.id==='song'&&value===1)flag('corrected-song');
    if(p.id==='baek'&&value===-1)flag('corrected-baek');
    if(refresh){flash='offset';save();render();sound('offset');}
  }
  function fail(text) { game().feedback=text;if(!ui.panel)ui.panel=step().type==='matching'?'decoder':'evidence';save();render();sound('error');document.querySelector('.proof-feedback')?.scrollIntoView({block:'nearest'}); }
  function advance() {
    const c=data(),g=game(),s=step(),completed=g.step;
    add(g.log,`${completed}`);g.step++;g.evidence=[];g.claim='';g.feedback='';
    const finished=g.step>=c.steps.length;
    if(finished){g.solved=true;state.unlocked=Math.max(state.unlocked||0,Math.min(3,state.current+1));} else {g.suspect=step().suspect;g.speaker=g.suspect;if(c.id===2)g.module='timeline';if(c.id===3&&g.step===1)g.module='gcd';if(c.id===3&&g.step===2)g.module='swap';if(c.id===4)g.module='offset';}
    g.line=0;ui.panel=null;
    const sentences=(s.result+(finished?' '+c.ending:'')).split(/(?<=[.!?])\s+(?![”"'’])/u),pages=[];
    let sentenceCount=0;
    for(const sentence of sentences){const text=sentence.trim();if(!text)continue;if(pages.length&&sentenceCount<2&&pages[pages.length-1].length+text.length<90){pages[pages.length-1]+=' '+text;sentenceCount++;}else{pages.push(text);sentenceCount=1;}}
    ui.resolution={title:s.resultTitle,finished,index:0,pages,person:s.suspect,expression:s.type==='matching'?'neutral':finished?({han:'breakdown',kang:'breakdown',oh:'defeated',jung:'guilty',baek:'breakdown'}[s.suspect]||'shaken'):s.suspect==='park'?'averted':s.suspect==='song'?'relieved':'shaken'};
    save();render();sound(s.type==='matching'?'match':'success');resolution();
  }
  function present() {
    const g=game(),s=step();if(g.solved)return;
    if(!g.claim){fail(s.options?'재구성할 동선을 먼저 선택하세요.':'의심되는 증언 문장을 먼저 선택해 홀드하세요.');return;}
    if(g.evidence.length!==s.evidence.length){fail(`이 단계에는 증거 ${s.evidence.length}개가 필요합니다. 보관함에서 선택하세요.`);return;}
    const result=C.checkProof(s,g.claim,g.evidence,g.flags);
    if(!result.ok){
      fail(result.reason==='claim'?'그 문장과 이 증거 사이에는 결정적인 모순이 없습니다. 반박할 진술이나 동선을 다시 살펴보세요.':result.reason==='tool'?'입증에 필요한 분석이 아직 남아 있습니다. 카드 대조 또는 이번 사건의 전용 모듈을 확인하세요.':'제시한 증거만으로는 이 진술을 반박할 수 없습니다. 숫자와 현장 단서를 다시 연결해 보세요.');return;
    }
    advance();
  }
  function matching() {
    const c=data(),g=game();if(c.id!==2||g.solved)return;
    if(!g.clues.includes('backup')){fail('보안 복도(3)의 비상 백업부터 조사하세요.');return;}
    if(!c.suspects.every(p=>g.scanned.includes(p.id))){fail('매칭을 위해 세 사람의 카드를 모두 스캔하세요.');return;}
    if(!C.matches(g.assignments,c.snapshots,c.suspects)){fail('각 스냅샷은 배정된 최종 카드의 약수여야 합니다. 같은 사람을 두 번 배정할 수 없습니다.');return;}
    flag('matched');
    if(g.step===0){g.qPerson='kang';g.qSnapshot=7098;advance();}else{save();render();toast('이미 매칭이 완료되었습니다.');}
  }
  function quotient() {
    const g=game(),c=data(),p=c.suspects.find(p=>p.id===g.qPerson);
    if(c.id!==2||!g.flags.includes('matched')||!p)return;
    if(g.assignments[g.qSnapshot]!==p.id){g.qResult=null;save();render();toast('이 스냅샷의 주인이 선택한 카드와 다릅니다.');return;}
    g.qResult=C.quotient(p.card,g.qSnapshot);
    if(p.id==='kang'&&g.qSnapshot===7098)flag('quotient');
    save();render();sound('scan');toast('정전 이후의 출입 기록을 추출했습니다.');
  }
  function gcd() {
    if(data().id!==3)return;
    if(!game().flags.includes('both-scanned')){toast('두 용의자의 카드를 모두 스캔하세요.');return;}
    flag('gcd');save();render();sound('scan');toast('공통 기록 2,940을 증거 보관함에 추가했습니다.');
  }
  function swap() {
    if(data().id!==3||game().flags.includes('swap'))return;
    if(!game().flags.includes('gcd')||!game().clues.includes('lounge')){toast('공약수 분석과 라운지 조사를 먼저 마치세요.');return;}
    flag('swap');save();render();sound('swap');toast('퇴실 블록 교환 완료 · 두 사람의 동선 복원');
  }
  function hint() {
    const g=game(),s=step(),level=Math.min(3,(Number(g.hints[g.step])||0)+1);g.hints[g.step]=level;save();
    showDialog(`${modalTop('INVESTIGATOR SUPPORT')}<h2>${s.title}</h2><div class="hint-count">${[1,2,3].map(i=>`<i class="${i<=level?'active':''}"></i>`).join('')}</div><p>${s.hints[level-1]}</p><div class="dialog-actions"><button class="secondary" data-action="close">돌아가기</button>${level<3?'<button class="primary" data-action="hint">더 구체적인 힌트 →</button>':''}</div>`);
  }
  function notebook() {
    const c=data(),g=game(),items=evidenceItems();
    showDialog(`${modalTop('CASE NOTEBOOK')}<h2>CASE 0${c.id} · 수사 노트</h2><p>수집한 현장 단서와 분석 결과가 기록됩니다.</p>${items.length?items.map(e=>`<div class="notebook-entry">${evidenceArt(e.id)}<strong>${e.title}</strong><p>${e.text}</p></div>`).join(''):'<p>아직 수집한 증거가 없습니다.</p>'}${g.log.length?`<div class="success-line"></div><div class="eyebrow">VERIFIED DEDUCTIONS</div>${g.log.map(i=>c.steps[Number(i)]).filter(Boolean).map(s=>`<div class="notebook-entry"><strong>${s.resultTitle}</strong><p>${s.result}</p></div>`).join('')}`:''}<div class="dialog-actions"><button class="primary" data-action="close">수사로 돌아가기</button></div>`);
  }
  function settings() {
    showDialog(`${modalTop('TERMINAL SETTINGS')}<h2>단말기 설정</h2><p>진행 상황은 현재 브라우저에 자동 저장됩니다. 개인 정보, 서버 전송, 계정 가입은 없습니다.</p><p>사운드: ${state.sound?'켜짐':'꺼짐'} · 이미지: 테크 느와르 아트 · 효과음/배경음악 연결됨<br>브라우저 확대/축소 및 시스템의 모션 줄이기 설정을 지원합니다.</p><p style="font-size:11px">PRIME SUSPECT / 유일한 흔적<br>네 개의 사건을 담은 오프라인 수사 단말기.</p><div class="dialog-actions"><button class="secondary red-text" data-action="reset-prompt">모든 진행 초기화</button><button class="primary" data-action="close">돌아가기</button></div>`);
  }
  function navigateCase(index) {
    if(index<0||index>unlocked())return;
    if(dialog.open)dialog.close();dialogCallback=null;ui.panel=null;ui.resolution=null;state.current=index;state.started=true;save();render();window.scrollTo(0,0);
  }
  document.addEventListener('click', event=>{
    const button=event.target.closest('button[data-action]');if(!button||button.disabled)return;
    const action=button.dataset.action,value=button.dataset.value,g=game();
    media.unlock();
    switch(action){
      case 'start':state.started=true;save();render();window.scrollTo(0,0);break;
      case 'home':state.started=false;ui.panel=null;save();render();window.scrollTo(0,0);break;
      case 'sound':state.sound=!state.sound;save();render();sound('scan');toast(`사운드 ${state.sound?'켜짐':'꺼짐'}`);break;
      case 'help':help();break;
      case 'settings':settings();break;
      case 'close':closeDialog();break;
      case 'case':navigateCase(Number(value));break;
      case 'next-case':navigateCase(Math.min(3,state.current+1));break;
      case 'panel':openPanel(value);break;
      case 'panel-close':ui.panel=null;g.feedback='';render();document.querySelector('.dialogue-right button')?.focus({preventScroll:true});break;
      case 'opening-next':if(g.opening<2)g.opening++;else g.openingDone=true;save();render();break;
      case 'speech-next':nextSpeech(1);break;
      case 'speech-prev':nextSpeech(-1);break;
      case 'hold':g.claim=currentLine().id;g.feedback='';save();render();sound('hold');break;
      case 'resume':nextSpeech(1);break;
      case 'speaker':if(data().suspects.some(p=>p.id===value)){g.speaker=value;g.suspect=value;g.line=0;g.claim='';g.evidence=[];ui.panel=null;save();render();}break;
      case 'inspect-card':sound('swipe');if(data().suspects.some(p=>p.id===value)){g.suspect=value;if(data().id===2&&g.flags.includes('matched')){g.qPerson=value;g.qSnapshot=data().snapshots.find(s=>g.assignments[s.value]===value)?.value||150;g.qResult=null;}save();render();}break;
      case 'deduce':if(step().options?.some(o=>o.id===value)){g.claim=value;ui.panel='evidence';save();render();}break;
      case 'start-matching':g.module='timeline';openPanel('decoder');save();break;
      case 'scan-all':data().suspects.forEach(p=>add(g.scanned,p.id));if(data().id===3)flag('both-scanned');if(data().id===1)flag('comparison');save();render();sound('scan');break;
      case 'assign-snapshot':g.assignments[data().snapshots[g.matchIndex].value]=value;g.feedback='';save();render();break;
      case 'snapshot-prev':g.matchIndex=Math.max(0,g.matchIndex-1);g.feedback='';save();render();break;
      case 'snapshot-next':g.matchIndex=Math.min(2,g.matchIndex+1);g.feedback='';save();render();break;
      case 'snapshot-page':g.matchIndex=Math.max(0,Math.min(2,Number(value)));save();render();break;
      case 'resolution-next':if(ui.resolution){ui.resolution.index=Math.min(ui.resolution.index+1,ui.resolution.pages.length-1);resolution();}break;
      case 'evidence-info':{const e=evidenceItems().find(e=>e.id===value);if(e)showDialog(`${modalTop('증거 상세')}<h2>${e.title}</h2>${evidenceArt(e.id,true)}<p>${e.text}</p><div class="dialog-actions"><button class="primary" data-action="close">확인</button></div>`);break;}
      case 'scan':scan();break;
      case 'room':inspectRoom(value);break;
      case 'clue':inspectClue(value);break;
      case 'take-evidence':closeDialog();chooseEvidence(value);toast('증거 선택을 갱신했습니다.');break;
      case 'evidence':chooseEvidence(value);break;
      case 'module':g.module=value;save();render();break;
      case 'present':present();break;
      case 'matching':matching();break;
      case 'quotient':quotient();break;
      case 'gcd':gcd();break;
      case 'swap':swap();break;
      case 'swap-select':if(!g.flags.includes('swap'))toast('블록을 반대 카드로 드래그하거나 아래 맞교환 버튼을 누르세요.');break;
      case 'offset':applyOffset(Number(value));break;
      case 'hint':hint();break;
      case 'notebook':notebook();break;
      case 'factor':{
        if(data().id===4&&person().id==='baek'&&(g.offsets.baek||0)===-1&&Number(value)===2){chooseEvidence('lobby-four');toast('로비 4회 통과 기록 선택');break;}
        const p=person(),v=p.card+(g.module==='offset'?(g.offsets[p.id]||0):0),f=C.factor(v).find(f=>f.p===Number(value));if(!f)break;
        const room=data().rooms.find(r=>r.p===f.p);
        showDialog(`${modalTop('FACTOR INSPECTION')}<h2 class="mono">${f.p}<sup>${f.k}</sup> <span style="font-size:13px" class="${f.k%2?'red-text':'blue-text'}">${f.k%2?'홀수 지수':'짝수 지수'}</span></h2><p>${room?`${room.name} 게이트가 ${f.k}회 기록되었습니다. ${f.k%2?'같은 문을 통한 정상 왕복만으로는 설명할 수 없습니다. 현재 위치, 우회 통로 또는 카드 교환을 검토하세요.':'일반적인 왕복 기록과 양립합니다. 다만 순서와 방문 목적까지 알 수 있는 것은 아닙니다.'}`:'연구소에 등록되지 않은 소수입니다. 원본 기록의 오염 여부를 조사하세요.'}</p><div class="dialog-actions"><button class="primary" data-action="close">확인</button></div>`);break;
      }
      case 'reset-prompt':showDialog(`${modalTop('RESET SAVE DATA')}<h2>모든 진행을 초기화할까요?</h2><p>4개 사건의 진행, 수집한 증거와 해결 기록을 이 브라우저에서 삭제합니다.</p><div class="dialog-actions"><button class="secondary" data-action="close">취소</button><button class="primary" data-action="reset">초기화</button></div>`);break;
      case 'reset':closeDialog();ui.panel=null;state=initial();save();render();window.scrollTo(0,0);toast('진행을 초기화했습니다.');break;
      case 'replay':showDialog(`${modalTop('REPLAY CASE')}<h2>이 사건을 다시 수사할까요?</h2><p>이 사건의 증거와 단계별 진행을 지웁니다. 이미 해금한 다음 사건은 유지됩니다.</p><div class="dialog-actions"><button class="secondary" data-action="close">취소</button><button class="primary" data-action="replay-confirm">다시 수사</button></div>`);break;
      case 'replay-confirm':{
        const max=unlocked();closeDialog();state.cases[state.current]=blankCase(state.current);
        // 해금 상태는 별도 저장하며 재수사 때문에 다음 사건이 잠기지 않도록 한다.
        state.unlocked=Math.max(state.unlocked||0,max);ui.panel=null;save();render();window.scrollTo(0,0);break;
      }
      case 'ending':showDialog(`${modalTop('ALL CASES CLOSED')}<div class="success-mark">∎</div><h2>PRIME SUSPECT<br><span class="lime-text">유일한 흔적</span></h2><p>${cases[3].ending}</p><div class="dialog-pills">${cases.map((c,i)=>`<span class="tag">CASE 0${i+1} ✓</span>`).join('')}</div><div class="dialog-actions"><button class="primary" data-action="close">기록으로 돌아가기</button></div>`);break;
    }
  });
  let dragged='';
  document.addEventListener('dragstart',event=>{const n=event.target.closest('[data-drag]');if(n){dragged=n.dataset.drag;event.dataTransfer.setData('text/plain',dragged);event.dataTransfer.effectAllowed='move';}});
  document.addEventListener('dragover',event=>{const n=event.target.closest('[data-drop]');if(n&&dragged&&n.dataset.drop!==dragged){event.preventDefault();n.classList.add('drag-over');}});
  document.addEventListener('dragleave',event=>{event.target.closest('[data-drop]')?.classList.remove('drag-over');});
  document.addEventListener('drop',event=>{const n=event.target.closest('[data-drop]');if(n&&dragged&&n.dataset.drop!==dragged){event.preventDefault();swap();}dragged='';});
  document.addEventListener('dragend',()=>{dragged='';document.querySelectorAll('.drag-over').forEach(n=>n.classList.remove('drag-over'));});
  document.addEventListener('error',event=>{if(event.target.matches?.('.scene-background,.evidence-art img,.room-number img')){event.target.hidden=true;}if(event.target.matches?.('.portrait-asset')){const p=data().suspects.find(p=>p.id===event.target.dataset.fallback);if(p)event.target.closest('.portrait-stage').outerHTML=portrait(p,true);}},true);
  document.addEventListener('keydown',event=>{
    if(dialog.open)return;
    if(ui.panel){
      if(event.key==='Escape'){event.preventDefault();ui.panel=null;render();document.querySelector('.dialogue-right button')?.focus({preventScroll:true});return;}
      if(event.key==='Tab'){
        const nodes=[...document.querySelectorAll('.workbench button:not(:disabled),.workbench select:not(:disabled),.workbench summary')].filter(n=>n.getClientRects().length);
        if(nodes.length&&(event.shiftKey&&(event.target===nodes[0]||event.target.id==='workbench-title')||!event.shiftKey&&event.target===nodes[nodes.length-1])){event.preventDefault();nodes[event.shiftKey?nodes.length-1:0].focus();return;}
      }
    }
    const tabs=event.target.closest('[role="tablist"]');if(!tabs||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const buttons=[...tabs.querySelectorAll('[role="tab"]')].filter(b=>!b.disabled),index=buttons.indexOf(event.target);if(index<0)return;
    event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
    buttons[next].focus();buttons[next].click();
  });
  dialog.addEventListener('cancel',event=>{if(dialog.dataset.mandatory==='true')event.preventDefault();});
  dialog.addEventListener('close',()=>{dialogCallback=null; if(!dialog.open){ui.resolution=null;syncMedia();}});
  render();
})();
