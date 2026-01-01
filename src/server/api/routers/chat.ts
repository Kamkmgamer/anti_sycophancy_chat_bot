import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { threads, messages } from "~/server/db/schema";
import { generateChatResponse } from "~/server/services/chat";
import type { ChatMessage } from "~/server/services/ai/cerebras";

export const chatRouter = createTRPCRouter({
  /**
   * Create a new chat thread
   * Optionally fork from an existing thread to copy its history
   */
  createThread: protectedProcedure
    .input(
      z.object({
        title: z.string().optional().default("New Chat"),
        parentThreadId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create the new thread
      const [newThread] = await ctx.db
        .insert(threads)
        .values({
          userId: ctx.userId,
          title: input.title,
          parentThreadId: input.parentThreadId,
        })
        .returning();

      if (!newThread) {
        throw new Error("Failed to create thread");
      }

      // If forking, copy messages from parent thread
      if (input.parentThreadId) {
        const parentMessages = await ctx.db.query.messages.findMany({
          where: eq(messages.threadId, input.parentThreadId),
          orderBy: [messages.timestamp],
        });

        if (parentMessages.length > 0) {
          await ctx.db.insert(messages).values(
            parentMessages.map((msg) => ({
              threadId: newThread.id,
              content: msg.content,
              isFromUser: msg.isFromUser,
              timestamp: msg.timestamp,
            }))
          );
        }
      }

      return newThread;
    }),

  /**
   * Get all threads for the current user
   */
  getThreads: protectedProcedure.query(async ({ ctx }) => {
    const userThreads = await ctx.db.query.threads.findMany({
      where: eq(threads.userId, ctx.userId),
      orderBy: [desc(threads.updatedAt), desc(threads.createdAt)],
      with: {
        messages: {
          limit: 1,
          orderBy: [desc(messages.timestamp)],
        },
      },
    });

    return userThreads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      lastMessage: thread.messages[0]?.content ?? null,
      lastMessageAt: thread.messages[0]?.timestamp ?? null,
      parentThreadId: thread.parentThreadId,
    }));
  }),

  /**
   * Get full message history for a thread
   */
  getThreadHistory: protectedProcedure
    .input(z.object({ threadId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verify thread belongs to user
      const thread = await ctx.db.query.threads.findFirst({
        where: and(
          eq(threads.id, input.threadId),
          eq(threads.userId, ctx.userId)
        ),
      });

      if (!thread) {
        throw new Error("Thread not found");
      }

      const threadMessages = await ctx.db.query.messages.findMany({
        where: eq(messages.threadId, input.threadId),
        orderBy: [messages.timestamp],
      });

      return {
        thread,
        messages: threadMessages,
      };
    }),

  /**
   * Send a message and get AI response
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        threadId: z.number(),
        content: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify thread belongs to user
      const thread = await ctx.db.query.threads.findFirst({
        where: and(
          eq(threads.id, input.threadId),
          eq(threads.userId, ctx.userId)
        ),
      });

      if (!thread) {
        throw new Error("Thread not found");
      }

      // Store the user's message
      const [userMessage] = await ctx.db
        .insert(messages)
        .values({
          threadId: input.threadId,
          content: input.content,
          isFromUser: true,
        })
        .returning();

      // Get chat history for context
      const history = await ctx.db.query.messages.findMany({
        where: eq(messages.threadId, input.threadId),
        orderBy: [messages.timestamp],
      });

      // Convert to ChatMessage format for AI
      const chatHistory: ChatMessage[] = history.slice(-20).map((msg) => ({
        role: msg.isFromUser ? "user" : "assistant",
        content: msg.content,
      }));

      // Generate AI response using two-agent system
      const result = await generateChatResponse({
        userMessage: input.content,
        chatHistory,
      });

      // Store the AI's response
      const [aiMessage] = await ctx.db
        .insert(messages)
        .values({
          threadId: input.threadId,
          content: result.response,
          isFromUser: false,
        })
        .returning();

      // Update thread's updatedAt
      await ctx.db
        .update(threads)
        .set({ updatedAt: new Date() })
        .where(eq(threads.id, input.threadId));

      // Update thread title if it's the first message
      if (history.length === 0) {
        const title = input.content.slice(0, 50) + (input.content.length > 50 ? "..." : "");
        await ctx.db
          .update(threads)
          .set({ title })
          .where(eq(threads.id, input.threadId));
      }

      return {
        userMessage,
        aiMessage,
        attempts: result.attempts,
        isFallback: result.isFallback,
      };
    }),

  /**
   * Delete a thread and all its messages
   */
  deleteThread: protectedProcedure
    .input(z.object({ threadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.query.threads.findFirst({
        where: and(
          eq(threads.id, input.threadId),
          eq(threads.userId, ctx.userId)
        ),
      });

      if (!thread) {
        throw new Error("Thread not found");
      }

      await ctx.db.delete(threads).where(eq(threads.id, input.threadId));
      return { success: true };
    }),

  /**
   * Update thread title
   */
  updateThreadTitle: protectedProcedure
    .input(
      z.object({
        threadId: z.number(),
        title: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.query.threads.findFirst({
        where: and(
          eq(threads.id, input.threadId),
          eq(threads.userId, ctx.userId)
        ),
      });

      if (!thread) {
        throw new Error("Thread not found");
      }

      const [updated] = await ctx.db
        .update(threads)
        .set({ title: input.title })
        .where(eq(threads.id, input.threadId))
        .returning();

      return updated;
    }),
});
