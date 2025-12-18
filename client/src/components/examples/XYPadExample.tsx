import { useState } from 'react';
import { XYPad } from '../XYPad';

export default function XYPadExample() {
  const [value, setValue] = useState({ x: 0.5, y: 0.5 });

  return (
    <div className="p-4">
      <XYPad
        value={value}
        onChange={setValue}
        xLabel={{ min: 'Summary', max: 'Detailed' }}
        yLabel={{ min: 'Factual', max: 'Creative' }}
      />
      <p className="mt-4 text-sm text-muted-foreground">
        X: {(value.x * 100).toFixed(0)}% | Y: {(value.y * 100).toFixed(0)}%
      </p>
    </div>
  );
}
