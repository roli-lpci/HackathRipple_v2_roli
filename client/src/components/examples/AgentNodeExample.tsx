import { AgentNode } from '../AgentNode';

export default function AgentNodeExample() {
  return (
    <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
      <AgentNode id="1" name="Scraper" status="idle" />
      <AgentNode id="2" name="Analyst" status="working" />
      <AgentNode id="3" name="Writer" status="complete" isSelected />
      <AgentNode id="4" name="Reviewer" status="error" />
    </div>
  );
}
