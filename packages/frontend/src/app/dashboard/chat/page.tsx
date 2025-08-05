import ChatWindow from '../../../components/chat-window';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">AI Assistant</h1>
        <p className="mt-1 text-gray-600">
          Ask questions about your company's documents and get instant, context-aware answers.
        </p>
      </div>
      <div className="flex-grow">
        <ChatWindow />
      </div>
    </div>
  );
}
