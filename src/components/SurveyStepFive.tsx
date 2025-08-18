'use client'
import BenefitsForm from "@/components/BenefitsForm.tsx";
import SurveyPageLayout from "@/components/SurveyPageLayout.tsx";
import { useStore } from "@nanostores/react";
import { answersStore } from "@/stores/answersStore.ts";
import { useEffect, useState } from "react";
import type { BenefitsAnswers } from '@/stores/answersStore';

export default function SurveyStepFive() {
  const $answers = useStore(answersStore);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if benefits form is complete
  const va_benefits = ($answers['va_benefits'] ?? {}) as BenefitsAnswers;
  const benefitsComplete = va_benefits?.has_applied !== undefined;

  const handleNext = () => {
    sessionStorage.setItem('scrollToTop', 'true');
    window.location.href = "/survey/6";
  };

  const handleBack = () => {
    sessionStorage.setItem('scrollToTop', 'true');
    window.location.href = "/survey/4";
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
        <SurveyPageLayout
      title="Benefits Experience"
      step={5}
      totalSteps={6}
      backHref="/survey/4"
      nextHref="/survey/6"
      nextDisabled={!benefitsComplete}
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-white">
        Benefits Experience
      </h2>
      <BenefitsForm />
    </SurveyPageLayout>
  );
}
