import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { answersStore } from "@/stores/answersStore.ts";
import AxisQuestionCard from "@/components/AxisQuestionCard.tsx";
import SurveyProgressBar from "@/components/SurveyProgressBar.tsx";

type question = {
  data: {
    question: string;
    axis: string;
    category: string;
  };
};

type Props = {
  questions: Array<question>;
};

const buildCategoryMap = (questions: Array<question>) => {
  return questions.reduce((acc, q) => {
    const category = q.data.category;
    if (!acc.has(category)) {
      acc.set(category, []);
    }

    acc.get(category)?.push(q);

    return acc;
  }, new Map<string, Array<question>>());
};

const handleInputChange = (question: string, axis: string, offset: number) => {
  console.log(question, axis, offset);
  answersStore.set({ ...answersStore.get(), [question]: { axis, offset } });
};

const QuestionForm = ({ questions }: Props) => {
  useEffect(() => {
    answersStore.set({});
  }, []);

  const categoryMap = buildCategoryMap(questions);

  const $answers = useStore(answersStore);

  const allQuestionsAnswered = questions.every(
    (q) => $answers[q.data.question] !== undefined
  );

  const categories = Array.from(categoryMap.keys());
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(categories[0]);
  const [currentQuestions, setCurrentQuestions] = useState(
    categoryMap.get(categories[0]) || []
  );
  const allQuestionsAnsweredForPage = currentQuestions.every(
    (q) => $answers[q.data.question] !== undefined
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

  const buttonClass =
    "flex flex-1 p-6 mx-4 mt-4 text-xl rounded-lg font-semibold justify-center min-w-36";

  return (
    <div className="flex flex-col flex-1 container-sm mx-auto">
      <h2 className="text-3xl font-bold p-4 text-center">{currentCategory}</h2>
      <SurveyProgressBar
        currentStep={currentCategoryIndex}
        totalSteps={categories.length}
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
            type="submit"
            className={buttonClass}
          >
            <a
              href="/results"
              className={!allQuestionsAnswered ? "pointer-events-none" : ""}
            >
              View Results
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuestionForm;
