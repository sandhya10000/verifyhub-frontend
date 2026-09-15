import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Shield';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BalanceIcon from '@mui/icons-material/Balance';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import './Home.css';
import shieldImg from '../assets/verifyhub_shield_high_quality.png';

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
              <p className="lead">Our AI-powered verification platform helps lenders make faster, smarter and more secure decisions. Verify identities, reduce fraud and onboard customers in minutes.</p>
              <div className="hero-actions">
                {/* <a className="btn btn-primary" href="#contact">Book a demo</a>
                <a className="btn btn-dark-outline" href="#contact">Talk to sales</a> */}
              </div>
            </div>
            <div className="hero-visual">
              <img src={shieldImg} alt="VerifyHub Shield AI Platform" className="hero-shield" />
            </div>
          </div>

          <div className="hero-stats" role="list" aria-label="Platform highlights">
            <div className="hstat" role="listitem"><b>1M+</b><span>Verifications</span></div>
            <div className="hstat" role="listitem"><b>50+</b><span>Enterprise Clients</span></div>
            <div className="hstat" role="listitem"><b>640ms</b><span>Avg. Response Time</span></div>
            <div className="hstat" role="listitem"><b>99.98%</b><span>Uptime</span></div>
          </div>
        </div>
      </header>

      {/* ================= AI CREDIT ANALYSIS ================= */}
      <section id="ai-credit-report" className="ai-credit" style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="hero-grid" style={{ alignItems: 'center', gap: '60px' }}>

            {/* LEFT COLUMN */}
            <div className="reveal" ref={addToRevealRefs}>
              <span className="eyebrow">NEW · AI-POWERED ANALYSIS</span>
              <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px', color: 'var(--ink)' }}>
                Smarter insights with{' '}
                <span style={{ color: 'var(--blue)' }}>AI-driven</span>{' '}
                credit analysis
              </h2>
              <p style={{ color: 'var(--slate)', fontSize: '17px', lineHeight: 1.7, marginBottom: '36px' }}>
                Get a detailed breakdown of your applicant's credit health with AI-powered analysis. We highlight key factors, risks and opportunities so you can make confident lending decisions.
              </p>

              {/* Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                {[
                  { title: 'AI risk assessment & score prediction', sub: 'Understand risk with advanced ML models.' },
                  { title: 'Detailed credit insights', sub: "See what's helping or hurting the score." },
                  { title: 'Actionable recommendations', sub: 'Make better decisions, faster.' },
                ].map((item) => (
                  <div key={item.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                      color: '#fff', display: 'grid', placeItems: 'center',
                      flexShrink: 0, fontSize: '13px', fontWeight: 700,
                    }}>✓</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)', marginBottom: '2px' }}>{item.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--slate-lt)' }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button — reuses btn-primary gradient */}
              <Box
                component={RouterLink}
                to="/login"
                onClick={() => sessionStorage.setItem('preLoginPath', window.location.pathname)}
                className="btn btn-primary"
              >
                Analyse my report <span>→</span>
              </Box>
            </div>

            {/* RIGHT COLUMN — white card */}
            <div className="reveal" ref={addToRevealRefs}>
              <div style={{
                background: '#fff',
                borderRadius: '20px',
                border: '1px solid var(--line)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}>
                {/* Card Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 24px 16px',
                  borderBottom: '1px solid var(--line)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>✨</span>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)' }}>AI Analysis</span>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
                    background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                    color: '#fff', padding: '4px 12px', borderRadius: '100px',
                  }}>Powered by AI</span>
                </div>

                {/* Card Body — two sub-columns */}
                <div style={{ display: 'flex', gap: '24px', padding: '24px', alignItems: 'flex-start' }}>

                  {/* Score ring */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="url(#scoreGrad)" strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="263.9"
                          strokeDashoffset="52.8"
                          transform="rotate(-90 50 50)"
                        />
                        <defs>
                          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#14B8A6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>742</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>Good</span>
                  </div>

                  {/* Key Insights */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate)', marginBottom: '12px' }}>Key Insights</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { icon: '💳', label: 'Payment history', status: 'Strong', green: true },
                        { icon: '📊', label: 'Credit utilisation', status: 'Low risk', green: true },
                        { icon: '🏦', label: 'Account mix', status: 'Healthy', green: true },
                        { icon: '🆕', label: 'New credit', status: 'No recent inquiries', green: false },
                      ].map((row) => (
                        <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px' }}>{row.icon}</span>
                            <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 500 }}>{row.label}</span>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: row.green ? 'var(--green)' : 'var(--slate-lt)', whiteSpace: 'nowrap' }}>{row.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Recommendation row */}
                <div style={{
                  margin: '0 16px 16px',
                  background: 'var(--bg-soft)',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>💡</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)', marginBottom: '4px' }}>AI Recommendation</div>
                    <div style={{ fontSize: '13px', color: 'var(--slate)', lineHeight: 1.6 }}>
                      Maintain low credit utilisation and continue timely payments to improve your score further.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= BUREAU COVERAGE ================= */}
      {/* ================= BUREAU COVERAGE ================= */}
      <Box
        component="section"
        id="integrations"
        className="bureau-coverage"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)',
          borderTop: '1px solid var(--line)',
          pt: { xs: 6, md: 12.5 },
          pb: { xs: 7, md: 14 },
        }}
      >
        {/* Background decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '-180px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(74, 108, 255, 0.10) 0%, rgba(124, 58, 237, 0.04) 45%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: '-200px',
            left: '-150px',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(45, 212, 191, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>

          {/* ================= HEADER ================= */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
              alignItems: 'center',
              gap: { xs: 4, md: 8 },
              mb: { xs: 5, md: 9 },
            }}
          >

            {/* LEFT CONTENT */}
            <Box
              className="reveal"
              ref={addToRevealRefs}
              sx={{ maxWidth: { xs: '100%', md: '650px' } }}
            >
              <span
                className="eyebrow"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 12px',
                  borderRadius: '999px',
                  background: '#edf4ff',
                  color: 'var(--blue)',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  marginBottom: '18px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--blue)',
                  }}
                />
                WIDE BUREAU COVERAGE
              </span>

              <Box
                component="h2"
                sx={{
                  fontSize: { xs: '30px', sm: 'clamp(34px, 4vw, 52px)' },
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  m: '0 0 16px',
                  color: 'var(--ink)',
                  maxWidth: { xs: '100%', md: '650px' },
                }}
              >
                Connected to every major{' '}
                <span
                  style={{
                    background:
                      'linear-gradient(90deg, #6d3df5 0%, #3b82f6 55%, #16c79a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  credit bureau
                </span>
              </Box>

              <Box
                component="p"
                sx={{
                  color: 'var(--slate)',
                  fontSize: { xs: '15px', md: '17px' },
                  lineHeight: 1.7,
                  m: 0,
                  maxWidth: { xs: '100%', md: '600px' },
                }}
              >
                Pull credit reports from India's leading bureaus in one place.
                Get a complete view of your customer's credit profile and make
                faster, more informed decisions.
              </Box>

              {/* Mini stats */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: { xs: 'space-between', sm: 'flex-start' },
                  gap: { xs: 2, sm: 3.5 },
                  mt: { xs: 3, md: 4 },
                  p: { xs: 2, sm: 0 },
                  background: { xs: '#f7f9fc', sm: 'transparent' },
                  borderRadius: { xs: '14px', sm: 0 },
                }}
              >
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Box sx={{ fontSize: { xs: '18px', md: '22px' }, fontWeight: 800, color: 'var(--ink)' }}>4</Box>
                  <Box sx={{ fontSize: { xs: '11px', md: '12px' }, color: 'var(--slate-lt)', mt: 0.5 }}>Major bureaus</Box>
                </Box>

                <Box sx={{ width: '1px', height: '30px', background: 'var(--line)' }} />

                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Box sx={{ fontSize: { xs: '18px', md: '22px' }, fontWeight: 800, color: 'var(--ink)' }}>2</Box>
                  <Box sx={{ fontSize: { xs: '11px', md: '12px' }, color: 'var(--slate-lt)', mt: 0.5 }}>Live connections</Box>
                </Box>

                <Box sx={{ width: '1px', height: '30px', background: 'var(--line)' }} />

                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Box sx={{ fontSize: { xs: '18px', md: '22px' }, fontWeight: 800, color: 'var(--green)' }}>1</Box>
                  <Box sx={{ fontSize: { xs: '11px', md: '12px' }, color: 'var(--slate-lt)', mt: 0.5 }}>Unified platform</Box>
                </Box>
              </Box>
            </Box>

            {/* ================= ILLUSTRATION ================= */}
            <Box
              className="reveal"
              ref={addToRevealRefs}
              sx={{
                position: 'relative',
                minHeight: { xs: '220px', md: '300px' },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transform: { xs: 'scale(0.72)', sm: 'scale(0.85)', md: 'scale(1)' },
                mx: 'auto',
              }}
            >

              {/* Glow */}
              <div
                style={{
                  position: 'absolute',
                  width: '310px',
                  height: '210px',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(76, 104, 255, 0.16), transparent 70%)',
                  filter: 'blur(8px)',
                }}
              />

              {/* Orbit */}
              <div
                style={{
                  position: 'absolute',
                  width: '350px',
                  height: '150px',
                  border: '1px solid rgba(74, 108, 255, 0.18)',
                  borderRadius: '50%',
                  transform: 'rotate(75deg)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  width: '400px',
                  height: '150px',
                  border: '1px solid rgba(62, 6, 228, 0.18)',
                  borderRadius: '50%',
                  transform: 'rotate(20deg)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  width: '450px',
                  height: '200px',
                  border: '1px solid rgba(9, 2, 31, 0.18)',
                  borderRadius: '50%',
                  transform: 'rotate(-16deg)',
                }}
              />

              {/* Orbit dots */}
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: '65px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#6d3df5',
                  boxShadow: '0 0 12px rgba(109,61,245,.5)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  bottom: '54px',
                  left: '75px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#16c79a',
                  boxShadow: '0 0 12px rgba(22,199,154,.5)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  bottom: '-10px',
                  left: '250px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: '#1f43b8ff',
                  boxShadow: '0 0 12px rgba(28, 8, 82, 0.5)',
                }}
              />

              {/* Cards stack */}
              <div
                style={{
                  position: 'relative',
                  width: '290px',
                  height: '230px',
                }}
              >

                {/* CRIF */}
                <div
                  style={{
                    position: 'absolute',
                    top: '125px',
                    left: '48px',
                    width: '230px',
                    padding: '17px 20px',
                    background: 'rgba(255,255,255,.88)',
                    border: '1px solid rgba(220,228,240,.9)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 50px rgba(31,50,90,.10)',
                    transform: 'rotate(4deg)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#26364d' }}>
                    ≋ CRIF
                  </div>
                  <div
                    style={{
                      height: '6px',
                      width: '62%',
                      marginTop: '12px',
                      borderRadius: '10px',
                      background: '#e5ebf4',
                    }}
                  />
                </div>

                {/* EQUIFAX */}
                <div
                  style={{
                    position: 'absolute',
                    top: '82px',
                    left: '30px',
                    width: '230px',
                    padding: '17px 20px',
                    background: 'rgba(255,255,255,.92)',
                    border: '1px solid rgba(220,228,240,.9)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 50px rgba(31,50,90,.10)',
                    transform: 'rotate(-1deg)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#e31837' }}>
                    EQUIFAX
                  </div>
                  <div
                    style={{
                      height: '6px',
                      width: '72%',
                      marginTop: '12px',
                      borderRadius: '10px',
                      background: '#f0e5e8',
                    }}
                  />
                </div>

                {/* Experian */}
                <div
                  style={{
                    position: 'absolute',
                    top: '39px',
                    left: '14px',
                    width: '230px',
                    padding: '17px 20px',
                    background: 'rgba(255,255,255,.95)',
                    border: '1px solid rgba(220,228,240,.9)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 50px rgba(31,50,90,.11)',
                    transform: 'rotate(-3deg)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#9b2bc7' }}>
                    ✦ Experian
                  </div>
                  <div
                    style={{
                      height: '6px',
                      width: '66%',
                      marginTop: '12px',
                      borderRadius: '10px',
                      background: '#eee5f3',
                    }}
                  />
                </div>

                {/* CIBIL front */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '230px',
                    padding: '18px 20px',
                    background: '#ffffff',
                    border: '1px solid #dce6f3',
                    borderRadius: '16px',
                    boxShadow: '0 25px 60px rgba(31,50,90,.15)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--blue)' }}>
                      CIBIL
                    </div>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#94a3b8',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      height: '6px',
                      width: '78%',
                      marginTop: '13px',
                      borderRadius: '10px',
                      background: '#e5ebf4',
                    }}
                  />
                  <div
                    style={{
                      height: '6px',
                      width: '48%',
                      marginTop: '7px',
                      borderRadius: '10px',
                      background: '#eef2f7',
                    }}
                  />
                </div>
              </div>

              {/* Verified badge */}
              <div
                style={{
                  position: 'absolute',
                  right: '25px',
                  bottom: '28px',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, #10b981, #20c997)',
                  color: '#fff',
                  fontSize: '20px',
                  fontWeight: 800,
                  boxShadow: '0 10px 25px rgba(16,185,129,.28)',
                  border: '4px solid #fff',
                }}
              >
                ✓
              </div>
            </Box>
          </Box>

          {/* ================= BUREAU CARDS ================= */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: { xs: '14px', md: '18px' },
            }}
          >

            {/* CIBIL */}
            <Box
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
                style={{ background: '#f4f6f9', color: '#64748b', border: '1px solid #dce3ec' }}
              >
                Coming Soon
              </span>
              <div style={{ marginTop: '18px', fontSize: '20px', fontWeight: 800, color: 'var(--blue)' }}>
                CIBIL
              </div>
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--slate)' }}>
                Credit Information Bureau
              </div>
              <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--slate-lt)' }}>
                Score & full report analysis
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: '20px',
                  bottom: '18px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #d9e3f1',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--blue)',
                  fontSize: '15px',
                }}
              >
                →
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '-15px',
                  bottom: '-35px',
                  width: '150px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(59,130,246,.08)',
                  filter: 'blur(3px)',
                }}
              />
            </Box>

            {/* EXPERIAN */}
            <Box
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
                style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(16,185,129,.4)' }}
              >
                ● Live
              </span>
              <div style={{ marginTop: '18px', fontSize: '20px', fontWeight: 800, color: '#9b2bc7' }}>
                ✦ Experian
              </div>
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--slate)' }}>
                Experian
              </div>
              <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--slate-lt)' }}>
                Score & full report analysis
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: '20px',
                  bottom: '18px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid var(--green)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--green)',
                  fontSize: '15px',
                }}
              >
                →
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '-15px',
                  bottom: '-35px',
                  width: '150px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(155,43,199,.07)',
                  filter: 'blur(3px)',
                }}
              />
            </Box>

            {/* EQUIFAX */}
            <Box
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
                style={{ background: '#f4f6f9', color: '#64748b', border: '1px solid #dce3ec' }}
              >
                Coming Soon
              </span>
              <div style={{ marginTop: '18px', fontSize: '20px', fontWeight: 800, color: '#e31837' }}>
                EQUIFAX
              </div>
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--slate)' }}>
                Equifax
              </div>
              <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--slate-lt)' }}>
                Score & full report analysis
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: '20px',
                  bottom: '18px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #d9e3f1',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--slate)',
                  fontSize: '15px',
                }}
              >
                →
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '-15px',
                  bottom: '-35px',
                  width: '150px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(227,24,55,.06)',
                  filter: 'blur(3px)',
                }}
              />
            </Box>

            {/* CRIF */}
            <Box
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
                style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(16,185,129,.4)' }}
              >
                ● Live
              </span>
              <div style={{ marginTop: '18px', fontSize: '20px', fontWeight: 800, color: '#26364d' }}>
                ≋ CRIF
              </div>
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--slate)' }}>
                CRIF
              </div>
              <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--slate-lt)' }}>
                Score & full report analysis
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: '20px',
                  bottom: '18px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid var(--green)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--green)',
                  fontSize: '15px',
                }}
              >
                →
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '-15px',
                  bottom: '-35px',
                  width: '150px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(16,185,129,.07)',
                  filter: 'blur(3px)',
                }}
              />
            </Box>
          </Box>

        </div>
      </Box>
    </div>
  );
};

export default Home;