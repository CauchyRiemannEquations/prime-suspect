from pathlib import Path
import html,json
ROOT=Path(__file__).resolve().parent
A=ROOT/'assets';A.mkdir(exist_ok=True)
FONT="'Noto Sans CJK KR', 'Malgun Gothic', sans-serif"
NAVY='#0B132B';SLATE='#1C2541';CYAN='#00F5D4';AMBER='#FF9F1C';RED='#EF233C';TEXT='#E7EFF7';MUTED='#9CAFC4'
records=[]
def svg(name,w,h,title,body,desc='',state=None):
 s=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">{html.escape(title)}</title><desc id="desc">{html.escape(desc or title)}</desc>{body}</svg>'''
 (A/(name+'.svg')).write_text(s,encoding='utf-8');records.append(dict(id=name,file='assets/'+name+'.svg',width=w,height=h,title=title,state=state))
def text(x,y,t,size=18,fill=TEXT,anchor='middle',extra=''):
 return f'<text x="{x}" y="{y}" fill="{fill}" font-family="{FONT}" font-size="{size}" text-anchor="{anchor}" {extra}>{html.escape(t)}</text>'
def panel(w,h,color=CYAN):
 return f'<path d="M14 2H{w-14}L{w-2} 14V{h-14}L{w-14} {h-2}H14L2 {h-14}V14Z" fill="{NAVY}" stroke="{color}" stroke-width="2"/>'
# Thin frame: transparent center, no full opaque background.
body=f'<path fill="{SLATE}" fill-rule="evenodd" d="M20 2H620L638 20V340L620 358H20L2 340V20ZM24 24V336H616V24Z"/>'
body+=f'<path d="M20 2H620L638 20V340L620 358H20L2 340V20Z" fill="none" stroke="{MUTED}" stroke-width="2"/><rect x="24" y="24" width="592" height="312" rx="4" fill="none" stroke="{CYAN}" stroke-opacity=".4"/>'
for x in (12,628):
 for y in (12,348):body+=f'<circle cx="{x}" cy="{y}" r="3" fill="#A88D57"/><path d="M{x-2} {y}h4" stroke="{NAVY}"/>'
body+=f'<path d="M40 13h46m8 0h10M536 347h64" stroke="{CYAN}" stroke-width="2"/>'
svg('ui_decoder_frame',640,360,'팩터 디코더 얇은 프레임',body,'중앙 592×312 영역은 투명. 숫자와 조작 버튼은 게임 HTML로 별도 제공한다.')
for name,label,color,symbol,desc in [('even','짝수 지수',CYAN,'pair','짝수 횟수 통과 기록. 왕복과 양립하지만 무죄를 보장하지 않는다.'),('odd','홀수 지수',AMBER,'odd','홀수 횟수 통과 기록. 단독 오류 또는 유죄 판정이 아니다.'),('prime_state','소수',MUTED,'prime','더 분해되지 않는 정상적인 소수 상태. 1009의 소수성과 기록 변조는 구분한다.')]:
 body=panel(240,120,color)
 if symbol=='pair':body+=f'<path d="M18 22h14m-14 7h14" stroke="{color}" stroke-width="3"/>'
 elif symbol=='odd':body+=f'<path d="M25 16l8 14H17Z" fill="none" stroke="{color}" stroke-width="2"/><circle cx="25" cy="26" r="1" fill="{color}"/>'
 else:body+=f'<circle cx="25" cy="24" r="8" fill="none" stroke="{color}" stroke-width="2"/><circle cx="25" cy="24" r="2" fill="{color}"/>'
 body+=text(45,30,label,16,color,'start')+f'<path d="M18 42H222" stroke="{color}" stroke-opacity=".3"/><rect id="value-slot" x="24" y="51" width="192" height="53" fill="none"/>'
 svg('ui_block_'+name,240,120,label+' 블록',body,desc+' value-slot 영역의 실제 값은 코드로 넣는다.')
# Swap two segments, no card-total swap suggestion.
for state in ('idle','active','disabled'):
 col=CYAN if state=='active' else MUTED
 opacity='.45' if state=='disabled' else '1'
 body=f'<g opacity="{opacity}">'+panel(320,88,col)+f'<rect x="21" y="27" width="58" height="34" rx="5" fill="{SLATE}" stroke="{col}"/><rect x="241" y="27" width="58" height="34" rx="5" fill="{SLATE}" stroke="{col}"/><path d="M99 35H218l-9-8m9 8-9 8M220 55H101l9 8m-9-8 9-8" fill="none" stroke="{col}" stroke-width="3" stroke-linecap="round"/>'+text(50,50,'A',17,col)+text(270,50,'B',17,col)+'</g>'
 svg('ui_switch_swap_'+state,320,88,'퇴실 기록 블록 교환 '+state,body,'라운지 이후 퇴실 블록 교환을 나타내는 장식. 전체 카드 값을 무조건 교환하지 않는다.',state)
for val,name in [(-1,'minus'),(0,'zero'),(1,'plus')]:
 body=panel(320,100,MUTED)
 for i,(label,v) in enumerate([('−1',-1),('0',0),('+1',1)]):
  x=13+i*99;active=v==val
  body+=f'<rect x="{x}" y="14" width="96" height="72" rx="6" fill="{SLATE if active else NAVY}" stroke="{CYAN if active else MUTED}" stroke-width="{3 if active else 1}"/>'+text(x+48,58,label,26,CYAN if active else MUTED)
  if active:body+=f'<path d="M{x+38} 77h20" stroke="{CYAN}" stroke-width="3"/>'
 svg('ui_dial_noise_'+name,320,100,'오차 복구 선택 '+str(val),body,'선택값 '+str(val)+'. 실제 사건 단서로 적용 여부를 판단한다. 송지훈 +1, 백도현 −1 복구.',name)
for state in ('idle','focus','pressed','disabled'):
 color=RED if state!='disabled' else MUTED
 body=f'<g opacity="{.5 if state=="disabled" else 1}">'+panel(400,104,color)
 body+=f'<rect x="12" y="12" width="376" height="80" rx="5" fill="{SLATE if state=="pressed" else NAVY}"/>'
 body+=f'<path d="M26 29l12 12-12 12 12 12-12 12" fill="none" stroke="{color}" stroke-width="3"/>'+text(211,61,'모순 제시!',29,TEXT,extra='font-weight="700"')+'</g>'
 if state=='focus':body+=f'<rect x="6" y="6" width="388" height="92" rx="6" fill="none" stroke="{TEXT}" stroke-width="3" stroke-dasharray="6 5"/>'
 svg('ui_btn_contradict_'+state,400,104,'모순 제시 버튼 '+state,body,'버튼 시각 자산만 제공. 실제 버튼은 HTML button 및 사건 조건으로 구현한다. 게이지 없음.',state)
for n in (2,3,5,7,11,13,17,19):
 for state in ('default','active','attention'):
  col={'default':MUTED,'active':CYAN,'attention':AMBER}[state]
  body=f'<rect x="6" y="6" width="84" height="84" rx="16" fill="{NAVY}" stroke="{col}" stroke-width="{3 if state!="default" else 2}"/>'
  if state=='active':body+=f'<path d="M19 19h12M19 19v12M77 77H65M77 77V65" stroke="{col}" stroke-width="4"/>'
  if state=='attention':body+=f'<path d="M72 8l16 25H56Z" fill="{NAVY}" stroke="{col}" stroke-width="2"/><path d="M72 15v7" stroke="{col}" stroke-width="2"/><circle cx="72" cy="27" r="1.5" fill="{col}"/>'
  body+=text(48,61,str(n),36,TEXT,extra='font-weight="700"')
  svg(f'ui_map_node_prime_{n}_{state}',96,96,f'{n}번 방 '+state,body,'숫자 '+str(n)+' 방 번호. attention은 주목 상태이며 유죄를 뜻하지 않는다.',state)
svg('vfx_prime_slash',640,240,'소인수 분리 빛줄기',f'<g id="slash" class="ps-slash"><path d="M25 210L600 20 625 25 57 220Z" fill="{CYAN}" fill-opacity=".2"/><path d="M35 214L617 23 44 217Z" fill="{TEXT}"/><path d="M110 225L540 85" stroke="{CYAN}" stroke-width="2" stroke-opacity=".5"/></g>','합성수 분해 시 한 번만 표시하는 장식. 숫자와 실제 블록 분리는 코드로 구현한다.')
shards=[('160,120 260,60 310,116',-14,-12),('260,60 360,45 310,116',-2,-18),('360,45 480,100 310,116',12,-13),('480,100 500,170 310,116',18,3),('500,170 390,200 310,116',12,14),('390,200 290,195 310,116',0,18),('290,195 165,175 310,116',-16,12),('165,175 160,120 310,116',-20,0)]
body=''
for i,(pts,dx,dy) in enumerate(shards):body+=f'<g id="shard-{i}" class="ps-shard" style="--dx:{dx}px;--dy:{dy}px"><polygon points="{pts}" fill="{CYAN}" fill-opacity=".06" stroke="{TEXT}" stroke-opacity=".7" stroke-width="1.5"/></g>'
svg('vfx_logic_shatter',640,240,'논파 성공 진술 파편',body,'진술 오버레이 파편 장식. 카드나 실제 증거의 파괴를 뜻하지 않는다. CSS 한 번 재생, 반복 점멸 없음.')
(ROOT/'asset-manifest.json').write_text(json.dumps({'version':1,'scope':'assets-only-not-game-integrated','svg_count':len(records),'assets':records},ensure_ascii=False,indent=2))
print(len(records),'SVG assets generated')
