from pathlib import Path
import json,html,xml.etree.ElementTree as ET,hashlib
D=Path(__file__).parent
maps=json.loads((D/'map-data.json').read_text())
ESC=html.escape
for c in maps:
 rooms={r['p']:r for r in c['rooms']}
 pos={p:(r['x']*9.6,r['y']*7.2) for p,r in rooms.items()}
 def xy(p):return pos[p]
 out=['<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720" role="img" aria-labelledby="title desc">',f'<title id="title">Case {c["id"]} 평면도</title>', '<desc id="desc">실제 게임 방 번호와 연결을 반영한 정적 청사진. 특수 연결은 단서 공개 이후 표시해야 합니다. 선 교차는 방 연결이 아닙니다.</desc>', '<defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#547082" stroke-width="0.5" opacity="0.18"/></pattern><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" fill="none" stroke="#FF9F1C" stroke-width="1.4"/></marker></defs>', '<style>text{font-family:"Noto Sans CJK KR","Noto Sans KR","Malgun Gothic",sans-serif} .label{font-size:20px;fill:#DDEFF2;font-weight:600;text-anchor:middle}.prime{font-size:27px;fill:#00F5D4;font-weight:700;text-anchor:middle;dominant-baseline:central}.edge{fill:none;stroke:#00B9B2;stroke-width:2.5;opacity:.8}.special{fill:none;stroke:#FF9F1C;stroke-width:3;stroke-dasharray:9 7}.node{fill:#0B132B;fill-opacity:.94;stroke:#00F5D4;stroke-width:2}</style>', '<rect x="16" y="16" width="928" height="688" rx="8" fill="url(#grid)" stroke="#547082" stroke-width="1" opacity=".7"/>',f'<text x="38" y="45" font-size="16" fill="#88B8C4" letter-spacing="2">CASE {c["id"]} / BLUEPRINT</text>', '<g id="normal-edges">']
 for a,b in c['edges']:
  x1,y1=xy(a);x2,y2=xy(b)
  out.append(f'<path id="edge-{a}-{b}" data-from="{a}" data-to="{b}" class="edge" d="M{x1:g},{y1:g} L{x2:g},{y2:g}"/>')
 out.append('</g>')
 if 'special' in c:
  s=c['special'];a,b=s['from'],s['to'];x1,y1=xy(a);x2,y2=xy(b)
  if c['id']==1:
   path=f'M{x1+32:g},{y1+8:g} C330,570 630,570 {x2-32:g},{y2+8:g}';tx,ty=480,566;start=' marker-start="url(#arrow)"';label='환기 덕트 · 센서 없음'
  else:
   path=f'M{x1+35:g},{y1:g} C670,620 670,267 {x2+35:g},{y2:g}';tx,ty=690,450;start='';label='해치 → 홀 내부'
  out.extend([f'<g id="special-route" data-clue="{s["clue"]}" data-requires-reveal="true">',f'<path id="special-{a}-{b}" data-from="{a}" data-to="{b}" data-direction="{"bidirectional" if c["id"]==1 else "forward"}" class="special" d="{path}" marker-end="url(#arrow)"{start}/>',f'<rect x="{tx-122}" y="{ty-20}" width="244" height="29" rx="5" fill="#0B132B" fill-opacity=".95"/><text x="{tx}" y="{ty}" font-size="18" fill="#FFB550" text-anchor="middle">{label}</text>','</g>'])
 out.append('<g id="room-nodes">')
 for p,r in rooms.items():
  x,y=xy(p)
  out.extend([f'<g id="room-{p}" data-node="{p}" data-name="{ESC(r["name"],quote=True)}" transform="translate({x:g},{y:g})">',f'<title>{ESC(r["name"])} ({p})</title>','<circle r="34" class="node"/>',f'<text class="prime" y="0">{p}</text>',f'<rect x="-118" y="40" width="236" height="29" rx="4" fill="#0B132B" fill-opacity=".94"/><text class="label" y="62">{ESC(r["name"])}</text>','</g>'])
 out.extend(['</g>','<text x="38" y="67" font-size="11" fill="#88B8C4">실선: 일반 연결  /  점선: 특수 연결  ·  선 교차는 연결 지점이 아님</text>','</svg>'])
 (D/f'map_case{c["id"]}_blueprint.svg').write_text('\n'.join(out))
checks=[]
for c in maps:
 p=D/f'map_case{c["id"]}_blueprint.svg';root=ET.parse(p).getroot();ns={'s':'http://www.w3.org/2000/svg'}
 actual_nodes={int(e.attrib['data-node']) for e in root.findall('.//s:g[@data-node]',ns)}
 actual_edges={(int(e.attrib['data-from']),int(e.attrib['data-to'])) for e in root.findall('.//s:g[@id="normal-edges"]/s:path',ns)}
 assert actual_nodes=={r['p'] for r in c['rooms']}
 assert actual_edges=={tuple(e) for e in c['edges']}
 assert root.attrib['viewBox']=='0 0 960 720'
 assert not root.findall('.//s:script',ns) and not root.findall('.//s:image',ns)
 special=root.findall('.//s:g[@id="special-route"]/s:path',ns)
 assert len(special)==int('special' in c)
 if special:
  assert int(special[0].attrib['data-from'])==c['special']['from'] and int(special[0].attrib['data-to'])==c['special']['to']
 checks.append({'case':c['id'],'nodes':len(actual_nodes),'normal_edges':len(actual_edges),'special_edges':len(special),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'passed':True})
(D/'VALIDATION.json').write_text(json.dumps({'source':'cases.js blob 8e8fa8b1ec1656cf589cb521c8b94ba827f0fd1e','checks':checks},indent=2))
print(json.dumps(checks,indent=2))
