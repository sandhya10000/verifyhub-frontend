import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import './AboutUs.css';

const STATS = [
  { value: '1M+', label: 'Verifications' },
  { value: '50+', label: 'Enterprise clients' },
  { value: '640ms', label: 'Avg. response time' },
  { value: '99.98%', label: 'Uptime' },
];

const PRODUCTS = [
  {
    icon: '🏦', iconCls: 'abt-icon-blue',
    title: 'Credit Bureau API',
    desc: 'Pull reports from major Indian bureaus through one unified API.',
    href: '/credit-bureau-api',
  },
  {
    icon: '🤖', iconCls: 'abt-icon-teal',
    title: 'AI Decisioning',
    desc: 'Turn credit reports into plain-language lending decisions in multiple Indian languages.',
    href: '/ai-decisioning',
  },
];

const PRINCIPLES = [
  {
    icon: '✓',
    title: 'Consent first',
    desc: 'Every data pull is consent-based.',
  },
  {
    icon: '🔒',
    title: 'Security by design',
    desc: 'Encrypted in transit, careful data handling.',
  },
  {
    icon: '⚡',
    title: 'Fast and reliable',
    desc: 'Built for sub-second responses at scale.',
  },
  {
    icon: '📄',
    title: 'Plain-language outputs',
    desc: 'Reports people can actually read, in English and regional Indian languages.',
  },
];

const AboutUs = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = 'About Us — VerifyHub';
    let meta = document.querySelector('meta[name="description"]');
    const prevContent = meta ? meta.getAttribute('content') : null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'VerifyHub provides API and technology infrastructure for retail data, verification and AI decisioning under one platform.');
    return () => {
      document.title = prev;
      if (prevContent !== null) meta.setAttribute('content', prevContent);
    };
  }, []);

  return (
    <div className="abt-page">

      {/* ── HERO ── */}
      <section className="abt-hero" aria-labelledby="abt-h1">
        <div className="abt-wrap abt-hero-grid">

          {/* Left copy */}
          <div>
            <div className="abt-eyebrow">About VerifyHub</div>
            <h1 id="abt-h1">
              The verification layer behind{' '}
              <span className="abt-grad">modern lending</span>
            </h1>
            <p className="abt-lead">
              VerifyHub provides API and technology infrastructure that helps
              ecosystems in retail data, verification and AI decisioning work
              under one platform. We make it easier for lenders to verify
              identities, access bureau data and turn it into decisions — faster,
              safer and with consent at every step.
            </p>
          </div>

          {/* Right: dark stats card */}
          <div className="abt-stats-card" aria-label="Platform highlights">
            <div className="abt-stats-label">Platform at a glance</div>
            <div className="abt-stats-grid" role="list">
              {STATS.map((s) => (
                <div key={s.label} className="abt-stat" role="listitem">
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section className="abt-section" id="products" aria-labelledby="abt-prod">
        <div className="abt-wrap">
          <div className="abt-head">
            <h2 id="abt-prod">What we do</h2>
          </div>
          <div className="abt-products-grid">
            {PRODUCTS.map((p) => (
              <div key={p.title} className="abt-product-card">
                <div className={`abt-product-icon ${p.iconCls}`} aria-hidden="true">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <RouterLink to={p.href} className="abt-learn-link">
                  Learn more <span aria-hidden="true">→</span>
                </RouterLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW WE WORK ── */}
      <section className="abt-section-soft" aria-labelledby="abt-princ">
        <div className="abt-wrap">
          <div className="abt-head">
            <h2 id="abt-princ">How we work</h2>
          </div>
          <div className="abt-principles-grid">
            {PRINCIPLES.map((pr) => (
              <div key={pr.title} className="abt-principle">
                <span className="abt-principle-icon" aria-hidden="true">{pr.icon}</span>
                <div>
                  <h3>{pr.title}</h3>
                  <p>{pr.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPANY & CONTACT STRIP ── */}
      <section className="abt-section" aria-labelledby="abt-contact">
        <div className="abt-wrap">
          <div className="abt-head">
            <h2 id="abt-contact">Company</h2>
          </div>
          <div className="abt-contact-card">
            <div className="abt-contact-brand">
              <strong>Optimystic Auxiliary Services Private Limited</strong>
              VerifyHub is a brand of Optimystic Auxiliary Services Private
              Limited. We are building the data infrastructure layer for modern
              credit and lending in India.
            </div>
            <div className="abt-contact-links">
              <div className="abt-contact-row">
                <a href="mailto:info@verifyhub.in" className="abt-contact-item">
                  info@verifyhub.in
                </a>
                <span className="abt-contact-divider">·</span>
                <a
                  href="https://www.verifyhub.in"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="abt-contact-item"
                >
                  www.verifyhub.in
                </a>
              </div>
              <div className="abt-contact-row">
                <RouterLink to="/contact" className="abt-contact-item">
                  Contact us
                </RouterLink>
                <span className="abt-contact-divider">·</span>
                <RouterLink to="/grievance-officer" className="abt-contact-item">
                  Grievance officer
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;
