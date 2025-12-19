import { useEffect, useRef, useCallback } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import type { Agent, Artifact, ExecutionLog, Message } from '@/stores/agentStore';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const {
    addAgent,
    updateAgent,
    addTask,
    updateTask,
    addArtifact,
    addMessage,
    addExecutionLog,
    reset,
  } = useAgentStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);

        switch (type) {
          case 'init':
            reset();
            payload.agents.forEach((agent: Agent) => addAgent(agent));
            payload.artifacts.forEach((artifact: Artifact) => addArtifact(artifact));
            payload.logs.forEach((log: ExecutionLog) => addExecutionLog(log));
            break;
          case 'agent':
            addAgent(payload as Agent);
            break;
          case 'agent_update':
            updateAgent(payload.id, payload);
            break;
          case 'task':
            addTask(payload);
            break;
          case 'task_update':
            updateTask(payload.id, payload);
            break;
          case 'artifact':
            addArtifact(payload as Artifact);
            break;
          case 'message':
            addMessage({
              ...payload,
              timestamp: new Date(payload.timestamp),
            } as Message);
            break;
          case 'log':
            addExecutionLog({
              ...payload,
              timestamp: new Date(payload.timestamp),
            } as ExecutionLog);
            break;
          case 'reset':
            reset();
            break;
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting...');
      reconnectTimeoutRef.current = setTimeout(connect, 2000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [addAgent, updateAgent, addTask, updateTask, addArtifact, addMessage, addExecutionLog, reset]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((type: string, payload: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const sendGodMode = useCallback((goal: string) => {
    sendMessage('god_mode', { goal });
  }, [sendMessage]);

  const sendChat = useCallback((content: string) => {
    sendMessage('chat', { content });
  }, [sendMessage]);

  const updateSteering = useCallback((agentId: string, steeringX: number, steeringY: number) => {
    sendMessage('steering_update', { agentId, steeringX, steeringY });
  }, [sendMessage]);

  const resetMission = useCallback(() => {
    sendMessage('reset', {});
  }, [sendMessage]);

  const toggleTool = useCallback((agentId: string, tool: string, enabled: boolean) => {
    sendMessage('tool_toggle', { agentId, tool, enabled });
  }, [sendMessage]);

  const rerunAgent = useCallback((agentId: string, maxDurationSeconds?: number, runIntervalMinutes?: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'rerun_agent',
        agentId,
        maxDurationSeconds,
        runIntervalMinutes,
      }));
    }
  }, [sendMessage]);

  return {
    sendGodMode,
    sendChat,
    updateSteering,
    toggleTool,
    resetMission,
    rerunAgent,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}