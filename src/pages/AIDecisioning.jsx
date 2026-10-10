import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import './AIDecisioning.css';

const FEATURES = [
  { title: 'Executive Summary', desc: 'Score band, what helps and what hurts' },
  { title: 'Risk Factors & Portfolio', desc: 'Ranked risks and every account analysed' },
  { title: 'Account Health & DPD', desc: 'Health scores and month-wise payment history' },
  { title: '90-Day Action Plan', desc: 'Step-by-step plan with a projected score' },
];

const LANGUAGES = [
  { id: 'en', native: 'English', name: 'English', sampleTitle: 'Executive Summary',
    sampleText: 'The applicant has a stable repayment history with no recent defaults. The credit utilisation is well within limits.' },
  { id: 'hi', native: 'हिंदी', name: 'Hindi', sampleTitle: 'कार्यकारी सारांश',
    sampleText: 'आवेदक का पुनर्भुगतान इतिहास स्थिर है और हाल ही में कोई चूक नहीं हुई है। क्रेडिट उपयोग सीमा के भीतर है।' },
  { id: 'mr', native: 'मराठी', name: 'Marathi', sampleTitle: 'कार्यकारी सारांश',
    sampleText: 'अर्जदाराचा परतफेड इतिहास स्थिर आहे आणि अलीकडे कोणतीही चूक झालेली नाही. क्रेडिट वापर मर्यादेत आहे.' },
  { id: 'kn', native: 'ಕನ್ನಡ', name: 'Kannada', sampleTitle: 'ಕಾರ್ಯನಿರ್ವಾಹಕ ಸಾರಾಂಶ',
    sampleText: 'ಅರ್ಜಿದಾರರು ಸ್ಥಿರವಾದ ಮರುಪಾವತಿ ಇತಿಹಾಸವನ್ನು ಹೊಂದಿದ್ದಾರೆ ಮತ್ತು ಇತ್ತೀಚೆಗೆ ಯಾವುದೇ ಡೀಫಾಲ್ಟ್‌ಗಳಿಲ್ಲ.' },
  { id: 'bn', native: 'বাংলা', name: 'Bengali', sampleTitle: 'নির্বাহী সারসংক্ষেপ',
    sampleText: 'আবেদনকারীর একটি স্থিতিশীল ঋণ পরিশোধের ইতিহাস রয়েছে এবং সাম্প্রতিক কোনো খেলাপি নেই।' },
  { id: 'ta', native: 'தமிழ்', name: 'Tamil', sampleTitle: 'செயல் சுருக்கம்',
    sampleText: 'விண்ணப்பதாரர் நிலையான திருப்பிச் செலுத்தும் வரலாற்றைக் கொண்டுள்ளார் மற்றும் சமீபத்திய இயல்புநிலைகள் எதுவும் இல்லை.' },
  { id: 'te', native: 'తెలుగు', name: 'Telugu', sampleTitle: 'కార్యనిర్వాహక సారాంశం',
    sampleText: 'దరఖాస్తుదారు స్థిరమైన తిరిగి చెల్లింపు చరిత్రను కలిగి ఉన్నారు మరియు ఇటీవల ఎటువంటి డిఫాల్ట్‌లు లేవు.' },
];

const STEPS = [
  { title: 'Upload report', desc: 'Any supported bureau report, PDF or JSON.' },
  { title: 'Choose language', desc: 'English or a regional Indian language.' },
  { title: 'Analyse and download', desc: 'Get an easy-to-read PDF with insights.' },
];

const AIDecisioning = () => {
  const [activeLang, setActiveLang] = useState(LANGUAGES[0]);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = 'AI Decisioning — VerifyHub';
    let meta = document.querySelector('meta[name="description"]');
    const prevContent = meta ? meta.getAttribute('content') : null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Turn raw credit reports into clear lending decisions. AI-powered risk summaries in English, Hindi, Marathi, Kannada, Bengali, Tamil and Telugu.');
    return () => {
      document.title = prev;
      if (prevContent !== null) meta.setAttribute('content', prevContent);
    };
  }, []);

  const pickLang = (lang) => {
    if (lang.id === activeLang.id) return;
    setFade(true);
    setTimeout(() => { setActiveLang(lang); setFade(false); }, 150);
  };

  return (
    <div className="aid-page">
      {/* HERO: copy on the left, live language preview on the right */}
      <section className="aid-hero" aria-labelledby="aid-h1">
        <div className="aid-wrap aid-hero-grid">
          <div className="aid-hero-copy">
            <div className="aid-eyebrow">AI Decisioning</div>
            <h1 id="aid-h1">
              Credit reports, turned into <span className="aid-grad">lending decisions</span>
            </h1>
            <p className="aid-lead">
              Upload any CIBIL, Experian, Equifax or CRIF report and get a plain-language
              risk summary and a download-ready recommendation, in the language your team
              and customers read.
            </p>
          </div>

          <div className="aid-preview" aria-label="Report language preview">
            <div className="aid-preview-label">Download reports in 7 languages</div>
            <div className="aid-chips" role="tablist">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  role="tab"
                  aria-selected={activeLang.id === l.id}
                  className={`aid-chip ${activeLang.id === l.id ? 'active' : ''}`}
                  onClick={() => pickLang(l)}
                >
                  {l.native}
                </button>
              ))}
            </div>
            <div className="aid-report">
              <div className="aid-report-head">
                <span className={`aid-fade ${fade ? 'out' : ''}`}>{activeLang.sampleTitle}</span>
                <span className="aid-score">742 · Good</span>
              </div>
              <p className={`aid-fade ${fade ? 'out' : ''}`}>{activeLang.sampleText}</p>
            </div>
            <div className="aid-preview-foot">Pick the language from the “Output language” dropdown before generating.</div>
          </div>
        </div>
      </section>

      {/* INCLUDED + HOW IT WORKS in one compact section */}
      <section className="aid-section" aria-labelledby="aid-inc">
        <div className="aid-wrap">
          <div className="aid-head">
            <h2 id="aid-inc">What's in every report</h2>
            <span className="aid-badge">Standard bank grade</span>
          </div>
          <div className="aid-features">
            {FEATURES.map((f) => (
              <div key={f.title} className="aid-feature">
                <span className="aid-check" aria-hidden="true">✓</span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="aid-head aid-head-steps">
            <h2>How it works</h2>
          </div>
          <ol className="aid-steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="aid-step-n">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="aid-note">Upload without a password. Password-protected PDFs cannot be analysed.</p>
        </div>
      </section>

      
    </div>
  );
};

export default AIDecisioning;