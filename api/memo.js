// Nuage : met à jour le petit carnet (ce que Nuage retient d'une conversation à l'autre).
// Le carnet est renvoyé au navigateur, qui est le seul à le stocker.
import Anthropic from "@anthropic-ai/sdk";
import { MEMO_PROMPT, MEMO_SCHEMA, MODEL, cleanMemory, cleanMessages, readBody } from "./_nuage.js";

const client = new Anthropic();

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "method" }));
  }
  const body = readBody(req);
  const messages = cleanMessages(body.messages);
  const memory = cleanMemory(body.memory);
  if (!messages || !process.env.ANTHROPIC_API_KEY) {
    res.statusCode = messages ? 503 : 400;
    return res.end(JSON.stringify({ error: messages ? "config" : "invalid" }));
  }

  const transcript = messages
    .map((m) => (m.role === "user" ? "Personne : " : "Nuage : ") + m.content)
    .join("\n\n");

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: MEMO_SCHEMA },
      },
      system: MEMO_PROMPT,
      messages: [
        {
          role: "user",
          content:
            "Carnet actuel :\n" + JSON.stringify(memory, null, 2) +
            "\n\nConversation :\n<conversation>\n" + transcript + "\n</conversation>",
        },
      ],
    });

    if (response.stop_reason !== "end_turn") {
      res.statusCode = 502;
      return res.end(JSON.stringify({ error: response.stop_reason }));
    }
    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    res.end(JSON.stringify(cleanMemory(JSON.parse(text))));
  } catch (err) {
    console.error("Nuage memo error:", err?.status, err?.message);
    res.statusCode = err instanceof Anthropic.RateLimitError ? 429 : 502;
    res.end(JSON.stringify({ error: "upstream" }));
  }
}
