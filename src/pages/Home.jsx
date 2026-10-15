import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Shield';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BalanceIcon from '@mui/icons-material/Balance';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BoltIcon from '@mui/icons-material/Bolt';
import HubIcon from '@mui/icons-material/Hub';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LockIcon from '@mui/icons-material/Lock';
import './Home.css';
import HeroGlobe from '../Components/HeroGlobe/HeroGlobe';

/* ================= BUREAU CARDS DATA ================= */
const BUREAU_CARDS = [
  { key: 'cibil', name: 'CIBIL', title: 'Credit Information Bureau', live: true, color: 'var(--blue)', arrow: 'var(--green)', glow: 'rgba(59,130,246,.08)' },
  { key: 'experian', name: '✦ Experian', title: 'Experian', live: true, color: '#9b2bc7', arrow: 'var(--green)', glow: 'rgba(155,43,199,.07)', to: '/credit-bureau-api' },
  { key: 'equifax', name: 'EQUIFAX', title: 'Equifax', live: true, color: '#e31837', arrow: 'var(--green)', glow: 'rgba(227,24,55,.06)' },
  { key: 'crif', name: '≋ CRIF', title: 'CRIF', live: true, color: '#26364d', arrow: 'var(--green)', glow: 'rgba(16,185,129,.07)', to: '/credit-bureau-api' },
];

/* ================= GST & VEHICLE RC VERIFICATION DATA =================
   Placeholder content in [SQUARE BRACKETS] - replace with real copy / sample data later.
   No prices anywhere in this section. */
const VERIFY_SERVICES = [
  {
    id: 'gst-verification',
    eyebrow: 'GST VERIFICATION',
    title: 'Authenticate GSTIN and taxpayer status instantly',
    body: 'Confirm that a business GSTIN is valid, check its taxpayer status and review filing compliance before you lend.',
    checks: [
      { title: 'GSTIN authentication', sub: 'Check if the GST number is real and see the business’s legal name.' },
      { title: 'Taxpayer status check', sub: 'See if the business is Active, and if it is a Regular taxpayer.' },
      { title: 'Filing compliance review', sub: 'See if the business files its GST returns on time.' },
    ],
    cta: 'Explore GST verification',
    mock: {
      title: 'GST Verification',
      pill: 'Authenticated',
      rows: [
        { label: 'GSTIN', value: '27AAOCR8332H1ZY' },
        { label: 'Legal name', value: 'RUPEEYAN FINTECH PRIVATE LIMITED' },
        { label: 'Taxpayer type', value: 'Regular' },
      ],
    },
  },
  {
    id: 'vehicle-rc',
    eyebrow: 'VEHICLE RC VERIFICATION',
    title: 'Verify vehicle registration, owner and insurance instantly',
    body: 'Check the registration, owner, insurance and permit details of a vehicle before you approve a loan.',
    checks: [
      { title: 'Registration details', sub: 'Check if the vehicle is registered, and see its make, model and fuel type.' },
      { title: 'Owner details', sub: 'See the name of the person the vehicle is registered to.' },
      { title: 'Insurance and permit status', sub: 'Check if the insurance and permit are valid, and until when.' },
    ],
    cta: 'Explore vehicle RC verification',
    mock: {
      title: 'Vehicle RC',
      pill: 'Verified',
      rows: [
        { label: 'Vehicle number', value: 'MH12AB1234' },
        { label: 'Owner', value: 'Rahul Patil' },
        { label: 'Insurance', value: 'Valid until 18 Aug 2027' },
        { label: 'Permit', value: 'Valid' },
      ],
    },
  },
];



const getInitials = (name = '') =>
  name.startsWith('[')
    ? ''
    : name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

const arrowStyle = (b) => ({
  position: 'absolute',
  right: '20px',
  bottom: '18px',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: `1px solid ${b.live ? 'var(--green)' : '#d9e3f1'}`,
  display: 'grid',
  placeItems: 'center',
  color: b.arrow,
  fontSize: '15px',
  textDecoration: 'none',
});

const TESTIMONIALS = [
  {
    quote:
      "We used to log in to different sites for CIBIL and CRIF. Now I get both from one screen. It saves me a lot of back and forth.",
    name: "Ramesh Patil",
    role: "Credit Officer",
    company: "Sai Krupa Finance, Kolhapur",
    avatar: null,
  },
  {
    quote:
      "The AI summary is useful when I am short on time. I read the score, the risk points and the advice, and then I decide.",
    name: "Neha Joshi",
    role: "Credit Analyst",
    company: "Triveni Capital",
    avatar: null,
  },
  {
    quote:
      "GST check costs only ₹10 and shows the filing history too. Last month it helped us catch a business that had stopped filing returns.",
    name: "Sandeep Kulkarni",
    role: "Branch Manager",
    company: "Navjeevan Credit Society",
    avatar: null,
  },
  {
    quote:
      "For used vehicle loans, I check the insurance date and permit before anything else. Vehicle RC gives me both in a few seconds.",
    name: "Faisal Shaikh",
    role: "Loan Executive",
    company: "Motorline Finance",
    avatar: null,
  },
  {
    quote:
      "The API was easy to connect. Our developer finished it in about a week, and the support team answered all his questions.",
    name: "Aditi Rao",
    role: "Product Manager",
    company: "LendPe Technologies",
    avatar: null,
  },
  {
    quote:
      "I like that the wallet balance and every charge are in the dashboard. At the end of the month, our accounts team does not have to ask me for anything.",
    name: "Manoj Gupta",
    role: "Operations Lead",
    company: "Shree Ganesh Microfinance",
    avatar: null,
  },
];

const BureauGrid = ({ addToRevealRefs }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
      gap: { xs: '14px', md: '18px' },
    }}
  >
    {BUREAU_CARDS.map((b) => (
      <Box
        key={b.key}
        className="pcard reveal"
        ref={addToRevealRefs}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: '#fff',
          p: { xs: '20px', md: '26px' },
          minHeight: { xs: 'auto', md: '210px' },
          border: '1px solid #e2e9f3',
          borderRadius: '18px',
          boxShadow: '0 10px 30px rgba(31,50,90,.06)',
        }}
      >
        <span
          className="badge-new"
          style={
            b.live
              ? { background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(16,185,129,.4)' }
              : { background: '#f4f6f9', color: '#64748b', border: '1px solid #dce3ec' }
          }
        >
          {b.live ? '● Live' : 'Coming Soon'}
        </span>

        <div style={{ marginTop: '18px', fontSize: '20px', fontWeight: 800, color: b.color }}>{b.name}</div>
        <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--slate)' }}>{b.title}</div>
        <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--slate-lt)' }}>Score & full report analysis</div>

        {b.live ? (
          <RouterLink to={b.to} aria-label={`Learn more about ${b.title}`} className="arrow-link" style={arrowStyle(b)}>
            →
          </RouterLink>
        ) : (
          <div aria-hidden="true" style={arrowStyle(b)}>→</div>
        )}

        <div
          style={{
            position: 'absolute',
            left: '-15px',
            bottom: '-35px',
            width: '150px',
            height: '80px',
            borderRadius: '50%',
            background: b.glow,
            filter: 'blur(3px)',
          }}
        />
      </Box>
    ))}
  </Box>
);

const Home = () => {
  const revealRefs = useRef([]);
  const countRefs = useRef([]);

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('on');
            revealObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    revealRefs.current.forEach((el) => {
      if (el) revealObserver.observe(el);
    });

    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = +el.dataset.target;
          const suffix = el.dataset.suffix || '';
          countObserver.unobserve(el);

          if (reduce) {
            el.textContent = target + suffix;
            return;
          }

          const t0 = performance.now();
          const dur = 1500;

          const tick = (t) => {
            const p = Math.min((t - t0) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * ease) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );

    countRefs.current.forEach((el) => {
      if (el) countObserver.observe(el);
    });

    return () => countObserver.disconnect();
  }, []);

  const testimonialRef = useRef(null);

  const scrollTestimonials = (dir) => {
    const el = testimonialRef.current;
    if (!el) return;
    const card = el.querySelector('.tm-card');
    const step = card ? card.offsetWidth + 20 : 320;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * step, behavior: reduce ? 'auto' : 'smooth' });
  };

  const addToRevealRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  const addToCountRefs = (el) => {
    if (el && !countRefs.current.includes(el)) {
      countRefs.current.push(el);
    }
  };

  return (
    <div className="home-container">

      {/* ================= HERO ================= */}
      <header className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-content">
              <h1>The verification layer behind <span className="grad">modern lending</span></h1>
              <p className="lead">Pull CIBIL, Experian, Equifax and CRIF reports through one API, get AI-driven risk insights on every applicant, and approve with confidence in minutes.</p>
              <div className="hero-actions">
                {/* <a className="btn btn-primary" href="#contact">Book a demo</a>
                <a className="btn btn-dark-outline" href="#contact">Talk to sales</a> */}
              </div>
            </div>
            <div className="hero-visual">
              <HeroGlobe />
            </div>
          </div>
        </div>
      </header>

      {/* ================= TESTIMONIALS ================= */}
      <section id="testimonials" className="tm" aria-labelledby="testimonials-heading">
        <div className="wrap">
          <div className="tm-head">
            <div>
              <span className="svc-pill">CLIENT STORIES</span>
              <h2 id="testimonials-heading" className="svc-h2 tm-title">
                Trusted by <span className="svc-grad">lenders and fintechs</span> across India
              </h2>
            </div>

            <div className="tm-nav">
              <button type="button" className="tm-btn" onClick={() => scrollTestimonials(-1)} aria-label="Previous testimonials">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <button type="button" className="tm-btn" onClick={() => scrollTestimonials(1)} aria-label="Next testimonials">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <ul className="tm-track" ref={testimonialRef} tabIndex={0} aria-label="Client testimonials, scroll horizontally">
            {TESTIMONIALS.map((t, i) => (
              <li key={i} className="tm-card">
                <figure>
                  <span className="tm-mark" aria-hidden="true">&ldquo;</span>
                  <blockquote className="tm-quote">{t.quote}</blockquote>
                  <figcaption className="tm-person">
                    {t.avatar ? (
                      <img className="tm-avatar" src={t.avatar} alt="" />
                    ) : (
                      <span className="tm-avatar tm-avatar-empty" aria-hidden="true">{getInitials(t.name)}</span>
                    )}
                    <span className="tm-meta">
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                      <span>{t.company}</span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= OUR SERVICES WRAPPER ================= */}
      <section id="services" aria-labelledby="services-heading" className="services-wrapper">

        {/* ================= WHAT WE OFFER ================= */}
        <div className="wrap svc-offer">
          <div className="svc-offer-head reveal" ref={addToRevealRefs}>
            <span className="svc-pill">WHAT WE OFFER</span>
            <h2 id="services-heading" className="svc-h2 svc-h2-center">
              One platform for <span className="svc-grad">credit bureau data</span>, AI analysis and business verification
            </h2>
            <p className="svc-sub">
              AI-powered credit analysis and direct access to India&rsquo;s leading credit bureaus, in one platform.
            </p>
          </div>

          <div className="svc-offer-grid">
            <article className="svc-offer-card tone-blue reveal" ref={addToRevealRefs}>
              <span className="svc-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 7h14M5 12h10M5 17h7" /></svg>
              </span>
              <h3>Credit Bureau API</h3>
              <p>Pull full credit reports from CIBIL, Experian, Equifax and CRIF with a single integration.</p>
              <a href="#bureau-coverage" className="svc-link">Explore the credit report API &rarr;</a>
            </article>

            <article className="svc-offer-card tone-purple reveal" ref={addToRevealRefs}>
              <span className="svc-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /></svg>
              </span>
              <h3>AI Decisioning</h3>
              <p>Risk assessment, key factors and recommendations on every report, ready for your credit team.</p>
              <a href="#ai-credit-report" className="svc-link">See AI credit decisioning &rarr;</a>
            </article>
            <article className="svc-offer-card tone-teal reveal" ref={addToRevealRefs}>
              <span className="svc-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" /><path d="M9 8h3M9 12h7M9 16h7" /></svg>
              </span>
              <h3>GST Verification</h3>
              <p>Authenticate GSTIN, taxpayer status and filing compliance instantly.</p>
              <a href="#gst-verification" className="svc-link">Explore GST verification &rarr;</a>
            </article>

            <article className="svc-offer-card tone-orange reveal" ref={addToRevealRefs}>
              <span className="svc-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 16v-4l1.7-4.3A2 2 0 0 1 8.6 6.5h6.8a2 2 0 0 1 1.9 1.2L19 12v4" /><path d="M3 16h18v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M7.5 12.5h.01M16.5 12.5h.01" /></svg>
              </span>
              <h3>Vehicle RC Verification</h3>
              <p>Verify registration, owner, insurance and permit details instantly.</p>
              <a href="#vehicle-rc" className="svc-link">Explore vehicle RC verification &rarr;</a>
            </article>
          </div>
        </div>

        {/* ================= AI CREDIT ANALYSIS ================= */}
        <section id="ai-credit-report" className="svc-ai">
          <div className="wrap svc-ai-grid">

            {/* LEFT */}
            <div className="reveal" ref={addToRevealRefs}>
              <span className="svc-eyebrow">NEW &middot; AI CREDIT CHECK</span>
              <h2 className="svc-h2 svc-ai-title">
                Know if an applicant is <span className="svc-grad">safe to lend to, </span>in minutes
              </h2>
              <p className="svc-body">
                Upload your credit report. Our AI checks their credit report and tells you the score, the risks, and what to do next.
              </p>

              <ul className="svc-checks">
                {[
                  { title: 'AI risk assessment & score prediction', sub: 'Understand risk with advanced ML models.' },
                  { title: 'Detailed credit insights', sub: 'See what is helping or hurting the score.' },
                  { title: 'Actionable recommendations', sub: 'See the score, the risks and a simple approve or review suggestion.' },
                ].map((item) => (
                  <li key={item.title}>
                    <span className="svc-check">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.sub}</span>
                    </div>
                  </li>
                ))}
              </ul>

              
            </div>

            {/* RIGHT — analysis card */}
            <div className="reveal" ref={addToRevealRefs}>
              <div className="svc-card">
                <div className="svc-card-head">
                  <span>AI Analysis</span>
                  <span className="svc-badge">Powered by AI</span>
                </div>

                <div className="svc-card-body">
                  <div className="svc-score">
                    <div className="svc-ring">
                      <svg width="110" height="110" viewBox="0 0 100 100" aria-hidden="true">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#e4e8f2" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="42" fill="none" stroke="#12a67c" strokeWidth="8"
                          strokeLinecap="round" strokeDasharray="263.9" strokeDashoffset="52.8"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <b>742</b>
                    </div>
                    <span className="svc-good">Good</span>
                  </div>

                  <div className="svc-insights">
                    <div className="svc-insights-label">KEY INSIGHTS</div>
                    {[
                      { label: 'Payment history', status: 'Strong', good: true },
                      { label: 'Credit utilisation', status: 'Low risk', good: true },
                      { label: 'Account mix', status: 'Healthy', good: true },
                      { label: 'New credit', status: 'No recent inquiries', good: false },
                    ].map((row) => (
                      <div key={row.label} className="svc-insight-row">
                        <span>{row.label}</span>
                        <span className={row.good ? 'good' : 'muted'}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="svc-reco">
                  <b>AI recommendation.</b> Maintain low credit utilisation and continue timely payments to improve
                  the score further.
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= BUREAU COVERAGE ================= */}
        <section id="bureau-coverage" className="svc-bureau">
          <div className="wrap">
            <div className="svc-bureau-head">
              <div className="reveal" ref={addToRevealRefs}>
                <span className="svc-pill">WIDE BUREAU COVERAGE</span>
                <h2 className="svc-h2 svc-bureau-title">
                  CIBIL, Experian, Equifax and CRIF credit reports through <span className="svc-grad">one API</span>
                </h2>
                <p className="svc-body">
                  Pull credit reports from India&rsquo;s leading bureaus in one place. Get a complete view of your
                  customer&rsquo;s credit profile and make faster, better-informed decisions.
                </p>
              </div>

              <div className="svc-stats reveal" ref={addToRevealRefs}>
                <div><b>4</b><span>Major bureaus</span></div>
                <div><b>4</b><span>Live connections</span></div>
                <div><b className="green">1</b><span>Unified API</span></div>
              </div>
            </div>

            <div className="svc-bureau-grid">
              {[
                { name: 'CIBIL', full: 'Credit Information Bureau', color: '#2f5bd8' },
                { name: 'Experian', full: 'Experian', color: '#7c3aed' },
                { name: 'Equifax', full: 'Equifax', color: '#b4231f' },
                { name: 'CRIF', full: 'CRIF', color: '#0f7b5a' },
              ].map((b) => (
                <article key={b.name} className="svc-bureau-card reveal" ref={addToRevealRefs}>
                  <span className="svc-live">&bull; LIVE</span>
                  <h3 style={{ color: b.color }}>{b.name}</h3>
                  <p>
                    {b.full}
                    <br />
                    Score &amp; full report analysis
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= GST & VEHICLE RC VERIFICATION ================= */}
        <section id="verification-services" className="svc-verify" aria-labelledby="verify-heading">
          <div className="wrap">
            <div className="svc-verify-head reveal" ref={addToRevealRefs}>
              <span className="svc-pill">VERIFICATION SERVICES</span>
              <h2 id="verify-heading" className="svc-h2 svc-h2-center">
                GST and vehicle RC <span className="svc-grad">verification APIs</span> for lenders
              </h2>
              <p className="svc-sub">
                Check business and vehicle details alongside the credit report, from the same platform.
              </p>
            </div>
          </div>

          {VERIFY_SERVICES.map((svc, i) => (
            <div key={svc.id} id={svc.id} className={`svc-verify-band${i % 2 === 1 ? ' alt' : ''}`}>
              <div className={`wrap svc-verify-grid${i % 2 === 1 ? ' flip' : ''}`}>

                {/* TEXT */}
                <div className="svc-verify-text reveal" ref={addToRevealRefs}>
                  <span className="svc-eyebrow">{svc.eyebrow}</span>
                  <h3 className="svc-verify-title">{svc.title}</h3>
                  <p className="svc-body">{svc.body}</p>

                  <ul className="svc-checks">
                    {svc.checks.map((item) => (
                      <li key={item.title}>
                        <span className="svc-check">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                        </span>
                        <div>
                          <strong>{item.title}</strong>
                          <span>{item.sub}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* <Box
                    component={RouterLink}
                    to="/login"
                    onClick={() => sessionStorage.setItem('preLoginPath', window.location.pathname)}
                    className="btn btn-primary svc-cta"
                  >
                    {svc.cta} <span>&rarr;</span>
                  </Box> */}
                </div>

                {/* MOCK RESULT CARD */}
                <div className="reveal" ref={addToRevealRefs}>
                  <div className="svc-card svc-vcard">
                    <div className="svc-card-head">
                      <span>{svc.mock.title}</span>
                      <span className="svc-badge svc-badge-green">{svc.mock.pill}</span>
                    </div>

                    <div className="svc-vcard-body">
                      <span className="svc-vcheck" aria-hidden="true">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                      </span>
                      <div className="svc-vcard-rows">
                        {svc.mock.rows.map((row) => (
                          <div key={row.label} className="svc-insight-row">
                            <span>{row.label}</span>
                            <span className="muted">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </section>

      </section>


      {/* ================= WHY CHOOSE VERIFYHUB ================= */}
      <section
        id="why-verifyhub"
        aria-labelledby="why-heading"
        className="why-choose"
      >
        <div className="wrap">

          {/* Section header */}
          <div className="why-choose-header reveal" ref={addToRevealRefs}>
            <span className="eyebrow why-eyebrow">WHY VERIFY HUB</span>
            <h2 id="why-heading" className="why-choose-title">
              Why choose{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg,#6d3df5 0%,#3b82f6 55%,#16c79a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Verify Hub
              </span>
            </h2>
            <p className="why-choose-sub">
              Built for lenders who want fast, simple and safe checks.
            </p>
          </div>

          {/* 6-card grid */}
          <div className="why-choose-grid">
            {[
              {
                Icon: BoltIcon,
                gradient: 'linear-gradient(135deg,#3B82F6,#0EA5E9)',
                title: 'Instant reports',
                desc: 'Pull credit reports in under a second with an average response time of 640 ms.',
              },
              {
                Icon: HubIcon,
                gradient: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                title: 'All major bureaus, one place',
                desc: 'CIBIL, Experian, Equifax and CRIF through a single unified platform.',
              },
              {
                Icon: AutoAwesomeIcon,
                gradient: 'linear-gradient(135deg,#8B5CF6,#3B82F6)',
                title: 'AI explains your credit reports',
                desc: 'Get AI analysis and clear advice on any raw credit report.',
              },
              {
                Icon: VerifiedIcon,
                gradient: 'linear-gradient(135deg,#10B981,#14B8A6)',
                title: 'Reliable at scale',
                desc: '99.98% uptime, trusted by 50+ enterprise clients and 1 M+ verifications.',
              },
              {
                Icon: AccountBalanceWalletIcon,
                gradient: 'linear-gradient(135deg,#F59E0B,#EF4444)',
                title: 'Clear and simple billing',
                desc: 'See your wallet balance and every payment in your dashboard, live.',
              },
              {
                Icon: LockIcon,
                gradient: 'linear-gradient(135deg,#06B6D4,#3B82F6)',
                title: 'Secure and privacy-first',
                desc: 'We protect your data, and a grievance officer is there if you have a problem.',
              },
            ].map(({ Icon, gradient, title, desc }) => (
              <div
                key={title}
                className="wc-card reveal"
                ref={addToRevealRefs}
              >
                <div className="wc-icon-wrap" style={{ background: gradient }}>
                  <Icon sx={{ fontSize: 26, color: '#fff' }} />
                </div>
                <h3 className="wc-title">{title}</h3>
                <p className="wc-desc">{desc}</p>
              </div>
            ))}
          </div>


        </div>
      </section>

    </div>
  );
};

export default Home;