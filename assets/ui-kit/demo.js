'use strict';
const byId = id => document.getElementById(id);
const toggleSwap = byId('toggle-swap');
toggleSwap.addEventListener('click', () => {
  const active = toggleSwap.getAttribute('aria-pressed') !== 'true';
  toggleSwap.setAttribute('aria-pressed', String(active));
  byId('swap-preview').src = `assets/ui_switch_swap_${active ? 'active' : 'idle'}.svg`;
  byId('swap-status').textContent = active ? '시연: 라운지 이후 퇴실 블록 교환 선택' : '시연: 교환 선택 해제';
});
document.querySelectorAll('[data-dial]').forEach(button => {
  button.addEventListener('click', () => {
    const state = button.dataset.dial;
    document.querySelectorAll('[data-dial]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    byId('dial-preview').src = `assets/ui_dial_noise_${state}.svg`;
    byId('dial-status').textContent = `시연 선택값: ${button.textContent}. 실제 기록에는 적용하지 않습니다.`;
  });
});
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let effectTimer;
function stopEffect() {
  clearTimeout(effectTimer);
  document.querySelectorAll('.ps-vfx').forEach(node => node.classList.remove('ps-play'));
  document.querySelectorAll('[data-effect]').forEach(button => {button.disabled = false;});
}
function playEffect(kind) {
  stopEffect();
  byId('effect-status').textContent = kind === 'slash' ? '시연: 소인수 분해 연출' : '시연: 진술 논파 연출';
  if (motionQuery.matches) {
    byId('effect-status').textContent += ' — 동작 줄이기 설정으로 정적 안내만 표시';
    return;
  }
  document.querySelectorAll('[data-effect]').forEach(button => {button.disabled = true;});
  byId(`effect-${kind}`).classList.add('ps-play');
  effectTimer = setTimeout(stopEffect, 700);
}
document.querySelectorAll('[data-effect]').forEach(button => button.addEventListener('click', () => playEffect(button.dataset.effect)));
byId('effect-cancel').addEventListener('click', () => {stopEffect();byId('effect-status').textContent='시연 연출 중지';});
motionQuery.addEventListener('change', stopEffect);
window.addEventListener('pagehide', stopEffect);
