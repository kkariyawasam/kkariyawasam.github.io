<script>
  // ===== Slider logic (Projects) =====
  const slider = document.getElementById('projectsSlider');
  const dotsWrap = document.getElementById('projectsDots');
  const slides = [...slider.querySelectorAll('.slide')];

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'slider-dot';
    d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    d.addEventListener('click', () => scrollToSlide(i));
    dotsWrap.appendChild(d);
  });

  function slideWidth() {
    const first = slides[0];
    const gap = parseFloat(getComputedStyle(slider).gap || "0");
    return first.getBoundingClientRect().width + gap;
  }

  function currentIndex() {
    const w = slideWidth();
    return Math.round(slider.scrollLeft / w);
  }

  function setActiveDot(i){
    [...dotsWrap.children].forEach((d, idx) => d.classList.toggle('active', idx === i));
  }

  function scrollToSlide(i){
    const w = slideWidth();
    slider.scrollTo({ left: i * w, behavior: 'smooth' });
    setActiveDot(i);
  }

  // Arrow buttons
  document.querySelectorAll('.slider-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.classList.contains('next') ? 1 : -1;
      const next = Math.max(0, Math.min(slides.length - 1, currentIndex() + dir));
      scrollToSlide(next);
    });
  });

  // Update active dot while scrolling
  let t;
  slider.addEventListener('scroll', () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => setActiveDot(currentIndex()), 60);
  });

  // Keyboard support
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') scrollToSlide(Math.min(slides.length - 1, currentIndex() + 1));
    if (e.key === 'ArrowLeft') scrollToSlide(Math.max(0, currentIndex() - 1));
  });

  // Drag to scroll (mouse)
  let isDown = false, startX = 0, startLeft = 0;
  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('dragging');
    startX = e.pageX;
    startLeft = slider.scrollLeft;
  });
  window.addEventListener('mouseup', () => { isDown = false; slider.classList.remove('dragging'); });
  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const dx = e.pageX - startX;
    slider.scrollLeft = startLeft - dx;
  });

  // Init
  setActiveDot(0);
</script>
