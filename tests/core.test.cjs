const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const core = require(path.join(root,'core.js'));
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'cases.js'),'utf8'), context);
const cases=context.PS_CASES;
let count=0;
function test(name,fn){fn();count++;process.stdout.write('PASS '+name+'\n');}
test('all supplied card values factor exactly',()=>{
 for(const c of cases)for(const p of c.suspects){const f=core.factor(p.card);assert.equal(f.reduce((n,{p,k})=>n*p**k,1),p.card);}
});
test('chapter 1 absence and parity',()=>{
 assert.equal(core.factor(1764).some(x=>x.p===5),false);
 assert.deepEqual(core.factor(2340),[{p:2,k:2},{p:3,k:2},{p:5,k:1},{p:13,k:1}]);
 assert.equal(2**2*3**2*5**2*13**2,152100);
});
test('timeline has exactly one valid one-to-one assignment',()=>{
 const c=cases[1], ids=c.suspects.map(p=>p.id),valid=[];
 for(const a of ids)for(const b of ids)for(const d of ids){const assignment={150:a,1470:b,7098:d};if(core.matches(assignment,c.snapshots,c.suspects))valid.push(assignment);}
 assert.deepEqual(valid,[{150:'lee',1470:'kim',7098:'kang'}]);
 assert.equal(core.quotient(298116,7098),42);assert.equal(core.quotient(152100,150),1014);assert.equal(core.quotient(44100,7098),null);
});
test('gcd and swapped exit blocks restore real routes',()=>{
 assert.equal(core.gcd(355740,496860),2940);
 assert.deepEqual(core.restore(355740,42,496860,70),[592900,298116]);
 assert.equal(2**2*5**2*7**2*11**2,592900);
});
test('noise correction and consistent hatch route',()=>{
 assert.deepEqual(core.factor(1009),[{p:1009,k:1}]);
 assert.deepEqual(core.factor(1763),[{p:41,k:1},{p:43,k:1}]);
 assert.equal(1763+1,1764);assert.equal(1009-1,2**4*3**2*7);
 const route=[2,2,2,3,7,3,2];assert.equal(route.reduce((a,b)=>a*b,1),1008);
});
test('proof validator rejects false claims, missing evidence, extras, missing tools',()=>{
 for(const c of cases)for(const s of c.steps){if(s.type==='matching')continue;
 assert.equal(core.checkProof(s,s.claim,[...s.evidence],[...(s.flags||[])]).ok,true);
 assert.equal(core.checkProof(s,'wrong',[...s.evidence],[...(s.flags||[])]).ok,false);
 assert.equal(core.checkProof(s,s.claim,[],[...(s.flags||[])]).ok,false);
 assert.equal(core.checkProof(s,s.claim,[...s.evidence,'irrelevant'],[...(s.flags||[])]).ok,false);
 if(s.flags?.length)assert.equal(core.checkProof(s,s.claim,[...s.evidence],[]).ok,false);
 }
});
test('invalid numeric inputs fail explicitly',()=>{
 for(const n of [0,-1,NaN,Infinity,1.5,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>core.factor(n),RangeError);
 assert.deepEqual(core.factor(1),[]);assert.throws(()=>core.restore(5,2,7,3),RangeError);
});
test('all maps reference existing unique prime gates; solutions reference real statements',()=>{
 for(const c of cases){const gates=c.rooms.map(r=>r.p);assert.equal(new Set(gates).size,gates.length);
 for(const p of gates)assert.deepEqual(core.factor(p),[{p,k:1}]);
 for(const [a,b]of c.edges){assert.ok(gates.includes(a)&&gates.includes(b));}
 for(const s of c.steps){if(s.type==='matching')continue;const claims=[...c.suspects.flatMap(p=>p.lines.map(l=>l.id)),...(s.options||[]).map(o=>o.id)];assert.ok(claims.includes(s.claim));}
 }
});
process.stdout.write(`${count} checks passed.\n`);
