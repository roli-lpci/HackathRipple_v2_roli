import { ArtifactNode } from '../ArtifactNode';

export default function ArtifactNodeExample() {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <ArtifactNode id="1" name="analysis.md" type="markdown" />
      <ArtifactNode id="2" name="data.json" type="json" isSelected />
      <ArtifactNode id="3" name="script.py" type="code" />
      <ArtifactNode id="4" name="notes.txt" type="text" />
    </div>
  );
}
