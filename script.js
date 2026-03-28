/**
 * Multi-page apology site — vanilla JS
 * CUSTOMIZE: CONFIG (copy, NO phrases, easter egg, gallery file names). Audio: gallery.html.
 */

const CONFIG = {
  /**
   * Entry page (index.html): password to continue. Digits only (slashes optional when typing).
   * Default matches first-date style 12 / 12 / 2025 → 12122025.
   */
  entryPassword: "12122025",

  /**
   * Optional Marvel Spider-Man image (PNG/WebP with transparency works best).
   * We cannot ship official Marvel art in this repo (copyright). Leave "" for the SVG fallback.
   * When you have a file you’re allowed to use, set e.g. "assets/spidey-hero.png" and add that file.
   */
  heroImageUrl: "",
  apologyText: `I am really sorry for not being the person you expected me to be. But honestly, I want you to know that I have been trying my best, and I will keep trying for as long as it takes. You mean that much to me.

These past few days have been really tough for me. I tried to distract myself, but nothing worked. I missed you constantly. I even cried, especially when you said you couldn’t hold on anymore. It felt like something really important in my life was slipping away, and that broke me.

I don’t know how you have been feeling, but I just want you to know that you matter so much to me, Ugey. I have always seen a future with you. I have planned things with you.

I am truly sorry for shouting at you and for hurting you. Please forgive me. I don’t want us to stay like this… I want us to go back to how we were, and better in the coming days. I will keep working on myself, not just for you, but for us.

Please… let’s fix this together. ❤️`,
  noPhrases: [
    "No 😅",
    "Hmm",
    "Try again",
    "Not this one",
    "You know the answer 👀",
  ],
  easterEggMessage:
    "If you found this: thank you for the curiosity. Everything on these pages is sincere — not a performance.",

  /**
   * Gallery on gallery.html: loads assets/image1.ext … image10.ext
   * Put files in the /assets folder. Match `extension` to your files (jpg, jpeg, png, webp).
   * `captions`: text under each photo — same order as image1.jpeg … image10.jpeg (first line = image1).
   */
  galleryImages: {
    count: 10,
    directory: "assets",
    baseName: "image",
    extension: "jpeg",
    captions: [
      /* image1.jpeg */ "Your First Photoshoot?.",
      /* image2.jpeg */ "Asked 2 times for Picture.",
      /* image3.jpeg */ "You asked me which one looks better and I chose this one.",
      /* image4.jpeg */ "Didn't want to take pictures but Kaka and Indra did and we both have it in our phones.",
      /* image5.jpeg */ "You look like a model ana dhi apa ama promise.",
      /* image6.jpeg */ "When I insisted and you agreed. Funny part dhi elevator na halam yama joyi.",
      /* image7.jpeg */ "Your picnic Picture.",
      /* image8.jpeg */ "The first picture of you that I saw.",
      /* image9.jpeg */ "Ani ben you did gara. Sem ghayi sa that time.",
      /* image10.jpeg */ "The First Picture that I saved in my phone. (Screenshot bay bay enn nga ra gi)",
    ],
  },
};

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  const PAGE = document.body?.dataset?.page || "";

  /** Web-style transition then navigate */
  function reducedMotion() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function navigateWithWebTransition(href) {
    const overlay = $("#page-transition");
    if (!overlay) {
      window.location.href = href;
      return;
    }
    overlay.hidden = false;
    requestAnimationFrame(() => {
      overlay.classList.add("is-active");
    });
    const ms = reducedMotion() ? 120 : 820;
    setTimeout(() => {
      window.location.href = href;
    }, ms);
  }

  /** Fade in body */
  function initPageLoad() {
    requestAnimationFrame(() => {
      document.body.classList.add("is-loaded");
    });
  }

  /**
   * If CONFIG.heroImageUrl loads, show it in .swing-hero and hide the SVG fallback.
   */
  function initHeroPhoto() {
    const url = CONFIG.heroImageUrl && String(CONFIG.heroImageUrl).trim();
    if (!url) return;

    document.querySelectorAll(".swing-hero").forEach((hero) => {
      const svg = hero.querySelector(".swing-hero__svg");
      if (!svg) return;

      const probe = new Image();
      probe.onload = () => {
        const img = document.createElement("img");
        img.className = "swing-hero__photo";
        img.src = url;
        img.alt = "";
        img.decoding = "async";
        hero.insertBefore(img, svg);
        svg.setAttribute("hidden", "");
        svg.style.display = "none";
        hero.classList.add("swing-hero--has-photo");
      };
      probe.onerror = () => {};
      probe.src = url;
    });
  }

  // --- Particles (entry + gallery) ---
  function initParticles() {
    const canvas = $("#particle-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function initParticlesData() {
      particles = [];
      const n = Math.min(50, Math.floor((canvas.width * canvas.height) / 18000));
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2.2 + 0.6,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          a: Math.random() * 0.35 + 0.25,
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(94, 124, 98, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }

    resize();
    initParticlesData();
    tick();
    window.addEventListener("resize", () => {
      resize();
      initParticlesData();
    });
  }

  // --- Entry (password gate) ---
  function initEntry() {
    initParticles();
    const form = $("#entry-form");
    const input = $("#entry-password");
    const err = $("#entry-error");
    const expected = CONFIG.entryPassword != null ? String(CONFIG.entryPassword) : "";
    const digitsOnly = (s) => String(s).replace(/\D/g, "");

    if (form && input) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (err) {
          err.hidden = true;
          err.textContent = "";
        }
        if (digitsOnly(input.value) === digitsOnly(expected)) {
          navigateWithWebTransition("message.html");
          return;
        }
        if (err) {
          err.textContent = "Not quite — try again.";
          err.hidden = false;
        }
        form.classList.remove("entry-form--shake");
        void form.offsetWidth;
        form.classList.add("entry-form--shake");
        setTimeout(() => form.classList.remove("entry-form--shake"), 500);
        input.focus();
        input.select();
      });
    }
  }

  // --- Message: typing ---
  function initMessage() {
    const apologyEl = $("#apology-typed");
    const cursorEl = $("#typing-cursor");
    const btn = $("#btn-continue");

    function runTyping() {
      if (!apologyEl) return;
      if (cursorEl) cursorEl.hidden = false;
      const text = CONFIG.apologyText;
      if (reducedMotion()) {
        apologyEl.textContent = text;
        if (cursorEl) cursorEl.hidden = true;
        return;
      }
      let i = 0;
      const step = () => {
        if (i <= text.length) {
          apologyEl.textContent = text.slice(0, i);
          i++;
          setTimeout(step, 14 + Math.random() * 10);
        } else if (cursorEl) {
          cursorEl.hidden = true;
        }
      };
      step();
    }

    runTyping();
    if (btn) btn.addEventListener("click", () => navigateWithWebTransition("final.html"));
  }

  // --- Final: escaping NO + YES (NO moves only inside .decision-no-zone) ---
  function initFinal() {
    const btnNo = $("#btn-no");
    const btnYes = $("#btn-yes");
    const decisionSection = $("#decision");
    const noZone = $("#decision-no-zone");
    let noPhraseIndex = 0;

    function nextNoPhrase() {
      const phrases = CONFIG.noPhrases;
      btnNo.textContent = phrases[noPhraseIndex % phrases.length];
      noPhraseIndex++;
    }

    /** Random position inside the glass card’s NO zone only (center coords for translate -50%) */
    function randomNoPosition() {
      if (!noZone) return;
      const pad = 6;
      const zw = noZone.offsetWidth;
      const zh = noZone.offsetHeight;
      const w = btnNo.offsetWidth || 72;
      const h = btnNo.offsetHeight || 36;
      const minX = pad + w / 2;
      const maxX = zw - pad - w / 2;
      const minY = pad + h / 2;
      const maxY = zh - pad - h / 2;
      const x = minX + Math.random() * Math.max(0, maxX - minX);
      const y = minY + Math.random() * Math.max(0, maxY - minY);
      btnNo.style.left = `${x}px`;
      btnNo.style.top = `${y}px`;
    }

    function moveNoButton() {
      nextNoPhrase();
      randomNoPosition();
    }

    if (btnNo && decisionSection && noZone) {
      nextNoPhrase();

      function placeNoInitial() {
        const zw = noZone.offsetWidth;
        const zh = noZone.offsetHeight;
        const w = btnNo.offsetWidth || 72;
        const h = btnNo.offsetHeight || 36;
        const pad = 6;
        const cx = zw * 0.68;
        const cy = zh * 0.45;
        const minX = pad + w / 2;
        const maxX = zw - pad - w / 2;
        const minY = pad + h / 2;
        const maxY = zh - pad - h / 2;
        const x = Math.min(Math.max(minX, cx), maxX);
        const y = Math.min(Math.max(minY, cy), maxY);
        btnNo.style.left = `${x}px`;
        btnNo.style.top = `${y}px`;
      }

      placeNoInitial();
      window.addEventListener("resize", placeNoInitial);

      const decisionIo = new IntersectionObserver(
        (entries) => {
          btnNo.style.visibility = entries[0].isIntersecting ? "visible" : "hidden";
        },
        { threshold: 0.05 }
      );
      decisionIo.observe(decisionSection);

      function distToNo(clientX, clientY) {
        const r = btnNo.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        return Math.hypot(clientX - cx, clientY - cy);
      }

      function isPointerInNoZone(clientX, clientY) {
        const r = noZone.getBoundingClientRect();
        return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
      }

      const proximityPx = 88;

      function onPointerNear(clientX, clientY) {
        if (btnNo.style.visibility === "hidden" || btnNo.style.display === "none") return;
        if (!isPointerInNoZone(clientX, clientY)) return;
        if (distToNo(clientX, clientY) < proximityPx) moveNoButton();
      }

      btnNo.addEventListener("mouseenter", () => moveNoButton());
      btnNo.addEventListener("pointerenter", () => moveNoButton());
      btnNo.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        moveNoButton();
      });
      btnNo.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        moveNoButton();
      });
      btnNo.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          moveNoButton();
        },
        { passive: false }
      );

      document.addEventListener(
        "mousemove",
        (e) => onPointerNear(e.clientX, e.clientY),
        { passive: true }
      );
      document.addEventListener(
        "touchmove",
        (e) => {
          for (const t of e.changedTouches) onPointerNear(t.clientX, t.clientY);
        },
        { passive: true }
      );
    }

    if (btnYes) {
      btnYes.addEventListener("click", () => {
        if (btnNo) btnNo.style.display = "none";
        navigateWithWebTransition("gallery.html");
      });
    }
  }

  /** Build <figure> tiles from CONFIG.galleryImages (image1…image10 in /assets) */
  function renderGallery() {
    const root = $("#gallery");
    const cfg = CONFIG.galleryImages;
    if (!root || !cfg) return;

    const count = Math.max(1, Math.min(50, Number(cfg.count) || 10));
    const dir = (cfg.directory || "assets").replace(/\/$/, "");
    const base = cfg.baseName || "image";
    const ext = (cfg.extension || "jpg").replace(/^\./, "");

    const captions = Array.isArray(cfg.captions) ? cfg.captions : [];

    root.innerHTML = "";
    for (let i = 1; i <= count; i++) {
      const fig = document.createElement("figure");
      fig.className = "gallery-item reveal";

      const media = document.createElement("div");
      media.className = "gallery-item__media";

      const img = document.createElement("img");
      img.src = `${dir}/${base}${i}.${ext}`;
      const cap =
        captions[i - 1] != null && String(captions[i - 1]).trim() !== ""
          ? String(captions[i - 1]).trim()
          : `Memory ${i}`;
      img.alt = cap;
      img.loading = i > 3 ? "lazy" : "eager";

      media.appendChild(img);
      fig.appendChild(media);

      const fc = document.createElement("figcaption");
      fc.className = "gallery-item__caption";
      fc.textContent = cap;
      fig.appendChild(fc);

      root.appendChild(fig);
    }
  }

  // --- Gallery ---
  function initGallery() {
    initParticles();
    renderGallery();

    const items = document.querySelectorAll("#gallery .gallery-item");
    items.forEach((item, i) => {
      setTimeout(() => item.classList.add("is-visible"), 160 + i * 65);
    });

    const audioEl = $("#memory-audio");
    if (audioEl) {
      audioEl.play().catch(() => {
        /* User may need to press play if autoplay is blocked */
      });
    }

    const eggTrigger = $("#easter-egg-trigger");
    const eggModal = $("#easter-egg-modal");
    const eggMessage = $("#egg-message");
    const eggClose = $("#egg-close");

    if (eggMessage) eggMessage.textContent = CONFIG.easterEggMessage;

    function openEgg() {
      if (!eggModal) return;
      eggModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }

    function closeEgg() {
      if (!eggModal) return;
      eggModal.classList.add("hidden");
      document.body.style.overflow = "";
    }

    if (eggTrigger) eggTrigger.addEventListener("click", openEgg);
    if (eggClose) eggClose.addEventListener("click", closeEgg);
    if (eggModal) {
      eggModal.addEventListener("click", (e) => {
        if (e.target === eggModal) closeEgg();
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && eggModal && !eggModal.classList.contains("hidden")) closeEgg();
    });
  }

  // --- Boot ---
  document.addEventListener("DOMContentLoaded", () => {
    initPageLoad();
    initHeroPhoto();

    switch (PAGE) {
      case "entry":
        initEntry();
        break;
      case "message":
        initMessage();
        break;
      case "final":
        initFinal();
        break;
      case "gallery":
        initGallery();
        break;
      default:
        break;
    }
  });
})();
