import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import {
  decomposeGoal,
  getAgentDecision,
  executeToolMock,
  type Agent,
  type Task,
  type Artifact,
  type ExecutionLog,
  type AgentDecision,
} from "./agent-runtime";

interface MissionState {
  agents: Map<string, Agent>;
  tasks: Map<string, Task>;
  artifacts: Map<string, Artifact>;
  logs: ExecutionLog[];
  context: string;
  taskAgentMap: Map<string, number>;
}

const missionState: MissionState = {
  agents: new Map(),
  tasks: new Map(),
  artifacts: new Map(),
  logs: [],
  context: '',
  taskAgentMap: new Map(),
};

function broadcast(wss: WebSocketServer, type: string, payload: unknown) {
  const message = JSON.stringify({ type, payload });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function addLog(wss: WebSocketServer, log: Omit<ExecutionLog, 'id' | 'timestamp'>) {
  const fullLog: ExecutionLog = {
    ...log,
    id: randomUUID(),
    timestamp: new Date(),
  };
  missionState.logs.push(fullLog);
  broadcast(wss, 'log', fullLog);
  return fullLog;
}

async function runAgentLoop(
  wss: WebSocketServer,
  agent: Agent,
  task: Task
) {
  const previousResults: string[] = [];

  agent.status = 'working';
  agent.currentTaskId = task.id;
  broadcast(wss, 'agent_update', agent);

  task.status = 'active';
  broadcast(wss, 'task_update', task);

  while (task.iterationCount < task.maxIterations && task.status === 'active') {
    task.iterationCount++;
    broadcast(wss, 'task_update', task);

    addLog(wss, {
      agentId: agent.id,
      agentName: agent.name,
      type: 'decision',
      data: { iteration: task.iterationCount, status: 'thinking' },
    });

    let decision: AgentDecision;
    try {
      decision = await getAgentDecision(agent, task, missionState.context, previousResults);
    } catch (error) {
      addLog(wss, {
        agentId: agent.id,
        agentName: agent.name,
        type: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      task.status = 'failed';
      agent.status = 'error';
      break;
    }

    addLog(wss, {
      agentId: agent.id,
      agentName: agent.name,
      type: 'decision',
      data: { action: decision.action, reason: decision.reason, tool: decision.tool },
    });

    broadcast(wss, 'message', {
      id: randomUUID(),
      role: 'agent',
      agentId: agent.id,
      agentName: agent.name,
      content: `[${decision.action}] ${decision.reason}`,
      timestamp: new Date(),
    });

    if (decision.action === 'use_tool' && decision.tool) {
      addLog(wss, {
        agentId: agent.id,
        agentName: agent.name,
        type: 'action',
        data: { tool: decision.tool, input: decision.toolInput },
      });

      const toolResult = await executeToolMock(decision.tool, decision.toolInput || {});
      previousResults.push(`Tool: ${decision.tool}\nResult: ${toolResult}`);
      task.outputs.push(toolResult);

      addLog(wss, {
        agentId: agent.id,
        agentName: agent.name,
        type: 'action',
        data: { tool: decision.tool, result: 'completed' },
      });
    } else if (decision.action === 'create_artifact' && decision.artifactName) {
      const artifact: Artifact = {
        id: randomUUID(),
        name: decision.artifactName,
        type: decision.artifactType || 'text',
        content: decision.artifactContent || '',
        createdBy: agent.name,
        createdAt: new Date(),
      };
      missionState.artifacts.set(artifact.id, artifact);

      addLog(wss, {
        agentId: agent.id,
        agentName: agent.name,
        type: 'artifact',
        data: { name: artifact.name, type: artifact.type },
      });

      broadcast(wss, 'artifact', artifact);
      broadcast(wss, 'message', {
        id: randomUUID(),
        role: 'agent',
        agentId: agent.id,
        agentName: agent.name,
        content: `Created artifact: ${artifact.name}`,
        artifactId: artifact.id,
        timestamp: new Date(),
      });

      task.status = 'done';
    } else if (decision.action === 'complete') {
      task.status = 'done';

      broadcast(wss, 'message', {
        id: randomUUID(),
        role: 'agent',
        agentId: agent.id,
        agentName: agent.name,
        content: decision.message || 'Task completed.',
        timestamp: new Date(),
      });
    } else if (decision.action === 'ask_user') {
      task.status = 'blocked';

      broadcast(wss, 'message', {
        id: randomUUID(),
        role: 'agent',
        agentId: agent.id,
        agentName: agent.name,
        content: decision.message || 'I need more information to proceed.',
        timestamp: new Date(),
      });
      break;
    }
  }

  if (task.iterationCount >= task.maxIterations && task.status === 'active') {
    task.status = 'done';
    addLog(wss, {
      agentId: agent.id,
      agentName: agent.name,
      type: 'complete',
      data: { reason: 'max_iterations_reached' },
    });
  }

  agent.status = task.status === 'done' ? 'complete' : task.status === 'failed' ? 'error' : 'idle';
  agent.currentTaskId = undefined;
  broadcast(wss, 'agent_update', agent);
  broadcast(wss, 'task_update', task);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // File upload endpoint for feeding files to agents
  app.post('/api/upload-artifact', async (req, res) => {
    try {
      const { name, content, type = 'text' } = req.body;

      if (!name || !content) {
        return res.status(400).json({ error: 'Name and content are required' });
      }

      const artifact: Artifact = {
        id: randomUUID(),
        name,
        type: type as 'markdown' | 'json' | 'text' | 'code',
        content,
        createdBy: 'User',
        createdAt: new Date(),
      };

      missionState.artifacts.set(artifact.id, artifact);
      broadcast(wss, 'artifact_created', artifact);

      console.log(`Artifact uploaded: ${name}`);
      res.json({ success: true, artifact });
    } catch (error) {
      console.error(`Upload error: ${error}`);
      res.status(500).json({ error: 'Failed to upload artifact' });
    }
  });

  // Initialize coordinator agent for chat
  let coordinatorAgent: Agent | null = null;

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.send(JSON.stringify({ type: 'connected' }));

    // Create coordinator agent on first connection
    if (!coordinatorAgent) {
      coordinatorAgent = {
        id: 'coordinator-agent',
        name: 'Coordinator',
        description: 'Helpful assistant for answering questions about agents, artifacts, and mission progress',
        status: 'idle',
        position: { x: -150, y: -100 },
        steeringX: 0.7,
        steeringY: 0.5,
        tools: [],
      };
      missionState.agents.set(coordinatorAgent.id, coordinatorAgent);
    }

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'god_mode') {
          const userGoal = message.payload.goal;
          missionState.context = userGoal;

          broadcast(wss, 'message', {
            id: randomUUID(),
            role: 'system',
            content: 'Analyzing request and planning mission...',
            timestamp: new Date(),
          });

          addLog(wss, {
            agentId: 'system',
            agentName: 'Mission Control',
            type: 'action',
            data: { action: 'decompose_goal', goal: userGoal },
          });

          const { agents: agentTemplates, tasks: taskTemplates } = await decomposeGoal(userGoal);

          const newAgents: Agent[] = [];
          const newTasks: Task[] = [];
          const agentIdMap = new Map<number, string>();

          agentTemplates.forEach((template, index) => {
            const agent: Agent = {
              ...template,
              id: randomUUID(),
            };
            missionState.agents.set(agent.id, agent);
            newAgents.push(agent);
            agentIdMap.set(index, agent.id);
            broadcast(wss, 'agent', agent);
          });

          taskTemplates.forEach((template, index) => {
            const task: Task = {
              ...template,
              id: randomUUID(),
              assignedAgentId: agentIdMap.get(missionState.taskAgentMap.get(template.goal) ?? index % newAgents.length) || newAgents[0]?.id || '',
            };
            missionState.tasks.set(task.id, task);
            newTasks.push(task);
            broadcast(wss, 'task', task);
          });

          broadcast(wss, 'message', {
            id: randomUUID(),
            role: 'system',
            content: `Created ${newAgents.length} agent(s): ${newAgents.map(a => a.name).join(', ')}. Starting execution...`,
            timestamp: new Date(),
          });

          for (const task of newTasks) {
            const agent = missionState.agents.get(task.assignedAgentId);
            if (agent) {
              await runAgentLoop(wss, agent, task);
            }
          }

          broadcast(wss, 'message', {
            id: randomUUID(),
            role: 'system',
            content: 'Mission complete. All agents have finished their tasks.',
            timestamp: new Date(),
          });
        } else if (message.type === 'chat') {
          const userMessage = message.payload.content;
          
          broadcast(wss, 'message', {
            id: randomUUID(),
            role: 'user',
            content: userMessage,
            timestamp: new Date(),
          });

          // ONLY coordinator agent handles chat - all other agents ignore chat
          if (coordinatorAgent && coordinatorAgent.status !== 'working') {
            coordinatorAgent.status = 'working';
            broadcast(wss, 'agent_update', coordinatorAgent);

            const task: Task = {
              id: randomUUID(),
              goal: `Answer user question: ${userMessage}`,
              status: 'pending',
              assignedAgentId: coordinatorAgent.id,
              inputs: [userMessage],
              outputs: [],
              successCriteria: 'Provide helpful response',
              iterationCount: 0,
              maxIterations: 1,
            };
            missionState.tasks.set(task.id, task);
            await runAgentLoop(wss, coordinatorAgent, task);

            coordinatorAgent.status = 'idle';
            broadcast(wss, 'agent_update', coordinatorAgent);
          }
        } else if (message.type === 'steering_update') {
          const { agentId, steeringX, steeringY } = message.payload;
          const agent = missionState.agents.get(agentId);
          if (agent) {
            agent.steeringX = steeringX;
            agent.steeringY = steeringY;
            broadcast(wss, 'agent_update', agent);
          }
        } else if (message.type === 'reset') {
          missionState.agents.clear();
          missionState.tasks.clear();
          missionState.artifacts.clear();
          missionState.logs = [];
          missionState.context = '';
          broadcast(wss, 'reset', {});
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  app.get('/api/state', (req, res) => {
    res.json({
      agents: Array.from(missionState.agents.values()),
      tasks: Array.from(missionState.tasks.values()),
      artifacts: Array.from(missionState.artifacts.values()),
      logs: missionState.logs,
    });
  });

  app.get('/api/artifacts/:id', (req, res) => {
    const artifact = missionState.artifacts.get(req.params.id);
    if (artifact) {
      res.json(artifact);
    } else {
      res.status(404).json({ error: 'Artifact not found' });
    }
  });

  return httpServer;
}