
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, Network, Sliders, Terminal } from 'lucide-react';

interface TutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialDialog({ isOpen, onClose }: TutorialDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Welcome to Agent Synapse
          </DialogTitle>
          <DialogDescription className="text-base">
            An AI agent orchestration system that spawns specialized teams to accomplish your goals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">God Mode Input</h3>
              <p className="text-sm text-muted-foreground">
                Describe your goal in natural language. The system will decompose it into tasks and spawn specialized agents to execute them.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Network className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Agent Canvas</h3>
              <p className="text-sm text-muted-foreground">
                Watch agents spawn and work on the visual graph. Each node represents an agent or artifact. Agents move as they process tasks.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Chat Thread</h3>
              <p className="text-sm text-muted-foreground">
                Chat with the Coordinator agent about mission progress, ask questions, or request modifications. Artifacts appear here as they're created.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sliders className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Steering Controls</h3>
              <p className="text-sm text-muted-foreground">
                Adjust agent autonomy (X-axis) and quality/speed balance (Y-axis). Toggle tools on/off and rerun agents with new parameters.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Omni-Console</h3>
              <p className="text-sm text-muted-foreground">
                Expand the bottom drawer to see live execution logs, decision trees, and system prompts sent to each agent.
              </p>
            </div>
          </div>

          <div className="bg-accent/50 rounded-lg p-4 mt-4">
            <div className="text-sm font-medium mb-2">💡 Pro Tip</div>
            <div className="text-xs text-muted-foreground">
              Try: "Research emerging AI trends and create a summary report" or "Build a content strategy for a sustainable fashion brand"
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Got it! Let's start
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
