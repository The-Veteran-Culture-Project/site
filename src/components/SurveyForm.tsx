import AxisQuestionCard from "./AxisQuestionCard.tsx";

const onSubmit = (event: SubmitEvent) => {
  console.log(event);
};

type Props = {
  questions: Array<{ data: { question: string } }>;
};

const QuestionForm = ({ questions }: Props) => (
  <form onSubmit={onSubmit} class="flex flex-col">
    {questions.map((q) => (
      <AxisQuestionCard question={q.data.question} />
    ))}
    <button type="submit" class="text-yellow-500 text-lg">
      Submit
    </button>
  </form>
);

export default QuestionForm;
