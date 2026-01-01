"use client";

import { useState } from "react";
import {
  Plus,
  MessageSquare,
  GitBranch,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { formatRelativeTime } from "~/lib/utils";

export interface Thread {
  id: number;
  title: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  parentThreadId: number | null;
}

export interface ThreadSidebarProps {
  threads: Thread[];
  activeThreadId: number | null;
  onSelectThread: (threadId: number) => void;
  onCreateThread: (parentThreadId?: number) => void;
  onDeleteThread: (threadId: number) => void;
  isLoading?: boolean;
  className?: string; // Add className prop
}

export function ThreadSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
  onDeleteThread,
  isLoading,
  className,
}: ThreadSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDelete = (threadId: number) => {
    if (deleteConfirmId === threadId) {
      onDeleteThread(threadId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(threadId);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  return (
    <div
      className={cn(
        "bg-muted/10 relative flex h-full flex-col border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-72",
        className, // Merge className
      )}
    >
      {/* Header */}
      <div className="flex h-[69px] items-center justify-between border-b p-3">
        {!isCollapsed && <span className="px-2 font-semibold">Chats</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("shrink-0", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={() => onCreateThread()}
          className={cn(
            "w-full justify-start gap-2",
            isCollapsed && "justify-center px-0",
          )}
          disabled={isLoading}
          variant={isCollapsed ? "outline" : "default"}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span>New Chat</span>}
        </Button>
      </div>

      {/* Thread List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {threads.length === 0 ? (
            <div className={cn("py-8 text-center", isCollapsed && "hidden")}>
              <p className="text-muted-foreground text-sm">No chats yet</p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={cn(
                  "group relative rounded-md transition-all",
                  activeThreadId === thread.id
                    ? "bg-primary/10"
                    : "hover:bg-muted",
                )}
              >
                <button
                  onClick={() => onSelectThread(thread.id)}
                  className={cn(
                    "w-full text-left",
                    isCollapsed ? "flex justify-center p-3" : "p-3",
                  )}
                >
                  {isCollapsed ? (
                    <MessageSquare
                      className={cn(
                        "h-4 w-4",
                        activeThreadId === thread.id
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  ) : (
                    <>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm font-medium",
                            activeThreadId === thread.id
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {thread.title ?? "Untitled Chat"}
                        </span>
                        {thread.parentThreadId && (
                          <GitBranch className="text-muted-foreground h-3 w-3 shrink-0" />
                        )}
                      </div>

                      {thread.lastMessage && (
                        <p className="text-muted-foreground/70 mb-1 truncate text-xs">
                          {thread.lastMessage}
                        </p>
                      )}

                      <p className="text-muted-foreground/50 text-[10px]">
                        {formatRelativeTime(
                          new Date(thread.lastMessageAt ?? thread.createdAt),
                        )}
                      </p>
                    </>
                  )}
                </button>

                {/* Action buttons */}
                {!isCollapsed && (
                  <div className="bg-background/80 absolute top-2 right-2 flex gap-1 rounded-md border opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateThread(thread.id);
                      }}
                      title="Fork conversation"
                    >
                      <GitBranch className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "hover:text-destructive h-6 w-6",
                        deleteConfirmId === thread.id &&
                          "text-destructive bg-destructive/10",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(thread.id);
                      }}
                      title={
                        deleteConfirmId === thread.id
                          ? "Click again to confirm"
                          : "Delete"
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
