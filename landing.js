// bulcup.kr landing: the gym display counts reps as you scroll, rest timers tick while in view.
// Decorative only (aria-hidden). Without JS or with reduced motion the page shows its final state.
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("js");

  const REPS = 12, REST = 90;
  const $ = (s, el = document) => el.querySelector(s);
  const hud = $(".hud"), label = $(".hud__label", hud), num = $(".hud__num", hud), unit = $(".hud__unit", hud);
  const bars = [...hud.querySelectorAll(".hud__bar i")];
  const steps = [...document.querySelectorAll("[data-step]")];
  const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // Rest timers: count down from 90s, one second per second, only while at least half in view.
  const left = new Map();
  for (const rest of document.querySelectorAll(".rest")) left.set(rest, REST);
  const timers = new Map();
  const restIO = new IntersectionObserver((entries) => {
    for (const { target: rest, isIntersecting } of entries) {
      clearInterval(timers.get(rest));
      if (!isIntersecting || left.get(rest) === 0) continue;
      timers.set(rest, setInterval(() => {
        const s = Math.max(0, left.get(rest) - 1);
        left.set(rest, s);
        $(".rest__time", rest).textContent = clock(s);
        if (s === 0) { clearInterval(timers.get(rest)); rest.classList.add("is-over"); }
        update();
      }, 1000));
    }
  }, { threshold: 0.5 });
  left.forEach((_, rest) => restIO.observe(rest));

  // One-shot reveals: set checks tick on, the 오운완 stamp lands.
  const revealIO = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); }
  }, { threshold: 0.6 });
  document.querySelectorAll(".sets, .stamp").forEach((el) => revealIO.observe(el));

  // HUD: the step whose top passed 55% of the viewport is the current one.
  let queued = false;
  function update() {
    queued = false;
    const line = innerHeight * 0.55;
    let cur = null;
    for (const s of steps) if (s.getBoundingClientRect().top < line) cur = s;
    hud.classList.toggle("is-on", cur !== null);
    if (!cur) return;
    let done = 0, text, sub, u = "";
    if (cur.dataset.step === "set") {
      const n = +cur.dataset.set, r = cur.getBoundingClientRect();
      const reps = Math.round(Math.min(1, Math.max(0, (line - r.top) / (r.height * 0.8))) * REPS);
      sub = `${n}/5세트`; text = String(reps).padStart(2, "0"); u = "회";
      done = n - 1 + (reps === REPS ? 1 : 0);
    } else if (cur.dataset.step === "rest") {
      sub = "휴식"; text = clock(left.get(cur));
      done = steps.filter((s) => s.dataset.step === "set" && s.compareDocumentPosition(cur) & Node.DOCUMENT_POSITION_FOLLOWING).length;
    } else {
      sub = "오운완"; text = "끝"; done = 5;
    }
    label.textContent = sub; num.textContent = text; unit.textContent = u;
    bars.forEach((b, i) => b.classList.toggle("is-done", i < done));
  }
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue, { passive: true });
  update();
})();
