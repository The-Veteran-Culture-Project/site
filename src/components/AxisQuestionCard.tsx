import type { TargetedEvent } from "preact/compat";

type Props = {
  question: string;
  axis: string;
  category: string;
  onInputChange: (question: string, axis: string, offset: number) => void;
};

const choices: { [key: string]: number } = {
  "Strongly Disagree": -2,
  Disagree: -1,
  Neutral: 0,
  Agree: 1,
  "Strongly Agree": 2,
};

const choiceKeys = Object.keys(choices);

const AxisQuestionCard = ({
  question,
  axis,
  category,
  onInputChange,
}: Props) => {
  const onInput = (event: TargetedEvent<HTMLInputElement>) => {
    const offset = choices[event.currentTarget.value];
    onInputChange(question, axis, offset);
  };

  return (
    <div class="bg-gray-300 m-8 p-4 md:p-8 text-zinc-900 rounded-2xl flex-1 flex-column my-4">
      <h2 class="text-2xl md:text-3xl font-bold pb-4 flex-1">{question}</h2>
      <div class="flex-column">
        {choiceKeys.map((choice) => (
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
