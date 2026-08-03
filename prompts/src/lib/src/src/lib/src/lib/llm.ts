import { readFileSync } from 'fs';
import path from 'path';

const SYSTEM_PROMPT = readFileSync(
  path.join(process.cwd(), 'prompts', 'sommelier-bogan.txt'),
  'utf-8'
);

export interface RevealPayload {
  event_name: string;
  question: string;
  options: string[];
  outcome_option: string;
  crowd_accuracy_pct: number;
  crowd_breakdown: Record<string, number>;
}

export async function generateRevealScript(payload: RevealPayload): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.8,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(payload) }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI request failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}
