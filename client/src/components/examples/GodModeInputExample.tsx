import { GodModeInput } from '../GodModeInput';

export default function GodModeInputExample() {
  return (
    <GodModeInput 
      onSubmit={(value) => console.log('God Mode submitted:', value)} 
    />
  );
}
