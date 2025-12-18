
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUploadComplete?: () => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const content = await file.text();
      const type = file.name.endsWith('.md') ? 'markdown' 
        : file.name.endsWith('.json') ? 'json'
        : file.name.match(/\.(js|ts|py|java|cpp|c|go|rs|tsx|jsx)$/) ? 'code'
        : 'text';

      const response = await fetch('/api/upload-artifact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, content, type }),
      });

      if (!response.ok) throw new Error('Upload failed');

      toast({
        title: 'File uploaded',
        description: `${file.name} is now available to agents`,
      });

      onUploadComplete?.();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <File className="w-4 h-4" />
          Upload Files for Agents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-xs text-muted-foreground">
            Agents can read uploaded files using the read_file tool
          </Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="cursor-pointer"
          />
        </div>
      </CardContent>
    </Card>
  );
}
