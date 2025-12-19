
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, Sparkles, ChevronDown, ChevronUp, FileText, X, Clock, Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface GodModeInputProps {
  onSubmit: (value: string) => void;
  onSchedule?: (goal: string, intervalMinutes: number) => void;
  onCancelSchedule?: () => void;
  isLoading?: boolean;
  isScheduleActive?: boolean;
  scheduleInterval?: number;
  runCount?: number;
}

export function GodModeInput({ 
  onSubmit, 
  onSchedule, 
  onCancelSchedule,
  isLoading = false,
  isScheduleActive = false,
  scheduleInterval = 0,
  runCount = 0,
}: GodModeInputProps) {
  const [value, setValue] = useState('');
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(1);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!value.trim() || isLoading) return;

    // Upload context files first if in advanced mode
    if (isAdvanced && contextFiles.length > 0) {
      for (const file of contextFiles) {
        try {
          const content = await file.text();
          const type = file.name.endsWith('.md') ? 'markdown' 
            : file.name.endsWith('.json') ? 'json'
            : file.name.match(/\.(js|ts|py|java|cpp|c|go|rs|tsx|jsx)$/) ? 'code'
            : 'text';

          await fetch('/api/upload-artifact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: file.name, content, type }),
          });
        } catch (error) {
          toast({
            title: 'File upload failed',
            description: `Could not upload ${file.name}`,
            variant: 'destructive',
          });
        }
      }
    }

    onSubmit(value.trim());
    setValue('');
    setContextFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isAdvanced) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setContextFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setContextFiles(contextFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="border-b bg-card/50 backdrop-blur-md">
      <div className="flex items-center gap-3 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-medium uppercase tracking-wide hidden sm:inline">God Mode</span>
        </div>
        
        {!isAdvanced ? (
          <div className="flex-1 relative">
            <Input
              data-testid="input-god-mode"
              type="text"
              placeholder="Tell me what you need... (e.g., 'Create a research team for crypto analysis')"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="h-12 pr-12 text-base bg-background"
            />
          </div>
        ) : (
          <div className="flex-1">
            <Textarea
              data-testid="input-god-mode-advanced"
              placeholder="Describe your goal in detail... Include context, constraints, desired outcomes, etc."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={isLoading}
              className="min-h-[80px] text-base bg-background resize-none"
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            data-testid="button-toggle-mode"
            onClick={() => setIsAdvanced(!isAdvanced)}
            variant="outline"
            size="lg"
            disabled={isLoading}
          >
            {isAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
          <Button
            data-testid="button-god-mode-submit"
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            size="lg"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {isAdvanced && (
        <div className="px-4 pb-4 space-y-3 border-t pt-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="context-files" className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Context Documents (optional)
            </Label>
          </div>
          
          {contextFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {contextFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-1 px-2 py-1 bg-accent rounded-md text-sm">
                  <FileText className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 p-0"
                    onClick={() => removeFile(i)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Input
            id="context-files"
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={isLoading}
            className="cursor-pointer text-sm"
            accept=".md,.txt,.json,.js,.ts,.py,.java,.cpp,.c,.go,.rs,.tsx,.jsx"
          />
          <p className="text-xs text-muted-foreground">
            Upload company docs, requirements, or reference materials. Agents can access these via the read_file tool.
          </p>

          <div className="border-t pt-3 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs text-muted-foreground">Scheduled Execution</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Run every</span>
              <Input
                data-testid="input-schedule-interval"
                type="number"
                min={0.5}
                max={60}
                step={0.5}
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Math.max(0.5, parseFloat(e.target.value) || 1))}
                disabled={isLoading || isScheduleActive}
                className="w-20 h-9"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
              
              {!isScheduleActive ? (
                <Button
                  data-testid="button-start-schedule"
                  onClick={() => {
                    if (value.trim() && onSchedule) {
                      onSchedule(value.trim(), intervalMinutes);
                    }
                  }}
                  disabled={!value.trim() || isLoading}
                  size="sm"
                  variant="outline"
                  className="gap-1"
                >
                  <Play className="w-3 h-3" />
                  Start
                </Button>
              ) : (
                <Button
                  data-testid="button-stop-schedule"
                  onClick={onCancelSchedule}
                  size="sm"
                  variant="destructive"
                  className="gap-1"
                >
                  <Square className="w-3 h-3" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {isScheduleActive && (
        <div className="px-4 py-2 border-t bg-chart-1/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Scheduled: every {scheduleInterval} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Run #{runCount}
            </Badge>
            <Button
              data-testid="button-cancel-schedule-bar"
              onClick={onCancelSchedule}
              size="sm"
              variant="ghost"
              className="h-6 text-xs"
            >
              <Square className="w-3 h-3 mr-1" />
              Stop
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
