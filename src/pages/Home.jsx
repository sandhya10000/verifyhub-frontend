import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import './Home.css';
import SectionHeading from '../Components/common/SectionHeading';
import FeatureCard from '../Components/common/FeatureCard';
import PrimaryButton from '../Components/common/PrimaryButton';

const Home = () => {
  const revealRefs = useRef([]);
  const countRefs = useRef([]);


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

      {/* ================= HERO ================= */}
      <header className="hero">
        <div className="wrap hero-in">
          <div>
            <span className="eyebrow on-dark">⬢ &nbsp;API infrastructure for financial institutions</span>
            <h1>The verification layer behind <span className="grad">modern lending</span></h1>
            <p className="lead">Credit bureau data, identity verification, bank statement intelligence and AI decisioning — unified into one enterprise-grade API platform trusted by banks, NBFCs and fintechs across India.</p>
            <div className="hero-actions">
              <PrimaryButton href="#contact" sx={{ px: 4, py: 1.5, fontSize: '16px' }}>Start with sandbox <span className="arr" style={{marginLeft: 8}}>→</span></PrimaryButton>
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
          <Box className="reveal" ref={addToRevealRefs} sx={{ mb: 7 }}>
            <SectionHeading 
              alignment="center"
              eyebrow="Product suite"
              title="Everything your credit stack needs, in one platform"
              subtext="Modular APIs that work independently or together — assess creditworthiness, verify identity and automate decisions end to end."
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            <FeatureCard 
              className="reveal"
              ref={addToRevealRefs}
              icon="📊"
              iconColor="primary"
              title="Credit Bureau API"
              description="Consumer and commercial credit reports from all major Indian bureaus, delivered through one normalised schema."
              points={['Soft & hard pull support', 'Built-in consent capture', 'Score bands & summary attributes']}
            />
            <FeatureCard 
              className="reveal"
              ref={addToRevealRefs}
              icon="🪪"
              iconColor="success"
              title="Identity & KYC Suite"
              description="Real-time verification of PAN, Aadhaar (offline), GSTIN, driving licence, voter ID, bank accounts and UPI handles."
              points={['Face match & liveness detection', 'Video KYC workflows', 'CKYC search & download']}
            />
            <FeatureCard 
              className="reveal"
              ref={addToRevealRefs}
              icon="🏦"
              iconColor="primary"
              title="Bank Statement Analyzer"
              description="Convert PDFs and account aggregator feeds into categorised transactions and lender-ready cashflow insights."
              points={['700+ bank formats supported', 'Fraud & tampering detection', 'FOIR, ABB & obligation analysis']}
            />
            <FeatureCard 
              className="reveal"
              ref={addToRevealRefs}
              isNew={true}
              icon="🤖"
              iconColor="warning"
              title="AI Decisioning Engine"
              description="Combine bureau, banking and alternate data into configurable scorecards that return instant credit decisions."
              points={['No-code rule builder', 'ML models with explainability', 'Champion–challenger testing']}
            />
            <FeatureCard 
              className="reveal"
              ref={addToRevealRefs}
              icon="📄"
              iconColor="success"
              title="Document Intelligence"
              description="AI-powered OCR and forgery detection for salary slips, ITRs, Form 16, invoices and financial statements."
              points={['Structured field extraction', 'Tamper & template checks', 'Confidence scoring per field']}
            />
            <FeatureCard 
              className="reveal"
              ref={addToRevealRefs}
              icon="📡"
              iconColor="warning"
              title="Portfolio Monitoring"
              description="Track borrower health after disbursal with bureau refresh triggers, employment signals and early-warning alerts."
              points={['Scheduled bureau refreshes', 'EPFO & employment tracking', 'Risk-event webhooks']}
            />
          </Box>
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
          <Box className="reveal" ref={addToRevealRefs} sx={{ mb: 7 }}>
            <SectionHeading 
              eyebrow="Implementation"
              title="From first API call to production in days, not months"
              subtext="A structured onboarding process backed by dedicated solution engineers — most teams go live within two weeks."
            />
          </Box>
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
          <Box className="reveal" ref={addToRevealRefs} sx={{ mb: 7 }}>
            <SectionHeading 
              eyebrow="Developer experience"
              title="An API your engineers will actually enjoy"
              subtext="Predictable JSON, semantic errors, idempotent retries and webhooks — designed to the standard of the best global API companies."
              sx={{ '& h2': { color: '#fff' }, '& p': { color: '#A9BAD6' } }}
            />
          </Box>
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
              <PrimaryButton href="mailto:info@verifyhub.in" sx={{ px: 4, py: 1.5, fontSize: '16px' }}>Get sandbox keys <span className="arr" style={{marginLeft: 8}}>→</span></PrimaryButton>
              <a className="btn btn-dark-outline" href="mailto:sales@verifyhub.in">Talk to sales</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
