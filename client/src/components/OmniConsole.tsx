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
    
    const autonomyLevel = selectedAgent.steeringX < 0.3 ? 'low' : selectedAgent.steeringX > 0.7 ? 'high' : 'medium';
    const qualityLevel = selectedAgent.steeringY < 0.3 ? 'speed' : selectedAgent.steeringY > 0.7 ? 'quality' : 'balanced';
    
    const autonomyInstruction = {
      low: 'Ask the user for confirmation before taking significant actions. Request guidance when uncertain.',
      medium: 'Use your judgment for routine tasks but consult the user for important decisions.',
      high: 'Work independently. Only pause for critical blockers. Make autonomous decisions.'
    }[autonomyLevel];
    
    const qualityInstruction = {
      speed: 'Prioritize speed and efficiency. Provide concise responses. Skip edge cases.',
      balanced: 'Balance thoroughness with efficiency. Cover main scenarios.',
      quality: 'Be thorough and meticulous. Consider all edge cases. Provide comprehensive analysis.'
    }[qualityLevel];
    
    const enabledTools = selectedAgent.enabledTools || selectedAgent.tools;
    const disabledTools = selectedAgent.tools.filter(t => !enabledTools.includes(t));
    
    const toolInstructions = disabledTools.length > 0 
      ? `\n\nDISABLED TOOLS (DO NOT USE): ${disabledTools.join(', ')}`
      : '';
    
    const systemPrompt = `You are ${selectedAgent.name}, ${selectedAgent.description.toLowerCase()}.

AUTONOMY (X=${(selectedAgent.steeringX * 100).toFixed(0)}%):
${autonomyInstruction}

QUALITY/SPEED (Y=${(selectedAgent.steeringY * 100).toFixed(0)}%):
${qualityInstruction}

AVAILABLE TOOLS: ${enabledTools.length > 0 ? enabledTools.join(', ') : 'None'}${toolInstructions}`;

    return { 
      systemPrompt,
      tokenCount: selectedAgent.tokenCount || 0,
      costSpent: selectedAgent.costSpent || 0,
      enabledTools,
      disabledTools
    };
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
              {selectedAgent && context ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      {selectedAgent.name} - Live System Prompt
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{context.tokenCount.toLocaleString()} tokens</span>
                      <span className="text-chart-1">${context.costSpent.toFixed(4)}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/30 border font-mono text-xs leading-relaxed">
                    <pre className="whitespace-pre-wrap text-foreground">{context.systemPrompt}</pre>
                  </div>
                  
                  {context.disabledTools.length > 0 && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                      <div className="flex items-center gap-2 text-destructive text-xs font-semibold mb-1">
                        <Wrench className="w-3 h-3" />
                        Disabled Tools
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {context.disabledTools.map(tool => (
                          <span key={tool} className="px-2 py-0.5 rounded bg-destructive/20 text-destructive text-xs">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Move the steering controls to see this prompt update in real-time
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Brain className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Select an agent on the graph to inspect its system prompt
                  </p>
                </div>
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
