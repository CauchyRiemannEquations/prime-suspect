from pathlib import Path
import json,xml.etree.ElementTree as ET,subprocess,hashlib
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent
m=json.loads((R/'asset-manifest.json').read_text());ns={'s':'http://www.w3.org/2000/svg'}
assert len(m['assets'])==40
res=[]
for a in m['assets']:
 p=R/a['file'];root=ET.parse(p).getroot()
 assert root.attrib['viewBox']==f"0 0 {a['width']} {a['height']}"
 assert root.find('s:title',ns) is not None and root.find('s:desc',ns) is not None
 ids=[e.attrib['id'] for e in root.iter() if 'id' in e.attrib];assert len(ids)==len(set(ids))
 assert not root.findall('.//s:script',ns)
 assert not root.findall('.//s:image',ns)
 if a['id'].startswith('ui_block_'):
  assert root.find('.//*[@id="value-slot"]') is not None
 if a['id'].startswith('ui_map_node_prime_'):
  n=a['id'].split('_')[4];assert root.find('s:text',ns).text==n
 out=R/'previews'/(p.stem+'.png')
 proc=subprocess.run(['inkscape',str(p),'--export-filename='+str(out)],capture_output=True,text=True)
 assert proc.returncode==0,(p,proc.stderr)
 im=Image.open(out);assert im.size==(a['width'],a['height'])
 if a['id']=='ui_decoder_frame':assert im.convert('RGBA').getpixel((320,180))[3]==0
 res.append({'id':a['id'],'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'render':'passed','size':list(im.size)})
# Rendered SVG atlas for review only; output art remains editable SVG.
W=1200;canvas=Image.new('RGB',(W,3000),'#0B132B');d=ImageDraw.Draw(canvas)
y=20
for group in [m['assets'][:4],m['assets'][4:10],m['assets'][10:14],m['assets'][14:38],m['assets'][38:]]:
 cellw=280;cellh=250 if len(group)<10 else 150
 cols=4
 for i,a in enumerate(group):
  x=20+(i%cols)*295;yy=y+(i//cols)*cellh
  im=Image.open(R/'previews'/(a['id']+'.png')).convert('RGBA');im.thumbnail((260,cellh-45))
  canvas.paste(im,(x,yy),im);d.text((x,yy+cellh-35),a['id'].replace('ui_map_node_prime_','node_'),fill='#9CAFC4')
 y+=((len(group)+cols-1)//cols)*cellh+20
canvas.crop((0,0,W,y)).save(R/'previews'/'svg-atlas.png')
report={'svg_count':len(res),'xml_checks':'passed','all_svg_render':'passed','frame_center_transparent':True,'assets':res,'browser_test':'blocked: Chromium socket() Operation not permitted','browser_touch_test':'not run','font_note':'SVG renders use available font fallback; target device fonts may differ'}
(R/'VALIDATION.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('40 XML and rendered SVG assets passed')
