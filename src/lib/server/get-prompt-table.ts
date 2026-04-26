import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PromptTableRow = {
  id: string;
  text: string;
  topic: string | null;
  volume: string | null;
  // own-brand metrics for this prompt
  visibility: number | null; // 0-100
  sentiment: number | null; // 0-100
  position: number | null;
  share_of_voice: number | null; // 0-100
  // distinct AI engines that returned mentions of any tracked brand for this prompt
  model_ids: string[];
};

export const getPromptTable = createServerFn({ method: "GET" }).handler(
  async (): Promise<PromptTableRow[]> => {
    const [{ data: prompts }, { data: metrics }, { data: qfos }] =
      await Promise.all([
        supabaseAdmin
          .from("prompts")
          .select("id, text, topic, volume")
          .order("text", { ascending: true }),
        supabaseAdmin
          .from("prompt_brand_metrics")
          .select(
            "prompt_id, is_own, visibility, sentiment, position, share_of_voice, mention_count",
          ),
        supabaseAdmin
          .from("prompt_qfos")
          .select("prompt_id, model_id"),
      ]);

    const ownByPrompt = new Map<string, {
      visibility: number | null;
      sentiment: number | null;
      position: number | null;
      share_of_voice: number | null;
    }>();
    for (const m of metrics ?? []) {
      if (!m.is_own) continue;
      ownByPrompt.set(m.prompt_id, {
        visibility:
          m.visibility === null ? null : Math.round(Number(m.visibility) * 100),
        sentiment: m.sentiment === null ? null : Math.round(Number(m.sentiment)),
        position: m.position === null ? null : Number(m.position),
        share_of_voice:
          m.share_of_voice === null
            ? null
            : Math.round(Number(m.share_of_voice) * 100),
      });
    }

    const modelsByPrompt = new Map<string, Set<string>>();
    for (const q of qfos ?? []) {
      if (!q.model_id) continue;
      if (!modelsByPrompt.has(q.prompt_id))
        modelsByPrompt.set(q.prompt_id, new Set());
      modelsByPrompt.get(q.prompt_id)!.add(q.model_id);
    }

    return (prompts ?? []).map((p) => {
      const own = ownByPrompt.get(p.id);
      return {
        id: p.id,
        text: p.text,
        topic: p.topic,
        volume: p.volume,
        visibility: own?.visibility ?? 0,
        sentiment: own?.sentiment ?? null,
        position: own?.position ?? null,
        share_of_voice: own?.share_of_voice ?? 0,
        model_ids: Array.from(modelsByPrompt.get(p.id) ?? []),
      };
    });
  },
);
