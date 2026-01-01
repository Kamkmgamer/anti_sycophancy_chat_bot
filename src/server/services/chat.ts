import { generateWriterResponse } from "./ai/response-writer";
import { checkForSycophancy } from "./ai/sycophancy-checker";
import type { ChatMessage } from "./ai/cerebras";

const MAX_REGENERATION_ATTEMPTS = 5;
const FALLBACK_MESSAGE = "I'm having trouble generating a response that meets my strict standards for objectivity. Please try rephrasing your query.";

export interface ChatServiceInput {
  userMessage: string;
  chatHistory: ChatMessage[];
}

export interface ChatServiceResult {
  response: string;
  attempts: number;
  wasRejected: boolean;
  isFallback: boolean;
}

/**
 * Chat Service
 * 
 * Orchestrates the two-agent system:
 * 1. Response Writer generates a response
 * 2. Sycophancy Checker evaluates it
 * 3. If sycophantic, regenerate with feedback (up to MAX_REGENERATION_ATTEMPTS)
 * 4. If all attempts fail, return fallback message
 */
export async function generateChatResponse(
  input: ChatServiceInput
): Promise<ChatServiceResult> {
  let attempts = 0;
  let feedback: string | undefined;
  let wasRejected = false;

  while (attempts < MAX_REGENERATION_ATTEMPTS) {
    attempts++;
    
    console.log(`[ChatService] Attempt ${attempts}/${MAX_REGENERATION_ATTEMPTS}`);

    try {
      // Step 1: Generate response
      const writerResult = await generateWriterResponse({
        userMessage: input.userMessage,
        chatHistory: input.chatHistory,
        feedback,
      });

      // Step 2: Check for sycophancy
      const checkResult = await checkForSycophancy({
        userMessage: input.userMessage,
        aiResponse: writerResult.content,
      });

      console.log(`[ChatService] Sycophancy check: ${checkResult.isSycophantic ? 'REJECTED' : 'APPROVED'} (confidence: ${checkResult.confidence})`);

      // Step 3: If approved, return the response
      if (!checkResult.isSycophantic) {
        return {
          response: writerResult.content,
          attempts,
          wasRejected,
          isFallback: false,
        };
      }

      // Step 4: If rejected, capture feedback for next attempt
      wasRejected = true;
      feedback = checkResult.feedback ?? checkResult.reason;
      
      console.log(`[ChatService] Regenerating with feedback: ${feedback}`);
    } catch (error) {
      console.error(`[ChatService] Error on attempt ${attempts}:`, error);
      
      // If we have a network/API error, don't burn through all attempts
      if (attempts >= 3) {
        return {
          response: "Network error: Unable to reach AI services. Please try again later.",
          attempts,
          wasRejected: false,
          isFallback: true,
        };
      }
    }
  }

  // All attempts exhausted
  console.log(`[ChatService] All ${MAX_REGENERATION_ATTEMPTS} attempts exhausted, returning fallback`);
  return {
    response: FALLBACK_MESSAGE,
    attempts,
    wasRejected: true,
    isFallback: true,
  };
}
