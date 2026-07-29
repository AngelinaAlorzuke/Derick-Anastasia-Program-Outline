/* =========================================================
   DERICK & ANASTASIA — script.js
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Loading screen ---------- */
  const loader = document.getElementById('loader');
  window.setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }, 2400);

  /* ---------- 2. Scroll reveal (AOS + fallback IntersectionObserver) ---------- */
  if (window.AOS) {
    AOS.init({ once: true, duration: 800, easing: 'ease-out-cubic', offset: 40 });
  }
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- 2b. Navigation: topBar + tabNav ---------- */
  const tabNav = document.getElementById('tabNav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const heroEl = document.querySelector('.hero');
  const tabLinks = document.querySelectorAll('.tab-link');

  if (tabNav && heroEl) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // reveal the sticky tab bar once the hero has scrolled mostly out of view (desktop only)
        tabNav.classList.toggle('visible', !entry.isIntersecting);
      });
    }, { threshold: 0.6 });
    navObserver.observe(heroEl);
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = 'auto';
      });
    });
  }

  // scroll-spy: highlight the tab-link matching the section currently in view
  if (tabLinks.length) {
    const sections = Array.from(tabLinks)
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          tabLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
        }
      });
    }, { threshold: 0.4, rootMargin: '-80px 0px -40% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- 3. Countdown ---------- */
  const WEDDING_DATE = new Date('2026-08-15T12:30:00+00:00').getTime();
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');

  function pad(n){ return n.toString().padStart(2,'0'); }

  function tickCountdown(){
    const now = Date.now();
    let diff = WEDDING_DATE - now;
    if (diff < 0) diff = 0;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    if (cdDays) cdDays.textContent = pad(days);
    if (cdHours) cdHours.textContent = pad(hours);
    if (cdMins) cdMins.textContent = pad(mins);
    if (cdSecs) cdSecs.textContent = pad(secs);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- 4. Gallery Carousel + Lightbox ---------- */
  const carouselTrack = document.getElementById('carouselTrack');
  const galleryCount = 16; // gallery-01.jpg .. gallery-16.jpg
  const images = [];
  for (let i = 1; i <= galleryCount; i++) {
    images.push(`assets/images/gallery-${String(i).padStart(2,'0')}.jpg`);
  }

  images.forEach((src, i) => {
    const fig = document.createElement('figure');
    fig.setAttribute('data-index', i);
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.alt = `Derick and Anastasia — gallery photo ${i + 1}`;
    fig.appendChild(img);
    carouselTrack.appendChild(fig);
  });

  const carPrev = document.getElementById('carPrev');
  const carNext = document.getElementById('carNext');
  function scrollCarousel(dir){
    const card = carouselTrack.querySelector('figure');
    if (!card) return;
    const amount = card.getBoundingClientRect().width + 12; // gap
    carouselTrack.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }
  if (carPrev) carPrev.addEventListener('click', () => scrollCarousel(-1));
  if (carNext) carNext.addEventListener('click', () => scrollCarousel(1));

  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  let currentIndex = 0;

  function openLightbox(index){
    currentIndex = index;
    lbImg.src = images[currentIndex];
    lightbox.classList.add('open');
  }
  function closeLightbox(){ lightbox.classList.remove('open'); }
  function showNext(){ currentIndex = (currentIndex + 1) % images.length; lbImg.src = images[currentIndex]; }
  function showPrev(){ currentIndex = (currentIndex - 1 + images.length) % images.length; lbImg.src = images[currentIndex]; }

  carouselTrack.addEventListener('click', (e) => {
    const fig = e.target.closest('figure');
    if (!fig) return;
    openLightbox(Number(fig.getAttribute('data-index')));
  });
  lbClose.addEventListener('click', closeLightbox);
  lbNext.addEventListener('click', showNext);
  lbPrev.addEventListener('click', showPrev);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  // basic swipe support on mobile lightbox
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (dx > 50) showPrev();
    if (dx < -50) showNext();
  });

  /* ---------- 4b. Order of Photography badges ---------- */
  const photoBadgeGrid = document.getElementById('photoBadgeGrid');
  if (photoBadgeGrid) {
    const photoOrder = [
      "Officiating Ministers", "Counselors", "Groom's Parents", "Both Parents",
      "Bride's Parents", "Bride's Family", "Both Family", "Groom's Family",
      "Bride's Siblings", "Groom's Siblings", "NMAH Lab Staff", "NMAH Staff",
      "GRO Officials Staff & Sub-Contractors", "Global Evangelical Church Members",
      "Global Evangelical Media Team & VOG (Voice of Grace)", "King's Temple Members",
      "King's Choir", "3:16", "Broken Chains", "Wonder Breed Team",
      "Groom's Friends", "Bride's Friends"
    ];
    photoOrder.forEach((label, i) => {
      const item = document.createElement('div');
      item.className = 'photo-badge';
      item.innerHTML = `<span class="badge-num">${i}</span><span>${label}</span>`;
      photoBadgeGrid.appendChild(item);
    });
  }

  /* ---------- 4c. Share Your Memories upload preview ---------- */
  const memoryUpload = document.getElementById('memoryUpload');
  const uploadPreview = document.getElementById('uploadPreview');
  if (memoryUpload && uploadPreview) {
    memoryUpload.addEventListener('change', () => {
      uploadPreview.innerHTML = '';
      Array.from(memoryUpload.files).forEach(file => {
        const url = URL.createObjectURL(file);
        const el = file.type.startsWith('video') ? document.createElement('video') : document.createElement('img');
        el.src = url;
        if (el.tagName === 'VIDEO') { el.muted = true; el.controls = true; }
        uploadPreview.appendChild(el);
      });
    });
  }

  /* ---------- 4d. Guest Messages ---------- */
  // ── Google Forms hookup ──────────────────────────────────────────────
  // 1. Create a Google Form with two short-answer questions: "Name" and "Message".
  // 2. Click the ⋮ menu → "Get pre-filled link", fill in sample answers, click "Get link".
  // 3. That link looks like: https://docs.google.com/forms/d/e/XXXXXXX/viewform?entry.111=John&entry.222=Hello
  //    - GOOGLE_FORM_ACTION_URL = same XXXXXXX id, with /formResponse instead of /viewform
  //    - GOOGLE_FORM_ENTRY_NAME / GOOGLE_FORM_ENTRY_MESSAGE = the entry.### numbers for each field
  // 4. Paste all three values below. Until then, messages still post to the on-page wall,
  //    they just won't be copied to your Google Sheet yet.
  const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfZw18EzGYtMMY3WVVxqEHJmfTErwRsS-aw4AU2PT09TN10BA/formResponse';
  const GOOGLE_FORM_ENTRY_NAME = 'entry.159986993';
  const GOOGLE_FORM_ENTRY_MESSAGE = 'entry.1383773970';
  const GOOGLE_FORM_READY = !GOOGLE_FORM_ACTION_URL.includes('REPLACE') &&
                             !GOOGLE_FORM_ENTRY_NAME.includes('REPLACE') &&
                             !GOOGLE_FORM_ENTRY_MESSAGE.includes('REPLACE');

  function submitToGoogleForm(name, message){
    if (!GOOGLE_FORM_READY) return; // silently skip until the IDs above are filled in
    const body = new URLSearchParams();
    body.append(GOOGLE_FORM_ENTRY_NAME, name);
    body.append(GOOGLE_FORM_ENTRY_MESSAGE, message);
    // Google Forms doesn't allow CORS reads, so we fire-and-forget with no-cors.
    fetch(GOOGLE_FORM_ACTION_URL, { method: 'POST', mode: 'no-cors', body }).catch(() => {});
  }

  const guestForm = document.getElementById('guestForm');
  const guestNote = document.getElementById('guestNote');
  const messageList = document.getElementById('messageList');
  function renderEmptyState(){
    if (messageList && !messageList.querySelector('.message-card')) {
      messageList.innerHTML = '<p class="message-empty">Be the first to leave a message for the couple 💛</p>';
    }
  }
  renderEmptyState();
  if (guestForm) {
    guestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('gName').value.trim();
      const msg = document.getElementById('gMessage').value.trim();
      if (!name || !msg) return;

      submitToGoogleForm(name, msg);

      const empty = messageList.querySelector('.message-empty');
      if (empty) empty.remove();
      const card = document.createElement('div');
      card.className = 'message-card';
      card.innerHTML = `<span class="m-name"></span><p></p>`;
      card.querySelector('.m-name').textContent = name;
      card.querySelector('p').textContent = msg;
      messageList.prepend(card);
      guestForm.reset();

      if (guestNote) {
        guestNote.classList.add('show');
        window.setTimeout(() => guestNote.classList.remove('show'), 4000);
      }
    });
  }

  /* ---------- 5. RSVP form ---------- */
  const attendToggle = document.getElementById('attendToggle');
  const attendanceInput = document.getElementById('attendance');
  if (attendToggle) {
    attendToggle.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        attendToggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        attendanceInput.value = btn.getAttribute('data-value');
      });
    });
  }

  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpNote = document.getElementById('rsvpNote');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Ready for Netlify Forms / Formspree / Google Forms integration.
      // Swap this block for a real fetch() call to your chosen form endpoint.
      rsvpNote.classList.add('show');
      rsvpForm.reset();
      if (attendToggle) {
        attendToggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        attendToggle.querySelector('button').classList.add('active');
        attendanceInput.value = attendToggle.querySelector('button').getAttribute('data-value');
      }
    });
  }

});
