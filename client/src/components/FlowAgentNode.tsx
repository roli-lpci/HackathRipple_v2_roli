import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Bot, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { AgentStatus } from '@/stores/agentStore';

interface FlowAgentNodeData {
  id: string;
  name: string;
  status: AgentStatus;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const statusConfig = {
  idle: { icon: Bot, color: 'bg-chart-3', borderColor: 'border-chart-3', label: 'Idle' },
  working: { icon: Loader2, color: 'bg-chart-4', borderColor: 'border-chart-4', label: 'Working' },
  complete: { icon: CheckCircle, color: 'bg-chart-1', borderColor: 'border-chart-1', label: 'Complete' },
  error: { icon: AlertCircle, color: 'bg-destructive', borderColor: 'border-destructive', label: 'Error' },
};

function AgentNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as FlowAgentNodeData;
  const config = statusConfig[nodeData.status];
  const Icon = config.icon;

  return (
    <div
      data-testid={`agent-node-${nodeData.id}`}
      className={cn(
        'flex flex-col items-center gap-2 p-4 cursor-pointer transition-all',
        'bg-card rounded-xl border-2 shadow-lg min-w-[120px]',
        nodeData.isSelected ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-border',
        nodeData.status === 'working' && 'animate-pulse'
      )}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      
      <div
        className={cn(
          'relative w-14 h-14 rounded-full flex items-center justify-center',
          'bg-accent/50 transition-all'
        )}
      >
        <Icon 
          className={cn(
            'w-7 h-7',
            nodeData.status === 'working' && 'animate-spin text-chart-4',
            nodeData.status === 'idle' && 'text-muted-foreground',
            nodeData.status === 'complete' && 'text-chart-3',
            nodeData.status === 'error' && 'text-destructive'
          )} 
        />
        <div
          className={cn(
            'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card',
            config.color
          )}
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm font-semibold truncate max-w-[100px]">{nodeData.name}</p>
        <p className={cn(
          'text-xs font-medium uppercase tracking-wide',
          nodeData.status === 'idle' && 'text-muted-foreground',
          nodeData.status === 'working' && 'text-chart-4',
          nodeData.status === 'complete' && 'text-chart-3',
          nodeData.status === 'error' && 'text-destructive'
        )}>
          {config.label}
        </p>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </div>
  );
}

export const FlowAgentNode = memo(AgentNodeComponent);
