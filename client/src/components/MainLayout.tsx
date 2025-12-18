import { useState } from 'react';
import { GodModeInput } from './GodModeInput';
import { ChatThread } from './ChatThread';
import { AgentCanvas } from './AgentCanvas';
import { SteeringControls } from './SteeringControls';
import { OmniConsole } from './OmniConsole';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgentStore } from '@/stores/agentStore';
import { useWebSocket } from '@/hooks/useWebSocket';

export function MainLayout() {
  const {
    agents,
    artifacts,
    messages,
    executionLogs,
    selectedAgentId,
    isConsoleOpen,
    updateAgent,
    selectAgent,
    toggleConsole,
    clearExecutionLogs,
  } = useAgentStore();

  const { sendGodMode, sendChat, updateSteering, resetMission } = useWebSocket();

  const [isLoading, setIsLoading] = useState(false);
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const handleGodModeSubmit = async (value: string) => {
    setIsLoading(true);
    sendGodMode(value);
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

  return (
    <div className="flex flex-col h-screen bg-background">
      <GodModeInput onSubmit={handleGodModeSubmit} isLoading={isLoading} />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[60%] border-r flex flex-col">
          <ChatThread
            messages={messages}
            artifacts={artifacts}
            onSend={handleChatSend}
            onViewArtifact={(artifact) => console.log('View artifact:', artifact)}
            isLoading={isLoading}
          />
        </div>

        <div className="w-[40%] flex flex-col">
          <div className="flex-1 overflow-hidden">
            <AgentCanvas
              agents={agents}
              artifacts={artifacts}
              selectedAgentId={selectedAgentId}
              onSelectAgent={selectAgent}
              onSelectArtifact={(artifact) => console.log('Canvas artifact:', artifact)}
              isExpanded={isCanvasExpanded}
              onToggleExpand={() => setIsCanvasExpanded(!isCanvasExpanded)}
            />
          </div>
          
          {selectedAgent && (
            <ScrollArea className="border-t max-h-[50%]">
              <SteeringControls
                agent={selectedAgent}
                onSteeringChange={handleSteeringChange}
                onToolToggle={(tool, enabled) => console.log('Tool toggle:', tool, enabled)}
              />
            </ScrollArea>
          )}
        </div>
      </div>

      <OmniConsole
        logs={executionLogs}
        isOpen={isConsoleOpen}
        onToggle={toggleConsole}
        onClear={clearExecutionLogs}
      />
    </div>
  );
}
