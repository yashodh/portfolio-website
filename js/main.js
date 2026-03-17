/* ===========================================
   TAB SWITCHING
   =========================================== */
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const contentHeading = document.getElementById('content-heading');

function switchTab(targetId) {
  const currentPanel = document.querySelector('.tab-panel.active');
  const newPanel = document.getElementById(`tab-${targetId}`);
  if (!newPanel || currentPanel === newPanel) return;

  // Update buttons and heading
  const dropdownLabel = document.querySelector('.dropdown-label');
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === targetId);
    btn.setAttribute('aria-selected', btn.dataset.tab === targetId);
    if (btn.dataset.tab === targetId && contentHeading) {
      contentHeading.textContent = btn.textContent;
      if (dropdownLabel) dropdownLabel.textContent = btn.textContent;
    }
  });
  dropdownItems.forEach(item => item.classList.toggle('active', item.dataset.tab === targetId));

  // Crossfade: fade out current, then swap, then fade in new
  currentPanel.style.opacity = '0';
  setTimeout(() => {
    // Reset fade-in state on the outgoing panel so it replays next visit
    currentPanel.querySelectorAll('.fade-in').forEach(el => {
      el.classList.remove('visible');
      el.style.transitionDelay = '';
    });
    currentPanel.classList.remove('active');
    currentPanel.style.opacity = '';
    document.querySelector('.content-area').scrollTop = 0;
    newPanel.style.opacity = '0';
    newPanel.classList.add('active');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      newPanel.style.opacity = '1';
      triggerFadeIns(newPanel);
    }));
  }, 200);
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

/* ===========================================
   SCROLL / REVEAL ANIMATIONS
   =========================================== */
function triggerFadeIns(container) {
  const elements = container.querySelectorAll('.fade-in');
  elements.forEach((el, i) => {
    el.style.transitionDelay = `${i * 60}ms`;
    requestAnimationFrame(() => el.classList.add('visible'));
  });
}

/* ===========================================
   MEDIA VIDEO (click-to-play)
   =========================================== */
function initVideoPlayers() {
  document.querySelectorAll('.media-video').forEach(el => {
    el.addEventListener('click', () => {
      const src = el.dataset.youtube;
      if (!src) return;
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
      el.innerHTML = '';
      el.appendChild(iframe);
      el.style.cursor = 'default';
    });
  });
}

/* ===========================================
   MEDIA CAROUSELS
   =========================================== */
function initCarousels() {
  document.querySelectorAll('.media-carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prev = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    const dots = carousel.querySelectorAll('.dot');
    const total = slides.length;
    let current = 0;

    // Set track and slide widths dynamically based on slide count
    track.style.width = `${total * 100}%`;
    slides.forEach(slide => slide.style.width = `${100 / total}%`);

    function goTo(index) {
      current = index;
      track.style.transform = `translateX(-${current * (100 / total)}%)`;

      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      prev.classList.remove('hidden');
      next.classList.remove('hidden');

      // Lazy-load iframe on first visit
      const iframe = slides[current].querySelector('iframe[data-src]');
      if (iframe) {
        iframe.src = iframe.dataset.src;
        delete iframe.dataset.src;
      }

      // Pause iframe when navigating away
      slides.forEach((slide, i) => {
        if (i !== current) {
          const f = slide.querySelector('iframe');
          if (f && f.src) f.src = f.src;
        }
      });
    }

    prev.addEventListener('click', () => goTo((current - 1 + total) % total));
    next.addEventListener('click', () => goTo((current + 1) % total));

    goTo(0); // init state
  });
}

/* ===========================================
   MOBILE DROPDOWN
   =========================================== */
function initMobileDropdown() {
  const dropdown = document.getElementById('mobile-tab-dropdown');
  const trigger = document.getElementById('dropdown-trigger');
  const menu = document.getElementById('dropdown-menu');
  if (!dropdown || !trigger || !menu) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    trigger.setAttribute('aria-expanded', isOpen);
  });

  menu.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      switchTab(item.dataset.tab);
      dropdown.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  });
}

/* ===========================================
   INIT ON LOAD
   =========================================== */
document.addEventListener('DOMContentLoaded', () => {
  const activePanel = document.querySelector('.tab-panel.active');
  if (activePanel) {
    setTimeout(() => triggerFadeIns(activePanel), 80);
  }
  initCarousels();
  initVideoPlayers();
  initMobileDropdown();
});
