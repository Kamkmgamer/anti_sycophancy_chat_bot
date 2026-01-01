"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  isLoading,
  disabled,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [message]);

  return (
    <div className="bg-muted/50 ring-border focus-within:ring-ring focus-within:bg-background relative flex items-end gap-2 rounded-xl p-2 ring-1 transition-all focus-within:ring-2">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={(isLoading ?? false) || (disabled ?? false)}
        rows={1}
        className={cn(
          "max-h-[150px] min-h-[44px] resize-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0",
          "text-base",
        )}
      />
      <Button
        onClick={handleSubmit}
        disabled={
          !message.trim() || (isLoading ?? false) || (disabled ?? false)
        }
        size="icon"
        className="mb-0.5 h-10 w-10 shrink-0 rounded-lg"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  );
}
