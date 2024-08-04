import type { TargetedEvent } from "preact/compat";

type Props = {
  question: string;
  onInputChange: (question: string, axis: string, offset: number) => void;
};

const choices = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

const AxisQuestionCard = ({ question, onInputChange }: Props) => {
  const onInput = (event: TargetedEvent<HTMLInputElement>) => {
    console.log(event.currentTarget.value);
    onInputChange(question, "x", 0);
  };

  return (
    <div class="bg-gray-300 p-4 md:p-8 text-zinc-900 rounded-2xl flex-1 flex-column my-4">
      <h2 class="text-2xl md:text-3xl font-bold pb-4 flex-1">{question}</h2>
      <div class="flex-column">
        {choices.map((choice) => (
          <div class="flex-1 p-0.5 flex">
            <input
              type="radio"
              id={`${question}-${choice}`}
              name={question}
              value={choice}
              class="peer/{choice} appearance-none flex"
              onClick={onInput}
            />
            <label
              for={`${question}-${choice}`}
              class="flex-1 font-display peer-checked/{choice}:bg-gradient-to-r from-violet-700 to-purple-500 peer-checked/{choice}:text-slate-100 cursor-pointer p-2 rounded-md"
            >
              {choice}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AxisQuestionCard;
