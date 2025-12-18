import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { XYPad } from './XYPad';
import { Search, Code, Database, Globe } from 'lucide-react';
import type { Agent } from '@/stores/agentStore';

interface SteeringControlsProps {
  agent: Agent;
  onSteeringChange: (x: number, y: number) => void;
  onToolToggle?: (tool: string, enabled: boolean) => void;
}

const toolIcons: Record<string, typeof Search> = {
  web_search: Globe,
  code_writer: Code,
  analyze_data: Database,
};

export function SteeringControls({ agent, onSteeringChange, onToolToggle }: SteeringControlsProps) {
  const enabledTools = agent.enabledTools || agent.tools;
  const maxTokens = 128000;
  const contextUsage = Math.min(100, Math.round((agent.tokenCount / maxTokens) * 100));
  const costSpent = agent.costSpent || 0;

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">{agent.name}</h3>
        <p className="text-xs text-muted-foreground">{agent.description}</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Steering</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <XYPad
            value={{ x: agent.steeringX, y: agent.steeringY }}
            onChange={({ x, y }) => onSteeringChange(x, y)}
            xLabel={{ min: 'Summary', max: 'Detailed' }}
            yLabel={{ min: 'Factual', max: 'Creative' }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Constraints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-xs">Recursion Depth</Label>
              <span className="text-xs font-mono text-muted-foreground">3</span>
            </div>
            <Slider data-testid="slider-recursion" defaultValue={[3]} max={10} step={1} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-xs">Safety Level</Label>
              <span className="text-xs font-mono text-muted-foreground">High</span>
            </div>
            <Slider data-testid="slider-safety" defaultValue={[80]} max={100} step={10} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {agent.tools.map((tool) => {
            const Icon = toolIcons[tool] || Search;
            const isEnabled = enabledTools.includes(tool);
            return (
              <div key={tool} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{tool.replace('_', ' ')}</span>
                </div>
                <Switch
                  data-testid={`switch-tool-${tool}`}
                  checked={isEnabled}
                  onCheckedChange={(checked) => onToolToggle?.(tool, checked)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Vitals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted-foreground">Context Usage</span>
              <span className="text-xs font-mono">{contextUsage}%</span>
            </div>
            <Progress data-testid="progress-context" value={contextUsage} className="h-2" />
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Cost</span>
            <span className="text-sm font-mono font-medium">${costSpent.toFixed(4)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
