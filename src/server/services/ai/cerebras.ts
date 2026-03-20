import { env } from "~/env";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CerebrasResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const MODEL_FALLBACK_CHAIN = [
  "zai-glm-4.7",
  "qwen-3-235b-a22b-instruct-2507",
  "llama3.1-8b",
];

/**
 * Cerebras AI Client
 *
 * Uses the Cerebras API with automatic model fallback.
 * API structure follows OpenAI-compatible format.
 */
export async function callCerebras(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  },
): Promise<string> {
  const { temperature = 0.3, maxTokens = 1024, model } = options ?? {};

  // If a specific model is requested, use it; otherwise try the fallback chain
  const modelsToTry = model ? [model] : MODEL_FALLBACK_CHAIN;

  let lastError: Error | null = null;

  for (const currentModel of modelsToTry) {
    try {
      console.log(`[Cerebras] Trying model: ${currentModel}`);

      const response = await fetch(env.CEREBRAS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.CEREBRAS_API_KEY}`,
        },
        body: JSON.stringify({
          model: currentModel,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const isModelNotFound =
          response.status === 404 &&
          errorText.includes("does not exist or you do not have access");

        if (
          isModelNotFound &&
          modelsToTry.indexOf(currentModel) < modelsToTry.length - 1
        ) {
          console.warn(
            `[Cerebras] Model ${currentModel} unavailable, trying next fallback...`,
          );
          lastError = new Error(`Model ${currentModel} not available`);
          continue;
        }

        console.error("[Cerebras] API Error:", response.status, errorText);
        throw new Error(`Cerebras API error: ${response.status}`);
      }

      const data = (await response.json()) as CerebrasResponse;

      if (!data.choices?.[0]?.message?.content) {
        throw new Error("Invalid response structure from Cerebras");
      }

      console.log(`[Cerebras] Success with model: ${currentModel}`);
      return data.choices[0].message.content;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Cerebras API error")
      ) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  console.error("[Cerebras] All models failed. Last error:", lastError);
  throw lastError ?? new Error("All Cerebras models failed");
}

/**
 * Utility to extract JSON from a response that might have markdown code blocks
 */
export function extractJSON<T>(text: string): T | null {
  try {
    // Try parsing directly first
    return JSON.parse(text) as T;
  } catch {
    // Try extracting from markdown code block
    const jsonMatch = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
    if (jsonMatch?.[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim()) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
