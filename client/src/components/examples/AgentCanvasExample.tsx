import { useState } from 'react';
import { AgentCanvas } from '../AgentCanvas';
import type { Agent, Artifact } from '@/stores/agentStore';

export default function AgentCanvasExample() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mockAgents: Agent[] = [
    { id: '1', name: 'Scraper', description: '', status: 'complete', position: { x: 0, y: 0 }, steeringX: 0.5, steeringY: 0.5, tools: [] },
    { id: '2', name: 'Analyst', description: '', status: 'working', position: { x: 0, y: 0 }, steeringX: 0.5, steeringY: 0.5, tools: [] },
    { id: '3', name: 'Writer', description: '', status: 'idle', position: { x: 0, y: 0 }, steeringX: 0.5, steeringY: 0.5, tools: [] },
  ];

  const mockArtifacts: Artifact[] = [
    { id: 'a1', name: 'data.json', type: 'json', content: '', createdBy: 'Scraper', createdAt: new Date() },
    { id: 'a2', name: 'analysis.md', type: 'markdown', content: '', createdBy: 'Analyst', createdAt: new Date() },
  ];

  return (
    <div className="h-[400px]">
      <AgentCanvas
        agents={mockAgents}
        artifacts={mockArtifacts}
        selectedAgentId={selectedId}
        onSelectAgent={setSelectedId}
        onSelectArtifact={(a) => console.log('Selected artifact:', a)}
      />
    </div>
  );
}
