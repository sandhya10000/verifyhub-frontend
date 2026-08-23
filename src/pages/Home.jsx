import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
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
                <a className="btn btn-primary" href="#contact">Book a demo</a>
                <a className="btn btn-dark-outline" href="#contact">Talk to sales</a>
              </div>
            </div>
            <div className="hero-visual">
              <img src={shieldImg} alt="VerifyHub Shield AI Platform" className="hero-shield" />
            </div>
          </div>

          <div className="hero-stats" role="list" aria-label="Platform highlights">
            <div className="hstat" role="listitem"><b>50M+</b><span>Verifications</span></div>
            <div className="hstat" role="listitem"><b>220+</b><span>Enterprise Clients</span></div>
            <div className="hstat" role="listitem"><b>640ms</b><span>Avg. Response Time</span></div>
            <div className="hstat" role="listitem"><b>99.98%</b><span>Uptime</span></div>
          </div>
        </div>
      </header>

      {/* ================= PRODUCTS ================= */}
      <section className="products" id="products">
        <div className="wrap">
          <div className="sec-head center reveal" ref={addToRevealRefs}>
            <span className="eyebrow">OUR PRODUCTS</span>
            <h2>Everything you need to <br /><span className="grad-blue">screen, onboard &amp; protect</span></h2>
            <p>Comprehensive verification solutions for every lending journey.</p>
          </div>
          
          <div className="prod-grid">
            <div className="pcard reveal" ref={addToRevealRefs}>
              <div className="ico ico-blue">🪪</div>
              <h3>Identity Verification</h3>
              <p>Verify identities instantly with government ID, selfie &amp; ML checks.</p>
              <div className="pts">
                <span>PAN, Aadhaar, Voter ID</span>
                <span>Selfie &amp; Liveness Detection</span>
                <span>OCR &amp; Data Extraction</span>
                <span>Sanction Screening</span>
              </div>
              <a href="#" className="link">Explore <span className="arr">→</span></a>
            </div>

            <div className="pcard reveal" ref={addToRevealRefs}>
              <div className="ico ico-green">📄</div>
              <h3>Document Verification</h3>
              <p>Validate documents in real-time with advanced AI and rules.</p>
              <div className="pts">
                <span>Income Proof, Bank Statements</span>
                <span>Address Proof, KYC Docs</span>
                <span>Tamper &amp; Fraud Detection</span>
                <span>Custom Rules Engine</span>
              </div>
              <a href="#" className="link">Explore <span className="arr">→</span></a>
            </div>

            <div className="pcard reveal" ref={addToRevealRefs}>
              <div className="ico ico-purple">💼</div>
              <h3>Employment Verification</h3>
              <p>Verify employment details accurately and securely.</p>
              <div className="pts">
                <span>Employer Verification</span>
                <span>Salary &amp; Tenure Validation</span>
                <span>Work Email Verification</span>
                <span>Reference Checks</span>
              </div>
              <a href="#" className="link">Explore <span className="arr">→</span></a>
            </div>

            <div className="pcard reveal" ref={addToRevealRefs}>
              <span className="badge-new">New</span>
              <div className="ico ico-gold">📊</div>
              <h3>Financial Insights</h3>
              <p>Get deeper financial insights to assess risk with confidence.</p>
              <div className="pts">
                <span>Bank Statement Analysis</span>
                <span>Income &amp; Cash Flow Insights</span>
                <span>Spend Pattern Analysis</span>
                <span>Risk Scoring</span>
              </div>
              <a href="#" className="link">Explore <span className="arr">→</span></a>
            </div>

            <div className="pcard reveal" ref={addToRevealRefs}>
              <div className="ico ico-teal">🛡️</div>
              <h3>Fraud Detection</h3>
              <p>Detect fraud early with AI-powered risk models and anomalies.</p>
              <div className="pts">
                <span>Device Intelligence</span>
                <span>Behavioral Analytics</span>
                <span>Velocity &amp; Anomaly Checks</span>
                <span>Fraud Risk Score</span>
              </div>
              <a href="#" className="link">Explore <span className="arr">→</span></a>
            </div>

            <div className="pcard reveal" ref={addToRevealRefs}>
              <div className="ico ico-gold">⚙️</div>
              <h3>Platform Solutions</h3>
              <p>End-to-end verification platform built for scale and flexibility.</p>
              <div className="pts">
                <span>Custom Workflows</span>
                <span>API &amp; SDK Integrations</span>
                <span>White-label Solutions</span>
                <span>Enterprise Dashboard</span>
              </div>
              <a href="#" className="link">Explore <span className="arr">→</span></a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= METRICS STRIP ================= */}
      <div className="metrics-strip">
        <div className="wrap">
          <div className="metrics-strip-inner reveal" ref={addToRevealRefs}>
            <div className="ms-dots ms-dots-left"></div>
            <div className="ms-dots ms-dots-right"></div>
            <div className="m-item">
              <div className="m-icon m-icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div className="m-text">
                <b className="count" data-target="50" data-suffix="M+" ref={addToCountRefs}>0M+</b>
                <span>Verifications</span>
                <div className="m-accent m-accent-purple"></div>
              </div>
            </div>
            <div className="m-divider"></div>
            <div className="m-item">
              <div className="m-icon m-icon-teal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
              </div>
              <div className="m-text">
                <b className="count" data-target="220" data-suffix="+" ref={addToCountRefs}>0+</b>
                <span>Enterprise Clients</span>
                <div className="m-accent m-accent-teal"></div>
              </div>
            </div>
            <div className="m-divider"></div>
            <div className="m-item">
              <div className="m-icon m-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l2 2"></path><path d="M10 2h4"></path></svg>
              </div>
              <div className="m-text">
                <b className="count" data-target="640" data-suffix="ms" ref={addToCountRefs}>0ms</b>
                <span>Avg. Response Time</span>
                <div className="m-accent m-accent-blue"></div>
              </div>
            </div>
            <div className="m-divider"></div>
            <div className="m-item">
              <div className="m-icon m-icon-indigo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div className="m-text">
                <b>99.98%</b>
                <span>Uptime</span>
                <div className="m-accent m-accent-indigo"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TRUSTED BY ================= */}
      <section className="trusted-by">
        <div className="wrap">
          <div className="sec-head center reveal" ref={addToRevealRefs} style={{ marginBottom: '40px' }}>
            <span className="eyebrow" style={{ background: 'transparent', border: 'none', color: '#64748B', fontWeight: 700, letterSpacing: '0.1em' }}>TRUSTED BY LEADING LENDERS</span>
            <h2 style={{fontSize: '24px'}}>Trusted by <span className="grad-blue">200+</span> top lenders &amp; fintechs</h2>
            <p>Powering verification for the world's most innovative financial companies.</p>
          </div>
          
          <div className="logos-carousel reveal" ref={addToRevealRefs}>
            <div className="logo-placeholder"><span>🐝</span> KreditBee</div>
            <div className="logo-placeholder"><span style={{color: '#3B82F6'}}>m</span>Pokket</div>
            <div className="logo-placeholder"><span style={{color: '#8B5CF6'}}>CASHe</span></div>
            <div className="logo-placeholder"><span style={{color: '#EC4899'}}>S</span>StashFin</div>
            <div className="logo-placeholder"><span style={{color: '#10B981'}}>M</span>MoneyView</div>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="why-us" id="features">
        <div className="wrap">
          <div className="sec-head center reveal" ref={addToRevealRefs}>
            <span className="eyebrow on-dark" style={{ background: 'transparent', border: 'none' }}>WHY CHOOSE VERIFYHUB</span>
            <h2 style={{color: '#fff'}}>A better verification stack<br/>for modern lenders</h2>
            <p style={{color: '#A9BAD6'}}>Built for scale, accuracy and security from day one.</p>
          </div>
          
          <div className="why-grid">
            <div className="why-card reveal" ref={addToRevealRefs}>
              <div className="why-ico">🤖</div>
              <div>
                <h3>AI-Powered Automation</h3>
                <p>Reduce manual work and errors with intelligent automation.</p>
              </div>
            </div>
            <div className="why-card reveal" ref={addToRevealRefs}>
              <div className="why-ico">⚡</div>
              <div>
                <h3>Real-time verification</h3>
                <p>Verify in real-time and reduce onboarding time.</p>
              </div>
            </div>
            <div className="why-card reveal" ref={addToRevealRefs}>
              <div className="why-ico">📈</div>
              <div>
                <h3>High Accuracy</h3>
                <p>Advanced ML models ensure highest accuracy and reliability.</p>
              </div>
            </div>
            <div className="why-card reveal" ref={addToRevealRefs}>
              <div className="why-ico">🔒</div>
              <div>
                <h3>Secure &amp; Compliant</h3>
                <p>Built with security-first approach and regulatory compliance.</p>
              </div>
            </div>
            <div className="why-card reveal" ref={addToRevealRefs}>
              <div className="why-ico">⚙️</div>
              <div>
                <h3>Scalable Infrastructure</h3>
                <p>Cloud-native platform built to handle millions of verifications.</p>
              </div>
            </div>
            <div className="why-card reveal" ref={addToRevealRefs}>
              <div className="why-ico">💻</div>
              <div>
                <h3>Developer Friendly</h3>
                <p>Easy to integrate APIs and comprehensive documentation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-sec" id="contact">
        <div className="wrap">
          <div className="cta reveal" ref={addToRevealRefs}>
            <div className="cta-shield-icon">🛡️</div>
            <h2>Start verifying in minutes</h2>
            <p>Join 200+ lenders who trust VerifyHub for their verification needs.</p>
            <div className="row">
              <a className="btn btn-white" href="#contact">Get started for free</a>
              <a className="btn btn-dark-outline" href="#contact">Talk to sales</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
