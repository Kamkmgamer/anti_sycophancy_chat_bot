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

/**
 * Cerebras AI Client
 * 
 * Uses the Cerebras API to generate responses with their gpt-oss-120b model.
 * API structure follows OpenAI-compatible format.
 */
export async function callCerebras(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }
): Promise<string> {
  const { 
    temperature = 0.7, 
    maxTokens = 1024,
    model = "gpt-oss-120b"
  } = options ?? {};

  try {
    const response = await fetch(env.CEREBRAS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.CEREBRAS_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Cerebras] API Error:", response.status, errorText);
      throw new Error(`Cerebras API error: ${response.status}`);
    }

    const data = await response.json() as CerebrasResponse;
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response structure from Cerebras");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("[Cerebras] Request failed:", error);
    throw error;
  }
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
