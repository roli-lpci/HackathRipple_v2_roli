
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Search, Code, Database, Globe } from 'lucide-react';

interface AddAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAgent: (agent: {
    name: string;
    description: string;
    tools: string[];
    position: { x: number; y: number };
  }) => void;
}

const availableTools = [
  { id: 'web_search', name: 'Web Search', icon: Globe },
  { id: 'code_writer', name: 'Code Writer', icon: Code },
  { id: 'analyze_data', name: 'Analyze Data', icon: Database },
];

export function AddAgentDialog({ open, onOpenChange, onAddAgent }: AddAgentDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>(['web_search']);

  const handleSubmit = () => {
    if (!name.trim()) return;

    onAddAgent({
      name: name.trim(),
      description: description.trim() || `${name} agent`,
      tools: selectedTools,
      position: { x: 100, y: 100 },
    });

    // Reset form
    setName('');
    setDescription('');
    setSelectedTools(['web_search']);
    onOpenChange(false);
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(t => t !== toolId)
        : [...prev, toolId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
          <DialogDescription>
            Create a new agent and configure its capabilities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Agent Name</Label>
            <Input
              id="agent-name"
              placeholder="e.g., Researcher, Analyst, Designer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-agent-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <Textarea
              id="agent-description"
              placeholder="What does this agent do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              data-testid="input-agent-description"
            />
          </div>

          <div className="space-y-3">
            <Label>Available Tools</Label>
            {availableTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{tool.name}</span>
                  </div>
                  <Switch
                    checked={selectedTools.includes(tool.id)}
                    onCheckedChange={() => toggleTool(tool.id)}
                    data-testid={`switch-add-agent-tool-${tool.id}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            data-testid="button-confirm-add-agent"
          >
            Add Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
