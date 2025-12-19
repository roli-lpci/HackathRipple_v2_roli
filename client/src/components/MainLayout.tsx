import { useState } from 'react';
import { ChatThread } from './ChatThread';
import { AgentCanvas } from './AgentCanvas';
import { SteeringControls } from './SteeringControls';
import { OmniConsole } from './OmniConsole';
import { ArtifactViewer } from './ArtifactViewer';
import { MissionStatusHeader } from './MissionStatusHeader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Loader2, PanelLeftClose, PanelLeft, Clock, Play, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAgentStore } from '@/stores/agentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';
import type { Artifact, Agent } from '@/stores/agentStore';
import { TutorialDialog } from './TutorialDialog';

export function MainLayout() {
  const {
    agents,
    tasks,
    artifacts,
    messages,
    executionLogs,
    selectedAgentId,
    isConsoleOpen,
    schedule,
    updateAgent,
    selectAgent,
    toggleConsole,
    clearExecutionLogs,
    addArtifact,
    addAgent,
    addMessage,
  } = useAgentStore();

  const { sendGodMode, sendChat, updateSteering, toggleTool, rerunAgent, scheduleTask, cancelSchedule } = useWebSocket();

  const [isLoading, setIsLoading] = useState(false);
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);
  const [viewingArtifact, setViewingArtifact] = useState<Artifact | null>(null);
  const [commandInput, setCommandInput] = useState('');
  const [currentGoal, setCurrentGoal] = useState('');
  const [isGraphCollapsed, setIsGraphCollapsed] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(true); // State for tutorial dialog
  const [isAdvancedMode, setIsAdvancedMode] = useState(false); // State for mode selection
  const [scheduleIntervalInput, setScheduleIntervalInput] = useState(1);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const handleStartSchedule = () => {
    if (commandInput.trim()) {
      scheduleTask(commandInput.trim(), scheduleIntervalInput);
    }
  };
  const lastLog = executionLogs[executionLogs.length - 1];

  const handleGodModeSubmit = async (value: string) => {
    if (!value.trim()) return;
    setIsLoading(true);
    setCurrentGoal(value);
    sendGodMode(value);
    setCommandInput('');
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleChatSend = (message: string) => {
    sendChat(message);
  };

  const handleSteeringChange = (x: number, y: number) => {
    if (selectedAgentId) {
      updateAgent(selectedAgentId, { steeringX: x, steeringY: y });
      updateSteering(selectedAgentId, x, y);
    }
  };

  const handleToolToggle = (tool: string, enabled: boolean) => {
    if (selectedAgentId && selectedAgent) {
      const newEnabledTools = enabled
        ? [...(selectedAgent.enabledTools || selectedAgent.tools), tool]
        : (selectedAgent.enabledTools || selectedAgent.tools).filter(t => t !== tool);
      updateAgent(selectedAgentId, { enabledTools: newEnabledTools });
      toggleTool(selectedAgentId, tool, enabled);
    }
  };

  const handleViewArtifact = (artifact: Artifact) => {
    setViewingArtifact(artifact);
  };

  const handleCloseTutorial = () => {
    setIsTutorialOpen(false);
  };

  const handleToggleMode = () => {
    setIsAdvancedMode(!isAdvancedMode);
  };

  const handleRerunAgent = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    updateAgent(agentId, { 
      status: 'working',
      lastAppliedSteeringX: agent.steeringX,
      lastAppliedSteeringY: agent.steeringY,
    });

    try {
      const response = await fetch('/api/agent/rerun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId,
          steeringX: agent.steeringX,
          steeringY: agent.steeringY,
          enabledTools: agent.enabledTools,
        }),
      });

      if (!response.ok) throw new Error('Failed to rerun agent');

      const result = await response.json();

      updateAgent(agentId, { 
        status: 'complete',
        tokenCount: result.tokenCount || agent.tokenCount,
        costSpent: result.costSpent || agent.costSpent,
      });

      if (result.artifact) {
        addArtifact({
          id: `artifact-${Date.now()}`,
          name: result.artifact.name,
          type: result.artifact.type,
          content: result.artifact.content,
          createdBy: agent.name,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to rerun agent:', error);
      updateAgent(agentId, { status: 'error' });
    }
  };

  const handleAddAgent = (agentData: {
    name: string;
    description: string;
    tools: string[];
    position: { x: number; y: number };
  }) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: agentData.name,
      description: agentData.description,
      status: 'idle',
      position: agentData.position,
      steeringX: 0.5,
      steeringY: 0.5,
      tools: agentData.tools,
      enabledTools: agentData.tools,
      tokenCount: 0,
      costSpent: 0,
    };

    addAgent(newAgent);

    addMessage({
      id: `msg-${Date.now()}`,
      role: 'system',
      content: `New agent "${agentData.name}" added to the system.`,
      timestamp: new Date(),
    });
  };


  return (
    <div className="flex flex-col h-screen bg-background">
      <TutorialDialog isOpen={isTutorialOpen} onClose={handleCloseTutorial} />

      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card/50">
        <form
          onSubmit={(e) => { e.preventDefault(); handleGodModeSubmit(commandInput); }}
          className="flex-1 flex gap-2"
        >
          <div className="flex items-center gap-2 px-3 text-primary">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-sm hidden sm:inline">Agent Synapse</span>
          </div>

          {!isAdvancedMode ? (
            <Input
              data-testid="input-god-mode"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Dream your agent team... (e.g., 'Research AI trends and write a report')"
              className="flex-1 max-w-xl"
              disabled={isLoading}
            />
          ) : (
            <div className="flex-1 flex items-center gap-2">
              <Input
                data-testid="input-god-mode-advanced"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Detailed prompt..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button variant="outline" className="flex-shrink-0">Upload Files</Button>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !commandInput.trim()}
            data-testid="button-god-mode-submit"
            className="gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">{isAdvancedMode ? "Run" : "Spawn"}</span>
          </Button>
        </form>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsGraphCollapsed(!isGraphCollapsed)}
          data-testid="button-toggle-graph"
        >
          {isGraphCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </Button>
        <Button
          variant="outline"
          onClick={handleToggleMode}
          data-testid="button-toggle-mode"
        >
          {isAdvancedMode ? "Simple Mode" : "Advanced Mode"}
        </Button>
      </header>

      {isAdvancedMode && (
        <div className="px-4 py-2 border-b bg-muted/30 flex items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Scheduled Execution</span>
          </div>
          <span className="text-sm text-muted-foreground">Run every</span>
          <Input
            data-testid="input-schedule-interval"
            type="number"
            min={0.5}
            max={60}
            step={0.5}
            value={scheduleIntervalInput}
            onChange={(e) => setScheduleIntervalInput(Math.max(0.5, parseFloat(e.target.value) || 1))}
            disabled={isLoading || schedule.isActive}
            className="w-20 h-8"
          />
          <span className="text-sm text-muted-foreground">minutes</span>

          {!schedule.isActive ? (
            <Button
              data-testid="button-start-schedule"
              onClick={handleStartSchedule}
              disabled={!commandInput.trim() || isLoading}
              size="sm"
              variant="outline"
              className="gap-1"
            >
              <Play className="w-3 h-3" />
              Start Schedule
            </Button>
          ) : (
            <Button
              data-testid="button-stop-schedule"
              onClick={cancelSchedule}
              size="sm"
              variant="destructive"
              className="gap-1"
            >
              <Square className="w-3 h-3" />
              Stop
            </Button>
          )}

          {schedule.isActive && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
              <span className="text-xs">Active: every {schedule.intervalMinutes} min</span>
              <Badge variant="secondary" className="text-xs">
                Run #{schedule.runCount}
              </Badge>
            </div>
          )}
        </div>
      )}

      <MissionStatusHeader
        agents={agents}
        tasks={tasks}
        lastLog={lastLog}
        currentGoal={currentGoal}
      />

      <div className="flex-1 flex overflow-hidden">
        {!isGraphCollapsed && (
          <div className="flex flex-col border-r w-[50%]">
            <div className="flex-1 overflow-hidden">
              <AgentCanvas
                agents={agents}
                artifacts={artifacts}
                selectedAgentId={selectedAgentId}
                onSelectAgent={selectAgent}
                onSelectArtifact={handleViewArtifact}
                onRerunAgent={handleRerunAgent}
                onAddAgent={handleAddAgent}
                isExpanded={isCanvasExpanded}
                onToggleExpand={() => setIsCanvasExpanded(!isCanvasExpanded)}
              />
            </div>

            {selectedAgent && (
              <div className="border-t max-h-[40%] overflow-hidden">
                <ScrollArea className="h-full">
                  <SteeringControls
                    agent={selectedAgent}
                    onSteeringChange={handleSteeringChange}
                    onRerun={rerunAgent}
                    onToolToggle={handleToolToggle}
                  />
                </ScrollArea>
              </div>
            )}
          </div>
        )}

        <div className={cn(
          'flex flex-col transition-all duration-300',
          isGraphCollapsed ? 'w-full' : 'w-[50%]'
        )}>
          <div className="flex-1 overflow-hidden">
            <ChatThread
              messages={messages}
              artifacts={artifacts}
              onSend={handleChatSend}
              onViewArtifact={handleViewArtifact}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      <OmniConsole
        logs={executionLogs}
        isOpen={isConsoleOpen}
        onToggle={toggleConsole}
        onClear={clearExecutionLogs}
        selectedAgent={selectedAgent}
        artifacts={artifacts}
        onViewArtifact={handleViewArtifact}
      />

      <ArtifactViewer
        artifact={viewingArtifact}
        isOpen={viewingArtifact !== null}
        onClose={() => setViewingArtifact(null)}
      />
    </div>
  );
}