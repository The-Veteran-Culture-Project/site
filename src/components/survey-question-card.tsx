"use client";

import { useStore } from "@nanostores/react";
import { answersStore } from "../stores/answersStore";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  questionNumber: number;
  question: string;
  axis: string;
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

export function SurveyQuestionCard({
  questionNumber,
  question,
  axis,
  onInputChange,
}: Props) {
  const $answers = useStore(answersStore);

  const onInput = (question: string, axis: string) => (value: string) => {
    const offset = choices[value];
    onInputChange(question, axis, offset);
  };

  return (
    <Card className="w-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 m-6">
      <CardContent className="p-6">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {`${questionNumber}. ${question}`}
          </h3>
          <RadioGroup onValueChange={onInput(question, axis)}>
            <div className="space-y-3">
              {choiceKeys.map((choice, idx) => (
                <div className="flex items-center space-x-3" key={idx}>
                  <RadioGroupItem
                    value={choice}
                    id={`${question}-${choice}`}
                    checked={$answers[question]?.offset === choices[choice]}
                  />
                  <Label
                    htmlFor="javascript"
                    className="text-base text-gray-700 cursor-pointer"
                  >
                    JavaScript
                  </Label>
                </div>
              ))}
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="javascript" id="javascript" />
                <Label
                  htmlFor="javascript"
                  className="text-base text-gray-700 cursor-pointer"
                >
                  JavaScript
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="python" id="python" />
                <Label
                  htmlFor="python"
                  className="text-base text-gray-700 cursor-pointer"
                >
                  Python
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="java" id="java" />
                <Label
                  htmlFor="java"
                  className="text-base text-gray-700 cursor-pointer"
                >
                  Java
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="csharp" id="csharp" />
                <Label
                  htmlFor="csharp"
                  className="text-base text-gray-700 cursor-pointer"
                >
                  C#
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
