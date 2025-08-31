import React, { useState } from 'react';
import { PasswordProtection } from './PasswordProtection';

interface SurveyProtectionWrapperProps {
  children: React.ReactNode;
}

export function SurveyProtectionWrapper({ children }: SurveyProtectionWrapperProps) {
  // Temporarily disable beta protection for debugging
  return <>{children}</>;
}
