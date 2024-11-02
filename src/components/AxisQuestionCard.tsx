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

  const hasAnswered = $answers[question]?.offset !== undefined;

  return (
    <Card
      className={`m-4 flex flex-col drop-shadow-md ${hasAnswered ? "bg-muted" : ""}`}
    >
      <CardHeader className="flex flex-row flex-1">
        <h2 className="text-4xl font-display text-primary mr-4 font-bold">
          {questionNumber}
        </h2>
        <CardTitle className="flex items-center">{question}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1">
        <RadioGroup onValueChange={onInput(question, axis)}>
          {choiceKeys.map((choice) => (
            <div
              className="flex items-center space-x-2 hover:bg-muted p-2 rounded-md"
              key={`${question}-${choice}`}
            >
              <RadioGroupItem
                value={choice}
                checked={$answers[question]?.offset === choices[choice]}
                id={`${question}-${choice}`}
              />
              <label
                className="min-w-64 cursor-pointer"
                htmlFor={`${question}-${choice}`}
              >
                {choice}
              </label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default AxisQuestionCard;
