import { useStore } from "@nanostores/preact";

import { answersStore } from "../stores/answersStore.ts";
import AxisQuestionCard from "./AxisQuestionCard.tsx";

type Props = {
  questions: Array<{ data: { question: string } }>;
};

const handleInputChange = (question: string, axis: string, offset: number) => {
  answersStore.set({
    ...answersStore.get(),
    [question]: { axis, offset },
  });
};

const QuestionForm = ({ questions }: Props) => {
  const answers = useStore(answersStore);

  const allQuestionsAnswered = questions.every(
    (q) => answers[q.data.question] !== undefined
  );
  return (
    <div class="flex flex-col">
      {questions.map((q) => (
        <AxisQuestionCard
          question={q.data.question}
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
