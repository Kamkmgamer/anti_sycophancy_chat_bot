"use client";

import { useEffect, useRef } from "react";
import { Bot, Menu } from "lucide-react";
import { Button } from "~/components/ui/button";
import { MessageBubble, TypingIndicator } from "./message-bubble";
import { MessageInput } from "./message-input";

export interface Message {
  id: number;
  threadId: number;
  content: string;
  isFromUser: boolean;
  timestamp: Date;
}

export interface ChatWindowProps {
  messages: Message[];
  threadTitle?: string | null;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isTyping?: boolean;
  onToggleSidebar?: () => void;
}

export function ChatWindow({
  messages,
  threadTitle,
  onSendMessage,
  isLoading,
  isTyping,
  onToggleSidebar,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="bg-background flex h-full flex-col">
      {/* Header */}
      <div className="bg-card/50 flex items-center gap-3 border-b px-4 py-3 backdrop-blur md:px-6 md:py-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
          <Bot className="text-primary h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg leading-none font-semibold tracking-tight">
            {threadTitle ?? "New Conversation"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Standard Mode • Anti-Sycophancy Active
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  isFromUser={message.isFromUser}
                  timestamp={message.timestamp}
                />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="bg-background border-t p-4">
        <div className="mx-auto max-w-3xl">
          <MessageInput
            onSendMessage={onSendMessage}
            isLoading={(isLoading ?? false) || (isTyping ?? false)}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="bg-primary/5 mb-8 flex h-20 w-20 items-center justify-center rounded-2xl">
        <Bot className="text-primary h-10 w-10" />
      </div>

      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        How can I help you today?
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        I&apos;m designed to give you honest feedback and objective answers,
        avoiding the common trap of just telling you what you want to hear.
      </p>

      <div className="grid w-full max-w-md gap-2">
        {[
          "Review my argument for logical fallacies",
          "What are the counter-arguments to my view?",
          "Give me an objective analysis of...",
        ].map((suggestion) => (
          <button
            key={suggestion}
            className="bg-card text-muted-foreground hover:bg-muted hover:text-foreground w-full rounded-lg border p-3 text-left text-sm transition-colors"
          >
            &quot;{suggestion}&quot;
          </button>
        ))}
      </div>
    </div>
  );
}
