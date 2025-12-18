import { useState } from 'react';
import { OmniConsole } from '../OmniConsole';
import type { ExecutionLog } from '@/stores/agentStore';

export default function OmniConsoleExample() {
  const [isOpen, setIsOpen] = useState(true);

  const mockLogs: ExecutionLog[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5000),
      agentId: 'analyst-1',
      agentName: 'Analyst',
      type: 'decision',
      data: { action: 'use_tool', tool: 'web_search', reason: 'Need market data' },
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3000),
      agentId: 'analyst-1',
      agentName: 'Analyst',
      type: 'action',
      data: { tool: 'web_search', query: 'Bitcoin price trends 2024' },
    },
    {
      id: '3',
      timestamp: new Date(),
      agentId: 'analyst-1',
      agentName: 'Analyst',
      type: 'artifact',
      data: { name: 'market_data.json', type: 'json' },
    },
  ];

  return (
    <div className="h-[300px] border rounded-lg overflow-hidden">
      <div className="h-[calc(100%-40vh)] bg-muted/20" />
      <OmniConsole
        logs={mockLogs}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        onClear={() => console.log('Clear logs')}
      />
    </div>
  );
}
