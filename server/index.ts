import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();

// Assume these types and functions are defined elsewhere
// import { type Agent, type Task, decomposeGoal, getAgentDecision } from './agent';
// const socket = {
//   on: (event: string, handler: (data: any) => void) => {},
//   emit: (event: string, data: any) => {},
// };

// Mock implementations for demonstration
interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'working' | 'error';
  position: { x: number; y: number };
  steeringX: number;
  steeringY: number;
  tools: string[];
}

interface Task {
  id: string;
  goal: string;
  status: 'active' | 'completed' | 'failed';
  assignedAgentId: string;
  inputs: string[];
  outputs: string[];
  successCriteria: string;
  iterationCount: number;
  maxIterations: number;
}

async function decomposeGoal(goal: string): Promise<{ agents: Agent[]; tasks: Task[] }> {
  console.log(`Decomposing goal: ${goal}`);
  // Mock decomposition logic
  return {
    agents: [{ id: 'mock-agent-1', name: 'Researcher', description: 'Researches topics', status: 'idle', position: { x: 0, y: 0 }, steeringX: 0.5, steeringY: 0.5, tools: ['web_search'] }],
    tasks: [{ id: 'mock-task-1', goal: `Research ${goal}`, status: 'active', assignedAgentId: 'mock-agent-1', inputs: [goal], outputs: [], successCriteria: 'Provide summary', iterationCount: 0, maxIterations: 1 }],
  };
}

async function getAgentDecision(agent: Agent, task: Task, userMessage: string, chatHistory: any[]): Promise<{ action: string; reason: string; message?: string }> {
  console.log(`Agent ${agent.name} deciding on task "${task.goal}" for message: "${userMessage}"`);
  // Mock decision logic
  if (task.goal.includes("Answer the user's question")) {
    return { action: 'respond', reason: 'Directly answering user question', message: `I am the coordinator. You asked: "${userMessage}". I will try to help.` };
  }
  return { action: 'continue', reason: 'Continuing task execution' };
}

// WebSocket setup would typically go here, for example using Socket.IO
// For this example, we'll just simulate the event handlers
const mockSocket = {
  on: (event: string, handler: (data: any) => void) => {
    console.log(`Mock socket listening for: ${event}`);
    // In a real app, this would register handlers with a WebSocket server
  },
  emit: (event: string, data: any) => {
    console.log(`Mock socket emitting: ${event}`, data);
    // In a real app, this would send data over the WebSocket
  },
};

// Simulate the WebSocket event handlers
(async () => {
  const socket = mockSocket; // Use the mock socket for simulation

  // Create a persistent coordinator agent for user chat
  let coordinatorAgent: Agent | null = null;

  socket.on('god_mode', async (data: { message: string }) => {
    try {
      console.log('God mode request:', data.message);

      // Decompose goal into agents and tasks
      const { agents: agentTemplates, tasks: taskTemplates } = await decomposeGoal(data.message);

      // Create actual agents with IDs
      const agents: Agent[] = agentTemplates.map((template, i) => ({
        ...template,
        id: `agent-${Date.now()}-${i}`,
      }));

      // Create tasks and assign to agents
      const tasks: Task[] = taskTemplates.map((template, i) => {
        const agentIndex = (template as any).agentIndex || i % agents.length;
        return {
          ...template,
          id: `task-${Date.now()}-${i}`,
          assignedAgentId: agents[agentIndex].id,
        };
      });

      // Emit created agents and tasks
      agents.forEach(agent => socket.emit('agent_created', agent));
      tasks.forEach(task => socket.emit('task_created', task));

      // Simulate task execution (simplified)
      tasks.forEach(task => {
        const assignedAgent = agents.find(a => a.id === task.assignedAgentId);
        if (assignedAgent) {
          assignedAgent.status = 'working';
          socket.emit('agent_updated', assignedAgent);
          // Simulate task completion after a delay
          setTimeout(() => {
            task.status = 'completed';
            task.outputs.push(`Completed ${task.goal}`);
            assignedAgent.status = 'idle';
            socket.emit('task_updated', { ...task, status: 'completed' });
            socket.emit('agent_updated', assignedAgent);
          }, 1000);
        }
      });

    } catch (error) {
      console.error('God mode error:', error);
      socket.emit('message', {
        id: `msg-${Date.now()}`,
        role: 'system',
        content: 'An error occurred in God Mode.',
        timestamp: new Date(),
      });
    }
  });

  socket.on('chat_message', async (data: { message: string }) => {
    console.log('Chat message:', data.message);

    // Ensure we have a coordinator agent
    if (!coordinatorAgent) {
      coordinatorAgent = {
        id: 'coordinator-agent',
        name: 'Coordinator',
        description: 'A helpful assistant that answers questions about the mission and agents',
        status: 'idle',
        position: { x: -150, y: 0 },
        steeringX: 0.7, // High autonomy
        steeringY: 0.5, // Balanced speed/quality
        tools: ['web_search'],
      };

      socket.emit('agent_created', coordinatorAgent);
    }

    // Coordinator responds to user chat
    coordinatorAgent.status = 'working';
    socket.emit('agent_updated', coordinatorAgent);

    const coordinatorTask: Task = {
      id: `coord-task-${Date.now()}`,
      goal: `Answer the user's question: ${data.message}`,
      status: 'active',
      assignedAgentId: coordinatorAgent.id,
      inputs: [data.message],
      outputs: [],
      successCriteria: 'Provide a helpful response',
      iterationCount: 0,
      maxIterations: 1,
    };

    try {
      const decision = await getAgentDecision(
        coordinatorAgent,
        coordinatorTask,
        data.message,
        [] // Assuming empty chat history for simplicity
      );

      socket.emit('execution_log', {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        agentId: coordinatorAgent.id,
        agentName: coordinatorAgent.name,
        type: 'decision',
        data: { action: decision.action, reason: decision.reason },
      });

      if (decision.message) {
        socket.emit('message', {
          id: `msg-${Date.now()}`,
          role: 'agent',
          content: decision.message,
          agentId: coordinatorAgent.id,
          agentName: coordinatorAgent.name,
          timestamp: new Date(),
        });
      }

      coordinatorAgent.status = 'idle';
      socket.emit('agent_updated', coordinatorAgent);
    } catch (error) {
      console.error('Coordinator error:', error);
      socket.emit('message', {
        id: `msg-${Date.now()}`,
        role: 'system',
        content: 'The coordinator encountered an error. Please try again.',
        timestamp: new Date(),
      });
      coordinatorAgent.status = 'error';
      socket.emit('agent_updated', coordinatorAgent);
    }
  });
})();