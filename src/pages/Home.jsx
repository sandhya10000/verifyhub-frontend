import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/shared/Logo';
import './Home.css';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const revealRefs = useRef([]);
  const countRefs = useRef([]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    // Reveal on scroll
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
    // Metric count-up
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
      <div className="announce">
        <div className="announce-in">
          <span className="announce-tag">New</span>
          <span>Commercial Credit Bureau API is now live for MSME lending</span>
          <a href="#products">Explore <span className="arr" aria-hidden="true">→</span></a>
        </div>
      </div>

      <nav aria-label="Main navigation">
        <div className="wrap nav-in">
          <a href="#" className="logo" aria-label="VerifyHub home">
            <Logo height={36} alt="VerifyHub" />
          </a>
          <div className="nav-links">
            <a href="#products">Products</a>
            <a href="#platform">Platform</a>
            <a href="#developers">Developers</a>
            <a href="#contact">Pricing</a>
          </div>
          <div className="nav-cta">
            <Link className="signin" to="/login">Sign in</Link>
            <a className="btn btn-outline" href="#developers">Documentation</a>
            <a className="btn btn-primary" href="#contact">Get started <span className="arr">→</span></a>
            <button className="hamburger" aria-label="Toggle menu" aria-expanded={isMenuOpen} onClick={toggleMenu}>☰</button>
          </div>
        </div>
      </nav>
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`} id="mmenu">
        <a href="#products" onClick={closeMenu}>Products</a>
        <a href="#platform" onClick={closeMenu}>Platform</a>
        <a href="#developers" onClick={closeMenu}>Developers</a>
        <a href="#contact" onClick={closeMenu}>Pricing</a>
        <a href="#contact" className="btn btn-primary" onClick={closeMenu}>Get started →</a>
      </div>

      {/* ================= HERO ================= */}
      <header className="hero">
        <div className="wrap hero-in">
          <div>
            <span className="eyebrow on-dark">⬢ &nbsp;API infrastructure for financial institutions</span>
            <h1>The verification layer behind <span className="grad">modern lending</span></h1>
            <p className="lead">Credit bureau data, identity verification, bank statement intelligence and AI decisioning — unified into one enterprise-grade API platform trusted by banks, NBFCs and fintechs across India.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#contact">Start with sandbox <span className="arr">→</span></a>
              <a className="btn btn-dark-outline" href="#contact">Book a demo</a>
            </div>
          </div>

          <div className="hero-stats" role="list" aria-label="Platform highlights">
            <div className="hstat" role="listitem"><b><span className="u">640 ms</span></b><span>avg. API response</span></div>
            <div className="hstat" role="listitem"><b>₹2,400 Cr+</b><span>loans decisioned monthly</span></div>
            <div className="hstat" role="listitem"><b><span className="u">99.98%</span></b><span>platform uptime</span></div>
            <div className="hstat" role="listitem"><b>4 bureaus</b><span>consolidated in one call</span></div>
          </div>
        </div>
      </header>

      {/* ================= PRODUCTS ================= */}
      <section className="products" id="products">
        <div className="wrap">
          <div className="sec-head center reveal" ref={addToRevealRefs}>
            <span className="eyebrow">Product suite</span>
            <h2>Everything your credit stack needs, in one platform</h2>
            <p>Modular APIs that work independently or together — assess creditworthiness, verify identity and automate decisions end to end.</p>
          </div>
          <div className="prod-grid">
            <div className="pcard reveal" ref={addToRevealRefs}>
              <div className="ico ico-blue">📊</div>
              <h3>Credit Bureau API</h3>
              <p>Consumer and commercial credit reports from all major Indian bureaus, delivered through one normalised schema.</p>
              <div className="pts">
                <span>Soft &amp; hard pull support</span>
                <span>Built-in consent capture</span>
                <span>Score bands &amp; summary attributes</span>
              </div>
              <a className="link" href="#contact">Explore API →</a>
            </div>
            <div className="pcard reveal" ref={addToRevealRefs}>
              <div className="ico ico-green">🪪</div>
              <h3>Identity &amp; KYC Suite</h3>
              <p>Real-time verification of PAN, Aadhaar (offline), GSTIN, driving licence, voter ID, bank accounts and UPI handles.</p>
              <div className="pts">
                <span>Face match &amp; liveness detection</span>
                <span>Video KYC workflows</span>
                <span>CKYC search &amp; download</span>
              </div>
              <a className="link" href="#contact">Explore API →</a>
            </div>
            <div className="pcard reveal" ref={addToRevealRefs}>
              <div className="ico ico-blue">🏦</div>
              <h3>Bank Statement Analyzer</h3>
              <p>Convert PDFs and account aggregator feeds into categorised transactions and lender-ready cashflow insights.</p>
              <div className="pts">
                <span>700+ bank formats supported</span>
                <span>Fraud &amp; tampering detection</span>
                <span>FOIR, ABB &amp; obligation analysis</span>
              </div>
              <a className="link" href="#contact">Explore API →</a>
            </div>
            <div className="pcard reveal" ref={addToRevealRefs}>
              <span className="badge-new">NEW</span>
              <div className="ico ico-gold">🤖</div>
              <h3>AI Decisioning Engine</h3>
              <p>Combine bureau, banking and alternate data into configurable scorecards that return instant credit decisions.</p>
              <div className="pts">
                <span>No-code rule builder</span>
                <span>ML models with explainability</span>
                <span>Champion–challenger testing</span>
              </div>
              <a className="link" href="#contact">Explore API →</a>
            </div>
            <div className="pcard reveal" ref={addToRevealRefs}>
              <div className="ico ico-green">📄</div>
              <h3>Document Intelligence</h3>
              <p>AI-powered OCR and forgery detection for salary slips, ITRs, Form 16, invoices and financial statements.</p>
              <div className="pts">
                <span>Structured field extraction</span>
                <span>Tamper &amp; template checks</span>
                <span>Confidence scoring per field</span>
              </div>
              <a className="link" href="#contact">Explore API →</a>
            </div>
            <div className="pcard reveal" ref={addToRevealRefs}>
              <div className="ico ico-gold">📡</div>
              <h3>Portfolio Monitoring</h3>
              <p>Track borrower health after disbursal with bureau refresh triggers, employment signals and early-warning alerts.</p>
              <div className="pts">
                <span>Scheduled bureau refreshes</span>
                <span>EPFO &amp; employment tracking</span>
                <span>Risk-event webhooks</span>
              </div>
              <a className="link" href="#contact">Explore API →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= METRICS ================= */}
      <div className="metrics">
        <div className="wrap">
          <div className="divider">Platform performance</div>
          <div className="metrics-grid">
            <div className="metric reveal" ref={addToRevealRefs}><b className="count" data-target="50" data-suffix="M+" ref={addToCountRefs}>0M+</b><small>Monthly API calls</small><span className="delta">▲ 3.2× YoY</span></div>
            <div className="metric reveal" ref={addToRevealRefs}><b className="count" data-target="200" data-suffix="+" ref={addToCountRefs}>0+</b><small>Institutions onboarded</small><span className="delta">▲ 60 this year</span></div>
            <div className="metric reveal" ref={addToRevealRefs}><b className="count" data-target="640" data-suffix="ms" ref={addToCountRefs}>0ms</b><small>Median response time</small><span className="delta">P99 under 1.4s</span></div>
            <div className="metric reveal" ref={addToRevealRefs}><b>99.98%</b><small>Uptime SLA</small><span className="delta">Zero Sev-1 in 12 mo</span></div>
          </div>
        </div>
      </div>

      {/* ================= WORKFLOW ================= */}
      <section id="platform">
        <div className="wrap">
          <div className="sec-head reveal" ref={addToRevealRefs}>
            <span className="eyebrow">Implementation</span>
            <h2>From first API call to production in days, not months</h2>
            <p>A structured onboarding process backed by dedicated solution engineers — most teams go live within two weeks.</p>
          </div>
          <div className="flow-grid">
            <div className="fstep reveal" ref={addToRevealRefs}>
              <span className="num">STEP 1</span>
              <h3>Sandbox access</h3>
              <p>Instant test credentials with realistic mock data for every endpoint. No paperwork required.</p>
            </div>
            <div className="fstep reveal" ref={addToRevealRefs}>
              <span className="num">STEP 2</span>
              <h3>Integration</h3>
              <p>REST APIs, official SDKs and Postman collections, with a solutions engineer assigned to your team.</p>
            </div>
            <div className="fstep reveal" ref={addToRevealRefs}>
              <span className="num">STEP 3</span>
              <h3>Compliance setup</h3>
              <p>We coordinate bureau agreements, consent architecture and data-sharing documentation with you.</p>
            </div>
            <div className="fstep reveal" ref={addToRevealRefs}>
              <span className="num">STEP 4</span>
              <h3>Production &amp; scale</h3>
              <p>Go live with usage alerts, spend controls and volume-based pricing that scales with your book.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DEVELOPERS ================= */}
      <section className="dev" id="developers">
        <div className="wrap">
          <div className="sec-head reveal" ref={addToRevealRefs}>
            <span className="eyebrow on-dark">Developer experience</span>
            <h2>An API your engineers will actually enjoy</h2>
            <p>Predictable JSON, semantic errors, idempotent retries and webhooks — designed to the standard of the best global API companies.</p>
          </div>
          <div className="dev-points">
              <div className="dev-pt reveal" ref={addToRevealRefs}>
                <span className="di">🔁</span>
                <div><h3>One schema, every bureau</h3><p>Normalised responses across all data sources — no vendor-specific parsing in your codebase.</p></div>
              </div>
              <div className="dev-pt reveal" ref={addToRevealRefs}>
                <span className="di">🪝</span>
                <div><h3>Webhooks for async jobs</h3><p>Statement analysis and monitoring events post back to your endpoint with signed payloads.</p></div>
              </div>
              <div className="dev-pt reveal" ref={addToRevealRefs}>
                <span className="di">📦</span>
                <div><h3>SDKs in four languages</h3><p>Official libraries for Node.js, Python, Java and PHP, plus a maintained Postman workspace.</p></div>
              </div>
              <div className="dev-pt reveal" ref={addToRevealRefs}>
                <span className="di">📈</span>
                <div><h3>Usage &amp; spend dashboard</h3><p>Per-endpoint analytics, success-rate tracking, budget alerts and downloadable invoices.</p></div>
              </div>
              <div className="dev-pt reveal" ref={addToRevealRefs}>
                <span className="di">🧪</span>
                <div><h3>Production-grade sandbox</h3><p>Deterministic test personas that simulate every response state — including failures.</p></div>
              </div>
            </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-sec" id="contact" style={{ paddingTop: '96px' }}>
        <div className="wrap">
          <div className="cta reveal" ref={addToRevealRefs}>
            <h2>Start verifying in minutes</h2>
            <p>Get free sandbox access today, or speak with our solutions team about enterprise volumes and custom scorecards.</p>
            <div className="row">
              <a className="btn btn-primary" href="mailto:hello@verifyhub.in">Get sandbox keys <span className="arr">→</span></a>
              <a className="btn btn-dark-outline" href="mailto:sales@verifyhub.in">Talk to sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a href="#" className="logo">
                <Logo height={36} alt="VerifyHub" />
              </a>
              <p>API and technology infrastructure for India's lending ecosystem — credit data, verification and AI decisioning under one platform.</p>
            </div>
            <div>
              <h4>Products</h4>
              <ul>
                <li><a href="#products">Credit Bureau API</a></li>
                <li><a href="#products">Identity &amp; KYC</a></li>
                <li><a href="#products">Statement Analyzer</a></li>
                <li><a href="#products">AI Decisioning</a></li>
                <li><a href="#products">Monitoring</a></li>
              </ul>
            </div>
            <div>
              <h4>Developers</h4>
              <ul>
                <li><a href="#developers">Documentation</a></li>
                <li><a href="#developers">API Reference</a></li>
                <li><a href="#developers">SDKs</a></li>
                <li><a href="#developers">System status</a></li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><a href="#">About us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy policy</a></li>
                <li><a href="#">Terms of service</a></li>
                <li><a href="#">Data protection</a></li>
                <li><a href="#">Grievance officer</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <div className="foot-legal">
              <span>© 2026 Optimystic Auxiliary Services Private Limited. All rights reserved.</span>
              <span className="foot-sub">VerifyHub is a brand of Optimystic Auxiliary Services Private Limited.</span>
            </div>
            <div className="foot-meta">
              <a className="foot-chip" href="https://www.verifyhub.in" target="_blank" rel="noreferrer noopener">www.verifyhub.in</a>
              <a className="foot-chip" href="mailto:hello@verifyhub.in">hello@verifyhub.in</a>
              <span className="foot-chip"><span className="tricolor" aria-hidden="true"><i></i><i></i><i></i></span>Made in India</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
