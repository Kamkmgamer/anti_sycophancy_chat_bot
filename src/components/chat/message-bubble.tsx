"use client";

import { cn } from "~/lib/utils";
import { formatRelativeTime } from "~/lib/utils";
import { Bot, User } from "lucide-react";

export interface MessageBubbleProps {
  content: string;
  isFromUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

export function MessageBubble({
  content,
  isFromUser,
  timestamp,
  isLoading,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isFromUser ? "justify-end" : "justify-start",
      )}
    >
      {!isFromUser && (
        <div className="bg-primary/10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
          <Bot className="text-primary h-4 w-4" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed shadow-sm",
          isFromUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground border",
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap">{content}</p>
            <p
              className={cn(
                "mt-1 text-xs opacity-50",
                isFromUser
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground",
              )}
            >
              {formatRelativeTime(new Date(timestamp))}
            </p>
          </>
        )}
      </div>

      {isFromUser && (
        <div className="bg-muted mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
          <User className="text-muted-foreground h-4 w-4" />
        </div>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start gap-3">
      <div className="bg-primary/10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
        <Bot className="text-primary h-4 w-4" />
      </div>
      <div className="bg-muted rounded-lg border px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
          <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
          <span className="bg-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full" />
        </div>
      </div>
    </div>
  );
}
