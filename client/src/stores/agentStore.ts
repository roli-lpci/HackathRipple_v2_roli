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
  lastAppliedSteeringX?: number;
  lastAppliedSteeringY?: number;
  tools: string[];
  enabledTools: string[];
  tokenCount: number;
  costSpent: number;
  currentTaskId?: string;
  memory?: string[];
  axisLabels?: {
    xLabel: { min: string; max: string };
    yLabel: { min: string; max: string };
  };
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

export interface SteeringProfile {
  id: string;
  name: string;
  steeringX: number;
  steeringY: number;
  enabledTools: string[];
}

export interface ScheduleState {
  isActive: boolean;
  goal: string;
  intervalMinutes: number;
  runCount: number;
}

interface AgentStore {
  agents: Agent[];
  tasks: Task[];
  artifacts: Artifact[];
  messages: Message[];
  executionLogs: ExecutionLog[];
  steeringProfiles: SteeringProfile[];
  selectedAgentId: string | null;
  isConsoleOpen: boolean;
  schedule: ScheduleState;

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

  addSteeringProfile: (profile: SteeringProfile) => void;
  removeSteeringProfile: (id: string) => void;

  toggleConsole: () => void;

  updateSchedule: (schedule: Partial<ScheduleState>) => void;

  reset: () => void;
}

const defaultProfiles: SteeringProfile[] = [
  { id: 'research', name: 'Research Mode', steeringX: 0.8, steeringY: 0.2, enabledTools: ['web_search', 'analyze_data'] },
  { id: 'creative', name: 'Creative Mode', steeringX: 0.6, steeringY: 0.9, enabledTools: ['web_search', 'code_writer'] },
  { id: 'quick', name: 'Quick Summary', steeringX: 0.2, steeringY: 0.3, enabledTools: ['web_search'] },
  { id: 'detailed', name: 'Detailed Analysis', steeringX: 0.95, steeringY: 0.4, enabledTools: ['web_search', 'analyze_data', 'code_writer'] },
];

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  tasks: [],
  artifacts: [],
  messages: [],
  executionLogs: [],
  steeringProfiles: defaultProfiles,
  selectedAgentId: null,
  isConsoleOpen: false,
  schedule: { isActive: false, goal: '', intervalMinutes: 1, runCount: 0 },

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

  addSteeringProfile: (profile) => set((state) => ({ 
    steeringProfiles: [...state.steeringProfiles, profile] 
  })),
  removeSteeringProfile: (id) => set((state) => ({ 
    steeringProfiles: state.steeringProfiles.filter(p => p.id !== id) 
  })),

  toggleConsole: () => set((state) => ({ isConsoleOpen: !state.isConsoleOpen })),

  updateSchedule: (schedule) => set((state) => ({
    schedule: { ...state.schedule, ...schedule }
  })),

  reset: () => set({
    agents: [],
    tasks: [],
    artifacts: [],
    messages: [],
    executionLogs: [],
    selectedAgentId: null,
    schedule: { isActive: false, goal: '', intervalMinutes: 1, runCount: 0 },
  }),
}));