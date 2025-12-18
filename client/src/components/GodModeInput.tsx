import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface GodModeInputProps {
  onSubmit: (value: string) => void;
  isLoading?: boolean;
}

export function GodModeInput({ onSubmit, isLoading = false }: GodModeInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim() && !isLoading) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 border-b bg-card/50 backdrop-blur-md">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Sparkles className="w-5 h-5" />
        <span className="text-xs font-medium uppercase tracking-wide hidden sm:inline">God Mode</span>
      </div>
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
  );
}
