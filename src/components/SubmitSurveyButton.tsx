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
      
      console.log("FULL STORE:", JSON.stringify(store, null, 2));
      console.log("Contact from store:", JSON.stringify(contact, null, 2));
      console.log("Raw subscribe value:", contact.subscribe);
      console.log("Raw story_opt_in value:", contact.story_opt_in);
      console.log("Type of subscribe:", typeof contact.subscribe);
      console.log("Type of story_opt_in:", typeof contact.story_opt_in);
      
      // Force the values to be true booleans using simple but explicit conversion
      // First stringify, then check truthy content, then convert back to boolean
      const subscribeStr = String(contact.subscribe).toLowerCase();
      const storyOptInStr = String(contact.story_opt_in).toLowerCase();
      
      const subscribeValue = subscribeStr === 'true' || subscribeStr === '1';
      const storyOptInValue = storyOptInStr === 'true' || storyOptInStr === '1';
      
      console.log("Processed subscribe value:", subscribeValue);
      console.log("Processed story_opt_in value:", storyOptInValue);
      
      // Prepare the survey data object - forcing true booleans (not 1 or "true")
      const surveyData = {
        first_name: contact.first_name || "",
        last_name: contact.last_name || "",
        email: contact.email || "",
        subscribe: subscribeValue === true, // Force a true boolean
        story_opt_in: storyOptInValue === true, // Force a true boolean
        military_score: militaryScore,
        civilian_score: civilianScore,
        strategy: strategy,
        demographics: demographics || {},
        va_benefits: va_benefits || {}
      };
      
      console.log("Survey data being submitted:", JSON.stringify(surveyData, null, 2));
      
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
