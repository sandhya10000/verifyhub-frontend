import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout from '../Components/layout/LegalPageLayout';

const DataProtection = () => {
  return (
    <LegalPageLayout title="Data Protection" narrow={true}>
      <p>Customers are solely responsible for obtaining all necessary legal authority, permissions, notices, and consents before submitting any personal or business information to VerifyHub.</p>

      <p>VerifyHub processes information according to its <Link to="/privacy-policy">Privacy Policy</Link> and applicable law.</p>
    </LegalPageLayout>
  );
};

export default DataProtection;
