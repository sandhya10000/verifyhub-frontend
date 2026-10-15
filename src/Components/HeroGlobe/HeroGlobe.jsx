import { useEffect, useRef, useState } from 'react';
import { LAND_MASK_B64 } from './heroGlobeLand';
import './HeroGlobe.css';

/* Interactive services globe for the hero (dark theme only, plain canvas, no dependencies). */

const D2R = Math.PI / 180;
const TAU = Math.PI * 2;
const LAT0 = 22;
const LON0 = 79; /* hub: centre of India */

const PAL = {
  land: '#9db7ff',
  india: '#e6efff',
  sa: '#2b409e',
  sb: '#0a1236',
  rim: '#7f9cff',
  atmo: '#6366f1',
  grat: '#8fa6e8',
  lbg: '#101a42',
  lfg: '#ffffff',
  lline: '#33427f',
  hub: '#34d399',
};

const NODES = [
  { name: 'CIBIL', short: 'CIBIL', tiny: 'CIBIL', group: 'Credit bureau API', desc: 'Credit Information Bureau. Score and full report analysis.', color: '#6ea2ff', dLat: 30, dLon: -40 },
  { name: 'Experian', short: 'Experian', tiny: 'Experian', group: 'Credit bureau API', desc: 'Experian credit reports with score and full report analysis.', color: '#c084fc', dLat: 4, dLon: -64 },
  { name: 'Equifax', short: 'Equifax', tiny: 'Equifax', group: 'Credit bureau API', desc: 'Equifax credit reports with score and full report analysis.', color: '#ff7b86', dLat: -26, dLon: -46 },
  { name: 'CRIF', short: 'CRIF', tiny: 'CRIF', group: 'Credit bureau API', desc: 'CRIF credit reports with score and full report analysis.', color: '#4ade80', dLat: -44, dLon: -8 },
  { name: 'AI Decisioning', short: 'AI Decisioning', tiny: 'AI', group: 'AI credit analysis', desc: 'Risk assessment, key factors and recommendations on every credit report.', color: '#818cf8', dLat: 42, dLon: 20 },
  { name: 'GST Verification', short: 'GST Verification', tiny: 'GST', group: 'Business verification', desc: 'Authenticate GSTIN, taxpayer status and filing compliance instantly.', color: '#22d3ee', dLat: 14, dLon: 60 },
  { name: 'Vehicle RC Verification', short: 'Vehicle RC', tiny: 'RC', group: 'Vehicle verification', desc: 'Verify registration, owner, insurance and permit details instantly.', color: '#fb923c', dLat: -30, dLon: 46 },
];

const ARIA_LABEL =
  'Interactive globe centred on India. Seven nodes show the services: CIBIL, Experian, Equifax, CRIF, AI Decisioning, GST Verification and Vehicle RC Verification.';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const vec = (lat, lon) => {
  const la = lat * D2R;
  const lo = lon * D2R;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
};

/* ---- static geometry, built once per page load ---- */
let GEO = null;
function buildGeo() {
  if (GEO) return GEO;
  const bin = atob(LAND_MASK_B64);
  const mask = new Uint8Array(bin.length);
  for (let q = 0; q < bin.length; q++) mask[q] = bin.charCodeAt(q);
  const isLand = (lat, lon) => {
    const col = ((Math.floor(lon + 180) % 360) + 360) % 360;
    const row = Math.min(179, Math.max(0, Math.floor(90 - lat)));
    const idx = row * 360 + col;
    return (mask[idx >> 3] >> (7 - (idx & 7))) & 1;
  };

  const hub = vec(LAT0, LON0);
  const dots = [];
  const N = 5400;
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - ((i + 0.5) / N) * 2;
    const lat = Math.asin(y) / D2R;
    let lon = ((i * ga) % TAU) / D2R;
    if (lon > 180) lon -= 360;
    if (!isLand(lat, lon)) continue;
    const v = vec(lat, lon);
    const ind = lat > 6 && lat < 36 && lon > 68 && lon < 98 ? 1 : 0;
    dots.push([v[0], v[1], v[2], ind]);
  }

  const nodes = NODES.map((n) => {
    const v = vec(LAT0 + n.dLat, LON0 + n.dLon);
    const dot = clamp(hub[0] * v[0] + hub[1] * v[1] + hub[2] * v[2], -1, 1);
    const w = Math.acos(dot);
    const sw = Math.sin(w);
    const lift = 0.07 + 0.2 * Math.min(1, w / 1.3);
    const arc = [];
    for (let s = 0; s <= 40; s++) {
      const t = s / 40;
      const k1 = Math.sin((1 - t) * w) / sw;
      const k2 = Math.sin(t * w) / sw;
      const h = 1 + lift * Math.sin(Math.PI * t);
      arc.push([(hub[0] * k1 + v[0] * k2) * h, (hub[1] * k1 + v[1] * k2) * h, (hub[2] * k1 + v[2] * k2) * h]);
    }
    return { ...n, v, arc };
  });

  const grat = [];
  [-60, -30, 0, 30, 60].forEach((la) => {
    const l = [];
    for (let lo = -180; lo <= 180; lo += 6) l.push(vec(la, lo));
    grat.push(l);
  });
  for (let lo = -180; lo < 180; lo += 30) {
    const l = [];
    for (let la = -90; la <= 90; la += 6) l.push(vec(la, lo));
    grat.push(l);
  }

  GEO = { hub, dots, nodes, grat };
  return GEO;
}

export default function HeroGlobe() {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const setActiveRef = useRef(null);
  const focusRef = useRef(null);
  const chipHoverRef = useRef(-1);
  const userActRef = useRef(null);
  const [active, setActiveState] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const { hub, dots, nodes, grat } = buildGeo();
    const hero = canvas.closest('.hero') || document.documentElement;
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    const S = {
      yaw: 0, pitch: 0, nx: 0, ny: 0, ptrSeen: false, ptrAt: -1e9, idle: 1,
      active: 0, hover: -1, cp: null, lastUser: -1e9, lastCycle: 0,
      focusUntil: 0, focusIdx: -1, visible: true,
    };
    let W = 0, H = 0, cx = 0, cy = 0, R = 0, small = false, widths = {};
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    const nodeScr = [];

    const now = () => performance.now();
    const userAct = () => { S.lastUser = now(); };
    const setActive = (i) => {
      S.active = i;
      setActiveState(i);
    };
    setActiveRef.current = setActive;
    userActRef.current = userAct;
    focusRef.current = (i) => {
      userAct();
      setActive(i);
      S.focusIdx = i;
      S.focusUntil = now() + 4500;
    };

    const resize = () => {
      const r = stage.getBoundingClientRect();
      W = Math.max(260, Math.round(r.width));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      H = Math.round(W * 0.9);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2; R = W * 0.365; small = W < 470; widths = {};
    };

    const rr = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const onPointerMove = (e) => {
      const r = hero.getBoundingClientRect();
      if (r.width && r.height) {
        S.nx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
        S.ny = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
      }
      S.ptrSeen = true;
      S.ptrAt = now();
      const c = canvas.getBoundingClientRect();
      S.cp =
        e.clientX >= c.left && e.clientX <= c.right && e.clientY >= c.top && e.clientY <= c.bottom
          ? { x: ((e.clientX - c.left) * W) / c.width, y: ((e.clientY - c.top) * H) / c.height }
          : null;
    };
    const onLeave = () => { S.cp = null; };
    const onClick = () => { if (S.hover >= 0) focusRef.current(S.hover); };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('click', onClick);

    const draw = (tNow, dt, time) => {
      const idleNow = !S.ptrSeen || tNow - S.ptrAt > 2500;
      S.idle += ((idleNow ? 1 : 0) - S.idle) * (1 - Math.exp(-dt * 2));
      let ty, tp;
      const focusing = tNow < S.focusUntil;
      if (focusing) {
        const f = nodes[S.focusIdx];
        ty = clamp(f.dLon, -70, 70) * D2R;
        tp = clamp(f.dLat, -34, 34) * D2R;
      } else {
        ty = -S.nx * 24 * D2R;
        tp = S.ny * 14 * D2R;
        if (!reduce) {
          ty += Math.sin(time * 0.35) * 26 * D2R * S.idle;
          tp += Math.cos(time * 0.27) * 4 * D2R * S.idle;
        }
      }
      const k = 1 - Math.exp(-dt * (focusing ? 4 : 5));
      S.yaw += (ty - S.yaw) * k;
      S.pitch += (tp - S.pitch) * k;

      const psi = LON0 * D2R + S.yaw;
      const th = LAT0 * D2R + S.pitch;
      const cp = Math.cos(psi), sp = Math.sin(psi), ct = Math.cos(th), st = Math.sin(th);
      const proj = (v) => {
        const x1 = v[0] * cp - v[2] * sp;
        const z1 = v[0] * sp + v[2] * cp;
        return [x1, v[1] * ct - z1 * st, v[1] * st + z1 * ct];
      };
      const hidden = (p) => p[2] < 0 && p[0] * p[0] + p[1] * p[1] < 1;

      ctx.clearRect(0, 0, W, H);

      /* sphere */
      const sg = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, R * 0.08, cx, cy, R);
      sg.addColorStop(0, PAL.sa);
      sg.addColorStop(1, PAL.sb);
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();

      /* graticule */
      ctx.strokeStyle = PAL.grat; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.16;
      for (let gi = 0; gi < grat.length; gi++) {
        const line = grat[gi];
        let pen = false;
        ctx.beginPath();
        for (let j = 0; j < line.length; j++) {
          const p = proj(line[j]);
          if (p[2] > 0) {
            const px = cx + R * p[0], py = cy - R * p[1];
            if (pen) ctx.lineTo(px, py); else { ctx.moveTo(px, py); pen = true; }
          } else pen = false;
        }
        ctx.stroke();
      }

      /* land dots */
      for (let pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass ? PAL.india : PAL.land;
        for (let d = 0; d < dots.length; d++) {
          const dd = dots[d];
          if (dd[3] !== pass) continue;
          const dx1 = dd[0] * cp - dd[2] * sp;
          const dz1 = dd[0] * sp + dd[2] * cp;
          const dy2 = dd[1] * ct - dz1 * st;
          const dz2 = dd[1] * st + dz1 * ct;
          if (dz2 <= 0) continue;
          ctx.globalAlpha = (pass ? 0.55 : 0.2) + (pass ? 0.45 : 0.8) * Math.pow(dz2, 0.7);
          ctx.beginPath();
          ctx.arc(cx + R * dx1, cy - R * dy2, (pass ? 1.5 : 1.0) + 0.9 * dz2, 0, TAU);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      /* rim */
      ctx.strokeStyle = PAL.rim; ctx.globalAlpha = 0.65; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 1;

      /* arcs + pulses */
      for (let a = 0; a < nodes.length; a++) {
        const n = nodes[a];
        const on = a === S.active;
        ctx.strokeStyle = n.color; ctx.lineWidth = on ? 2 : 1.1; ctx.globalAlpha = on ? 0.95 : 0.34;
        ctx.beginPath();
        let pen2 = false;
        const pts = [];
        for (let s2 = 0; s2 < n.arc.length; s2++) {
          const p = proj(n.arc[s2]);
          pts.push(p);
          if (hidden(p)) { pen2 = false; continue; }
          const qx = cx + R * p[0], qy = cy - R * p[1];
          if (pen2) ctx.lineTo(qx, qy); else { ctx.moveTo(qx, qy); pen2 = true; }
        }
        ctx.stroke();
        const np = on ? 3 : 2;
        for (let kk = 0; kk < np; kk++) {
          const tt = reduce ? 0.5 : (time * (on ? 0.5 : 0.28) + a * 0.137 + kk / np) % 1;
          const fi = (1 - tt) * (n.arc.length - 1);
          const i0 = Math.floor(fi);
          const i1 = Math.min(n.arc.length - 1, i0 + 1);
          const fr = fi - i0;
          const pa = pts[i0], pb = pts[i1];
          const pz = pa[2] + (pb[2] - pa[2]) * fr;
          const pxx = pa[0] + (pb[0] - pa[0]) * fr;
          const pyy = pa[1] + (pb[1] - pa[1]) * fr;
          if (pz < 0 && pxx * pxx + pyy * pyy < 1) continue;
          ctx.globalAlpha = Math.sin(Math.PI * tt) * (on ? 1 : 0.8);
          ctx.fillStyle = n.color; ctx.shadowColor = n.color; ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.arc(cx + R * pxx, cy - R * pyy, on ? 3.2 : 2.4, 0, TAU); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      ctx.globalAlpha = 1;

      /* hub */
      const hp = proj(hub);
      const hx = cx + R * hp[0], hy = cy - R * hp[1];
      if (hp[2] > 0) {
        for (let rp = 0; rp < 2; rp++) {
          const ph = reduce ? 0.4 : (time * 0.5 + rp * 0.5) % 1;
          ctx.strokeStyle = PAL.hub; ctx.globalAlpha = (1 - ph) * 0.7; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(hx, hy, 5 + ph * 24, 0, TAU); ctx.stroke();
        }
        ctx.globalAlpha = 1; ctx.fillStyle = PAL.hub; ctx.shadowColor = PAL.hub; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(hx, hy, 5, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(hx, hy, 2, 0, TAU); ctx.fill();
      }

      /* nodes + labels */
      const fs = small ? 10.5 : 12.5;
      const ph2 = small ? 24 : 28;
      ctx.font = `700 ${fs}px "Plus Jakarta Sans", system-ui, sans-serif`;
      ctx.textBaseline = 'middle';
      nodeScr.length = 0;
      for (let b = 0; b < nodes.length; b++) {
        const nn = nodes[b];
        const pp = proj(nn.v);
        const vis = pp[2] > 0.04;
        const sx = cx + R * pp[0], sy = cy - R * pp[1];
        const label = small ? nn.tiny : nn.short;
        let tw = widths[label];
        if (tw === undefined) tw = widths[label] = ctx.measureText(label).width;
        const pw = tw + (small ? 26 : 32);
        const ddx = sx - cx, ddy = sy - cy, dl = Math.hypot(ddx, ddy);
        let ux, uy;
        if (dl < 22) { ux = 0.7; uy = -0.7; } else { ux = ddx / dl; uy = ddy / dl; }
        const lx = clamp(sx + ux * (pw / 2 + 12) - pw / 2, 6, W - pw - 6);
        const ly = clamp(sy + uy * (ph2 / 2 + 12) - ph2 / 2, 6, H - ph2 - 6);
        nodeScr.push({ x: sx, y: sy, z: pp[2], vis, lx, ly, pw, ph: ph2 });
        if (!vis) continue;
        const al = clamp((pp[2] - 0.04) / 0.28, 0, 1);
        const act = b === S.active;
        ctx.strokeStyle = nn.color; ctx.lineWidth = 1; ctx.globalAlpha = al * (act ? 0.9 : 0.45);
        ctx.beginPath(); ctx.moveTo(sx, sy);
        ctx.lineTo(clamp(sx, lx, lx + pw), clamp(sy, ly, ly + ph2)); ctx.stroke();
        ctx.globalAlpha = al;
        if (act) {
          ctx.fillStyle = nn.color; ctx.globalAlpha = al * 0.22;
          ctx.beginPath(); ctx.arc(sx, sy, 15, 0, TAU); ctx.fill();
          ctx.globalAlpha = al;
        }
        const pulse = reduce ? 0.3 : (time * 0.6 + b * 0.31) % 1;
        ctx.strokeStyle = nn.color; ctx.globalAlpha = al * (1 - pulse) * 0.7; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.arc(sx, sy, 4 + pulse * 11, 0, TAU); ctx.stroke();
        ctx.globalAlpha = al; ctx.fillStyle = nn.color;
        ctx.beginPath(); ctx.arc(sx, sy, act ? 5.5 : 4.2, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.globalAlpha = al * 0.9;
        ctx.beginPath(); ctx.arc(sx, sy, act ? 5.5 : 4.2, 0, TAU); ctx.stroke();
        ctx.globalAlpha = al;
        if (act) { ctx.shadowColor = nn.color; ctx.shadowBlur = 16; }
        ctx.fillStyle = PAL.lbg; rr(lx, ly, pw, ph2, ph2 / 2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = act ? nn.color : PAL.lline; ctx.lineWidth = act ? 1.6 : 1;
        rr(lx, ly, pw, ph2, ph2 / 2); ctx.stroke();
        ctx.fillStyle = nn.color;
        ctx.beginPath(); ctx.arc(lx + 12, ly + ph2 / 2, 3.4, 0, TAU); ctx.fill();
        ctx.fillStyle = PAL.lfg; ctx.textAlign = 'left';
        ctx.fillText(label, lx + 21, ly + ph2 / 2 + 0.5);
      }
      ctx.globalAlpha = 1;

      /* hover + auto cycle */
      let hit = -1, best = -1;
      if (S.cp) {
        for (let h = 0; h < nodeScr.length; h++) {
          const ns = nodeScr[h];
          if (!ns.vis) continue;
          const near =
            Math.hypot(S.cp.x - ns.x, S.cp.y - ns.y) < 16 ||
            (S.cp.x >= ns.lx - 3 && S.cp.x <= ns.lx + ns.pw + 3 && S.cp.y >= ns.ly - 3 && S.cp.y <= ns.ly + ns.ph + 3);
          if (near && ns.z > best) { best = ns.z; hit = h; }
        }
      }
      canvas.style.cursor = hit >= 0 ? 'pointer' : 'default';
      if (hit !== S.hover) {
        S.hover = hit;
        if (hit >= 0) { userAct(); setActive(hit); }
      }
      if (
        !reduce && S.hover < 0 && chipHoverRef.current < 0 &&
        tNow > S.focusUntil && tNow - S.lastUser > 2600 && tNow - S.lastCycle > 3200
      ) {
        S.lastCycle = tNow;
        setActive((S.active + 1) % nodes.length);
      }
    };

    const frame = () => {
      const tNow = now();
      const dt = Math.min(0.05, (tNow - last) / 1000);
      last = tNow;
      if (S.visible && !document.hidden) draw(tNow, dt, (tNow - t0) / 1000);
      raf = requestAnimationFrame(frame);
    };

    resize();
    setActive(0);
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(resize); ro.observe(stage); }
    else window.addEventListener('resize', resize);
    let io = null;
    if (window.IntersectionObserver) {
      io = new IntersectionObserver((en) => { S.visible = en[0].isIntersecting; });
      io.observe(stage);
    }
    const onVis = () => { if (!document.hidden) last = now(); };
    document.addEventListener('visibilitychange', onVis);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { widths = {}; });
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVis);
      if (ro) ro.disconnect();
      if (io) io.disconnect();
    };
  }, []);

  const n = NODES[active] || NODES[0];

  return (
    <div className="hg">
      <div className="hg-stage" ref={stageRef}>
        <canvas ref={canvasRef} className="hg-canvas" role="img" aria-label={ARIA_LABEL} />
      </div>

      <div className="hg-info" style={{ '--c': n.color }} aria-live="polite">
        <span className="hg-swatch" aria-hidden="true" />
        <div>
          <span className="hg-group">{n.group}</span>
          <strong className="hg-name">{n.name}</strong>
          <p className="hg-desc">{n.desc}</p>
        </div>
      </div>

      <ul className="hg-chips">
        {NODES.map((node, i) => (
          <li key={node.name}>
            <button
              type="button"
              className="hg-chip"
              style={{ '--c': node.color }}
              aria-pressed={i === active}
              onMouseEnter={() => { chipHoverRef.current = i; userActRef.current?.(); setActiveRef.current?.(i); }}
              onMouseLeave={() => { chipHoverRef.current = -1; }}
              onFocus={() => { userActRef.current?.(); setActiveRef.current?.(i); }}
              onClick={() => focusRef.current?.(i)}
            >
              <i aria-hidden="true" />
              {node.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}