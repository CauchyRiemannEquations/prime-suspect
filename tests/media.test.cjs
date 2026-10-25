const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const events={},created=[];
class Audio {constructor(src){this.src=src;this.paused=true;this.currentTime=0;this.playCount=0;created.push(this);}play(){this.paused=false;this.playCount++;return new Promise(resolve=>this.resolve=resolve);}pause(){this.paused=true;}addEventListener(){}}
const ctx={Audio,document:{hidden:false,addEventListener:(k,f)=>events[k]=f},addEventListener:(k,f)=>events[k]=f};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../media.js'),'utf8'),ctx);
const m=ctx.PSMedia.create({music:{investigation:'a.ogg',pursuit:'b.ogg'},audio:{scan:'a.wav'}});let n=0;
function test(name,fn){fn();console.log('PASS '+name);n++;}
(async()=>{
test('saved enabled setting cannot autoplay before current-page gesture',()=>{m.sync(true,'investigation');assert.equal(created[0].playCount,0);});
test('gesture unlock starts music, repeated render does not restart it',()=>{m.unlock();m.sync(true,'investigation');m.sync(true,'investigation');assert.equal(created[0].playCount,1);});
test('mute stops active background and effects',()=>{m.effect('scan');m.sync(false,'investigation');assert.ok(created.every(a=>a.paused));});
created.forEach(a=>a.resolve?.());await Promise.resolve();
test('late play fulfillment stays paused after mute',()=>assert.ok(created.every(a=>a.paused)));
m.sync(true,'investigation');const oldMusicResolve=created[0].resolve;m.sync(false,'investigation');m.sync(true,'investigation');oldMusicResolve?.();await Promise.resolve();
test('old play fulfillment does not pause a newly resumed element',()=>assert.equal(created[0].paused,false));
test('hidden page pauses and visible page can resume after previous unlock',()=>{m.sync(true,'investigation');ctx.document.hidden=true;events.visibilitychange();assert.ok(created.every(a=>a.paused));ctx.document.hidden=false;events.visibilitychange();assert.equal(created[0].paused,false);});
test('track switch stops previous audio; current track remains unique',()=>{m.sync(true,'pursuit');assert.equal(created[0].paused,true);assert.equal(created.at(-1).src,'b.ogg');assert.equal(created.filter(a=>!a.paused).length,1);});
test('repeated SFX taps are bounded to three concurrent effects',()=>{for(let i=0;i<12;i++)m.effect('scan');assert.ok(created.filter(a=>!a.paused&&a.src==='a.wav').length<=3);});
const evicted=created.slice(-12).find(a=>a.src==='a.wav'&&a.paused);evicted.paused=false;evicted.resolve?.();await Promise.resolve();
test('evicted effect cannot become audible through delayed play fulfillment',()=>assert.equal(evicted.paused,true));
test('pagehide stops all audible media',()=>{events.pagehide();assert.ok(created.every(a=>a.paused));});
console.log(n+' media checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
