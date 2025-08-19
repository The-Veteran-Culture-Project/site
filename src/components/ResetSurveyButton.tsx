import { answersStore } from '@/stores/answersStore';
import { Button } from '@/components/ui/button';

export function ResetSurveyButton() {
  const handleReset = () => {
    // Clear the store
    answersStore.set({});
    // Navigate back to the survey start
    window.location.href = '/survey';
  };

  return (
    <Button 
      onClick={handleReset}
      variant="outline"
      className="mt-6"
    >
      Start New Survey
    </Button>
  );
}
