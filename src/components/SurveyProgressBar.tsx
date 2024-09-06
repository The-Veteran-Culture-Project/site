import { Progress } from "@/components/ui/progress";

type Props = {
  currentStep: number;
  totalSteps: number;
};

const SurveyProgressBar = ({ currentStep, totalSteps }: Props) => {
  const progress = (currentStep / totalSteps) * 100;
  return (
    <div className="flex justify-center p-4">
      <Progress value={progress} className="w-[60%]" />
    </div>
  );
};

export default SurveyProgressBar;
