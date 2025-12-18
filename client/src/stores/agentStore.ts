import { create } from 'zustand';

export type AgentStatus = 'idle' | 'working' | 'complete' | 'error';
export type TaskStatus = 'pending' | 'active' | 'blocked' | 'done' | 'failed';
export type MessageRole = 'user' | 'agent' | 'system';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  position: { x: number; y: number };
  steeringX: number;
  steeringY: number;
  tools: string[];
  enabledTools: string[];
  tokenCount: number;
  costSpent: number;
}

export interface Task {
  id: string;
  goal: string;
  status: TaskStatus;
  assignedAgentId: string;
  inputs: string[];
  outputs: string[];
  successCriteria: string;
  iterationCount: number;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'markdown' | 'json' | 'text' | 'code';
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  agentId?: string;
  agentName?: string;
  artifactId?: string;
  timestamp: Date;
}

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
  type: 'decision' | 'action' | 'artifact' | 'error' | 'complete';
  data: Record<string, unknown>;
}

interface AgentStore {
  agents: Agent[];
  tasks: Task[];
  artifacts: Artifact[];
  messages: Message[];
  executionLogs: ExecutionLog[];
  selectedAgentId: string | null;
  isConsoleOpen: boolean;
  
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  selectAgent: (id: string | null) => void;
  
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  
  addArtifact: (artifact: Artifact) => void;
  
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  
  addExecutionLog: (log: ExecutionLog) => void;
  clearExecutionLogs: () => void;
  
  toggleConsole: () => void;
  
  reset: () => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  tasks: [],
  artifacts: [],
  messages: [],
  executionLogs: [],
  selectedAgentId: null,
  isConsoleOpen: false,
  
  addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
  updateAgent: (id, updates) => set((state) => ({
    agents: state.agents.map((a) => a.id === id ? { ...a, ...updates } : a)
  })),
  removeAgent: (id) => set((state) => ({
    agents: state.agents.filter((a) => a.id !== id)
  })),
  selectAgent: (id) => set({ selectedAgentId: id }),
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t)
  })),
  
  addArtifact: (artifact) => set((state) => ({ artifacts: [...state.artifacts, artifact] })),
  
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  
  addExecutionLog: (log) => set((state) => ({ executionLogs: [...state.executionLogs, log] })),
  clearExecutionLogs: () => set({ executionLogs: [] }),
  
  toggleConsole: () => set((state) => ({ isConsoleOpen: !state.isConsoleOpen })),
  
  reset: () => set({
    agents: [],
    tasks: [],
    artifacts: [],
    messages: [],
    executionLogs: [],
    selectedAgentId: null,
  }),
}));
