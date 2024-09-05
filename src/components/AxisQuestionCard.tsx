import "@/styles/global.css";

import { useStore } from "@nanostores/react";
import { answersStore } from "../stores/answersStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const $answers = useStore(answersStore);

  const onInput = (question: string, axis: string) => (value: string) => {
    const offset = choices[value];
    onInputChange(question, axis, offset);
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>{question}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup onValueChange={onInput(question, axis)}>
          {choiceKeys.map((choice) => (
            <div
              className="flex items-center space-x-2"
              key={`${question}-${choice}`}
            >
              <RadioGroupItem
                value={choice}
                checked={$answers[question]?.offset === choices[choice]}
                id={`${question}-${choice}`}
              />
              <label htmlFor={choice}>{choice}</label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default AxisQuestionCard;
