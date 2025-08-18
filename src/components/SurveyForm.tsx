import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
// ...existing imports...

import { answersStore } from "@/stores/answersStore.ts";
import AxisQuestionCard from "@/components/AxisQuestionCard.tsx";
import SurveyProgressBar from "@/components/SurveyProgressBar.tsx";

interface question {
  data: {
    question: string;
    axis: string;
    category: string;
  };
}

interface Props {
  questions: question[];
}

// Map category names to neutral display labels
const getCategoryDisplayName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    "Patriotism & Purpose": "Before & After Service",
    "Mental Health & Addiction": "Wellbeing & Challenges", 
    "Mental Health & Addiction ": "Wellbeing & Challenges", // Handle trailing space variant
    "Civilian & Military Relationships": "Life with Others",
  };
  return categoryMap[category] || category;
};

const buildCategoryMap = (questions: question[]) => {
  return questions.reduce((acc, q) => {
    const category = q.data.category;
    if (!acc.has(category)) {
      acc.set(category, []);
    }

    acc.get(category)?.push(q);

    return acc;
  }, new Map<string, question[]>());
};

const handleInputChange = (question: string, axis: string, offset: number) => {
  console.log(question, axis, offset);
  answersStore.set({
    ...answersStore.get(),
    [question]: { axis, offset, question },
  });
};

const QuestionForm = ({ questions }: Props) => {
  useEffect(() => {
    answersStore.set({});
  }, []);

  const categoryMap = buildCategoryMap(questions);

  const $answers = useStore(answersStore);

  const allQuestionsAnswered = questions.every(
    (q) => $answers[q.data.question] !== undefined,
  );

  const categories = Array.from(categoryMap.keys());
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(categories[0]);
  const [currentQuestions, setCurrentQuestions] = useState(
    categoryMap.get(categories[0]) || [],
  );
  const allQuestionsAnsweredForPage = currentQuestions.every(
    (q) => $answers[q.data.question] !== undefined,
  );

  const handleNext = () => {
    const nextIndex = currentCategoryIndex + 1;
    if (nextIndex < categories.length) {
      setCurrentCategoryIndex(nextIndex);
      setCurrentCategory(categories[nextIndex]);
      setCurrentQuestions(categoryMap.get(categories[nextIndex]) || []);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    const previousIndex = currentCategoryIndex - 1;
    if (previousIndex >= 0) {
      setCurrentCategoryIndex(previousIndex);
      setCurrentCategory(categories[previousIndex]);
      setCurrentQuestions(categoryMap.get(categories[previousIndex]) || []);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };


// ...existing code...

  const buttonClass =
    "flex flex-1 p-6 mx-4 mt-4 text-xl rounded-lg font-semibold justify-center min-w-36";

  return (
    <div className="flex flex-col flex-1 container-sm mx-auto">
  <form onSubmit={(e) => e.preventDefault()}>
        <h2 className="text-3xl font-bold p-4 text-center">
          {getCategoryDisplayName(currentCategory)}
        </h2>
        <SurveyProgressBar
          currentStep={currentCategoryIndex + 1}
          totalSteps={categories.length + 1}
        />
        {currentQuestions.map((q, idx) => (
          <AxisQuestionCard
            questionNumber={idx + 1 + currentCategoryIndex * 10}
            question={q.data.question}
            axis={q.data.axis}
            category={q.data.category}
            onInputChange={handleInputChange}
            key={q.data.question}
          />
        ))}
        <div className="flex justify-center flex-wrap-reverse min-w-50 py-4">
          {currentCategoryIndex != 0 && (
            <Button onClick={handlePrevious} className={buttonClass}>
              Previous
            </Button>
          )}
          {currentCategoryIndex != categories.length - 1 && (
            <Button
              disabled={
                !allQuestionsAnsweredForPage ||
                currentCategoryIndex === categories.length - 1
              }
              onClick={handleNext}
              className={buttonClass}
            >
              Next
            </Button>
          )}
          {currentCategoryIndex == categories.length - 1 && (
            <Button
              disabled={!allQuestionsAnswered}
              onClick={() => window.location.href = "/survey/demographics"}
              className={buttonClass}
            >
              Next
            </Button>
          )}
          {/* UserInfoDialog removed. No user info or API logic remains here. */}
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
