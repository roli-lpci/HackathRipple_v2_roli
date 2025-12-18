import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled = false, placeholder = 'Type a message...' }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((value.trim() || files.length > 0) && !disabled) {
      onSend(value.trim(), files.length > 0 ? files : undefined);
      setValue('');
      setFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t bg-card p-4">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-1 px-2 py-1 bg-accent rounded-md text-sm">
              <Paperclip className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <Button
                data-testid={`button-remove-file-${i}`}
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
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          data-testid="button-attach-file"
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        <Textarea
          data-testid="input-chat-message"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
        />
        <Button
          data-testid="button-send-message"
          onClick={handleSend}
          disabled={(!value.trim() && files.length === 0) || disabled}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
