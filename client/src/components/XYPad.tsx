import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface XYPadProps {
  xLabel?: { min: string; max: string };
  yLabel?: { min: string; max: string };
  value: { x: number; y: number };
  onChange: (value: { x: number; y: number }) => void;
  disabled?: boolean;
}

export function XYPad({
  xLabel = { min: 'Low', max: 'High' },
  yLabel = { min: 'Low', max: 'High' },
  value,
  onChange,
  disabled = false,
}: XYPadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateValue = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || disabled) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
    onChange({ x, y });
  }, [onChange, disabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      updateValue(e.clientX, e.clientY);
    }
  }, [isDragging, updateValue]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-muted-foreground font-medium">{yLabel.max}</div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground w-14 text-right">{xLabel.min}</div>
        <div
          ref={containerRef}
          data-testid="xy-pad"
          onMouseDown={handleMouseDown}
          className={cn(
            'relative w-40 h-40 rounded-lg border bg-muted/30 cursor-crosshair',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            background: `radial-gradient(circle at ${value.x * 100}% ${(1 - value.y) * 100}%, hsl(var(--primary) / 0.15), transparent 50%)`,
          }}
        >
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/40" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border/40" />
          <div
            className={cn(
              'absolute w-6 h-6 rounded-full bg-primary border-2 border-background shadow-lg',
              'transform -translate-x-1/2 -translate-y-1/2 transition-all',
              isDragging && 'shadow-xl scale-110'
            )}
            style={{
              left: `${value.x * 100}%`,
              top: `${(1 - value.y) * 100}%`,
            }}
          />
        </div>
        <div className="text-xs text-muted-foreground w-14">{xLabel.max}</div>
      </div>
      <div className="text-xs text-muted-foreground font-medium">{yLabel.min}</div>
    </div>
  );
}
