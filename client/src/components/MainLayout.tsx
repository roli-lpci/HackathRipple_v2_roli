import { useState } from 'react';
import { GodModeInput } from './GodModeInput';
import { ChatThread } from './ChatThread';
import { AgentCanvas } from './AgentCanvas';
import { SteeringControls } from './SteeringControls';
import { OmniConsole } from './OmniConsole';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgentStore } from '@/stores/agentStore';
import type { Message, Agent, Artifact, ExecutionLog } from '@/stores/agentStore';

export function MainLayout() {
  const {
    agents,
    artifacts,
    messages,
    executionLogs,
    selectedAgentId,
    isConsoleOpen,
    addMessage,
    addAgent,
    addArtifact,
    addExecutionLog,
    updateAgent,
    selectAgent,
    toggleConsole,
    clearExecutionLogs,
  } = useAgentStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const handleGodModeSubmit = async (value: string) => {
    setIsLoading(true);
    
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: value,
      timestamp: new Date(),
    });

    await new Promise(r => setTimeout(r, 1000));

    addMessage({
      id: crypto.randomUUID(),
      role: 'system',
      content: 'Analyzing request and spawning agents...',
      timestamp: new Date(),
    });

    await new Promise(r => setTimeout(r, 500));

    const newAgents: Agent[] = [
      {
        id: crypto.randomUUID(),
        name: 'Researcher',
        description: 'Gathers and analyzes information from various sources',
        status: 'idle',
        position: { x: 0, y: 0 },
        steeringX: 0.5,
        steeringY: 0.5,
        tools: ['web_search', 'analyze_data'],
      },
      {
        id: crypto.randomUUID(),
        name: 'Analyst',
        description: 'Processes data and identifies patterns',
        status: 'idle',
        position: { x: 100, y: 0 },
        steeringX: 0.5,
        steeringY: 0.5,
        tools: ['analyze_data', 'code_writer'],
      },
      {
        id: crypto.randomUUID(),
        name: 'Writer',
        description: 'Creates reports and documentation',
        status: 'idle',
        position: { x: 200, y: 0 },
        steeringX: 0.5,
        steeringY: 0.5,
        tools: ['code_writer'],
      },
    ];

    newAgents.forEach(agent => addAgent(agent));

    addMessage({
      id: crypto.randomUUID(),
      role: 'system',
      content: `Created ${newAgents.length} agents: ${newAgents.map(a => a.name).join(', ')}`,
      timestamp: new Date(),
    });

    addExecutionLog({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      agentId: 'system',
      agentName: 'System',
      type: 'action',
      data: { action: 'spawn_agents', count: newAgents.length },
    });

    await new Promise(r => setTimeout(r, 500));

    updateAgent(newAgents[0].id, { status: 'working' });
    
    addExecutionLog({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      agentId: newAgents[0].id,
      agentName: newAgents[0].name,
      type: 'decision',
      data: { action: 'use_tool', tool: 'web_search', reason: 'Starting research' },
    });

    await new Promise(r => setTimeout(r, 1500));

    const artifactId = crypto.randomUUID();
    const newArtifact: Artifact = {
      id: artifactId,
      name: 'research_findings.md',
      type: 'markdown',
      content: '# Research Findings\n\n## Overview\nBased on the analysis...',
      createdBy: newAgents[0].name,
      createdAt: new Date(),
    };
    addArtifact(newArtifact);

    addExecutionLog({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      agentId: newAgents[0].id,
      agentName: newAgents[0].name,
      type: 'artifact',
      data: { name: newArtifact.name, type: newArtifact.type },
    });

    updateAgent(newAgents[0].id, { status: 'complete' });

    addMessage({
      id: crypto.randomUUID(),
      role: 'agent',
      agentId: newAgents[0].id,
      agentName: newAgents[0].name,
      content: 'I\'ve completed the initial research. Here are my findings.',
      artifactId: artifactId,
      timestamp: new Date(),
    });

    setIsLoading(false);
  };

  const handleChatSend = (message: string) => {
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    setTimeout(() => {
      if (agents.length > 0) {
        const agent = agents[0];
        addMessage({
          id: crypto.randomUUID(),
          role: 'agent',
          agentId: agent.id,
          agentName: agent.name,
          content: `I understand. Let me process your request: "${message}"`,
          timestamp: new Date(),
        });
      }
    }, 1000);
  };

  const handleSteeringChange = (x: number, y: number) => {
    if (selectedAgentId) {
      updateAgent(selectedAgentId, { steeringX: x, steeringY: y });
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
