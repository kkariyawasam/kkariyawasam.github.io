/* script.js
   Works with the portfolio HTML/CSS I provided (navbar, smooth scroll, scrollspy,
   progress bar, theme toggle, mobile menu, and the Projects slider window).
*/

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     Helpers
  ========================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* =========================
     Smooth scroll + close mobile menu
  ========================== */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;

      const el = $(id);
      if (!el) return;

      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });

      const navLinks = $("#navLinks");
      navLinks?.classList.remove("open");
    });
  });

  /* =========================
     Mobile menu toggle
  ========================== */
  const hamburger = $("#hamburger");
  const navLinks = $("#navLinks");
  hamburger?.addEventListener("click", () => {
    navLinks?.classList.toggle("open");
  });

  /* Close mobile menu when clicking outside */
  document.addEventListener("click", (e) => {
    if (!navLinks || !hamburger) return;
    const clickedInsideMenu = navLinks.contains(e.target);
    const clickedHamburger = hamburger.contains(e.target);
    if (!clickedInsideMenu && !clickedHamburger) navLinks.classList.remove("open");
  });

  /* =========================
     Navbar shadow + progress bar
  ========================== */
  const navbar = $("#navbar");
  const progress = $("#progress");

  const updateScrollUI = () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 10);

    if (progress) {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progress.style.width = `${percent}%`;
    }
  };

  updateScrollUI();
  window.addEventListener("scroll", updateScrollUI, { passive: true });

  /* =========================
     Scrollspy (active nav link)
  ========================== */
  const sections = $$("section, header.hero").filter((s) => s.id);
  const navItems = $$(".navlink");

  const findLinkById = (id) => navItems.find((l) => l.getAttribute("href") === `#${id}`);

  if (sections.length && navItems.length) {
    const io = new IntersectionObserver(
      (entries) => {
        // Find the most visible intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const id = visible.target.getAttribute("id");
        navItems.forEach((l) => l.classList.remove("active"));
        const link = findLinkById(id);
        if (link) link.classList.add("active");
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0.02, 0.1, 0.2, 0.4, 0.6] }
    );

    sections.forEach((s) => io.observe(s));
  }

  /* =========================
     Theme toggle (light/dark)
  ========================== */
  const toggle = $("#themeToggle");
  const icon = $("#themeIcon");

  const setTheme = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    if (icon) icon.textContent = t === "dark" ? "☀️" : "🌙";
    localStorage.setItem("theme", t);
  };

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) setTheme(savedTheme);

  toggle?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(current === "light" ? "dark" : "light");
  });

  /* =========================
     Footer year
  ========================== */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* =========================
     Projects slider (sliding window)
     - arrows
     - dots
     - drag / swipe
     - keyboard arrows
  ========================== */
  const slider = $("#projectsSlider");
  const dotsWrap = $("#projectsDots");

  if (slider && dotsWrap) {
    const slides = $$(".slide", slider);

    // Build dots
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "slider-dot";
      d.type = "button";
      d.setAttribute("aria-label", `Go to slide ${i + 1}`);
      d.addEventListener("click", () => scrollToSlide(i));
      dotsWrap.appendChild(d);
    });

    const getGap = () => parseFloat(getComputedStyle(slider).gap || "0");

    const slideWidth = () => {
      const first = slides[0];
      if (!first) return 0;
      return first.getBoundingClientRect().width + getGap();
    };

    const currentIndex = () => {
      const w = slideWidth();
      if (!w) return 0;
      return Math.round(slider.scrollLeft / w);
    };

    const setActiveDot = (i) => {
      [...dotsWrap.children].forEach((d, idx) => d.classList.toggle("active", idx === i));
    };

    function scrollToSlide(i) {
      const w = slideWidth();
      slider.scrollTo({ left: i * w, behavior: "smooth" });
      setActiveDot(i);
    }

    // Arrow buttons
    $$(".slider-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dir = btn.classList.contains("next") ? 1 : -1;
        const next = Math.max(0, Math.min(slides.length - 1, currentIndex() + dir));
        scrollToSlide(next);
      });
    });

    // Update active dot while scrolling (debounced)
    let t;
    slider.addEventListener(
      "scroll",
      () => {
        window.clearTimeout(t);
        t = window.setTimeout(() => setActiveDot(currentIndex()), 60);
      },
      { passive: true }
    );

    // Keyboard support
    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollToSlide(Math.min(slides.length - 1, currentIndex() + 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollToSlide(Math.max(0, currentIndex() - 1));
      }
    });

    // Drag to scroll (mouse)
    let isDown = false;
    let startX = 0;
    let startLeft = 0;

    slider.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX;
      startLeft = slider.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
      isDown = false;
    });

    slider.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const dx = e.pageX - startX;
      slider.scrollLeft = startLeft - dx;
    });

    // Touch swipe support (mobile)
    let touchStartX = 0;
    let touchStartLeft = 0;

    slider.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches || !e.touches[0]) return;
        touchStartX = e.touches[0].pageX;
        touchStartLeft = slider.scrollLeft;
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchmove",
      (e) => {
        if (!e.touches || !e.touches[0]) return;
        const dx = e.touches[0].pageX - touchStartX;
        slider.scrollLeft = touchStartLeft - dx;
      },
      { passive: true }
    );

    // Recalculate active dot on resize
    window.addEventListener("resize", () => setActiveDot(currentIndex()));

    // Init
    setActiveDot(0);
  }
});
