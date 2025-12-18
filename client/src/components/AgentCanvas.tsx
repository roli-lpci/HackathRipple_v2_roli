import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FlowAgentNode } from './FlowAgentNode';
import { FlowArtifactNode } from './FlowArtifactNode';
import type { Agent, Artifact } from '@/stores/agentStore';

interface AgentCanvasProps {
  agents: Agent[];
  artifacts: Artifact[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string | null) => void;
  onSelectArtifact?: (artifact: Artifact) => void;
  onRerunAgent?: (agentId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const nodeTypes: NodeTypes = {
  agent: FlowAgentNode,
  artifact: FlowArtifactNode,
};

export function AgentCanvas({
  agents,
  artifacts,
  selectedAgentId,
  onSelectAgent,
  onSelectArtifact,
  onRerunAgent,
  isExpanded = false,
  onToggleExpand,
}: AgentCanvasProps) {
  const initialNodes = useMemo(() => {
    const agentNodes: Node[] = agents.map((agent, index) => ({
      id: agent.id,
      type: 'agent',
      position: { x: 100 + index * 200, y: 100 },
      data: {
        ...agent,
        isSelected: selectedAgentId === agent.id,
        onClick: () => onSelectAgent(selectedAgentId === agent.id ? null : agent.id),
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    const artifactNodes: Node[] = artifacts.map((artifact, index) => {
      const creatorAgent = agents.find(a => a.name === artifact.createdBy);
      const creatorIndex = creatorAgent ? agents.indexOf(creatorAgent) : index;
      return {
        id: `artifact-${artifact.id}`,
        type: 'artifact',
        position: { x: 100 + creatorIndex * 200, y: 280 + (index % 3) * 60 },
        data: {
          ...artifact,
          key: `artifact-anim-${artifact.id}-${artifact.createdAt || Date.now()}`,
          onClick: () => onSelectArtifact?.(artifact),
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });

    return [...agentNodes, ...artifactNodes];
  }, [agents, artifacts, selectedAgentId, onSelectAgent, onSelectArtifact]);

  const initialEdges = useMemo(() => {
    const edges: Edge[] = [];

    for (let i = 0; i < agents.length - 1; i++) {
      edges.push({
        id: `edge-${agents[i].id}-${agents[i + 1].id}`,
        source: agents[i].id,
        target: agents[i + 1].id,
        animated: agents[i].status === 'working' || agents[i + 1].status === 'working',
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
        },
      });
    }

    artifacts.forEach((artifact) => {
      const creatorAgent = agents.find(a => a.name === artifact.createdBy);
      if (creatorAgent) {
        edges.push({
          id: `edge-${creatorAgent.id}-artifact-${artifact.id}`,
          source: creatorAgent.id,
          target: `artifact-${artifact.id}`,
          animated: false,
          style: { stroke: 'hsl(var(--chart-3))', strokeWidth: 1.5, strokeDasharray: '5,5' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--chart-3))',
          },
        });
      }
    });

    return edges;
  }, [agents, artifacts]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'agent') {
      onSelectAgent(selectedAgentId === node.id ? null : node.id);
    } else if (node.type === 'artifact' && node.data) {
      const artifact = artifacts.find(a => `artifact-${a.id}` === node.id);
      if (artifact) {
        onSelectArtifact?.(artifact);
      }
    }
  }, [selectedAgentId, onSelectAgent, onSelectArtifact, artifacts]);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'agent') {
      const agent = agents.find(a => a.id === node.id);
      if (agent && agent.status !== 'working') {
        onRerunAgent?.(node.id);
      }
    }
  }, [agents, onRerunAgent]);

  return (
    <div className={cn(
      'flex flex-col h-full bg-card',
      isExpanded && 'fixed inset-4 z-50 rounded-lg border'
    )}>
      <div className="flex items-center justify-between gap-2 py-2 px-4 border-b">
        <span className="text-sm font-semibold">Agent Graph</span>
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
      </div>
      <div className="flex-1 relative overflow-hidden">
        {agents.length === 0 && artifacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
            <Sparkles className="w-8 h-8 text-primary/30" />
            <span>Enter a mission to spawn agents</span>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
            className="bg-background"
          >
            <Background color="hsl(var(--border))" gap={20} size={1} />
            <Controls className="bg-card border rounded-md" />
            <MiniMap 
              className="bg-card border rounded-md"
              nodeColor={(node) => {
                if (node.type === 'artifact') return 'hsl(var(--chart-3))';
                return 'hsl(var(--primary))';
              }}
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
