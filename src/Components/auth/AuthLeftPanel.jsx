import React from 'react';
import BrandPanel from './BrandPanel';
import LeftFeatureList from './LeftFeatureList';
import TopUpBonusBanner from '../TopUpBonusBanner';

/**
 * Shared left panel used across auth pages (Register, Login, etc.).
 * Includes branding, instant credit report headline, 4 key features,
 * and the 1:1 wallet top-up bonus promo banner.
 */
const AuthLeftPanel = () => {
  return (
    <BrandPanel
      leftContent={
        <>
          <LeftFeatureList />
          <TopUpBonusBanner sx={{ maxWidth: '100%' }} />
        </>
      }
    />
  );
};

export default AuthLeftPanel;

