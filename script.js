// Ano automático no rodapé
document.getElementById("year").textContent = new Date().getFullYear();

// Reveal on scroll
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.15 });

revealEls.forEach(el => io.observe(el));

// Card tilt (hover 3D)
const tiltCards = document.querySelectorAll(".tilt");
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

tiltCards.forEach(card => {
  let rect = null;

  function onMove(ev){
    rect = rect || card.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / rect.width;
    const y = (ev.clientY - rect.top) / rect.height;

    const rx = clamp((0.5 - y) * 10, -10, 10);
    const ry = clamp((x - 0.5) * 12, -12, 12);

    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
  }

  function onLeave(){
    rect = null;
    card.style.transform = "";
  }

  card.addEventListener("mousemove", onMove);
  card.addEventListener("mouseleave", onLeave);
});

// Cursor glow following mouse
const glow = document.querySelector(".cursor-glow");
let gx = 0, gy = 0, tx = 0, ty = 0;

window.addEventListener("mousemove", (e) => {
  tx = e.clientX;
  ty = e.clientY;
});

function tick(){
  gx += (tx - gx) * 0.14;
  gy += (ty - gy) * 0.14;
  glow.style.left = gx + "px";
  glow.style.top = gy + "px";
  requestAnimationFrame(tick);
}
tick();

// Confetti mini-canvas (super leve)
const btn = document.getElementById("confettiBtn");
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

function fitCanvas(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const cssW = canvas.clientWidth || 10;
  const cssH = canvas.clientHeight || 140;
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
fitCanvas();
window.addEventListener("resize", fitCanvas);

let particles = [];
function spawnConfetti(){
  const w = canvas.clientWidth || 10;
  const h = canvas.clientHeight || 140;

  const count = 120;
  const now = performance.now();

  for (let i=0; i<count; i++){
    particles.push({
      x: Math.random() * w,
      y: -10 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 1.4,
      vy: 1.6 + Math.random() * 2.4,
      r: 2 + Math.random() * 3,
      a: 1,
      spin: (Math.random() - 0.5) * 0.2,
      t0: now
    });
  }
}

function step(){
  const w = canvas.clientWidth || 10;
  const h = canvas.clientHeight || 140;

  ctx.clearRect(0,0,w,h);

  const g = 0.02;
  particles = particles.filter(p => p.a > 0);

  for (const p of particles){
    p.vy += g;
    p.x += p.vx;
    p.y += p.vy;

    // fade out near bottom
    const fadeStart = h * 0.75;
    if (p.y > fadeStart) p.a = Math.max(0, 1 - (p.y - fadeStart) / (h - fadeStart));

    ctx.save();
    ctx.globalAlpha = p.a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.spin * (p.y * 0.08));
    ctx.beginPath();
    ctx.rect(-p.r, -p.r, p.r*2, p.r*2);
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.fill();
    ctx.restore();
  }

  requestAnimationFrame(step);
}
step();

btn.addEventListener("click", spawnConfetti);
