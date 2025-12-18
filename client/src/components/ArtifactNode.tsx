import { cn } from '@/lib/utils';
import { FileText, Code, FileJson, File } from 'lucide-react';

interface ArtifactNodeProps {
  id: string;
  name: string;
  type: 'markdown' | 'json' | 'code' | 'text';
  isSelected?: boolean;
  onClick?: () => void;
}

const typeConfig = {
  markdown: { icon: FileText, color: 'bg-chart-3/10 text-chart-3 border-chart-3/30' },
  json: { icon: FileJson, color: 'bg-chart-4/10 text-chart-4 border-chart-4/30' },
  code: { icon: Code, color: 'bg-chart-2/10 text-chart-2 border-chart-2/30' },
  text: { icon: File, color: 'bg-chart-1/10 text-chart-1 border-chart-1/30' },
};

export function ArtifactNode({ id, name, type, isSelected = false, onClick }: ArtifactNodeProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      data-testid={`artifact-node-${id}`}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all',
        'bg-card hover-elevate',
        config.color,
        isSelected && 'ring-2 ring-primary'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-xs font-medium truncate max-w-[100px]">{name}</span>
    </div>
  );
}
