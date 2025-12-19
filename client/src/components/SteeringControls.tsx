import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { XYPad } from './XYPad';
import { Search, Code, Database, Globe, Fuel, DollarSign, RotateCcw, Loader2, Bookmark, Save, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useAgentStore, type Agent, type SteeringProfile } from '@/stores/agentStore';
import { useState } from 'react';

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
  const { steeringProfiles, addSteeringProfile } = useAgentStore();
  const [savingProfile, setSavingProfile] = useState(false);
  const enabledTools = agent.enabledTools || agent.tools;
  const maxTokens = 128000;
  const contextUsage = Math.min(100, Math.round((agent.tokenCount / maxTokens) * 100));
  const costSpent = agent.costSpent || 0;

  const hasPendingChanges = agent.lastAppliedSteeringX !== undefined && 
    (Math.abs(agent.steeringX - agent.lastAppliedSteeringX) > 0.01 || 
     Math.abs(agent.steeringY - (agent.lastAppliedSteeringY ?? agent.steeringY)) > 0.01);

  const [showPromptPreview, setShowPromptPreview] = useState(false);

  const getSteeringContextPreview = () => {
    const xDesc = agent.steeringX < 0.3 
      ? 'low - ask for guidance often' 
      : agent.steeringX > 0.7 
        ? 'high - work independently' 
        : 'medium - balance guidance and autonomy';
    const yDesc = agent.steeringY < 0.3 
      ? 'prioritize speed' 
      : agent.steeringY > 0.7 
        ? 'prioritize thoroughness' 
        : 'balanced';
    
    return `Steering parameters (0-1 scale):
- Autonomy (X): ${agent.steeringX.toFixed(2)} (${xDesc})
- Speed vs Quality (Y): ${agent.steeringY.toFixed(2)} (${yDesc})`;
  };

  const getLastAppliedContextPreview = () => {
    if (agent.lastAppliedSteeringX === undefined) return null;
    const x = agent.lastAppliedSteeringX;
    const y = agent.lastAppliedSteeringY ?? 0.5;
    const xDesc = x < 0.3 
      ? 'low - ask for guidance often' 
      : x > 0.7 
        ? 'high - work independently' 
        : 'medium - balance guidance and autonomy';
    const yDesc = y < 0.3 
      ? 'prioritize speed' 
      : y > 0.7 
        ? 'prioritize thoroughness' 
        : 'balanced';
    
    return `Steering parameters (0-1 scale):
- Autonomy (X): ${x.toFixed(2)} (${xDesc})
- Speed vs Quality (Y): ${y.toFixed(2)} (${yDesc})`;
  };

  const applyProfile = (profile: SteeringProfile) => {
    onSteeringChange(profile.steeringX, profile.steeringY);
    profile.enabledTools.forEach(tool => {
      if (!enabledTools.includes(tool)) {
        onToolToggle?.(tool, true);
      }
    });
    agent.tools.forEach(tool => {
      if (!profile.enabledTools.includes(tool) && enabledTools.includes(tool)) {
        onToolToggle?.(tool, false);
      }
    });
  };

  const saveCurrentAsProfile = () => {
    const name = prompt('Enter profile name:');
    if (name) {
      addSteeringProfile({
        id: `custom-${Date.now()}`,
        name,
        steeringX: agent.steeringX,
        steeringY: agent.steeringY,
        enabledTools: [...enabledTools],
      });
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">{agent.name}</h3>
        <p className="text-xs text-muted-foreground">{agent.description}</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            Quick Profiles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {steeringProfiles.map((profile) => (
              <Button
                key={profile.id}
                data-testid={`button-profile-${profile.id}`}
                variant="outline"
                size="sm"
                onClick={() => applyProfile(profile)}
                className="text-xs gap-1"
              >
                <Sparkles className="w-3 h-3" />
                {profile.name}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-xs text-muted-foreground"
            onClick={saveCurrentAsProfile}
            data-testid="button-save-profile"
          >
            <Save className="w-3 h-3" />
            Save Current as Profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between gap-2">
            <span>Steering</span>
            {hasPendingChanges && (
              <Badge variant="outline" className="text-xs bg-chart-4/10 text-chart-4 border-chart-4/30">
                Pending Changes
              </Badge>
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
          
          <Collapsible open={showPromptPreview} onOpenChange={setShowPromptPreview} className="w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full gap-2 text-xs text-muted-foreground" data-testid="button-toggle-prompt-preview">
                {showPromptPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPromptPreview ? 'Hide' : 'Show'} Prompt Preview
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Current Steering Context:</div>
              <pre className={cn(
                "text-xs p-2 rounded bg-muted/50 whitespace-pre-wrap font-mono",
                hasPendingChanges && "border border-chart-4/30"
              )}>
                {getSteeringContextPreview()}
              </pre>
              {hasPendingChanges && getLastAppliedContextPreview() && (
                <>
                  <div className="text-xs font-medium text-muted-foreground">Last Applied:</div>
                  <pre className="text-xs p-2 rounded bg-muted/30 whitespace-pre-wrap font-mono opacity-60">
                    {getLastAppliedContextPreview()}
                  </pre>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Time Constraints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-xs">Max Duration (minutes)</Label>
              <span className="text-xs font-mono text-muted-foreground">15 min</span>
            </div>
            <Slider data-testid="slider-duration" defaultValue={[15]} max={60} step={1} />
            <p className="text-xs text-muted-foreground mt-1">Agent will stop after this time</p>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-xs">Run Every (minutes)</Label>
              <span className="text-xs font-mono text-muted-foreground">Off</span>
            </div>
            <Slider data-testid="slider-interval" defaultValue={[0]} max={60} step={5} />
            <p className="text-xs text-muted-foreground mt-1">0 = one-time execution</p>
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
