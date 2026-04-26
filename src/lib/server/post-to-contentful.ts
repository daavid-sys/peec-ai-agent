import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/contentful";

export type PostToContentfulInput = {
  spaceId: string;
  environmentId?: string;
  contentTypeId: string;
  titleField?: string;
  bodyField?: string;
  title: string;
  body: string;
  locale?: string;
  publish?: boolean;
};

export type PostToContentfulResult = {
  ok: boolean;
  entryId?: string;
  published?: boolean;
  error?: string;
};

export const postToContentful = createServerFn({ method: "POST" })
  .inputValidator((input: PostToContentfulInput) => input)
  .handler(async ({ data }): Promise<PostToContentfulResult> => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      return { ok: false, error: "LOVABLE_API_KEY is not configured" };
    }
    const CONTENTFUL_API_KEY = process.env.CONTENTFUL_API_KEY;
    if (!CONTENTFUL_API_KEY) {
      return {
        ok: false,
        error:
          "Contentful is not connected. Connect the Contentful connector in Lovable to enable posting.",
      };
    }

    const env = data.environmentId?.trim() || "master";
    const locale = data.locale?.trim() || "en-US";
    const titleField = data.titleField?.trim() || "title";
    const bodyField = data.bodyField?.trim() || "body";

    const fields: Record<string, Record<string, unknown>> = {
      [titleField]: { [locale]: data.title },
      [bodyField]: { [locale]: data.body },
    };

    try {
      // Create entry via Content Management API through the gateway.
      const createUrl = `${GATEWAY_URL}/spaces/${encodeURIComponent(
        data.spaceId,
      )}/environments/${encodeURIComponent(env)}/entries`;
      const createRes = await fetch(createUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": CONTENTFUL_API_KEY,
          "Content-Type": "application/vnd.contentful.management.v1+json",
          "X-Contentful-Content-Type": data.contentTypeId,
        },
        body: JSON.stringify({ fields }),
      });

      const createText = await createRes.text();
      if (!createRes.ok) {
        return {
          ok: false,
          error: `Contentful create failed [${createRes.status}]: ${createText.slice(0, 400)}`,
        };
      }
      const created = JSON.parse(createText) as {
        sys?: { id?: string; version?: number };
      };
      const entryId = created.sys?.id;
      const version = created.sys?.version;
      if (!entryId || !version) {
        return { ok: false, error: "Contentful response missing entry id/version" };
      }

      if (data.publish === false) {
        return { ok: true, entryId, published: false };
      }

      // Publish the new entry.
      const publishUrl = `${GATEWAY_URL}/spaces/${encodeURIComponent(
        data.spaceId,
      )}/environments/${encodeURIComponent(env)}/entries/${entryId}/published`;
      const pubRes = await fetch(publishUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": CONTENTFUL_API_KEY,
          "X-Contentful-Version": String(version),
        },
      });
      if (!pubRes.ok) {
        const t = await pubRes.text();
        return {
          ok: true,
          entryId,
          published: false,
          error: `Created draft entry, but publish failed [${pubRes.status}]: ${t.slice(0, 300)}`,
        };
      }

      return { ok: true, entryId, published: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  });
