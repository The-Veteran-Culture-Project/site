import { useStore } from "@nanostores/preact";

import { answersStore } from "../stores/answersStore.ts";
import AxisQuestionCard from "./AxisQuestionCard.tsx";

const onSubmit = (event: SubmitEvent) => {
  event.preventDefault();
  console.log("submitted");
};

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
    <form onSubmit={onSubmit} class="flex flex-col">
      {questions.map((q) => (
        <AxisQuestionCard
          question={q.data.question}
          onInputChange={handleInputChange}
        />
      ))}
      <button
        disabled={allQuestionsAnswered}
        type="Submit"
        class="text-yellow-500 text-lg"
      >
        Submit
      </button>
    </form>
  );
};

export default QuestionForm;
