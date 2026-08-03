import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout from '../Components/layout/LegalPageLayout';

const PrivacyPolicy = () => {

  return (
    <LegalPageLayout title="Privacy Policy">
          <h2>1. Introduction</h2>
          <p>Welcome to VerifyHub, a platform owned and operated by Optimystic Auxiliary Services Private Limited ("VerifyHub," "we," "our," or "us"). We are committed to protecting the privacy and security of information processed through our website, APIs, products, and services. This Privacy Policy explains how we collect, use, disclose, store, and protect information when you access or use our website, applications, APIs, and related services.

            By accessing or using our Platform, you acknowledge that you have read and understood this Privacy Policy and agree to its terms. If you do not agree, please discontinue use immediately.</p>



          <div className="privacy-divider" />

          <h2>2. Information We Collect</h2>
          <p>Depending upon your interaction with VerifyHub, we may collect the following information:</p>

          <span className="privacy-sub-label">Personal Information</span>
          <ul>
            <li>Full Name</li>
            <li>Email Address</li>
            <li>Phone Number</li>
            <li>Company Name</li>
            <li>Business Address</li>
            <li>Designation</li>
            <li>Account Credentials</li>
          </ul>

          <span className="privacy-sub-label">Technical Information</span>
          <p>We automatically collect information including:</p>
          <ul>
            <li>IP Address</li>
            <li>Browser Type</li>
            <li>Device Information</li>
            <li>Operating System</li>
            <li>Access Logs</li>
            <li>Session Information</li>
            <li>Cookies</li>
            <li>Website Usage Analytics</li>
          </ul>

          <span className="privacy-sub-label">Business & Verification Information</span>
          <p>Where applicable, customers may submit information including:</p>
          <ul>
            <li>PAN Details</li>
            <li>GSTIN</li>
            <li>Aadhaar Offline XML</li>
            <li>CKYC Information</li>
            <li>Bank Account Details</li>
            <li>Credit Bureau Request Information</li>
            <li>Business Registration Details</li>
            <li>Identity Verification Information</li>
            <li>Other information necessary for providing verification services.</li>
          </ul>

          <div className="privacy-divider" />

          <h2>3. How We Use Information</h2>
          <p>We may use collected information to:</p>

          <span className="privacy-sub-label">Core Services & Operations</span>
          <ul>
            <li>Provide our APIs and services.</li>
            <li>Authenticate users.</li>
            <li>Process verification requests.</li>
            <li>Generate verification responses.</li>
            <li>Improve platform performance.</li>
          </ul>

          <span className="privacy-sub-label">Security & Compliance</span>
          <ul>
            <li>Prevent fraud and abuse.</li>
            <li>Monitor platform security.</li>
            <li>Meet regulatory and legal obligations.</li>
          </ul>

          <span className="privacy-sub-label">Customer Support & Experience</span>
          <ul>
            <li>Respond to customer enquiries.</li>
            <li>Send service-related notifications.</li>
            <li>Improve customer experience.</li>
          </ul>

          <div className="privacy-divider" />

          <h2>4. Legal Basis for Processing</h2>
          <p>Where applicable, we process information based on:</p>
          <ul>
            <li>User consent.</li>
            <li>Contractual necessity.</li>
            <li>Compliance with legal obligations.</li>
            <li>Legitimate business interests.</li>
            <li>Regulatory requirements applicable to financial institutions.</li>
          </ul>

          <div className="privacy-divider" />

          <h2>5. Data Security</h2>
          <p>We implement commercially reasonable administrative, technical, and physical safeguards including:</p>

          <span className="privacy-sub-label">Infrastructure & Encryption</span>
          <ul>
            <li>SSL/TLS Encryption</li>
            <li>Secure API Authentication</li>
            <li>Encrypted Data Storage</li>
            <li>Firewall Protection</li>
          </ul>

          <span className="privacy-sub-label">Monitoring & Access</span>
          <ul>
            <li>Access Control Mechanisms</li>
            <li>Audit Logging</li>
            <li>Continuous Security Monitoring</li>
            <li>Regular Security Reviews</li>
          </ul>

          <p>While we strive to protect information, no method of transmission over the Internet or electronic storage can be guaranteed to be completely secure. Users acknowledge that they provide and transmit information at their own risk.</p>

          <div className="privacy-divider" />

          <h2>6. Information Sharing</h2>
          <div className="privacy-callout">
            We do not sell personal information.
          </div>
          <p>Information may be shared only where necessary with:</p>

          <span className="privacy-sub-label">Financial & Regulatory Partners</span>
          <ul>
            <li>Credit Information Companies (Credit Bureaus)</li>
            <li>Banks</li>
            <li>NBFCs</li>
            <li>Financial Institutions</li>
            <li>Government Authorities</li>
          </ul>

          <span className="privacy-sub-label">Technology & Service Providers</span>
          <ul>
            <li>Identity Verification Providers</li>
            <li>Cloud Infrastructure Providers</li>
            <li>Payment Processors</li>
            <li>Technology Partners</li>
            <li>Service Providers operating under contractual confidentiality obligations.</li>
          </ul>

          <div className="privacy-divider" />

          <h2>7. Cookies</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul>
            <li>Improve website functionality.</li>
            <li>Maintain secure sessions.</li>
            <li>Analyse website usage.</li>
            <li>Remember user preferences.</li>
            <li>Improve user experience.</li>
          </ul>
          <p>Users may disable cookies through browser settings; however, certain features may not function properly.</p>

          <div className="privacy-divider" />

          <h2>8. Third-Party Services</h2>
          <p>Our Platform may integrate with third-party service providers including:</p>

          <span className="privacy-sub-label">Financial & Data Sources</span>
          <ul>
            <li>Credit Bureaus</li>
            <li>Banks</li>
            <li>Government Databases</li>
            <li>KYC Providers</li>
          </ul>

          <span className="privacy-sub-label">Infrastructure & Operations</span>
          <ul>
            <li>Payment Gateways</li>
            <li>Cloud Hosting Providers</li>
            <li>Analytics Providers</li>
          </ul>

          <p>These third parties operate independently and are governed by their own privacy policies and terms of service.</p>

          <div className="privacy-divider" />

          <h2>9. API Data Processing</h2>
          <p>VerifyHub provides technology infrastructure and APIs for regulated businesses.</p>
          <p>Customers remain solely responsible for:</p>
          <ul>
            <li>Obtaining all legally required customer consents.</li>
            <li>Ensuring lawful collection and submission of personal information.</li>
            <li>Compliance with applicable laws and regulations.</li>
            <li>Accuracy and legality of information submitted through our APIs.</li>
          </ul>
          <p>VerifyHub acts solely as a technology platform facilitating data processing in accordance with customer instructions.</p>

          <div className="privacy-divider" />

          <h2>10. Data Retention</h2>
          <p>Information is retained only for as long as reasonably necessary to:</p>
          <ul>
            <li>Provide services.</li>
            <li>Meet contractual obligations.</li>
            <li>Comply with applicable laws.</li>
            <li>Resolve disputes.</li>
            <li>Maintain security records.</li>
            <li>Enforce legal rights.</li>
          </ul>
          <p>Following expiry of the applicable retention period, information may be securely deleted, anonymised, or archived where legally required.</p>

          <div className="privacy-divider" />

          <h2>11. Your Rights</h2>
          <p>Subject to applicable law, users may request:</p>
          <ul>
            <li>Access to their information.</li>
            <li>Correction of inaccurate information.</li>
            <li>Deletion of information where legally permissible.</li>
            <li>Restriction of processing.</li>
            <li>Withdrawal of consent where applicable.</li>
            <li>Information regarding processing activities.</li>
          </ul>
          <p>Requests may be submitted using the contact information provided below.</p>

          <div className="privacy-divider" />

          <h2>12. Children's Privacy</h2>
          <p>Our services are intended exclusively for businesses, financial institutions, and individuals who are legally competent to enter into binding agreements.</p>
          <div className="privacy-callout">
            We do not knowingly collect information from children under the age of 18 years.
          </div>

          <div className="privacy-divider" />

          <h2>13. International Transfers</h2>
          <p>Information may be processed using secure cloud infrastructure located in India or other jurisdictions where our authorised infrastructure providers operate, subject to appropriate contractual and legal safeguards.</p>

          <div className="privacy-divider" />

          <h2>14. Compliance</h2>
          <p>VerifyHub aims to comply with applicable Indian laws including, where applicable:</p>
          <ul>
            <li>Information Technology Act, 2000</li>
            <li>Digital Personal Data Protection Act, 2023</li>
            <li>RBI Guidelines</li>
            <li>Credit Information Companies regulations</li>
            <li>Other applicable financial and data protection laws.</li>
          </ul>

          <div className="privacy-divider" />

          <h2>15. Limitation of Liability</h2>
          <p>To the fullest extent permitted under applicable law, VerifyHub, Optimystic Auxiliary Services Private Limited, its directors, officers, employees, affiliates, licensors, contractors, technology partners, and service providers shall <strong>not</strong> be liable for any direct, indirect, incidental, consequential, punitive, exemplary, special, or business losses arising out of or relating to:</p>

          <span className="privacy-sub-label">Service Availability & Performance</span>
          <ul>
            <li>Use or inability to use the Platform.</li>
            <li>Temporary or permanent interruption of services.</li>
            <li>Delays in API responses.</li>
            <li>Network failures.</li>
            <li>Internet outages.</li>
          </ul>

          <span className="privacy-sub-label">Third-Party & Customer Actions</span>
          <ul>
            <li>Errors, omissions, inaccuracies, or delays in information received from third-party data providers.</li>
            <li>Decisions made by customers using information obtained through the Platform.</li>
            <li>Failure of third-party service providers.</li>
            <li>Data submitted incorrectly by customers.</li>
            <li>Misuse of APIs by customers or third parties.</li>
          </ul>

          <span className="privacy-sub-label">External Threats & Force Majeure</span>
          <ul>
            <li>Cyberattacks.</li>
            <li>Malware.</li>
            <li>Unauthorized access beyond our reasonable control.</li>
            <li>Force majeure events.</li>
          </ul>

          <div className="privacy-callout">
            The Platform and all services are provided strictly on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express, implied, statutory, or otherwise, except where such warranties cannot legally be excluded.
          </div>

          <p>Nothing contained in this Privacy Policy shall create any guarantee regarding uninterrupted availability, completeness, accuracy, merchantability, fitness for a particular purpose, or non-infringement.</p>

          <div className="privacy-divider" />

          <h2>16. Customer Responsibilities</h2>
          <p>Customers agree that they are solely responsible for:</p>
          <ul>
            <li>Obtaining all required user consents.</li>
            <li>Ensuring lawful collection and processing of personal data.</li>
            <li>Compliance with applicable laws.</li>
            <li>Maintaining confidentiality of API credentials.</li>
            <li>Verifying the suitability and accuracy of information before making lending, underwriting, compliance, hiring, verification, or business decisions.</li>
          </ul>
          <p>VerifyHub shall not be responsible for any business decisions, lending decisions, underwriting outcomes, financial losses, regulatory actions, or damages arising from customer reliance on information processed through the Platform.</p>

          <div className="privacy-divider" />

          <h2>17. Third-Party Data Disclaimer</h2>
          <p>VerifyHub aggregates, routes, and processes information received from authorised third-party providers including but not limited to:</p>
          <ul>
            <li>Credit Bureaus</li>
            <li>Banks</li>
            <li>Government Authorities</li>
            <li>KYC Providers</li>
            <li>Financial Institutions</li>
            <li>Data Aggregators</li>
          </ul>
          <p>VerifyHub neither owns nor controls such information and makes no representations or warranties regarding its completeness, correctness, accuracy, timeliness, or reliability.</p>
          <p>Any inaccuracies, omissions, or delays originating from third-party sources shall remain the responsibility of such third parties.</p>

          <div className="privacy-divider" />

          <h2>18. Indemnification</h2>
          <p>You agree to defend, indemnify, and hold harmless VerifyHub, Optimystic Auxiliary Services Private Limited, its directors, officers, employees, affiliates, licensors, partners, and service providers from and against any claims, liabilities, losses, damages, penalties, legal proceedings, regulatory actions, costs, and expenses (including reasonable legal fees) arising from:</p>
          <ul>
            <li>Your use of the Platform.</li>
            <li>Violation of applicable laws.</li>
            <li>Submission of inaccurate or unauthorised information.</li>
            <li>Failure to obtain required user consent.</li>
            <li>Misuse of APIs.</li>
            <li>Violation of this Privacy Policy.</li>
            <li>Violation of any applicable agreement with VerifyHub.</li>
          </ul>

          <div className="privacy-divider" />

          <h2>19. Changes to this Privacy Policy</h2>
          <p>We reserve the right to modify, amend, replace, or update this Privacy Policy at any time without prior notice.</p>
          <p>Any updated version shall become effective immediately upon publication on our website unless otherwise specified.</p>
          <p>Continued use of the Platform after publication constitutes acceptance of the revised Privacy Policy.</p>

          <div className="privacy-divider" />

          <h2>20. Contact Us</h2>
          <p>For any questions regarding this Privacy Policy, please contact:</p>
          <p><strong>VerifyHub</strong><br />
            A Brand of <strong>Optimystic Auxiliary Services Private Limited</strong></p>
          <p><strong>Email:</strong> <a href="mailto:info@verifyhub.in">info@verifyhub.in</a></p>
          <p><strong>Website:</strong> <a href="https://www.verifyhub.in">www.verifyhub.in</a></p>

    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
