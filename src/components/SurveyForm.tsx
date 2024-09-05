import { useStore } from "@nanostores/preact";
import { useEffect, useState } from "preact/hooks";

import { answersStore } from "../stores/answersStore.ts";
import AxisQuestionCard from "./AxisQuestionCard.tsx";

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
    "flex flex-1 p-4 m-4 text-slate-50 text-xl bg-purple-600 rounded-lg disabled:bg-slate-500 disabled:text-slate-800 font-semibold grow justify-center min-w-36";

  return (
    <div class="flex flex-col container-sm mx-auto">
      <h2 class="text-slate-50 text-3xl font-bold p-4 text-center">
        {currentCategory}
      </h2>
      {currentQuestions.map((q) => (
        <AxisQuestionCard
          question={q.data.question}
          axis={q.data.axis}
          category={q.data.category}
          onInputChange={handleInputChange}
        />
      ))}
      <div class="flex justify-center px-8 flex-wrap">
        <button
          disabled={currentCategoryIndex === 0}
          onClick={handlePrevious}
          class={buttonClass}
        >
          Previous
        </button>
        {currentCategoryIndex != categories.length - 1 && (
          <button
            disabled={currentCategoryIndex === categories.length - 1}
            onClick={handleNext}
            class={buttonClass}
          >
            Next
          </button>
        )}
        {currentCategoryIndex == categories.length - 1 && (
          <button
            disabled={!allQuestionsAnswered}
            type="Submit"
            class={buttonClass}
          >
            <a
              href="/results"
              class={!allQuestionsAnswered ? "pointer-events-none" : ""}
            >
              Submit Survey
            </a>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionForm;
