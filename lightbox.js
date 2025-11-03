// Lightweight zoom lightbox for .gallery img (no dependencies)
(() => {
  const BODY_LOCK_CLASS = 'lb-scroll-lock';
  let backdrop, stage, closeBtn, active, scrollingYBefore, closeTimeout;

  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function lockScroll() {
    scrollingYBefore = window.scrollY;
    document.documentElement.classList.add(BODY_LOCK_CLASS);
    document.documentElement.style.top = `-${scrollingYBefore}px`;
  }
  function unlockScroll() {
    document.documentElement.classList.remove(BODY_LOCK_CLASS);
    document.documentElement.style.top = '';
    window.scrollTo(0, scrollingYBefore || 0);
  }

  function build() {
    if (backdrop) return;
    backdrop = document.createElement('div');
    backdrop.className = 'lb-backdrop';
    stage = document.createElement('div');
    stage.className = 'lb-stage';
    closeBtn = document.createElement('button');
    closeBtn.className = 'lb-close';
    closeBtn.type = 'button';
    closeBtn.textContent = 'Close ✕';

    document.body.appendChild(backdrop);
    document.body.appendChild(stage);
    document.body.appendChild(closeBtn);

    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Scroll lock CSS
    const style = document.createElement('style');
    style.textContent = `.${BODY_LOCK_CLASS} { position: fixed; width: 100%; }`;
    document.head.appendChild(style);
  }

  function open(img) {
    build();
    if (active) return;

    const src = img.getAttribute('data-full') || img.currentSrc || img.src;
    const rect = img.getBoundingClientRect();

    const clone = document.createElement('img');
    clone.className = 'lb-clone';
    clone.src = src;
    clone.alt = img.alt || '';
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;

    stage.appendChild(clone);

    // Show backdrop (now accepts pointer events only when visible)
    requestAnimationFrame(() => backdrop.classList.add('is-visible'));

    const vw = window.innerWidth, vh = window.innerHeight;
    const maxW = Math.min(vw * 0.92, 1400);
    const maxH = vh * 0.92;

    const tmp = new Image();
    tmp.onload = () => {
      const ar = (tmp.naturalWidth || 1) / (tmp.naturalHeight || 1);
      let targetW = maxW, targetH = targetW / ar;
      if (targetH > maxH) { targetH = maxH; targetW = targetH * ar; }

      const left = (vw - targetW) / 2;
      const top  = (vh - targetH) / 2;

      requestAnimationFrame(() => {
        clone.style.left = `${left}px`;
        clone.style.top = `${top}px`;
        clone.style.width = `${targetW}px`;
        clone.style.height = `${targetH}px`;
        clone.style.borderRadius = '16px';
      });

      active = { clone, origin: img };
      closeBtn.style.display = 'block';
      lockScroll();
    };
    tmp.src = src;
  }

  function cleanupClone() {
    if (!active) return;
    const { clone } = active;
    if (clone && clone.parentNode === stage) stage.removeChild(clone);
    active = null;
  }

  function close() {
    if (!active) return;
    const { clone, origin } = active;
    const rect = origin.getBoundingClientRect();

    // Reverse animation
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.borderRadius = '12px';
    backdrop.classList.remove('is-visible');
    closeBtn.style.display = 'none';

    // Ensure we always reset, even if transitionend doesn't fire
    if (closeTimeout) clearTimeout(closeTimeout);
    closeTimeout = setTimeout(() => {
      cleanupClone();
    }, 350);

    clone.addEventListener('transitionend', () => {
      clearTimeout(closeTimeout);
      cleanupClone();
    }, { once: true });

    unlockScroll();
  }

  function enhance() {
    qsa('.gallery img').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => open(img), { passive: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhance);
  } else {
    enhance();
  }
})();
