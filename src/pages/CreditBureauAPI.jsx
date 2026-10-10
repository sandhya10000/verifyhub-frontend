import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import './CreditBureauAPI.css';

/* ── FAQ data ── */
const FAQS = [
  {
    q: 'Which credit bureaus are currently supported?',
    a: 'Experian and CRIF are live and available for immediate integration. CIBIL (TransUnion) and Equifax support is coming soon — sign up for early access to be notified when they launch.',
  },
  {
    q: 'How fast does the API respond?',
    a: 'Our median response time is 640 ms, measured end-to-end. We route each request to the optimal bureau endpoint in real time, and our infrastructure is tuned for sub-second p99 latency under production load.',
  },
  {
    q: 'What consent requirements apply?',
    a: 'All bureau pulls are consent-based. You must collect explicit, auditable consent from the individual before making a request. VerifyHub provides a Consent API and hosted consent-flow widgets to help you stay compliant with RBI and bureau guidelines.',
  },
  {
    q: 'How is the API priced?',
    a: 'Pricing is per-bureau-pull, with volume tiers that reduce cost as usage grows. We also offer flat-fee monthly plans for high-volume lenders. Contact sales or visit the Pricing page for a custom quote.',
  },
  {
    q: 'How is my data protected?',
    a: 'All data in transit is encrypted with TLS 1.3. Bureau report data is never stored on our servers after delivery — you receive it and we discard it. Our platform is ISO 27001-aligned and undergoes regular third-party security audits.',
  },
];

/* ── Bureau data ── */
const BUREAUS = [
  {
    logo: 'CIBIL',
    name: 'Credit Information Bureau India',
    status: 'live',
    desc: 'The largest and most widely used credit bureau in India, covering 600 M+ credit-active consumers.',
    pts: ['Credit score (300–900)', 'Full CIBIL report', 'Account & enquiry history'],
    href: '/contact',
  },
  {
    logo: 'Experian',
    name: 'Experian Credit Information',
    status: 'live',
    desc: 'Global bureau with deep India coverage, offering rich tradeline data and predictive score models.',
    pts: ['Experian credit score', 'Full credit report', 'Derogatory flag detection'],
    href: '/contact',
  },
  {
    logo: 'Equifax',
    name: 'Equifax Credit Information',
    status: 'live',
    desc: 'Comprehensive bureau data with alternative-data enrichment to extend credit access.',
    pts: ['Equifax credit score', 'Account summary', 'Payment pattern analysis'],
    href: '/contact',
  },
  {
    logo: 'CRIF',
    name: 'CRIF High Mark',
    status: 'live',
    desc: 'Specialist in microfinance, MSME and rural credit data, ideal for underserved-segment lending.',
    pts: ['CRIF credit score', 'Microfinance tradelines', 'Thin-file risk signals'],
    href: '/contact',
  },
];

/* ── Feature data ── */
const FEATURES = [
  { icon: '⚡', cls: 'cba-fi-indigo', title: 'Unified response schema', desc: 'One normalised JSON response structure regardless of the bureau, so you write integration logic once.' },
  { icon: '🔒', cls: 'cba-fi-blue',   title: 'Consent-based pulls',     desc: 'Built-in consent management helpers and audit logs keep you compliant with RBI and bureau T&Cs.' },
  { icon: '🛡️', cls: 'cba-fi-green',  title: 'Bank-grade security',     desc: 'TLS 1.3 in transit, zero at-rest bureau data storage, and SOC-2-style controls throughout.' },
  { icon: '🔔', cls: 'cba-fi-amber',  title: 'Webhooks',                desc: 'Receive async report-ready events the moment a bureau responds, without polling.' },
  { icon: '🧪', cls: 'cba-fi-teal',   title: 'Sandbox environment',     desc: 'Test with realistic synthetic credit profiles before going live — no real bureau calls, no cost.' },
  { icon: '🤖', cls: 'cba-fi-rose',   title: 'AI credit analysis',      desc: 'Optional AI layer that summarises risk, flags anomalies and gives actionable lending recommendations.' },
];

/* ── Code snippets ── */
const CODE_TABS = ['cURL', 'Node.js', 'Python'];

const CODE_CURL = `<span class="cba-token-comment"># Pull a credit report via VerifyHub</span>
<span class="cba-token-method">curl</span> -X POST \\
  <span class="cba-token-str">https://api.verifyhub.in/v1/credit/report</span> \\
  -H <span class="cba-token-header">"Authorization: Bearer &lt;YOUR_API_KEY&gt;"</span> \\
  -H <span class="cba-token-header">"Content-Type: application/json"</span> \\
  -d <span class="cba-token-str">'{
    "bureau": "experian",
    "pan":    "ABCDE1234F",
    "consent_id": "cns_8fjd92nKx2",
    "purpose": "credit_assessment"
  }'</span>`;

const CODE_NODE = `<span class="cba-token-kw">import</span> axios <span class="cba-token-kw">from</span> <span class="cba-token-str">'axios'</span>;

<span class="cba-token-kw">const</span> response = <span class="cba-token-kw">await</span> axios.<span class="cba-token-method">post</span>(
  <span class="cba-token-str">'https://api.verifyhub.in/v1/credit/report'</span>,
  {
    <span class="cba-token-key">bureau</span>:     <span class="cba-token-str">'experian'</span>,
    <span class="cba-token-key">pan</span>:        <span class="cba-token-str">'ABCDE1234F'</span>,
    <span class="cba-token-key">consent_id</span>: <span class="cba-token-str">'cns_8fjd92nKx2'</span>,
    <span class="cba-token-key">purpose</span>:    <span class="cba-token-str">'credit_assessment'</span>,
  },
  {
    headers: {
      <span class="cba-token-key">Authorization</span>: <span class="cba-token-str">\`Bearer \${process.env.VH_API_KEY}\`</span>,
    },
  }
);
<span class="cba-token-kw">const</span> { score, report_id } = response.data;`;

const CODE_PYTHON = `<span class="cba-token-kw">import</span> requests, os

payload = {
  <span class="cba-token-str">"bureau"</span>:     <span class="cba-token-str">"experian"</span>,
  <span class="cba-token-str">"pan"</span>:        <span class="cba-token-str">"ABCDE1234F"</span>,
  <span class="cba-token-str">"consent_id"</span>: <span class="cba-token-str">"cns_8fjd92nKx2"</span>,
  <span class="cba-token-str">"purpose"</span>:    <span class="cba-token-str">"credit_assessment"</span>,
}
headers = {<span class="cba-token-str">"Authorization"</span>: <span class="cba-token-str">f"Bearer {os.getenv('VH_API_KEY')}"</span>}

r = requests.<span class="cba-token-method">post</span>(
  <span class="cba-token-str">"https://api.verifyhub.in/v1/credit/report"</span>,
  json=payload, headers=headers
)
data = r.json()
print(data[<span class="cba-token-str">"score"</span>], data[<span class="cba-token-str">"report_id"</span>])`;

const CODE_SNIPPETS = [CODE_CURL, CODE_NODE, CODE_PYTHON];

const RESPONSE_JSON = `{
  <span class="cba-token-key">"report_id"</span>:  <span class="cba-token-str">"rpt_9K2mXq7RvB"</span>,
  <span class="cba-token-key">"bureau"</span>:     <span class="cba-token-str">"experian"</span>,
  <span class="cba-token-key">"score"</span>:      <span class="cba-token-num">742</span>,
  <span class="cba-token-key">"score_band"</span>: <span class="cba-token-str">"Good"</span>,
  <span class="cba-token-key">"accounts"</span>: [
    {
      <span class="cba-token-key">"type"</span>:         <span class="cba-token-str">"Home Loan"</span>,
      <span class="cba-token-key">"outstanding"</span>:  <span class="cba-token-num">2400000</span>,
      <span class="cba-token-key">"overdue"</span>:      <span class="cba-token-num">0</span>,
      <span class="cba-token-key">"status"</span>:       <span class="cba-token-str">"Active"</span>
    }
  ],
  <span class="cba-token-key">"enquiries_90d"</span>: <span class="cba-token-num">2</span>,
  <span class="cba-token-key">"ai_summary"</span>:  <span class="cba-token-str">"Low risk — stable repayment history..."</span>,
  <span class="cba-token-key">"fetched_at"</span>:  <span class="cba-token-str">"2026-10-01T08:14:03Z"</span>
}`;

/* ═══════════════════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════════════════════ */
const CreditBureauAPI = () => {
  const revealRefs = useRef([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  /* Set page title + meta description */
  useEffect(() => {
    const prev = document.title;
    document.title = 'Credit Bureau API — VerifyHub';
    let meta = document.querySelector('meta[name="description"]');
    const prevContent = meta ? meta.getAttribute('content') : null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Pull credit reports from CIBIL, Experian, Equifax and CRIF through a single unified API. Fast, consent-based, AI-powered. Start integrating with VerifyHub today.');
    return () => {
      document.title = prev;
      if (prevContent !== null) meta.setAttribute('content', prevContent);
    };
  }, []);

  /* Scroll-reveal (same pattern as Home.jsx) */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('on');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addReveal = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  return (
    <>
      <div className="cba-page">
        {/* ══════════════ HERO ══════════════ */}
        <section className="cba-hero" aria-label="Hero">
        </section>
        {/* ══════════════ INTEGRATED BUREAUS ══════════════ */}
        <section className="cba-section cba-section-light" id="bureaus" aria-labelledby="bureaus-heading">
          <div className="wrap">
            <div className="cba-sec-head center cba-reveal" ref={addReveal}>
              <div className="cba-eyebrow on-light">Integrated bureaus</div>
              <h2 id="bureaus-heading">Every bureau. One integration.</h2>
              <p>
                We handle the complexity of working with multiple bureau APIs so you
                can access all credit data through a single, consistent interface.
              </p>
            </div>

            <div className="cba-bureau-grid">
              {BUREAUS.map((b, i) => (
                <article
                  key={b.logo}
                  className="cba-bureau-card cba-reveal"
                  ref={addReveal}
                  style={{ transitionDelay: `${i * 80}ms` }}
                  aria-label={`${b.logo} bureau`}
                >
                  <div>
                    <div className="cba-bureau-logo">{b.logo}</div>
                    <div className="cba-bureau-name">{b.name}</div>
                  </div>
                  <span className={`cba-pill ${b.status === 'live' ? 'cba-pill-live' : 'cba-pill-soon'}`}>
                    {b.status === 'live' ? 'Live' : 'Coming soon'}
                  </span>
                  <p className="cba-bureau-desc">{b.desc}</p>
                  <ul className="cba-bureau-pts">
                    {b.pts.map((pt) => <li key={pt}>{pt}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CreditBureauAPI;
