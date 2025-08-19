import { useStore } from '@nanostores/react';
import { answersStore } from '@/stores/answersStore.ts';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { ContactAnswers } from '@/stores/answersStore';

export function SubmitSurveyButton() {
  const store = useStore(answersStore);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitSurvey = async () => {
    setIsSubmitting(true);
    
    try {
      // Check if we have the required data
      if (!store.contact) {
        toast({
          title: "Missing contact information",
          description: "Please complete the contact information section before submitting.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Calculate military and civilian scores from survey answers
      let militaryScore = 0;
      let civilianScore = 0;
      
      // Process answers to calculate scores
      Object.entries(store).forEach(([key, value]) => {
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
      
      const contact = store.contact as ContactAnswers;
      const demographics = store.demographics;
      const va_benefits = store.va_benefits;
      
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
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Survey submitted successfully",
          description: "Thank you for completing our survey!",
          variant: "default"
        });
        
        // Redirect to the thank you page
        window.location.href = '/survey/thank-you';
      } else {
        throw new Error(data.message || 'Failed to submit survey');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      
      toast({
        title: "Error submitting survey",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Button 
      onClick={submitSurvey}
      disabled={isSubmitting} 
      className="w-full md:w-auto bg-[#CBB87C] text-black hover:bg-[#a99d6b] flex items-center justify-center py-6 px-12 text-xl font-bold"
    >
      {isSubmitting ? 'Submitting...' : 'Submit Survey'}
    </Button>
  );
}
