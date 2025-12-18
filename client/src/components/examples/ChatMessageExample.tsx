import { ChatMessage } from '../ChatMessage';

export default function ChatMessageExample() {
  return (
    <div className="p-4 space-y-4">
      <ChatMessage 
        role="user" 
        content="Create a research team for crypto analysis" 
        timestamp={new Date()} 
      />
      <ChatMessage 
        role="agent" 
        content="I'll create a team of 3 specialized agents for crypto analysis: a Scraper to gather market data, an Analyst to process trends, and a Writer to compile the report."
        agentName="Orchestrator"
        timestamp={new Date()} 
      />
      <ChatMessage 
        role="system" 
        content="3 agents spawned: Scraper, Analyst, Writer"
        timestamp={new Date()} 
      />
    </div>
  );
}
