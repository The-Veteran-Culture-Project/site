'use client'
import ContactOptInForm from "@/components/ContactOptInForm.tsx";
import SurveyPageLayout from "@/components/SurveyPageLayout.tsx";
import { useStore } from "@nanostores/react";
import { answersStore } from "@/stores/answersStore.ts";
import { useEffect, useState } from "react";
import type { ContactAnswers } from '@/stores/answersStore';
import { useToast } from '@/hooks/use-toast';
import { getSessionInfo } from "@/lib/surveyResponseTracker";

export default function SurveyStepSix() {
  const $answers = useStore(answersStore);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Email validation regex - standard format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if contact form is complete (basic fields required)
  const contact = ($answers.contact ?? {}) as ContactAnswers;
  const contactComplete = contact?.first_name && 
                         contact?.last_name && 
                         contact?.email && 
                         validateEmail(contact.email); // Validate email format

  // Debug contact validation
  console.log("Contact validation debug:", {
    contact,
    first_name: !!contact?.first_name,
    last_name: !!contact?.last_name,
    email: !!contact?.email,
    emailValid: contact?.email ? validateEmail(contact.email) : false,
    contactComplete
  });

  const handleNext = async () => {
    console.log("🔥 VIEW RESULTS BUTTON CLICKED! Starting submission...");
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
      
      // Get the most up-to-date contact info from the store
      const latestContact = (answersStore.get().contact ?? {}) as ContactAnswers;
      
      console.log("SUBMITTING WITH CONTACT:", latestContact);
      console.log("Subscribe:", latestContact.subscribe, "Type:", typeof latestContact.subscribe);
      console.log("Story opt-in:", latestContact.story_opt_in, "Type:", typeof latestContact.story_opt_in);
      console.log("Military Score:", militaryScore, "Type:", typeof militaryScore);
      console.log("Civilian Score:", civilianScore, "Type:", typeof civilianScore);
      console.log("Strategy:", strategy, "Type:", typeof strategy);
      console.log("Demographics:", demographics);
      console.log("VA Benefits:", va_benefits);
      console.log("Full Answers Store:", $answers);
      console.log("🔍 Score calculation debug:");
      console.log("  Answers object keys:", Object.keys($answers));
      Object.entries($answers).forEach(([key, value]) => {
        if (typeof value === 'object' && value && 'axis' in value && 'offset' in value) {
          console.log(`  Answer ${key}:`, value);
        }
      });
      
      // Get the current response tracking session info
      const sessionInfo = getSessionInfo();
      
      // Extract individual question responses (axis questions only)
      const questionResponses: Record<string, { axis: string; offset: number; question: string }> = {};
      Object.entries($answers).forEach(([key, value]) => {
        if (typeof value === 'object' && value && 'axis' in value && 'offset' in value && 'question' in value) {
          questionResponses[key] = value as { axis: string; offset: number; question: string };
        }
      });
      
      console.log("🔍 Individual question responses to save:", questionResponses);
      console.log("🔍 Number of individual responses:", Object.keys(questionResponses).length);
      
      // Prepare the survey data object with explicit boolean values
      const surveyData = {
        first_name: latestContact.first_name || "",
        last_name: latestContact.last_name || "",
        email: latestContact.email || "",
        subscribe: latestContact.subscribe === true,
        story_opt_in: latestContact.story_opt_in === true,
        military_score: militaryScore,
        civilian_score: civilianScore,
        strategy: strategy,
        demographics: demographics || {},
        va_benefits: va_benefits || {},
        questionResponses: questionResponses, // Include individual question responses
        responseSessionId: sessionInfo.sessionId // Link to response tracking session
      };
      
      // Before submitting survey, directly handle the marketing signup if the checkbox is checked
      if (latestContact.subscribe === true && latestContact.email) {
        console.log("⭐ SurveyStepSix: Newsletter checkbox is checked, submitting to marketing database");
        
        try {
          const marketingResponse = await fetch('/api/marketing-signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: latestContact.email,
              name: `${latestContact.first_name || ''} ${latestContact.last_name || ''}`.trim(),
              source: 'survey-submit'
            })
          });
          
          console.log("⭐ Marketing signup response status:", marketingResponse.status);
          const marketingData = await marketingResponse.json();
          console.log("⭐ Marketing signup response data:", marketingData);
        } catch (marketingError) {
          console.error("⭐ Error submitting to marketing database:", marketingError);
          // Continue with survey submission even if marketing signup fails
        }
      }
      
      // Submit the data to the API
      console.log("🔍 About to submit this data:", surveyData);
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
