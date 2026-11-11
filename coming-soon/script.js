/* ───────────────────────────────────────────────
   LEXIDO — Countdown Timer
   ─────────────────────────────────────────────── */

(function () {
  "use strict";

  // Target: 30 November 2026, midnight
  const TARGET = new Date("2026-11-30T00:00:00");

  // DOM refs
  const $days    = document.getElementById("days");
  const $hours   = document.getElementById("hours");
  const $minutes = document.getElementById("minutes");
  const $seconds = document.getElementById("seconds");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function setBlock(el, value) {
    const str = pad(value);
    if (el.textContent !== str) {
      el.textContent = str;
      el.classList.remove("tick");
      void el.offsetWidth;
      el.classList.add("tick");
    }
  }

  function tick() {
    const diff = TARGET - new Date();

    if (diff <= 0) {
      setBlock($days, 0);
      setBlock($hours, 0);
      setBlock($minutes, 0);
      setBlock($seconds, 0);
      clearInterval(timer);

      // Swap to live state
      const hl = document.querySelector(".brand-title");
      if (hl) hl.textContent = "LEXIDO";
      const tag = document.querySelector(".tagline");
      if (tag) tag.textContent = "We Are Live.";
      const badge = document.querySelector(".soon-badge__text");
      if (badge) badge.textContent = "Now Open";
      return;
    }

    const t = Math.floor(diff / 1000);
    setBlock($days,    Math.floor(t / 86400));
    setBlock($hours,   Math.floor((t % 86400) / 3600));
    setBlock($minutes, Math.floor((t % 3600) / 60));
    setBlock($seconds, t % 60);
  }

  tick();
  const timer = setInterval(tick, 1000);
})();
