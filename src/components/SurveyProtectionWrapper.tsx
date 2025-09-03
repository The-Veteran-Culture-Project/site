import React, { useState, useEffect } from 'react';
import { PasswordProtection } from './PasswordProtection';

interface SurveyProtectionWrapperProps {
  children: React.ReactNode;
}

export function SurveyProtectionWrapper({ children }: SurveyProtectionWrapperProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already authorized
    const checkAuth = () => {
      const isAuth = sessionStorage.getItem('beta_survey_authorized') === 'true';
      const authTimestamp = sessionStorage.getItem('beta_auth_timestamp');
      
      console.log('SurveyProtectionWrapper - Checking auth:', { isAuth, authTimestamp });
      
      if (isAuth && authTimestamp) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      setIsChecking(false);
    };

    checkAuth();

    // Listen for storage changes (for when user clears access in another tab/component)
    const handleStorageChange = () => {
      console.log('Storage changed, rechecking auth...');
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab changes)
    window.addEventListener('betaAccessCleared', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('betaAccessCleared', handleStorageChange);
    };
  }, []);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <PasswordProtection onAuthorized={() => setIsAuthorized(true)} />;
  }

  return <>{children}</>;
}
