/**
 * STACKLY RENEWABLE ENERGY - MAIN LOGIC
 * Navigation, Full Viewport Loader, Dynamic Greetings, AOS Scroll Reveals, WCAG Helpers
 */

document.addEventListener("DOMContentLoaded", () => {
  initPageLoader();
  initDynamicGreeting();
  initStickyNavbar();
  initMobileNav();
  initScrollReveals();
  initCharCounters();
  initActionRedirections();
  initWindoraBoardTabs();
  init3DCardTilt();
  initAmbientHeroVideos();
});

/* =========================================================
   1. FULL VIEWPORT LOADER
   Smooth CSS spinner, instant hide on interactive, fallback timeout
   ========================================================= */
function initPageLoader() {
  const loader = document.getElementById("pageLoader");
  if (!loader) return;

  const hideLoader = () => {
    loader.classList.add("is-hidden");
    setTimeout(() => {
      loader.style.display = "none";
    }, 450);
  };

  // Immediate hide when DOM is ready with slight delay for silky visual transition
  if (document.readyState === "complete") {
    setTimeout(hideLoader, 300);
  } else {
    window.addEventListener("load", () => {
      setTimeout(hideLoader, 350);
    });
  }

  // Fallback safety timeout (maximum 1.5 seconds)
  setTimeout(hideLoader, 1500);
}

/* =========================================================
   2. DYNAMIC GREETING BASED ON LOCAL TIME ZONE & DURATION
   ========================================================= */
function getGreetingByTime() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 22) {
    return "Good evening";
  } else {
    return "Good night";
  }
}

function initDynamicGreeting() {
  const greeting = getGreetingByTime();
  const greetingElements = document.querySelectorAll(".dynamic-greeting");
  greetingElements.forEach((el) => {
    const customUser = el.getAttribute("data-user");
    if (customUser) {
      el.textContent = `${greeting}, ${customUser}`;
    } else {
      el.textContent = greeting;
    }
  });

  // Time meta badges
  const timeMetaElements = document.querySelectorAll(".current-local-time");
  timeMetaElements.forEach((el) => {
    const now = new Date();
    el.textContent = now.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  });
}

/* =========================================================
   3. STICKY NAVBAR & ACTIVE NAV ITEM HIGHLIGHT
   ========================================================= */
function initStickyNavbar() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 25) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Highlight active page
  const currentPath = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href")?.toLowerCase();
    if (!href) return;

    const isHome =
      (currentPath.endsWith("index.html") || currentPath.endsWith("/") || currentPath === "") &&
      (href.endsWith("index.html") || href === "./" || href === "/");

    if (isHome) {
      if (href.includes("index.html") || href === "./" || href === "/") {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    } else if (href !== "#" && currentPath.includes(href.replace(/^(\.\/|\.\.\/)/, ""))) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

/* =========================================================
   4. MOBILE NAVIGATION (FULL SCREEN OVERLAY & BODY SCROLL LOCK)
   ========================================================= */
function initMobileNav() {
  const toggleBtn = document.querySelector(".mobile-nav-toggle");
  const overlay = document.querySelector(".mobile-nav-overlay");
  if (!toggleBtn || !overlay) return;

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !overlay.classList.contains("is-active");
    if (isOpen) {
      overlay.classList.add("is-active");
      document.body.classList.add("nav-open");
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.innerHTML = `
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      `;
    } else {
      overlay.classList.remove("is-active");
      document.body.classList.remove("nav-open");
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.innerHTML = `
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      `;
    }
  }

  toggleBtn.addEventListener("click", () => toggleMenu());

  // Close when clicking mobile links
  const links = overlay.querySelectorAll("a");
  links.forEach((l) => {
    l.addEventListener("click", () => toggleMenu(false));
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-active")) {
      toggleMenu(false);
    }
  });
}

/* =========================================================
   5. AOS SCROLL REVEALS VIA INTERSECTION OBSERVER
   ========================================================= */
function initScrollReveals() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* =========================================================
   6. FORM CHARACTER COUNTER & LIVE VALIDATION HELPERS
   ========================================================= */
function initCharCounters() {
  const inputs = document.querySelectorAll("[data-counter-target]");
  inputs.forEach((input) => {
    const counterId = input.getAttribute("data-counter-target");
    const counterEl = document.getElementById(counterId);
    const max = input.getAttribute("maxlength") || 500;

    const updateCount = () => {
      if (counterEl) {
        counterEl.textContent = `${input.value.length} / ${max} characters`;
      }
    };

    input.addEventListener("input", updateCount);
    updateCount();
  });
}

/* =========================================================
   7. ACTION BUTTONS & LINKS REDIRECTION TO 404
   Ensures compliance with:
   - "Every action button/ links should be redirected to 404 page"
   - "All the links in the footer section should be redirected to 404 page except quick links and logo"
   - "Social media links redirect to 404 page"
   ========================================================= */
function initActionRedirections() {
  document.addEventListener("click", (e) => {
    const target = e.target.closest("a, button");
    if (!target) return;

    // If explicit 404 action class or attribute
    if (target.classList.contains("action-redirect-404") || target.getAttribute("data-action") === "404") {
      e.preventDefault();
      const isPagesDir = window.location.pathname.includes("/pages/");
      window.location.href = isPagesDir ? "404.html" : "pages/404.html";
    }
  });
}

/* =========================================================
   8. WINDORA OBSIDIAN BOARD INTERACTIVE TABS
   ========================================================= */
function initWindoraBoardTabs() {
  const tabs = document.querySelectorAll(".windora-board-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
    });
  });
}

/* =========================================================
   9. INTERACTIVE 3D PERSPECTIVE CARD TILT ENGINE
   Calculates mouse coordinates relative to card center, applies
   smooth 3D transform with RAF for 60fps performance
   ========================================================= */
function init3DCardTilt() {
  // Check for reduced motion preference or touch devices
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 768) {
    return;
  }

  const tiltTargets = document.querySelectorAll(
    ".tilt-card, .card, .windora-story-card, .windora-metric-card, .windora-kpi-card, .windora-telemetry-glass-card, .testimonial-card"
  );

  tiltTargets.forEach((card) => {
    let ticking = false;

    card.addEventListener("mousemove", (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const cardX = e.clientX - rect.left;
          const cardY = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          // Compute tilt angles (max 8 degrees for clean, subtle elegance)
          const rotateX = ((cardY - centerY) / centerY) * -7.5;
          const rotateY = ((cardX - centerX) / centerX) * 7.5;

          card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
          card.style.transition = "transform 0.08s ease-out, box-shadow 0.25s ease";
          ticking = false;
        });
        ticking = true;
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      card.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease";
    });
  });
}

/* =========================================================
   10. AMBIENT HERO VIDEO ANIMATION CONTROLLER
   Ensures video loops silently, handles autoplay & reduction
   ========================================================= */
function initAmbientHeroVideos() {
  const videos = document.querySelectorAll(".hero-bg-video");
  if (!videos.length) return;

  const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  videos.forEach((video) => {
    if (isReduced) {
      video.pause();
      video.style.opacity = "0.15";
      return;
    }

    // Force muted & playsinline for safe iOS/Android/Chrome autoplay policy
    video.muted = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may be restricted until first user interaction
        document.addEventListener("click", () => {
          video.play().catch(() => {});
        }, { once: true });
      });
    }
  });

  // Interactive toggle badge if clicked
  const toggleBadges = document.querySelectorAll(".hero-video-badge");
  toggleBadges.forEach((badge) => {
    badge.style.cursor = "pointer";
    badge.addEventListener("click", () => {
      videos.forEach((v) => {
        if (v.paused) {
          v.play();
          badge.querySelector(".hero-video-badge-text").textContent = "Video Active";
        } else {
          v.pause();
          badge.querySelector(".hero-video-badge-text").textContent = "Video Paused";
        }
      });
    });
  });
}

