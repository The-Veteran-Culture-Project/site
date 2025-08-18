import { useStore } from '@nanostores/react';
import { answersStore } from '@/stores/answersStore';
import { determineStrategy } from '@/lib/determineStrategy';
import { StrategyDefinition } from './StrategyDefinition';

export function StrategyDisplay() {
  const answers = useStore(answersStore);
  console.log('StrategyDisplay rendering with answers:', answers);
  
  const strategy = determineStrategy(answers);
  console.log('StrategyDisplay determined strategy:', strategy);

  return (
    <>
      {console.log('StrategyDisplay rendering StrategyDefinition with strategy:', strategy)}
      <StrategyDefinition strategy={strategy} />
    </>
  );
}
