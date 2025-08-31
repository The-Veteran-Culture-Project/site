'use client'
import DemographicsForm from "@/components/DemographicsForm.tsx";
import SurveyPageLayout from "@/components/SurveyPageLayout.tsx";
import { useStore } from "@nanostores/react";
import { answersStore } from "@/stores/answersStore.ts";
import { useEffect, useState } from "react";

export default function SurveyStepFour() {
  const $answers = useStore(answersStore);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if all required demographic fields are filled
  const demographics = ($answers.demographics ?? {}) as Record<string, any>;
  const demographicsComplete = demographics.age_range && 
                              demographics.gender && 
                              demographics.race && 
                              demographics.status_affiliation &&
                              demographics.combat;

  // Debug logging
  useEffect(() => {
    console.log('Demographics data:', demographics);
    console.log('Demographics complete:', demographicsComplete);
  }, [demographics, demographicsComplete]);

  const handleNext = () => {
    sessionStorage.setItem('scrollToTop', 'true');
    window.location.href = "/survey/5";
  };

  const handleBack = () => {
    sessionStorage.setItem('scrollToTop', 'true');
    window.location.href = "/survey/3";
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
        <SurveyPageLayout
      title="Demographics"
      step={4}
      totalSteps={6}
      backHref="/survey/3"
      nextHref="/survey/5"
      nextDisabled={!demographicsComplete}
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-white">
        Demographics
      </h2>
      <DemographicsForm />
    </SurveyPageLayout>
  );
}
