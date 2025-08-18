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

export default function SurveyStepThree({ questions }: Props) {
  const $answers = useStore(answersStore);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
      title="Life with Others"
      step={3}
      totalSteps={6}
      backHref="/survey/2"
      nextHref="/survey/4"
      nextDisabled={!allQuestionsAnswered}
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-white">
        Life with Others
      </h2>
      <form onSubmit={(e) => e.preventDefault()}>
        {questions.map((q, idx) => (
          <AxisQuestionCard
            questionNumber={idx + 21}
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
