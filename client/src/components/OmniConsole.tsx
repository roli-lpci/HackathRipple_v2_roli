import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronUp, ChevronDown, Pause, Play, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExecutionLog } from '@/stores/agentStore';

interface OmniConsoleProps {
  logs: ExecutionLog[];
  isOpen: boolean;
  onToggle: () => void;
  onClear?: () => void;
}

export function OmniConsole({ logs, isOpen, onToggle, onClear }: OmniConsoleProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState('stream');

  const formatLogEntry = (log: ExecutionLog) => {
    const time = log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return { time, ...log };
  };

  return (
    <div className={cn(
      'border-t bg-card transition-all duration-300',
      isOpen ? 'h-[40vh]' : 'h-10'
    )}>
      <div className="flex items-center justify-between h-10 px-4 border-b">
        <button
          data-testid="button-toggle-console"
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-medium hover-elevate px-2 py-1 rounded"
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          <span>Omni-Console</span>
          {logs.length > 0 && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{logs.length}</span>
          )}
        </button>
        {isOpen && (
          <div className="flex items-center gap-2">
            <Button
              data-testid="button-pause-console"
              size="icon"
              variant="ghost"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button
              data-testid="button-clear-console"
              size="icon"
              variant="ghost"
              onClick={onClear}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      {isOpen && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100%-40px)]">
          <div className="px-4 pt-2">
            <TabsList>
              <TabsTrigger data-testid="tab-stream" value="stream">Live Stream</TabsTrigger>
              <TabsTrigger data-testid="tab-decisions" value="decisions">Decisions</TabsTrigger>
              <TabsTrigger data-testid="tab-context" value="context">Context</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="stream" className="h-[calc(100%-48px)] m-0">
            <ScrollArea className="h-full p-4">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No execution logs yet
                </p>
              ) : (
                <div className="space-y-1 font-mono text-xs">
                  {logs.map((log) => {
                    const formatted = formatLogEntry(log);
                    return (
                      <div key={log.id} className="flex gap-2">
                        <span className="text-muted-foreground shrink-0">{formatted.time}</span>
                        <span className={cn(
                          'shrink-0 uppercase w-16',
                          log.type === 'decision' && 'text-chart-1',
                          log.type === 'action' && 'text-chart-4',
                          log.type === 'artifact' && 'text-chart-3',
                          log.type === 'error' && 'text-destructive'
                        )}>
                          [{log.type}]
                        </span>
                        <span className="text-muted-foreground shrink-0">{log.agentName}:</span>
                        <span className="text-foreground break-all">
                          {JSON.stringify(log.data)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="decisions" className="h-[calc(100%-48px)] m-0">
            <ScrollArea className="h-full p-4">
              {logs.filter(l => l.type === 'decision').length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No decisions logged
                </p>
              ) : (
                <div className="space-y-3">
                  {logs.filter(l => l.type === 'decision').map((log) => (
                    <div key={log.id} className="p-3 rounded-lg bg-muted/50 font-mono text-xs">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">{log.agentName}</span>
                        <span className="text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="whitespace-pre-wrap text-muted-foreground">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="context" className="h-[calc(100%-48px)] m-0">
            <ScrollArea className="h-full p-4">
              <p className="text-sm text-muted-foreground text-center py-8">
                Context inspector coming soon
              </p>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
