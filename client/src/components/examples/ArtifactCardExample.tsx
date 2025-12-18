import { ArtifactCard } from '../ArtifactCard';

export default function ArtifactCardExample() {
  const mockArtifact = {
    id: '1',
    name: 'crypto_analysis.md',
    type: 'markdown' as const,
    content: '# Crypto Market Analysis\n\n## Bitcoin Trends\n\nBitcoin has shown significant volatility over the past 24 hours...\n\n### Key Findings:\n- Price increased by 3.2%\n- Trading volume up 15%\n- Support level at $42,000',
    createdBy: 'Analyst',
    createdAt: new Date(),
  };

  return (
    <div className="p-4 max-w-md space-y-4">
      <ArtifactCard 
        artifact={mockArtifact}
        onView={() => console.log('View artifact')}
        onDownload={() => console.log('Download artifact')}
        onDismiss={() => console.log('Dismiss artifact')}
      />
      <ArtifactCard 
        artifact={{ ...mockArtifact, id: '2', name: 'data.json', type: 'json' }}
        compact
        onView={() => console.log('View compact')}
      />
    </div>
  );
}
