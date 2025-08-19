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
  const benefitsComplete = Boolean(
    // Basic application info
    va_benefits?.has_applied &&
    Array.isArray(va_benefits?.benefits_used) && 
    va_benefits.benefits_used.length > 0 &&
    va_benefits?.has_disability_rating &&
    
    // Disability rating is only required if they answered "Yes"
    (va_benefits.has_disability_rating === 'No' || 
     (va_benefits.has_disability_rating === 'Yes' && va_benefits?.disability_rating)) &&

    // Experience questions required if they have applied
    (va_benefits.has_applied === 'No' || 
     (va_benefits.has_applied === 'Yes' && 
      va_benefits?.comfort_delay &&
      va_benefits?.decision_time)) &&
    
    // Final impact question
    va_benefits?.va_healthcare
  );

  // Debug validation
  console.log('Benefits validation:', {
    hasApplied: va_benefits?.has_applied,
    benefitsUsed: va_benefits?.benefits_used,
    hasDisabilityRating: va_benefits?.has_disability_rating,
    disabilityRating: va_benefits?.disability_rating,
    comfortDelay: va_benefits?.comfort_delay,
    decisionTime: va_benefits?.decision_time,
    vaHealthcare: va_benefits?.va_healthcare,
    isComplete: benefitsComplete
  });

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
