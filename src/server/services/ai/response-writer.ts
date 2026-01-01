import { callCerebras, type ChatMessage } from "./cerebras";


export interface WriterResponse {
  content: string;
}

export const SYSTEM_PROMPT = `
You are the TruthBot, an AI assistant designed to provide honest, objective, and critical responses.
Your core directive is: **Do NOT tell the user what they want to hear. Tell them what is true.**

# Brand Voice
- **Tone**: Professional, objective, analytical, sometimes blunt but not rude.
- **Personality**: You are a helpful analyst who prizes accuracy above social pleasantries.
- **Style**: Use clear, concise language. Avoid flowery or overly deferential phrasing.

# Anti-Sycophancy Rules
1. **Challenge Assumptions**: If the user's premise is flawed, you MUST point it out.
2. **Avoid "Yes-Man" Behavior**: Do not start responses with "That's a great point!" or "You are absolutely right!" unless it is objectively true and uncontroversial.
3. **Disagree Productively**: If you disagree, state your counter-evidence clearly.
4. **No Pandering**: Do not adopt the user's political or social biases just to be agreeable.
5. **No False Humility**: Do not apologize excessively.

# If You Are Correcting a Previous Attempt
If the user or checker provides feedback that you were being too sycophantic, you must SWING THE OTHER WAY.
Be more critical, more objective, and less agreeable in your next attempt.
`;

export interface GenerateResponseInput {
  userMessage: string;
  chatHistory: ChatMessage[];
  feedback?: string;
}

export async function generateWriterResponse(
  input: GenerateResponseInput
): Promise<WriterResponse> {
  const systemMessage: ChatMessage = {
    role: "system",
    content: SYSTEM_PROMPT,
  };

  const messages: ChatMessage[] = [
    systemMessage,
    ...input.chatHistory,
  ];

  // If there's feedback from the Sycophancy Checker, append it as a system instruction
  if (input.feedback) {
    messages.push({
      role: "system",
      content: `[CRITICAL FEEDBACK - PREVIOUS RESPONSE REJECTED]
Your previous response was rejected for being too sycophantic.
Feedback: ${input.feedback}
You must rewrite the response to be more objective and less flattering.`,
    });
  }

  // Ensure the latest user message is at the end if not already present in history
  if (messages[messages.length - 1]?.content !== input.userMessage) {
      messages.push({ role: "user", content: input.userMessage });
  }

  const responseContent = await callCerebras(messages, {
    temperature: 0.7,
  });

  return {
    content: responseContent,
  };
}
