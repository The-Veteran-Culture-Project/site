import "@/styles/global.css";

import { useStore } from "@nanostores/react";
import { answersStore } from "@/stores/answersStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Props {
  questionNumber: number;
  question: string;
  axis: string;
  category: string;
  onInputChange: (question: string, axis: string, offset: number) => void;
}

const choices: Record<string, number> = {
  "Strongly Disagree": -2,
  Disagree: -1,
  Agree: 1,
  "Strongly Agree": 2,
};

const choiceKeys = Object.keys(choices);

const AxisQuestionCard = ({
  questionNumber,
  question,
  axis,
  onInputChange,
}: Props) => {
  const $answers = useStore(answersStore);

  const onInput = (question: string, axis: string) => (value: string) => {
    const offset = choices[value];
    onInputChange(question, axis, offset);
  };

  const hasAnswered = $answers[question] && typeof $answers[question] === 'object' && 'offset' in $answers[question];
  const currentAnswer = hasAnswered ? $answers[question] as { offset: number } : null;

  return (
    <div className={`mb-6 bg-gray-800 border border-gray-600 rounded-lg p-6 shadow-xl ${hasAnswered ? "border-[#CBB87C]" : ""}`}>
      <div className="flex flex-row items-start mb-4">
        <h2 className="text-4xl font-bold text-[#CBB87C] mr-4 min-w-fit">
          {questionNumber}
        </h2>
        <h3 className="text-lg font-semibold text-white leading-relaxed">{question}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {choiceKeys.map((choice) => (
          <label
            key={`${question}-${choice}`}
            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
              currentAnswer?.offset === choices[choice]
                ? "bg-[#CBB87C] border-[#CBB87C] text-black"
                : "bg-gray-700 border-gray-600 text-white hover:border-[#CBB87C] hover:bg-gray-600"
            }`}
          >
            <input
              type="radio"
              name={`question-${questionNumber}`}
              value={choice}
              checked={currentAnswer?.offset === choices[choice]}
              onChange={() => onInput(question, axis)(choice)}
              className="accent-[#CBB87C] scale-110"
            />
            <span className="font-medium">{choice}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default AxisQuestionCard;
