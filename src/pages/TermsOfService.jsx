import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout from '../Components/layout/LegalPageLayout';

const TermsOfService = () => {
  return (
    <LegalPageLayout title="Terms of Service">

          {/* ── Intro ── */}
          <h2>1. Introduction</h2>
          <p>Welcome to VerifyHub, a brand of Optimystic Auxiliary Services Private Limited ("VerifyHub," "Company," "we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the VerifyHub website, APIs, software, SDKs, documentation, sandbox environment, developer tools, products, and related services (collectively, the "Platform").</p>
          <div className="privacy-callout">
            By accessing or using the Platform, creating an account, accessing APIs, or using any VerifyHub services, you acknowledge that you have read, understood, and agree to be legally bound by these Terms. If you do not agree, you must immediately discontinue use of the Platform.
          </div>

          {/* ── Section 1 ── */}
          <div className="privacy-divider" />
          <h2>2. Eligibility</h2>
          <p>By using the Platform, you represent and warrant that:</p>
          <ul>
            <li>You are at least 18 years of age.</li>
            <li>You possess the legal capacity to enter into a binding agreement.</li>
            <li>If acting on behalf of an organisation, bank, NBFC, or fintech, you are authorised to bind that entity.</li>
            <li>All information you provide is accurate, complete, and current.</li>
          </ul>

          {/* ── Section 2 ── */}
          <div className="privacy-divider" />
          <h2>3. Scope of Services</h2>
          <p>VerifyHub provides technology infrastructure including:</p>

          <span className="privacy-sub-label">Data & Verification APIs</span>
          <ul>
            <li>Credit Bureau APIs</li>
            <li>Identity Verification APIs</li>
            <li>Digital KYC Services</li>
            <li>Bank Statement Analysis</li>
            <li>Document Intelligence</li>
          </ul>

          <span className="privacy-sub-label">Intelligence & Infrastructure</span>
          <ul>
            <li>AI Decisioning Infrastructure</li>
            <li>Portfolio Monitoring</li>
            <li>Risk Intelligence APIs</li>
            <li>API Gateway Services</li>
            <li>Developer Tools &amp; Sandbox Environment</li>
          </ul>

          <div className="privacy-callout">
            VerifyHub acts solely as a technology platform facilitating access to authorised third-party data providers. VerifyHub is not a bank, NBFC, credit bureau, financial institution, or lending institution.
          </div>

          {/* ── Section 3 ── */}
          <div className="privacy-divider" />
          <h2>4. Account Registration</h2>
          <p>You agree to:</p>
          <ul>
            <li>Maintain accurate account information.</li>
            <li>Keep your password confidential and secure your API credentials.</li>
            <li>Restrict unauthorised access.</li>
            <li>Notify VerifyHub immediately of any suspected security breach.</li>
          </ul>
          <p>You are solely responsible for all activities performed using your account.</p>

          {/* ── Section 4 ── */}
          <div className="privacy-divider" />
          <h2>5. API Usage</h2>

          <span className="privacy-sub-label">Prohibited Actions</span>
          <p>You shall not:</p>
          <ul>
            <li>Reverse engineer the Platform.</li>
            <li>Attempt to bypass security controls or gain unauthorised access.</li>
            <li>Copy or reproduce APIs without permission.</li>
            <li>Share API credentials.</li>
            <li>Perform excessive automated requests or circumvent rate limits.</li>
            <li>Interfere with Platform operations or upload malicious software.</li>
            <li>Use the Platform for illegal, fraudulent, deceptive, or harmful purposes.</li>
          </ul>
          <p>VerifyHub reserves the right to suspend or terminate API access immediately if misuse is detected.</p>

          {/* ── Section 5 ── */}
          <div className="privacy-divider" />
          <h2>6. Customer Responsibilities</h2>
          <p>You are solely responsible for:</p>

          <span className="privacy-sub-label">Legal & Compliance</span>
          <ul>
            <li>Obtaining all legally required user consents.</li>
            <li>Ensuring compliance with applicable laws.</li>
            <li>Validating all customer information before use.</li>
          </ul>

          <span className="privacy-sub-label">Security & Decisions</span>
          <ul>
            <li>Maintaining security of your systems and protecting API credentials.</li>
            <li>Reviewing verification results before making business decisions.</li>
            <li>All lending, underwriting, hiring, compliance, or business decisions based on Platform outputs.</li>
          </ul>

          <p>VerifyHub provides technology infrastructure only and does not make decisions on behalf of customers.</p>

          {/* ── Section 6 ── */}
          <div className="privacy-divider" />
          <h2>7. Third-Party Services and Data</h2>

          <span className="privacy-sub-label">Data Sources</span>
          <p>The Platform may access information from:</p>
          <ul>
            <li>Credit Information Companies</li>
            <li>Banks and NBFCs</li>
            <li>Government Authorities</li>
            <li>Identity Verification Providers</li>
            <li>CKYC Providers</li>
            <li>Account Aggregators</li>
            <li>Payment Service Providers</li>
            <li>Cloud Infrastructure Providers</li>
          </ul>

          <span className="privacy-sub-label">No Warranty on Third-Party Data</span>
          <p>VerifyHub does not own, create, or control such information and makes no warranty regarding its accuracy, completeness, availability, timeliness, authenticity, or reliability. Customers remain solely responsible for independently validating information before relying upon it.</p>

          {/* ── Section 7 ── */}
          <div className="privacy-divider" />
          <h2>8. Fees and Payments</h2>
          <p>Unless otherwise agreed in writing:</p>
          <ul>
            <li>All charges are payable in advance and are non-refundable.</li>
            <li>Taxes are charged separately where applicable.</li>
            <li>VerifyHub may suspend services for unpaid invoices.</li>
            <li>Pricing may be revised at any time.</li>
          </ul>
          <p>Enterprise agreements may contain separate commercial terms that prevail over these Terms.</p>

          {/* ── Section 8 ── */}
          <div className="privacy-divider" />
          <h2>9. Intellectual Property</h2>
          <p>All rights, title, and interest in the Platform — including APIs, SDKs, documentation, source code, software, UI, logos, trademarks, designs, databases, and AI models — remain exclusively owned by Optimystic Auxiliary Services Private Limited and its licensors.</p>
          <p>Nothing in these Terms transfers ownership of any intellectual property to users.</p>

          {/* ── Section 9 ── */}
          <div className="privacy-divider" />
          <h2>10. Confidentiality</h2>
          <p>Both parties agree to maintain confidentiality of non-public information including:</p>
          <ul>
            <li>API documentation and API keys</li>
            <li>Technical architecture and security practices</li>
            <li>Pricing information</li>
            <li>Business and customer information</li>
          </ul>
          <p>This obligation does not apply where disclosure is required by law.</p>

          {/* ── Section 10 ── */}
          <div className="privacy-divider" />
          <h2>11. Data Protection</h2>
          <p>Customers are solely responsible for obtaining all necessary legal authority, permissions, and consents before submitting personal or business information to VerifyHub. VerifyHub processes information according to its <Link to="/privacy-policy">Privacy Policy</Link> and applicable law.</p>

          {/* ── Section 11 ── */}
          <div className="privacy-divider" />
          <h2>12. Availability</h2>
          <p>VerifyHub does not guarantee continuous operation, uninterrupted access, error-free services, or permanent API availability. The Platform may experience downtime due to:</p>
          <ul>
            <li>Scheduled maintenance and upgrades</li>
            <li>Infrastructure failures</li>
            <li>Third-party outages</li>
          </ul>

          {/* ── Section 12 ── */}
          <div className="privacy-divider" />
          <h2>13. No Professional Advice</h2>
          <p>Nothing available through VerifyHub constitutes financial, legal, credit, investment, tax, lending, or compliance advice. Customers should obtain independent professional advice before making business or regulatory decisions.</p>

          {/* ── Section 13 ── */}
          <div className="privacy-divider" />
          <h2>14. Disclaimer of Warranties</h2>
          <div className="privacy-callout">
            The Platform is provided strictly on an "AS IS," "AS AVAILABLE," and "WITH ALL FAULTS" basis. VerifyHub expressly disclaims all warranties including merchantability, fitness for a particular purpose, accuracy, reliability, availability, security, and non-infringement.
          </div>
          <p>VerifyHub does not warrant that:</p>
          <ul>
            <li>APIs will always be operational.</li>
            <li>Information will always be correct.</li>
            <li>Third-party providers will remain available.</li>
            <li>The Platform will be free from interruptions or vulnerabilities.</li>
          </ul>

          {/* ── Section 14 ── */}
          <div className="privacy-divider" />
          <h2>15. Limitation of Liability</h2>

          <span className="privacy-sub-label">Excluded Losses</span>
          <p>VerifyHub shall not be liable for direct, indirect, consequential, incidental, special, exemplary, or punitive damages, including:</p>
          <ul>
            <li>Loss of profits, revenue, goodwill, opportunity, business, or data.</li>
            <li>Regulatory penalties.</li>
            <li>Credit, underwriting, or compliance-related losses.</li>
          </ul>

          <span className="privacy-sub-label">Arising From</span>
          <p>This applies to losses arising from:</p>
          <ul>
            <li>Use of the Platform.</li>
            <li>API downtime or service interruptions.</li>
            <li>Third-party data inaccuracies.</li>
            <li>Cyberattacks or force majeure events.</li>
            <li>Cloud infrastructure failures.</li>
          </ul>

          <div className="privacy-callout">
            VerifyHub's total aggregate liability for any claim shall not exceed the amount paid by the customer for the specific service in the three (3) months preceding the claim. Nothing in these Terms excludes liability that cannot be excluded under applicable law.
          </div>

          {/* ── Section 15 ── */}
          <div className="privacy-divider" />
          <h2>16. Indemnification</h2>
          <p>You agree to defend, indemnify, and hold harmless VerifyHub and its affiliates from claims arising out of:</p>
          <ul>
            <li>Your use of the Platform.</li>
            <li>Violation of these Terms or applicable laws.</li>
            <li>Submission of unauthorised data.</li>
            <li>Misuse of APIs.</li>
            <li>Intellectual property infringement.</li>
            <li>Fraudulent activity.</li>
          </ul>

          {/* ── Section 16 ── */}
          <div className="privacy-divider" />
          <h2>17. Suspension and Termination</h2>
          <p>VerifyHub may suspend, restrict, or terminate any account immediately, without prior notice, if:</p>
          <ul>
            <li>These Terms are violated.</li>
            <li>Fraud is suspected.</li>
            <li>Payments remain unpaid.</li>
            <li>Security risks are identified.</li>
            <li>Regulatory requirements demand suspension.</li>
          </ul>
          <p>Termination does not affect accrued rights or obligations.</p>

          {/* ── Section 17 ── */}
          <div className="privacy-divider" />
          <h2>18. Force Majeure</h2>
          <p>VerifyHub is not responsible for delays caused by circumstances beyond its control, including:</p>
          <ul>
            <li>Natural disasters, war, or civil unrest.</li>
            <li>Pandemics or government action.</li>
            <li>Internet or cloud infrastructure outages.</li>
            <li>Cyberattacks.</li>
          </ul>

          {/* ── Section 18 ── */}
          <div className="privacy-divider" />
          <h2>19. Modification of Services</h2>
          <p>VerifyHub reserves the right to modify APIs, change specifications, revise documentation, update pricing, introduce rate limits, or discontinue services — without prior notice, unless otherwise required by law.</p>

          {/* ── Section 19 ── */}
          <div className="privacy-divider" />
          <h2>20. Governing Law</h2>
          <p>These Terms are governed by the laws of the Republic of India.</p>

          {/* ── Section 20 ── */}
          <div className="privacy-divider" />
          <h2>21. Jurisdiction</h2>
          <div className="privacy-callout">
            Any dispute shall be subject to the exclusive jurisdiction of the competent courts located in Faridabad, Haryana, India.
          </div>

          {/* ── Section 21 ── */}
          <div className="privacy-divider" />
          <h2>22. Severability</h2>
          <p>If any provision is held invalid or unenforceable, the remaining provisions continue in full force and effect.</p>

          {/* ── Section 22 ── */}
          <div className="privacy-divider" />
          <h2>23. Entire Agreement</h2>
          <p>These Terms, together with the <Link to="/privacy-policy">Privacy Policy</Link> and any separately executed Enterprise Agreement, SLA, DPA, or Order Form, constitute the entire agreement between the parties.</p>

          {/* ── Section 23 ── */}
          <div className="privacy-divider" />
          <h2>24. Contact Information</h2>
          <p>For any questions regarding these Terms, please contact:</p>
          <p><strong>VerifyHub</strong><br />A Brand of <strong>Optimystic Auxiliary Services Private Limited</strong></p>
          <p><strong>Email:</strong> <a href="mailto:info@verifyhub.in">info@verifyhub.in</a></p>
          <p><strong>Website:</strong> <a href="https://www.verifyhub.in">www.verifyhub.in</a></p>

    </LegalPageLayout>
  );
};

export default TermsOfService;
