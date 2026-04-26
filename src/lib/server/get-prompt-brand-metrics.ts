import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PromptBrandMetric = {
  brand_id: string;
  brand_name: string;
  is_own: boolean;
  visibility: number; // 0-1
  share_of_voice: number; // 0-1
  sentiment: number | null; // 0-100
  position: number | null;
  mention_count: number;
};

export const getPromptBrandMetrics = createServerFn({ method: "GET" })
  .inputValidator((input: { promptId: string }) => input)
  .handler(async ({ data }): Promise<PromptBrandMetric[]> => {
    const { data: rows, error } = await supabaseAdmin
      .from("prompt_brand_metrics")
      .select("brand_id, brand_name, is_own, visibility, share_of_voice, sentiment, position, mention_count")
      .eq("prompt_id", data.promptId)
      .order("visibility", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      brand_id: r.brand_id,
      brand_name: r.brand_name,
      is_own: r.is_own,
      visibility: Number(r.visibility) || 0,
      share_of_voice: Number(r.share_of_voice) || 0,
      sentiment: r.sentiment === null ? null : Number(r.sentiment),
      position: r.position === null ? null : Number(r.position),
      mention_count: r.mention_count ?? 0,
    }));
  });
