// Nuage : route serveur qui transmet la conversation à Claude et renvoie la réponse en direct.
// La clé ANTHROPIC_API_KEY reste côté serveur, jamais dans le navigateur.
import Anthropic from "@anthropic-ai/sdk";
import { HAS_FALLBACK, MODEL, SYSTEM_PROMPT, buildContext, cleanMessages, readBody, tooMany } from "./_nuage.js";

const client = new Anthropic();

const SOFT_FALLBACK =
  "Je suis désolé, je n'arrive pas à te répondre correctement là-dessus. " +
  "Si tu traverses un moment très dur, tu peux appeler le 3114 (gratuit, 24h/24) : " +
  "quelqu'un sera là pour t'écouter. Et je reste là si tu veux me parler d'autre chose.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end("Méthode non autorisée");
  }

  const body = readBody(req);
  const messages = cleanMessages(body.messages);
  if (!messages || messages[messages.length - 1].role !== "user") {
    res.statusCode = 400;
    return res.end("Conversation invalide");
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.end("⚠︎ Nuage n'est pas encore configuré : il manque la clé ANTHROPIC_API_KEY sur le serveur.");
  }

  if (tooMany(req)) {
    return res.end("⚠︎ Ouh là, ça fait beaucoup de messages d’un coup. Fais une petite pause et réessaie un peu plus tard 💜 (si ça ne va vraiment pas : 3114, gratuit, 24h/24).");
  }

  const system = [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }];
  const context = buildContext(body);
  if (context) system.push({ type: "text", text: context });

  let wrote = false;
  try {
    const params = {
      model: MODEL,
      max_tokens: 2000,
      // Réflexion courte : largement suffisant pour une conversation, et beaucoup moins cher.
      output_config: { effort: "low" },
      // Met en cache le début de la conversation : ce qui est relu coûte ~10 fois moins cher.
      cache_control: { type: "ephemeral" },
      system,
      messages,
    };
    // Relais automatique vers un autre modèle si celui-ci refuse de répondre (quand c'est possible).
    const stream = HAS_FALLBACK
      ? client.beta.messages.stream({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" })
      : client.messages.stream(params);

    req.on?.("close", () => stream.abort());

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        res.write(event.delta.text);
        wrote = true;
      }
    }

    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      res.write((wrote ? "\n\n" : "") + SOFT_FALLBACK);
    }
  } catch (err) {
    if (err instanceof Anthropic.APIUserAbortError) return res.end();
    console.error("Nuage chat error:", err?.status, err?.message);
    const msg =
      err instanceof Anthropic.RateLimitError
        ? "Beaucoup de monde en même temps, je reprends mon souffle… Réessaie dans un instant."
        : err instanceof Anthropic.AuthenticationError
          ? "Nuage n'est pas bien configuré (clé API invalide)."
          : "Oups, ma connexion a flanché. Tu peux renvoyer ton message ?";
    res.write((wrote ? "\n\n" : "") + "⚠︎ " + msg);
  }
  res.end();
}
