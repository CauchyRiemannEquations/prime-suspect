const fs=require('fs'),vm=require('vm'),assert=require('assert');
class El{
 constructor(id){this.id=id;this.attrs={};this.listeners={};this.dataset={};this.textContent='';this.disabled=false;this.src='';this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x)};}
 setAttribute(k,v){this.attrs[k]=v}getAttribute(k){return this.attrs[k]??null}addEventListener(k,f){this.listeners[k]=f}click(){if(!this.disabled)this.listeners.click?.()}
}
const els={};['toggle-swap','swap-preview','swap-status','dial-preview','dial-status','effect-status','effect-slash','effect-shatter','effect-cancel'].forEach(id=>els[id]=new El(id));
const dials=['minus','zero','plus'].map((v,i)=>{const e=new El('dial-'+v);e.dataset.dial=v;e.textContent=['−1','0','+1'][i];e.setAttribute('aria-pressed',String(v==='zero'));return e});
const effects=['slash','shatter'].map(v=>{const e=new El(v);e.dataset.effect=v;return e});
const vfx=[els['effect-slash'],els['effect-shatter']];
let timers=new Map(),counter=0,query={matches:false,addEventListener:(k,f)=>query.change=f},win={addEventListener:(k,f)=>win[k]=f};
const context={document:{getElementById:id=>els[id],querySelectorAll:q=>q==='[data-dial]'?dials:q==='[data-effect]'?effects:q==='.ps-vfx'?vfx:[]},matchMedia:()=>query,window:win,setTimeout:f=>{timers.set(++counter,f);return counter},clearTimeout:id=>timers.delete(id)};
vm.runInNewContext(fs.readFileSync(__dirname+'/demo.js','utf8'),context);
let n=0;function test(name,fn){fn();console.log('PASS',name);n++}
test('swap select and deselect',()=>{els['toggle-swap'].click();assert.equal(els['toggle-swap'].attrs['aria-pressed'],'true');assert(els['swap-preview'].src.endsWith('_active.svg'));els['toggle-swap'].click();assert.equal(els['toggle-swap'].attrs['aria-pressed'],'false')});
test('dial all states and repeated selection',()=>{for(const e of [...dials,dials[2]]){e.click();assert.equal(dials.filter(x=>x.attrs['aria-pressed']==='true').length,1);assert.equal(e.attrs['aria-pressed'],'true');assert(els['dial-preview'].src.endsWith('_'+e.dataset.dial+'.svg'))}});
test('one shot locks repeated clicks',()=>{effects[0].click();assert(vfx[0].classes.has('ps-play'));assert(effects.every(x=>x.disabled));effects[1].click();assert(!vfx[1].classes.has('ps-play'));assert.equal(timers.size,1)});
test('cancel restores controls and hides effects',()=>{els['effect-cancel'].click();assert.equal(timers.size,0);assert(vfx.every(x=>!x.classes.has('ps-play')));assert(effects.every(x=>!x.disabled))});
test('timeout restores controls',()=>{effects[1].click();[...timers.values()][0]();assert(effects.every(x=>!x.disabled));assert(!vfx[1].classes.has('ps-play'))});
test('reduced motion prevents animation and timers',()=>{query.matches=true;effects[0].click();assert.equal(timers.size,0);assert(!vfx[0].classes.has('ps-play'));assert(els['effect-status'].textContent.includes('정적 안내'))});
test('preference change cancels running effect',()=>{query.matches=false;effects[0].click();query.matches=true;query.change();assert.equal(timers.size,0);assert(effects.every(x=>!x.disabled))});
test('pagehide cleanup',()=>{query.matches=false;effects[0].click();win.pagehide();assert.equal(timers.size,0);assert(effects.every(x=>!x.disabled))});
console.log(n+' interaction-model tests passed; not a real browser test');
