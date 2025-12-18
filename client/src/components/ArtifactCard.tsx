import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Code, FileJson, File, Download, Eye, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Artifact } from '@/stores/agentStore';

interface ArtifactCardProps {
  artifact: Artifact;
  onView?: () => void;
  onDownload?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

const typeIcons = {
  markdown: FileText,
  json: FileJson,
  code: Code,
  text: File,
};

const typeColors = {
  markdown: 'bg-chart-3/10 text-chart-3',
  json: 'bg-chart-4/10 text-chart-4',
  code: 'bg-chart-2/10 text-chart-2',
  text: 'bg-chart-1/10 text-chart-1',
};

export function ArtifactCard({ artifact, onView, onDownload, onDismiss, compact = false }: ArtifactCardProps) {
  const Icon = typeIcons[artifact.type] || File;

  if (compact) {
    return (
      <div 
        data-testid={`artifact-card-${artifact.id}`}
        className="flex items-center gap-2 p-2 rounded-md bg-accent/50 border hover-elevate cursor-pointer"
        onClick={onView}
      >
        <div className={cn('p-1.5 rounded', typeColors[artifact.type])}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm font-medium truncate flex-1">{artifact.name}</span>
        <Badge variant="secondary" className="text-xs">{artifact.type}</Badge>
      </div>
    );
  }

  return (
    <Card data-testid={`artifact-card-${artifact.id}`} className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 pb-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('p-2 rounded-md', typeColors[artifact.type])}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{artifact.name}</p>
            <p className="text-xs text-muted-foreground">
              by {artifact.createdBy} • {artifact.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        {onDismiss && (
          <Button data-testid="button-dismiss-artifact" size="icon" variant="ghost" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3">
        <div className="bg-muted/50 rounded-md p-3 mb-3 max-h-32 overflow-auto">
          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
            {artifact.content.slice(0, 300)}{artifact.content.length > 300 ? '...' : ''}
          </pre>
        </div>
        <div className="flex items-center gap-2">
          {onView && (
            <Button data-testid="button-view-artifact" size="sm" variant="secondary" onClick={onView} className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          )}
          {onDownload && (
            <Button data-testid="button-download-artifact" size="sm" variant="outline" onClick={onDownload}>
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
