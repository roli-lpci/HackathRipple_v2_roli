import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { XYPad } from './XYPad';
import { Search, Code, Database, Globe, Fuel, DollarSign, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent } from '@/stores/agentStore';

interface SteeringControlsProps {
  agent: Agent;
  onSteeringChange: (x: number, y: number) => void;
  onToolToggle?: (tool: string, enabled: boolean) => void;
  onRerun?: (agentId: string) => void;
}

const toolIcons: Record<string, typeof Search> = {
  web_search: Globe,
  code_writer: Code,
  analyze_data: Database,
};

export function SteeringControls({ agent, onSteeringChange, onToolToggle, onRerun }: SteeringControlsProps) {
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
          <CardTitle className="text-sm flex items-center justify-between gap-2">
            <span>Steering</span>
            {agent.status === 'complete' && (
              <span className="text-xs font-normal text-muted-foreground">Affects next run</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <XYPad
            value={{ x: agent.steeringX, y: agent.steeringY }}
            onChange={({ x, y }) => onSteeringChange(x, y)}
            xLabel={{ min: 'Concise', max: 'Detailed' }}
            yLabel={{ min: 'Factual', max: 'Creative' }}
          />
          <p className="text-xs text-muted-foreground text-center">
            X: {(agent.steeringX * 100).toFixed(0)}% | Y: {(agent.steeringY * 100).toFixed(0)}%
          </p>
          
          <Button
            data-testid="button-rerun-agent"
            onClick={() => onRerun?.(agent.id)}
            disabled={agent.status === 'working'}
            className="w-full gap-2"
            variant={agent.status === 'complete' ? 'default' : 'secondary'}
          >
            {agent.status === 'working' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Apply & Re-run
              </>
            )}
          </Button>
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
          <CardTitle className="text-sm flex items-center gap-2">
            <Fuel className="w-4 h-4" />
            Context Fuel Gauge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Token Usage</span>
                  <span className={cn(
                    "text-xs font-mono font-semibold",
                    contextUsage < 50 && "text-chart-3",
                    contextUsage >= 50 && contextUsage < 80 && "text-chart-4",
                    contextUsage >= 80 && "text-destructive"
                  )}>
                    {agent.tokenCount.toLocaleString()} / {maxTokens.toLocaleString()}
                  </span>
                </div>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      contextUsage < 50 && "bg-chart-3",
                      contextUsage >= 50 && contextUsage < 80 && "bg-chart-4",
                      contextUsage >= 80 && "bg-destructive"
                    )}
                    style={{ width: `${contextUsage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">0%</span>
                  <span className={cn(
                    "text-xs font-semibold",
                    contextUsage < 50 && "text-chart-3",
                    contextUsage >= 50 && contextUsage < 80 && "text-chart-4",
                    contextUsage >= 80 && "text-destructive"
                  )}>
                    {contextUsage}%
                  </span>
                  <span className="text-xs text-muted-foreground">100%</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{agent.tokenCount.toLocaleString()} tokens used of {maxTokens.toLocaleString()} available</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cost</span>
            </div>
            <span className="text-sm font-mono font-semibold">${costSpent.toFixed(4)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
