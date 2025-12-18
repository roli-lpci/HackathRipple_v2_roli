import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Download, Copy, X, FileText, FileCode, FileJson } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Artifact } from '@/stores/agentStore';

interface ArtifactViewerProps {
  artifact: Artifact | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArtifactViewer({ artifact, isOpen, onClose }: ArtifactViewerProps) {
  const { toast } = useToast();

  if (!artifact) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(artifact.content);
    toast({
      title: 'Copied to clipboard',
      description: 'The artifact content has been copied.',
    });
  };

  const handleDownload = () => {
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded',
      description: `${artifact.name} has been downloaded.`,
    });
  };

  const getIcon = () => {
    switch (artifact.type) {
      case 'code':
        return <FileCode className="w-5 h-5" />;
      case 'json':
        return <FileJson className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getLanguage = () => {
    if (artifact.type === 'code') {
      const ext = artifact.name.split('.').pop()?.toLowerCase();
      switch (ext) {
        case 'js': case 'jsx': return 'javascript';
        case 'ts': case 'tsx': return 'typescript';
        case 'py': return 'python';
        case 'md': return 'markdown';
        default: return ext || 'text';
      }
    }
    return artifact.type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {getIcon()}
              <div>
                <DialogTitle data-testid="artifact-title">{artifact.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{getLanguage()}</Badge>
                  <span>Created by {artifact.createdBy}</span>
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                data-testid="button-copy-artifact"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDownload}
                data-testid="button-download-artifact"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 mt-4 border rounded-md">
          <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
            <code data-testid="artifact-content">{artifact.content}</code>
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
