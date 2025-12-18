import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronUp, ChevronDown, Pause, Play, Trash2, Terminal, Brain, Eye, Wrench, MessageSquare, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExecutionLog, Agent, Artifact } from '@/stores/agentStore';

interface OmniConsoleProps {
  logs: ExecutionLog[];
  isOpen: boolean;
  onToggle: () => void;
  onClear?: () => void;
  selectedAgent?: Agent | null;
  artifacts?: Artifact[];
  onViewArtifact?: (artifact: Artifact) => void;
}

export function OmniConsole({ 
  logs, 
  isOpen, 
  onToggle, 
  onClear, 
  selectedAgent,
  artifacts = [],
  onViewArtifact 
}: OmniConsoleProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState('stream');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  const formatLogEntry = (log: ExecutionLog) => {
    const time = log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return { time, ...log };
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'decision':
        return <Brain className="w-3 h-3" />;
      case 'action':
        return <Wrench className="w-3 h-3" />;
      case 'artifact':
        return <Zap className="w-3 h-3" />;
      case 'error':
        return <Terminal className="w-3 h-3" />;
      default:
        return <MessageSquare className="w-3 h-3" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'decision':
        return 'bg-muted/50 text-muted-foreground border-l-2 border-muted-foreground';
      case 'action':
        return 'bg-chart-4/10 text-chart-4 border-l-2 border-chart-4';
      case 'artifact':
        return 'bg-chart-3/10 text-chart-3 border-l-2 border-chart-3';
      case 'error':
        return 'bg-destructive/10 text-destructive border-l-2 border-destructive';
      case 'complete':
        return 'bg-card text-foreground border-l-2 border-foreground';
      default:
        return 'bg-muted/30 text-foreground';
    }
  };

  const generateContextPreview = () => {
    if (!selectedAgent) return null;
    
    const steeringContext = `Steering parameters (0-1 scale):
- Autonomy (X): ${selectedAgent.steeringX.toFixed(2)} (${selectedAgent.steeringX < 0.3 ? 'low - ask for guidance often' : selectedAgent.steeringX > 0.7 ? 'high - work independently' : 'medium - balance guidance and autonomy'})
- Speed vs Quality (Y): ${selectedAgent.steeringY.toFixed(2)} (${selectedAgent.steeringY < 0.3 ? 'prioritize speed' : selectedAgent.steeringY > 0.7 ? 'prioritize thoroughness' : 'balanced'})`;

    const enabledTools = selectedAgent.enabledTools || selectedAgent.tools;
    const toolsContext = enabledTools.length > 0 
      ? `Available tools: ${enabledTools.join(', ')}`
      : 'No tools enabled';

    return { steeringContext, toolsContext };
  };

  const context = generateContextPreview();

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
          <Terminal className="w-4 h-4" />
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
              className={cn(isPaused && 'text-chart-4')}
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
              <TabsTrigger data-testid="tab-stream" value="stream" className="gap-1">
                <Terminal className="w-3 h-3" />
                Live Stream
              </TabsTrigger>
              <TabsTrigger data-testid="tab-context" value="context" className="gap-1">
                <Brain className="w-3 h-3" />
                Context Inspector
              </TabsTrigger>
              <TabsTrigger data-testid="tab-preview" value="preview" className="gap-1">
                <Eye className="w-3 h-3" />
                Preview
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="stream" className="h-[calc(100%-48px)] m-0">
            <ScrollArea className="h-full">
              <div ref={scrollRef} className="p-4">
                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No execution logs yet. Start a mission to see agent activity.
                  </p>
                ) : (
                  <div className="space-y-2 font-mono text-xs">
                    {logs.map((log) => {
                      const formatted = formatLogEntry(log);
                      return (
                        <div 
                          key={log.id} 
                          className={cn(
                            'p-2 rounded-r-md transition-colors',
                            getLogColor(log.type)
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getLogIcon(log.type)}
                            <span className="text-muted-foreground">{formatted.time}</span>
                            <span className="font-semibold">{log.agentName}</span>
                            <span className="uppercase text-xs opacity-60">{log.type}</span>
                          </div>
                          <div className="pl-5 text-sm opacity-90">
                            {log.type === 'decision' && log.data.action ? (
                              <span>
                                Action: <strong>{String(log.data.action)}</strong>
                                {log.data.reason ? <span className="opacity-70"> - {String(log.data.reason)}</span> : null}
                              </span>
                            ) : null}
                            {log.type === 'action' ? (
                              <span>
                                Tool: <strong>{String(log.data.tool || '')}</strong>
                                {log.data.result ? <span className="opacity-70"> ({String(log.data.result)})</span> : null}
                              </span>
                            ) : null}
                            {log.type === 'artifact' ? (
                              <span>Created: <strong>{String(log.data.name || '')}</strong> ({String(log.data.type || '')})</span>
                            ) : null}
                            {log.type === 'error' ? (
                              <span className="text-destructive">{String(log.data.error || 'Unknown error')}</span>
                            ) : null}
                            {log.type === 'complete' ? (
                              <span>{String(log.data.reason || 'Task completed')}</span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="context" className="h-[calc(100%-48px)] m-0">
            <ScrollArea className="h-full p-4">
              {selectedAgent ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/30 border">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Agent: {selectedAgent.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">{selectedAgent.description}</p>
                    
                    <div className="space-y-3 font-mono text-xs">
                      <div className="p-2 rounded bg-background">
                        <span className="text-chart-4 font-semibold">System Prompt Injection:</span>
                        <pre className="mt-1 whitespace-pre-wrap text-muted-foreground">
{context?.steeringContext}
                        </pre>
                      </div>
                      
                      <div className="p-2 rounded bg-background">
                        <span className="text-chart-3 font-semibold">Tool Configuration:</span>
                        <pre className="mt-1 whitespace-pre-wrap text-muted-foreground">
{context?.toolsContext}
                        </pre>
                      </div>
                      
                      <div className="p-2 rounded bg-background">
                        <span className="text-chart-1 font-semibold">Token Usage:</span>
                        <pre className="mt-1 whitespace-pre-wrap text-muted-foreground">
Tokens used: {selectedAgent.tokenCount?.toLocaleString() || 0}
Estimated cost: ${(selectedAgent.costSpent || 0).toFixed(6)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Select an agent to inspect its context and configuration.
                </p>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="preview" className="h-[calc(100%-48px)] m-0">
            <ScrollArea className="h-full p-4">
              {artifacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No artifacts created yet. Agents will create artifacts during mission execution.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {artifacts.map((artifact) => (
                    <button
                      key={artifact.id}
                      data-testid={`preview-artifact-${artifact.id}`}
                      onClick={() => onViewArtifact?.(artifact)}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-all hover-elevate',
                        'bg-muted/30'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-chart-3" />
                        <span className="font-semibold text-sm truncate">{artifact.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created by {artifact.createdBy}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Type: {artifact.type}
                      </p>
                      <div className="mt-2 p-2 rounded bg-background/50 font-mono text-xs max-h-20 overflow-hidden">
                        <pre className="whitespace-pre-wrap text-muted-foreground">
                          {artifact.content.slice(0, 150)}
                          {artifact.content.length > 150 && '...'}
                        </pre>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
