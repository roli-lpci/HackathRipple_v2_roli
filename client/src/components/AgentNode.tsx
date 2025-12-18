import { cn } from '@/lib/utils';
import { Bot, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { AgentStatus } from '@/stores/agentStore';

interface AgentNodeProps {
  id: string;
  name: string;
  status: AgentStatus;
  isSelected?: boolean;
  onClick?: () => void;
}

const statusConfig = {
  idle: { icon: Bot, color: 'bg-chart-3', ring: 'ring-chart-3/30', label: 'Idle' },
  working: { icon: Loader2, color: 'bg-chart-4', ring: 'ring-chart-4/30', label: 'Working' },
  complete: { icon: CheckCircle, color: 'bg-chart-1', ring: 'ring-chart-1/30', label: 'Complete' },
  error: { icon: AlertCircle, color: 'bg-destructive', ring: 'ring-destructive/30', label: 'Error' },
};

export function AgentNode({ id, name, status, isSelected = false, onClick }: AgentNodeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      data-testid={`agent-node-${id}`}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-3 cursor-pointer transition-transform',
        isSelected && 'scale-105'
      )}
    >
      <div
        className={cn(
          'relative w-16 h-16 rounded-full flex items-center justify-center',
          'bg-card border-2 transition-all',
          isSelected ? 'border-primary ring-4 ring-primary/20' : 'border-border',
          status === 'working' && 'animate-pulse'
        )}
      >
        <Icon 
          className={cn(
            'w-7 h-7',
            status === 'working' && 'animate-spin',
            status === 'idle' && 'text-muted-foreground',
            status === 'complete' && 'text-chart-3',
            status === 'error' && 'text-destructive'
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
        <p className="text-sm font-semibold truncate max-w-[80px]">{name}</p>
        <p className={cn(
          'text-xs font-medium uppercase tracking-wide',
          status === 'idle' && 'text-muted-foreground',
          status === 'working' && 'text-chart-4',
          status === 'complete' && 'text-chart-3',
          status === 'error' && 'text-destructive'
        )}>
          {config.label}
        </p>
      </div>
    </div>
  );
}
