import { SteeringControls } from '../SteeringControls';
import type { Agent } from '@/stores/agentStore';

export default function SteeringControlsExample() {
  const mockAgent: Agent = {
    id: 'analyst-1',
    name: 'Analyst',
    description: 'Analyzes market data and identifies trends',
    status: 'working',
    position: { x: 100, y: 100 },
    steeringX: 0.6,
    steeringY: 0.4,
    tools: ['web_search', 'analyze_data', 'code_writer'],
  };

  return (
    <div className="w-80 bg-card border rounded-lg">
      <SteeringControls
        agent={mockAgent}
        onSteeringChange={(x, y) => console.log('Steering:', x, y)}
        onToolToggle={(tool, enabled) => console.log('Tool:', tool, enabled)}
      />
    </div>
  );
}
