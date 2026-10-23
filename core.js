/* DOM과 분리한 계산 및 논리 검증. 카드 수치는 안전한 양의 정수만 허용합니다. */
(function (root) {
  'use strict';
  function integer(n) {
    if (!Number.isSafeInteger(n) || n < 1) throw new RangeError('카드 수치는 양의 안전한 정수여야 합니다.');
  }
  function factor(n) {
    integer(n);
    const list = [];
    let rest = n;
    for (let p = 2; p <= rest / p; p += p === 2 ? 1 : 2) {
      let k = 0;
      while (rest % p === 0) { rest /= p; k++; }
      if (k) list.push({ p, k });
    }
    if (rest > 1) list.push({ p: rest, k: 1 });
    return list;
  }
  function gcd(a, b) {
    integer(a); integer(b);
    while (b) [a, b] = [b, a % b];
    return a;
  }
  function quotient(final, snapshot) {
    integer(final); integer(snapshot);
    return final % snapshot === 0 ? final / snapshot : null;
  }
  function matches(assignments, snapshots, suspects) {
    const ids = snapshots.map(s => assignments[s.value]);
    if (ids.some(id => !id) || new Set(ids).size !== snapshots.length) return false;
    return snapshots.every(s => {
      const person = suspects.find(p => p.id === assignments[s.value]);
      return person && quotient(person.card, s.value) !== null;
    });
  }
  function restore(a, tailA, b, tailB) {
    if (quotient(a, tailA) === null || quotient(b, tailB) === null) throw new RangeError('분리할 수 없는 퇴실 기록입니다.');
    return [a / tailA * tailB, b / tailB * tailA];
  }
  function checkProof(step, claim, evidence, flags) {
    if (claim !== step.claim) return { ok: false, reason: 'claim' };
    if (evidence.length !== step.evidence.length || !step.evidence.every(e => evidence.includes(e))) return { ok: false, reason: 'evidence' };
    if ((step.flags || []).some(f => !flags.includes(f))) return { ok: false, reason: 'tool' };
    return { ok: true };
  }
  const api = { factor, gcd, quotient, matches, restore, checkProof };
  root.PSCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
