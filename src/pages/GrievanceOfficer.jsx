import React from 'react';
import LegalPageLayout from '../Components/layout/LegalPageLayout';

const GrievanceOfficer = () => {
  return (
    <LegalPageLayout title="Grievance Officer" narrow={true}>
      <p>For complaints or grievances relating to privacy or data protection, please contact the Grievance Officer.</p>

      <div className="contact-info-card">
        <strong>Grievance Officer</strong>
        <span>Optimystic Auxiliary Services Private Limited</span>
        <span>
          Email:{' '}
          <a href="mailto:nitinv@verifyhub.in">nitinv@verifyhub.in</a>
        </span>
      </div>
    </LegalPageLayout>
  );
};

export default GrievanceOfficer;
