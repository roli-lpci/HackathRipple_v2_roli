import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FileText, Code, FileJson, File } from 'lucide-react';

interface FlowArtifactNodeData {
  id: string;
  name: string;
  type: 'markdown' | 'json' | 'code' | 'text';
  onClick: () => void;
}

const typeConfig = {
  markdown: { icon: FileText, color: 'bg-chart-3/20 text-chart-3 border-chart-3/50' },
  json: { icon: FileJson, color: 'bg-chart-4/20 text-chart-4 border-chart-4/50' },
  code: { icon: Code, color: 'bg-chart-2/20 text-chart-2 border-chart-2/50' },
  text: { icon: File, color: 'bg-chart-1/20 text-chart-1 border-chart-1/50' },
};

function ArtifactNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as FlowArtifactNodeData;
  const config = typeConfig[nodeData.type];
  const Icon = config.icon;

  return (
    <motion.div
      data-testid={`artifact-node-${nodeData.id}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 15,
        mass: 0.8
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer',
        'shadow-md',
        config.color
      )}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 bg-chart-3 border border-background"
      />
      
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-xs font-medium truncate max-w-[100px]">{nodeData.name}</span>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2 h-2 bg-chart-3 border border-background"
      />
    </motion.div>
  );
}

export const FlowArtifactNode = memo(ArtifactNodeComponent);
