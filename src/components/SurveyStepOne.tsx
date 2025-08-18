'use client'
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { answersStore } from "@/stores/answersStore.ts";
import AxisQuestionCard from "@/components/AxisQuestionCard.tsx";
import SurveyPageLayout from "@/components/SurveyPageLayout.tsx";

interface Question {
  data: {
    question: string;
    axis: string;
    category: string;
  };
}

interface Props {
  questions: Question[];
}

const handleInputChange = (question: string, axis: string, offset: number) => {
  answersStore.set({
    ...answersStore.get(),
    [question]: { axis, offset, question },
  });
};

export default function SurveyStepOne({ questions }: Props) {
  const $answers = useStore(answersStore);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Add a global function to clear all survey data (for testing)
    (window as any).clearSurveyData = () => {
      answersStore.set({});
      localStorage.removeItem('vcp-survey-backup');
      localStorage.removeItem('answers'); // Clear the persistent atom storage
      console.log('Survey data cleared! Refresh the page.');
    };
    
    // Clear any existing answers on first load of survey
    const currentAnswers = answersStore.get();
    const hasAxisAnswers = Object.keys(currentAnswers).some(key => 
      currentAnswers[key] && typeof currentAnswers[key] === 'object' && 'axis' in currentAnswers[key]
    );
    if (!hasAxisAnswers) {
      // Only clear axis answers, keep demographic/benefits/contact data
      const nonAxisAnswers = Object.keys(currentAnswers).reduce((acc, key) => {
        if (key === 'demographics' || key === 'va_benefits' || key === 'contact') {
          acc[key] = currentAnswers[key];
        }
        return acc;
      }, {} as any);
      answersStore.set(nonAxisAnswers);
    }
  }, []);

  const allQuestionsAnswered = questions.every(
    (q) => $answers[q.data.question] !== undefined,
  );

  // Don't render until client-side to avoid hydration issues
  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <SurveyPageLayout
      title="Before & After Service"
      step={1}
      totalSteps={6}
      nextHref="/survey/2"
      nextDisabled={!allQuestionsAnswered}
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-white">
        Before & After Service
      </h2>
      <form onSubmit={(e) => e.preventDefault()}>
        {questions.map((q, idx) => (
          <AxisQuestionCard
            questionNumber={idx + 1}
            question={q.data.question}
            axis={q.data.axis}
            category={q.data.category}
            onInputChange={handleInputChange}
            key={q.data.question}
          />
        ))}
      </form>
    </SurveyPageLayout>
  );
}
