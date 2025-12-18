import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ArtifactCard } from './ArtifactCard';
import { ChatInput } from './ChatInput';
import { Sparkles } from 'lucide-react';
import type { Message, Artifact } from '@/stores/agentStore';

interface ChatThreadProps {
  messages: Message[];
  artifacts: Artifact[];
  onSend: (message: string, files?: File[]) => void;
  onViewArtifact?: (artifact: Artifact) => void;
  isLoading?: boolean;
}

export function ChatThread({ messages, artifacts, onSend, onViewArtifact, isLoading = false }: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, artifacts]);

  const getArtifactForMessage = (message: Message) => {
    if (!message.artifactId) return null;
    return artifacts.find(a => a.id === message.artifactId);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Mission Control Ready</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Use the command bar above to spawn your agent team, then chat here to guide and steer them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const artifact = getArtifactForMessage(message);
              return (
                <div key={message.id}>
                  <ChatMessage
                    role={message.role}
                    content={message.content}
                    agentName={message.agentName}
                    timestamp={message.timestamp}
                  />
                  {artifact && (
                    <div className="ml-11 mt-2 max-w-md">
                      <ArtifactCard
                        artifact={artifact}
                        onView={() => onViewArtifact?.(artifact)}
                        compact
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm ml-11">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Agent is thinking...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      <ChatInput onSend={onSend} disabled={isLoading} />
    </div>
  );
}
