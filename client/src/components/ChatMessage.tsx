import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import type { MessageRole } from '@/stores/agentStore';

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  agentName?: string;
  timestamp: Date;
}

export function ChatMessage({ role, content, agentName, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';
  const isSystem = role === 'system';

  return (
    <div
      data-testid={`message-${role}`}
      className={cn(
        'flex gap-3 mb-4',
        isUser && 'flex-row-reverse'
      )}
    >
      <Avatar className={cn('w-8 h-8 shrink-0', isSystem && 'bg-muted')}>
        <AvatarFallback className={cn(
          isUser ? 'bg-primary text-primary-foreground' : 
          isSystem ? 'bg-muted text-muted-foreground' :
          'bg-accent text-accent-foreground'
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      <div className={cn(
        'flex flex-col gap-1 max-w-[80%]',
        isUser && 'items-end'
      )}>
        {!isUser && agentName && (
          <span className="text-xs font-medium text-muted-foreground">{agentName}</span>
        )}
        <div className={cn(
          'px-4 py-2 rounded-lg',
          isUser ? 'bg-primary text-primary-foreground rounded-br-sm' :
          isSystem ? 'bg-muted text-muted-foreground italic' :
          'bg-card border rounded-bl-sm'
        )}>
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
