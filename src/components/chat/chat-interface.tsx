"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "~/trpc/react";
import { ThreadSidebar, type Thread } from "~/components/chat/thread-sidebar";
import { ChatWindow, type Message } from "~/components/chat/chat-window";
import { useUser } from "@clerk/nextjs";

export function ChatInterface() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  // Queries
  const { data: threadsData, refetch: refetchThreads } =
    api.chat.getThreads.useQuery(undefined, { enabled: !!user });

  const { data: threadHistory, refetch: refetchHistory } =
    api.chat.getThreadHistory.useQuery(
      { threadId: activeThreadId! },
      { enabled: !!activeThreadId && !!user },
    );

  // Mutations
  const createThreadMutation = api.chat.createThread.useMutation({
    onSuccess: (newThread) => {
      void refetchThreads();
      setActiveThreadId(newThread.id);
    },
  });

  const deleteThreadMutation = api.chat.deleteThread.useMutation({
    onSuccess: () => {
      void refetchThreads();
      if (activeThreadId && threadsData && threadsData.length > 1) {
        const remainingThreads = threadsData.filter(
          (t) => t.id !== activeThreadId,
        );
        if (remainingThreads.length > 0) {
          setActiveThreadId(remainingThreads[0]!.id);
        } else {
          setActiveThreadId(null);
        }
      } else {
        setActiveThreadId(null);
      }
    },
  });

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onMutate: async ({ content }) => {
      // Optimistic update
      const tempId = Date.now();
      const optimisticMessage: Message = {
        id: tempId,
        threadId: activeThreadId!,
        content,
        isFromUser: true,
        timestamp: new Date(),
      };
      setOptimisticMessages((prev) => [...prev, optimisticMessage]);
      setIsTyping(true);
    },
    onSuccess: () => {
      setOptimisticMessages([]);
      setIsTyping(false);
      void refetchHistory();
      void refetchThreads();
    },
    onError: () => {
      setOptimisticMessages([]);
      setIsTyping(false);
    },
  });

  // Auto-select first thread if none selected
  useEffect(() => {
    if (threadsData && threadsData.length > 0 && !activeThreadId) {
      setActiveThreadId(threadsData[0]!.id);
    }
  }, [threadsData, activeThreadId]);

  // Handlers
  const handleSelectThread = useCallback((threadId: number) => {
    setActiveThreadId(threadId);
    setOptimisticMessages([]);
  }, []);

  const handleCreateThread = useCallback(
    (parentThreadId?: number) => {
      createThreadMutation.mutate({
        title: parentThreadId ? "Forked Consultation" : "New Consultation",
        parentThreadId,
      });
    },
    [createThreadMutation],
  );

  const handleDeleteThread = useCallback(
    (threadId: number) => {
      deleteThreadMutation.mutate({ threadId });
    },
    [deleteThreadMutation],
  );

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!activeThreadId) {
        // Create a new thread first if none exists
        createThreadMutation.mutate(
          { title: content.slice(0, 50) },
          {
            onSuccess: (newThread) => {
              setActiveThreadId(newThread.id);
              sendMessageMutation.mutate({
                threadId: newThread.id,
                content,
              });
            },
          },
        );
      } else {
        sendMessageMutation.mutate({
          threadId: activeThreadId,
          content,
        });
      }
    },
    [activeThreadId, createThreadMutation, sendMessageMutation],
  );

  // Combine real messages with optimistic ones
  const allMessages: Message[] = [
    ...(threadHistory?.messages ?? []),
    ...optimisticMessages,
  ];

  // Transform threads data
  const threads: Thread[] = (threadsData ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    createdAt: new Date(t.createdAt),
    updatedAt: t.updatedAt ? new Date(t.updatedAt) : null,
    lastMessage: t.lastMessage,
    lastMessageAt: t.lastMessageAt ? new Date(t.lastMessageAt) : null,
    parentThreadId: t.parentThreadId,
  }));

  if (!isUserLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-fantasy-gold h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ThreadSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onCreateThread={handleCreateThread}
        onDeleteThread={handleDeleteThread}
        isLoading={
          createThreadMutation.isPending || deleteThreadMutation.isPending
        }
      />
      <main className="flex-1 overflow-hidden">
        <ChatWindow
          messages={allMessages}
          threadTitle={threadHistory?.thread.title}
          onSendMessage={handleSendMessage}
          isLoading={sendMessageMutation.isPending}
          isTyping={isTyping}
        />
      </main>
    </div>
  );
}
