import { ChatInput } from '../ChatInput';

export default function ChatInputExample() {
  return (
    <ChatInput 
      onSend={(message, files) => {
        console.log('Sending message:', message);
        if (files) console.log('With files:', files);
      }}
      placeholder="Ask the agent anything..."
    />
  );
}
