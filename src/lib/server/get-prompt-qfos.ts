import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PromptQfo = {
  id: string;
  query_text: string;
  model_id: string | null;
  occurrence_count: number;
};

export const getPromptQfos = createServerFn({ method: "GET" })
  .inputValidator((input: { promptId: string }) => input)
  .handler(async ({ data }): Promise<PromptQfo[]> => {
    const { data: rows, error } = await supabaseAdmin
      .from("prompt_qfos")
      .select("id, query_text, model_id, occurrence_count")
      .eq("prompt_id", data.promptId)
      .order("occurrence_count", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id,
      query_text: r.query_text,
      model_id: r.model_id,
      occurrence_count: r.occurrence_count ?? 1,
    }));
  });
