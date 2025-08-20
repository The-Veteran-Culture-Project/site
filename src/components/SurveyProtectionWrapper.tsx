import React, { useState } from 'react';
import { PasswordProtection } from './PasswordProtection';

interface SurveyProtectionWrapperProps {
  children: React.ReactNode;
}

export function SurveyProtectionWrapper({ children }: SurveyProtectionWrapperProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleAuthorized = () => {
    setIsAuthorized(true);
  };

  if (!isAuthorized) {
    return <PasswordProtection onAuthorized={handleAuthorized} />;
  }

  return <>{children}</>;
}
