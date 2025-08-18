'use client'
import ContactOptInForm from "@/components/ContactOptInForm.tsx";
import SurveyPageLayout from "@/components/SurveyPageLayout.tsx";
import { useStore } from "@nanostores/react";
import { answersStore } from "@/stores/answersStore.ts";
import { useEffect, useState } from "react";
import type { ContactAnswers } from '@/stores/answersStore';

export default function SurveyStepSix() {
  const $answers = useStore(answersStore);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if contact form is complete (basic fields required)
  const contact = ($answers.contact ?? {}) as ContactAnswers;
  const contactComplete = contact?.first_name && contact?.last_name && 
                         (!contact?.subscribe || (contact?.subscribe && contact?.email));

  const handleNext = () => {
    sessionStorage.setItem('scrollToTop', 'true');
    window.location.href = "/results";
  };

  const handleBack = () => {
    sessionStorage.setItem('scrollToTop', 'true');
    window.location.href = "/survey/5";
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <SurveyPageLayout
      title="Contact Information"
      step={6}
      totalSteps={6}
      onBack={handleBack}
      onNext={handleNext}
      nextDisabled={!contactComplete}
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-white">
        Contact Information
      </h2>
      <ContactOptInForm />
    </SurveyPageLayout>
  );
}
