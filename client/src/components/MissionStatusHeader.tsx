import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Target, Zap, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent, Task, ExecutionLog } from '@/stores/agentStore';

interface MissionStatusHeaderProps {
  agents: Agent[];
  tasks: Task[];
  lastLog?: ExecutionLog;
  currentGoal?: string;
}

export function MissionStatusHeader({ agents, tasks, lastLog, currentGoal }: MissionStatusHeaderProps) {
  const workingAgent = agents.find(a => a.status === 'working');
  const errorAgent = agents.find(a => a.status === 'error');
  const completedCount = agents.filter(a => a.status === 'complete').length;
  const hasError = !!errorAgent;
  const isIdle = !workingAgent && !hasError && agents.length > 0;
  const isEmpty = agents.length === 0;

  const totalTokens = agents.reduce((sum, a) => sum + (a.tokenCount || 0), 0);
  const totalCost = agents.reduce((sum, a) => sum + (a.costSpent || 0), 0);

  return (
    <Card className="flex items-center gap-4 px-4 py-2 mx-4 mt-2 mb-0 border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Target className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm font-medium truncate" data-testid="text-current-goal">
          {currentGoal || (isEmpty ? 'Enter a mission to begin...' : 'Mission active')}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isEmpty ? (
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            Awaiting mission
          </Badge>
        ) : hasError ? (
          <Badge variant="destructive" className="gap-1 animate-pulse" data-testid="badge-error">
            <AlertTriangle className="w-3 h-3" />
            {errorAgent.name} Error
          </Badge>
        ) : workingAgent ? (
          <Badge className="gap-1 bg-chart-4/20 text-chart-4 border-chart-4/50" data-testid="badge-working">
            <Activity className="w-3 h-3 animate-pulse" />
            {workingAgent.name} working...
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-chart-3" data-testid="badge-idle">
            <CheckCircle className="w-3 h-3" />
            {completedCount > 0 ? `${completedCount} complete` : 'Idle'}
          </Badge>
        )}

        {lastLog && (
          <div className={cn(
            'text-xs px-2 py-1 rounded bg-muted/50 max-w-[200px] truncate',
            lastLog.type === 'error' && 'bg-destructive/20 text-destructive'
          )} data-testid="text-last-action">
            {lastLog.type === 'decision' && `Decided: ${String(lastLog.data.action || 'thinking')}`}
            {lastLog.type === 'action' && `Tool: ${String(lastLog.data.tool || '')}`}
            {lastLog.type === 'artifact' && `Created: ${String(lastLog.data.name || '')}`}
            {lastLog.type === 'error' && `Error: ${String(lastLog.data.error || '').slice(0, 30)}`}
            {lastLog.type === 'complete' && 'Task complete'}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground border-l pl-3">
          <Zap className="w-3 h-3" />
          <span data-testid="text-total-tokens">{totalTokens.toLocaleString()} tokens</span>
          <span className="text-chart-1" data-testid="text-total-cost">${totalCost.toFixed(4)}</span>
        </div>
      </div>
    </Card>
  );
}
