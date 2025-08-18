import { marked } from "marked";

interface StrategyDefinitionProps {
  strategy: "integration" | "separation" | "assimilation" | "marginalization";
}

const definitions = {
  integration: `The integration strategy for Veterans involves actively balancing and embracing both their military and civilian identities. Veterans employing this strategy seek to maintain meaningful connections with fellow Veterans while also engaging authentically in civilian communities. They often participate in activities that bridge these two worlds, such as Veteran-specific events alongside broader community engagements. This approach aims for coherence in identity across contexts, leveraging military skills and experiences to enhance success in civilian life. Integrationist Veterans typically report higher levels of satisfaction and mental well-being compared to those employing other acculturation strategies.`,
  
  separation: `The separation strategy for Veterans involves maintaining a strong identification with their military culture while deliberately distancing themselves from civilian norms and identities. Veterans using this strategy may seek out environments or activities that reinforce their military background, such as joining Veteran-specific organizations, participating in military-themed hobbies, or associating primarily with other Veterans. This approach prioritizes preserving a distinct military identity over integrating into civilian life, which can lead to a sense of nostalgia for military experiences. While separationist Veterans may experience lower life satisfaction in mainstream society, they often find comfort and belonging within their military community.`,
  
  assimilation: `The assimilation strategy among Veterans involves prioritizing integration into civilian life while downplaying or suppressing aspects of their military identity. Veterans adopting this strategy may seek to assimilate into mainstream culture by embracing civilian roles, norms, and values, often at the expense of their military identity. This can stem from experiences of conflict, trauma, or disillusionment within the military, prompting a desire to distance themselves from their military past. Assimilationist Veterans may prioritize fitting in with civilian peers, seeking new career paths outside the military, and avoiding reminders of their military service. This approach can lead to improved mental health outcomes but may also involve challenges in reconciling their dual identities and finding a sense of belonging in both military and civilian contexts.`,
  
  marginalization: `The marginalization strategy among Veterans involves a sense of disconnection and alienation from both military and civilian cultures. Veterans adopting this strategy often feel rejected or neglected by mainstream society and may struggle to find a sense of belonging in any social group. This could stem from experiences of betrayal, trauma, or unresolved issues during military service, compounded by challenges reintegrating into civilian life. Marginalized Veterans may withdraw from social interactions, experience persistent feelings of isolation, and struggle with mental health issues such as depression and anxiety. They may find limited support networks and face barriers to accessing necessary services, exacerbating their sense of marginalization. Overall, this strategy can lead to the poorest mental health and life satisfaction outcomes among Veterans.`
};

export function StrategyDefinition({ strategy }: StrategyDefinitionProps) {
  console.log('StrategyDefinition rendering with strategy:', strategy);
  
  const strategyName = strategy.charAt(0).toUpperCase() + strategy.slice(1);
  const strategyPair = {
    integration: "High Military / High Civilian",
    separation: "High Military / Low Civilian",
    assimilation: "Low Military / High Civilian",
    marginalization: "Low Military / Low Civilian"
  }[strategy];

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-white">{strategyName} Strategy</h3>
        <p className="text-primary font-medium">{strategyPair}</p>
      </div>
      <div 
        className="prose prose-invert max-w-none" 
        dangerouslySetInnerHTML={{ __html: marked.parse(definitions[strategy]) }}
      />
    </div>
  );
}
