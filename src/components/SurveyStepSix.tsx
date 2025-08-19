'use client'
import ContactOptInForm from "@/components/ContactOptInForm.tsx";
import SurveyPageLayout from "@/components/SurveyPageLayout.tsx";
import { useStore } from "@nanostores/react";
import { answersStore } from "@/stores/answersStore.ts";
import { useEffect, useState } from "react";
import type { ContactAnswers } from '@/stores/answersStore';
import { useToast } from '@/hooks/use-toast';

export default function SurveyStepSix() {
  const $answers = useStore(answersStore);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Email validation regex with common TLDs
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[com|edu|org|net|gov|mil|biz|info|io|co|uk|us|ca]+)$/i;
    return emailRegex.test(email);
  };

  // Check if contact form is complete (basic fields required)
  const contact = ($answers.contact ?? {}) as ContactAnswers;
  const contactComplete = contact?.first_name && 
                         contact?.last_name && 
                         contact?.email && 
                         validateEmail(contact.email); // Validate email format

  const handleNext = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate military and civilian scores from survey answers
      let militaryScore = 0;
      let civilianScore = 0;
      
      // Process answers to calculate scores
      Object.entries($answers).forEach(([key, value]) => {
        if (typeof value === 'object' && 'axis' in value && 'offset' in value) {
          const answer = value as { axis: string; offset: number };
          if (answer.axis === 'X') {
            civilianScore += answer.offset;
          } else if (answer.axis === 'Y') {
            militaryScore += answer.offset;
          }
        }
      });
      
      // Determine strategy based on scores
      const highMilitary = militaryScore > 0;
      const highCivilian = civilianScore > 0;
      
      const strategy = (highMilitary && highCivilian) ? "Integration" :
                      (highMilitary && !highCivilian) ? "Separation" :
                      (!highMilitary && highCivilian) ? "Assimilation" :
                      "Marginalization";
      
      const demographics = $answers.demographics;
      const va_benefits = $answers.va_benefits;
      
      // Prepare the survey data object
      const surveyData = {
        first_name: contact.first_name || "",
        last_name: contact.last_name || "",
        email: contact.email || "",
        military_score: militaryScore,
        civilian_score: civilianScore,
        strategy: strategy,
        demographics: demographics || {},
        va_benefits: va_benefits || {}
      };
      
      // Submit the data to the API
      const response = await fetch('/api/submit-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(surveyData)
      });
      
      if (response.ok) {
        sessionStorage.setItem('scrollToTop', 'true');
        window.location.href = "/results";
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit survey');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast({
        title: "Error submitting survey",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
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
      nextDisabled={!contactComplete || isSubmitting}
      nextButtonText="View Results"
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-white">
        Contact Information
      </h2>
      <ContactOptInForm />
    </SurveyPageLayout>
  );
}
