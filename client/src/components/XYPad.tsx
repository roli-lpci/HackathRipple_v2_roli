import { useState, useRef, useCallback } from 'react';
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

  useState(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });

  return (
    <div className="relative">
      <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
        <span>{yLabel.max}</span>
        <span>{yLabel.min}</span>
      </div>
      <div
        ref={containerRef}
        data-testid="xy-pad"
        onMouseDown={handleMouseDown}
        className={cn(
          'relative w-48 h-48 rounded-lg border bg-muted/30 cursor-crosshair',
          'before:absolute before:inset-0 before:border-l before:border-t before:border-dashed before:border-border/50',
          'after:absolute after:left-1/2 after:top-1/2 after:w-full after:h-px after:bg-border/30 after:-translate-x-1/2',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{
          background: `
            linear-gradient(to right, transparent 50%, transparent 50%),
            linear-gradient(to bottom, transparent 50%, transparent 50%),
            radial-gradient(circle at ${value.x * 100}% ${(1 - value.y) * 100}%, hsl(var(--primary) / 0.1), transparent 40%)
          `,
        }}
      >
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/30" />
        <div
          className={cn(
            'absolute w-5 h-5 rounded-full bg-primary border-2 border-primary-foreground shadow-lg',
            'transform -translate-x-1/2 -translate-y-1/2 transition-shadow',
            isDragging && 'shadow-xl scale-110'
          )}
          style={{
            left: `${value.x * 100}%`,
            top: `${(1 - value.y) * 100}%`,
          }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>{xLabel.min}</span>
        <span>{xLabel.max}</span>
      </div>
    </div>
  );
}
