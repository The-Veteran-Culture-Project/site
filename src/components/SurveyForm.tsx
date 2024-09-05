import { useStore } from "@nanostores/preact";
import { useEffect } from "preact/hooks";

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

    acc.get(category).push(q);

    return acc;
  }, new Map());
};

const handleInputChange = (question: string, axis: string, offset: number) => {
  answersStore.set({ ...answersStore.get(), [question]: { axis, offset } });
};

const QuestionForm = ({ questions }: Props) => {
  useEffect(() => {
    answersStore.set({});
  }, []);

  const categoryMap: Map<string, Array<string>> = questions.reduce((acc, q) => {
    return acc;
  }, new Map());

  const $answers = useStore(answersStore);

  const allQuestionsAnswered = questions.every(
    (q) => $answers[q.data.question] !== undefined
  );

  return (
    <div class="flex flex-col container-sm mx-auto">
      {questions.map((q) => (
        <AxisQuestionCard
          question={q.data.question}
          axis={q.data.axis}
          category={q.data.category}
          onInputChange={handleInputChange}
        />
      ))}
      <a href="/results" class="flex justify-center">
        <button
          disabled={!allQuestionsAnswered}
          type="Submit"
          class="flex p-4 m-4 text-slate-50 text-xl bg-purple-600 rounded-lg disabled:bg-slate-500 disabled:text-slate-800 font-semibold"
        >
          Submit Survey
        </button>
      </a>
    </div>
  );
};

export default QuestionForm;
