import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgentNode } from './AgentNode';
import { ArtifactNode } from './ArtifactNode';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent, Artifact } from '@/stores/agentStore';

interface AgentCanvasProps {
  agents: Agent[];
  artifacts: Artifact[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string | null) => void;
  onSelectArtifact?: (artifact: Artifact) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function AgentCanvas({
  agents,
  artifacts,
  selectedAgentId,
  onSelectAgent,
  onSelectArtifact,
  isExpanded = false,
  onToggleExpand,
}: AgentCanvasProps) {
  return (
    <Card className={cn(
      'flex flex-col h-full',
      isExpanded && 'fixed inset-4 z-50'
    )}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-3 px-4">
        <CardTitle className="text-sm">Agent Graph</CardTitle>
        {onToggleExpand && (
          <Button
            data-testid="button-toggle-canvas-expand"
            size="icon"
            variant="ghost"
            onClick={onToggleExpand}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 relative overflow-auto p-4">
        <div 
          className="min-h-[200px] h-full rounded-lg border border-dashed bg-muted/20"
          style={{
            backgroundImage: `
              radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        >
          {agents.length === 0 && artifacts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No agents spawned yet
            </div>
          ) : (
            <div className="p-4">
              <div className="flex flex-wrap gap-4 justify-center mb-6">
                {agents.map((agent) => (
                  <AgentNode
                    key={agent.id}
                    id={agent.id}
                    name={agent.name}
                    status={agent.status}
                    isSelected={selectedAgentId === agent.id}
                    onClick={() => onSelectAgent(selectedAgentId === agent.id ? null : agent.id)}
                  />
                ))}
              </div>
              {artifacts.length > 0 && (
                <div className="border-t border-dashed pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Artifacts</p>
                  <div className="flex flex-wrap gap-2">
                    {artifacts.map((artifact) => (
                      <ArtifactNode
                        key={artifact.id}
                        id={artifact.id}
                        name={artifact.name}
                        type={artifact.type}
                        onClick={() => onSelectArtifact?.(artifact)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
