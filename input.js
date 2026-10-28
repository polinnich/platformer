
const keys = {
  left: false,
  right: false,
  jump: false
};

export function initInput() {
  // Клавиатура
  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'A', 'd', 'D', 'w', 'W'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.jump = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.jump = false;
  });

  // Мобильные кнопки
  const btnLeft = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');
  const btnJump = document.getElementById('btnJump');

  const bindMobile = (btn, key) => {
    if (!btn) return;
    const set = (val) => { keys[key] = val; };
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); set(true); }, { passive: false });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); set(false); }, { passive: false });
    btn.addEventListener('touchcancel', () => set(false));
    btn.addEventListener('mousedown', () => set(true));
    btn.addEventListener('mouseup', () => set(false));
    btn.addEventListener('mouseleave', () => set(false));
  };

  bindMobile(btnLeft, 'left');
  bindMobile(btnRight, 'right');
  bindMobile(btnJump, 'jump');
}

export function getKeys() {
  return keys;
}

export function clearKeys() {
  keys.left = false;
  keys.right = false;
  keys.jump = false;
}