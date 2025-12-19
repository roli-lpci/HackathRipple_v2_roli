import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export type AgentStatus = 'idle' | 'working' | 'complete' | 'error';
export type TaskStatus = 'pending' | 'active' | 'blocked' | 'done' | 'failed';

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
  axisLabels?: {
    xMin: string;
    xMax: string;
    yMin: string;
    yMax: string;
  };
  messages: string[];
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
  maxIterations: number;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'markdown' | 'json' | 'text' | 'code';
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
  type: 'decision' | 'action' | 'artifact' | 'error' | 'complete';
  data: Record<string, unknown>;
}

export interface AgentDecision {
  action: 'use_tool' | 'create_artifact' | 'delegate' | 'complete' | 'ask_user';
  tool?: string;
  toolInput?: Record<string, unknown>;
  artifactName?: string;
  artifactContent?: string;
  artifactType?: 'markdown' | 'json' | 'text' | 'code';
  delegateTo?: string;
  message?: string;
  reason: string;
}

const TOOL_DEFINITIONS = {
  web_search: {
    name: 'web_search',
    description: 'Search the web for information on a topic',
    parameters: { query: 'string' },
  },
  analyze_data: {
    name: 'analyze_data',
    description: 'Analyze data and extract insights',
    parameters: { data: 'string', analysisType: 'string' },
  },
  code_writer: {
    name: 'code_writer',
    description: 'Write code in various programming languages',
    parameters: { language: 'string', task: 'string' },
  },
  read_file: {
    name: 'read_file',
    description: 'Read the contents of a file or artifact by name',
    parameters: { filename: 'string' },
  },
};

export async function executeToolMock(
  toolName: string, 
  input: Record<string, unknown>,
  artifacts?: Map<string, Artifact>
): Promise<string> {
  await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));

  switch (toolName) {
    case 'web_search':
      return JSON.stringify({
        results: [
          { title: `Result for: ${input.query}`, snippet: 'Found relevant information about the topic...', url: 'https://example.com/1' },
          { title: `More on: ${input.query}`, snippet: 'Additional details and context...', url: 'https://example.com/2' },
        ],
        summary: `Search completed for "${input.query}". Found 2 relevant results with key insights.`
      });
    case 'analyze_data':
      return JSON.stringify({
        insights: [
          'Pattern identified: correlation between variables',
          'Anomaly detected in dataset segment 3',
          'Trend analysis shows upward trajectory',
        ],
        confidence: 0.85,
        summary: `Analysis complete. ${input.analysisType} analysis revealed 3 key insights.`
      });
    case 'code_writer':
      const code = `// Generated ${input.language} code for: ${input.task}\nfunction solution() {\n  // Implementation here\n  return result;\n}`;
      return JSON.stringify({
        code,
        language: input.language,
        summary: `Generated ${input.language} code for the specified task.`
      });
    case 'read_file':
      if (!artifacts) {
        return JSON.stringify({ error: 'No artifacts available to read' });
      }
      const filename = input.filename as string;
      const artifact = Array.from(artifacts.values()).find(a => a.name === filename);
      if (!artifact) {
        const available = Array.from(artifacts.values()).map(a => a.name).join(', ');
        return JSON.stringify({ 
          error: `File "${filename}" not found`,
          availableFiles: available || 'No files available'
        });
      }
      return JSON.stringify({
        filename: artifact.name,
        type: artifact.type,
        content: artifact.content,
        createdBy: artifact.createdBy,
        summary: `Successfully read file "${filename}" (${artifact.type})`
      });
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

export async function getAgentDecision(
  agent: Agent,
  task: Task,
  context: string,
  previousResults: string[]
): Promise<AgentDecision> {
  const enabledTools = agent.enabledTools || agent.tools;
  const availableTools = enabledTools.map(t => TOOL_DEFINITIONS[t as keyof typeof TOOL_DEFINITIONS]).filter(Boolean);

  const steeringContext = `
Steering parameters (0-1 scale):
- Autonomy (X): ${agent.steeringX.toFixed(2)} (${agent.steeringX < 0.3 ? 'low - ask for guidance often' : agent.steeringX > 0.7 ? 'high - work independently' : 'medium - balance guidance and autonomy'})
- Speed vs Quality (Y): ${agent.steeringY.toFixed(2)} (${agent.steeringY < 0.3 ? 'prioritize speed' : agent.steeringY > 0.7 ? 'prioritize thoroughness' : 'balanced'})
`;

  // Special handling for coordinator agent
  const isCoordinator = agent.name === 'Coordinator';

  const prompt = isCoordinator 
    ? `You are the Coordinator, the ONLY agent that handles user chat messages.

User question: ${task.goal.replace('Answer user question: ', '')}

Current mission context: ${context || 'No active mission'}
Available artifacts: ${previousResults.length > 0 ? previousResults.join(', ') : 'None'}

Your role:
- Answer ALL user questions conversationally
- Explain what the system can do and what artifacts are available
- Guide users on next steps
- Be friendly and helpful
- NEVER create artifacts or use tools
- NEVER mention "iterations" unless they're explicitly visible in the data

Respond with valid JSON:
{
  "action": "complete",
  "message": "Your direct answer to the user (be natural and conversational)",
  "reason": "Answering user chat"
}

Keep responses under 100 words unless more detail is needed.`
    : `You are an AI agent named "${agent.name}" with the following description: ${agent.description}

Your current task:
Goal: ${task.goal}
Success Criteria: ${task.successCriteria}
Iteration: ${task.iterationCount + 1} of ${task.maxIterations}

${steeringContext}
${agent.axisLabels ? `
Axis Labels:
- X-axis (Autonomy): Low (${agent.axisLabels.xMin}), High (${agent.axisLabels.xMax})
- Y-axis (Speed vs Quality): Low (${agent.axisLabels.yMin}), High (${agent.axisLabels.yMax})
` : ''}

Available tools:
${availableTools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

Context from user:
${context}

Previous results from this task:
${previousResults.length > 0 ? previousResults.join('\n---\n') : 'None yet'}

Based on this information, decide your next action. You MUST respond with valid JSON in this exact format:
{
  "action": "use_tool" | "create_artifact" | "complete" | "ask_user",
  "tool": "tool_name (if action is use_tool)",
  "toolInput": { "param": "value" } (if action is use_tool),
  "artifactName": "filename.ext (if action is create_artifact)",
  "artifactContent": "content as a single string - escape ALL quotes and newlines properly (if action is create_artifact)",
  "artifactType": "markdown" | "json" | "text" | "code" (if action is create_artifact)",
  "message": "message for user (if action is ask_user or complete)",
  "reason": "brief explanation of why you chose this action"
}

CRITICAL: When creating artifacts, artifactContent MUST be a properly escaped JSON string. All quotes must be escaped as \\" and all newlines as \\n.

Important:
- If you have enough information, create an artifact with your findings/output
- When naming artifacts, use descriptive names without iteration numbers (e.g., "analysis_report.md" NOT "analysis_iteration_3.md")
- Only reference iterations if they actually exist in the previous results
- Complete the task once you've produced meaningful output
- Respect the steering parameters for autonomy and thoroughness
- Stay focused on the specific goal`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const promptTokens = Math.ceil(prompt.length / 4);
    const responseTokens = Math.ceil(text.length / 4);
    agent.tokenCount = (agent.tokenCount || 0) + promptTokens + responseTokens;
    const costPerToken = 0.000001;
    agent.costSpent = (agent.costSpent || 0) + (promptTokens + responseTokens) * costPerToken;

    let decision: AgentDecision;
    try {
      decision = JSON.parse(jsonMatch[0]) as AgentDecision;
    } catch (parseError) {
      console.error('JSON parsing failed, raw response:', jsonMatch[0].substring(0, 500));
      // Fallback: try to extract action and create a safe response
      const actionMatch = jsonMatch[0].match(/"action"\s*:\s*"([^"]+)"/);
      const reasonMatch = jsonMatch[0].match(/"reason"\s*:\s*"([^"]+)"/);

      decision = {
        action: 'complete',
        message: 'Research completed - check artifacts for detailed results',
        reason: reasonMatch ? reasonMatch[1] : 'Completed task with malformed output',
      };
    }

    return decision;
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      action: 'complete',
      message: 'I encountered an issue processing this request. Please try again.',
      reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function decomposeGoal(userGoal: string): Promise<{ agents: Omit<Agent, 'id'>[]; tasks: Omit<Task, 'id' | 'assignedAgentId'>[]; }> {
  const prompt = `You are a mission planner for an AI agent system. Analyze the following goal and decompose it into agents and tasks.

User Goal: "${userGoal}"

Create a plan with 1-3 specialized agents and their tasks. Respond with valid JSON in this exact format:
{
  "agents": [
    {
      "name": "AgentName",
      "description": "What this agent specializes in",
      "tools": ["tool1", "tool2"],
      "initial_steering": {
        "x": 0.5,
        "y": 0.5
      },
      "axis_labels": {
        "x_min": "Brief/Concise label for low X value",
        "x_max": "Detailed/Verbose label for high X value",
        "y_min": "Label representing low Y (e.g., Factual, Speed, etc.)",
        "y_max": "Label representing high Y (e.g., Creative, Quality, etc.)"
      }
    }
  ],
  "tasks": [
    {
      "goal": "Specific task goal",
      "successCriteria": "How to know when done",
      "inputs": ["any required inputs"],
      "agentIndex": 0
    }
  ]
}

Available tools: web_search, analyze_data, code_writer

Keep it focused - maximum 3 agents, 1-2 tasks per agent. Match tools to agent purpose.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const plan = JSON.parse(jsonMatch[0]);

    const agents: Omit<Agent, 'id'>[] = plan.agents.map((agentDef: { name: string; description: string; tools: string[]; initial_steering?: { x: number; y: number }; axis_labels?: { x_min: string; x_max: string; y_min: string; y_max: string } }) => {
      const validTools = agentDef.tools.filter((t: string) => ['web_search', 'analyze_data', 'code_writer'].includes(t));
      return {
        name: agentDef.name,
        description: agentDef.description,
        status: 'idle',
        position: { x: 0, y: 0 }, // Position will be determined later based on agent order
        steeringX: agentDef.initial_steering?.x ?? 0.5,
        steeringY: agentDef.initial_steering?.y ?? 0.5,
        tools: validTools,
        enabledTools: validTools,
        tokenCount: 0,
        costSpent: 0,
        messages: [],
        axisLabels: agentDef.axis_labels ? {
          xMin: agentDef.axis_labels.x_min || 'Concise',
          xMax: agentDef.axis_labels.x_max || 'Detailed',
          yMin: agentDef.axis_labels.y_min || 'Factual',
          yMax: agentDef.axis_labels.y_max || 'Creative',
        } : undefined,
      };
    });

    const tasks: Omit<Task, 'id' | 'assignedAgentId'>[] = plan.tasks.map((t: { goal: string; successCriteria: string; inputs: string[]; agentIndex: number }) => ({
      goal: t.goal,
      status: 'pending',
      inputs: t.inputs || [],
      outputs: [],
      successCriteria: t.successCriteria,
      iterationCount: 0,
      maxIterations: 5,
    }));

    // Assign initial positions based on agent order
    agents.forEach((agent, index) => {
      agent.position = { x: index * 150, y: 0 };
    });

    return { agents, tasks };
  } catch (error) {
    console.error('Goal decomposition error:', error);
    // Fallback agent and task if decomposition fails
    return {
      agents: [{
        name: 'General Agent',
        description: 'A general-purpose agent to handle this request',
        status: 'idle',
        position: { x: 0, y: 0 },
        steeringX: 0.5,
        steeringY: 0.5,
        tools: ['web_search', 'analyze_data', 'code_writer'],
        enabledTools: ['web_search', 'analyze_data', 'code_writer'],
        tokenCount: 0,
        costSpent: 0,
        messages: [],
        axisLabels: {
          xMin: 'Less Autonomous',
          xMax: 'More Autonomous',
          yMin: 'Prioritize Speed',
          yMax: 'Prioritize Quality',
        },
      }],
      tasks: [{
        goal: userGoal,
        status: 'pending',
        inputs: [],
        outputs: [],
        successCriteria: 'Task completed successfully',
        iterationCount: 0,
        maxIterations: 5,
      }],
    };
  }
}