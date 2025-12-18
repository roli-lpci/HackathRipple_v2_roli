import { ChatThread } from '../ChatThread';
import type { Message, Artifact } from '@/stores/agentStore';

export default function ChatThreadExample() {
  const mockMessages: Message[] = [
    {
      id: '1',
      role: 'user',
      content: 'Create a research team for crypto analysis',
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: '2',
      role: 'system',
      content: 'Spawning 3 agents: Scraper, Analyst, Writer',
      timestamp: new Date(Date.now() - 55000),
    },
    {
      id: '3',
      role: 'agent',
      agentId: 'analyst-1',
      agentName: 'Analyst',
      content: 'I\'ve analyzed the latest crypto market trends. Bitcoin shows a bullish pattern with strong support at $42,000.',
      artifactId: 'artifact-1',
      timestamp: new Date(Date.now() - 30000),
    },
  ];

  const mockArtifacts: Artifact[] = [
    {
      id: 'artifact-1',
      name: 'market_analysis.md',
      type: 'markdown',
      content: '# Market Analysis\n\nBitcoin trending upward...',
      createdBy: 'Analyst',
      createdAt: new Date(),
    },
  ];

  return (
    <div className="h-[500px] border rounded-lg overflow-hidden">
      <ChatThread
        messages={mockMessages}
        artifacts={mockArtifacts}
        onSend={(msg) => console.log('Send:', msg)}
        onViewArtifact={(a) => console.log('View:', a)}
      />
    </div>
  );
}
