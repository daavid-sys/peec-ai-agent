import { cn } from "@/lib/utils";

const MODEL_DOMAINS: Record<string, string> = {
  ChatGPT: "openai.com",
  "GPT-4o": "openai.com",
  "GPT-4o Search": "openai.com",
  OpenAI: "openai.com",
  Perplexity: "perplexity.ai",
  Gemini: "gemini.google.com",
  "Google AI Overviews": "google.com",
  "Google AI Mode": "google.com",
  Google: "google.com",
  Claude: "claude.ai",
  Anthropic: "anthropic.com",
  Grok: "x.ai",
  "Microsoft Copilot": "copilot.microsoft.com",
  Copilot: "copilot.microsoft.com",
  DeepSeek: "deepseek.com",
  Llama: "meta.com",
  Qwen: "qwenlm.ai",
};

const BRAND_DOMAINS: Record<string, string> = {
  Attio: "attio.com",
  HubSpot: "hubspot.com",
  Salesforce: "salesforce.com",
  Pipedrive: "pipedrive.com",
  Zoho: "zoho.com",
  "Zoho CRM": "zoho.com",
  Monday: "monday.com",
  "monday.com": "monday.com",
  Close: "close.com",
  Copper: "copper.com",
  Freshsales: "freshworks.com",
  Freshworks: "freshworks.com",
  Insightly: "insightly.com",
  Keap: "keap.com",
  Nutshell: "nutshell.com",
  ActiveCampaign: "activecampaign.com",
  Folk: "folk.app",
  Capsule: "capsulecrm.com",
  Nimble: "nimble.com",
  Bitrix24: "bitrix24.com",
  Microsoft: "microsoft.com",
  "Microsoft Dynamics": "microsoft.com",
  Dynamics: "microsoft.com",
  Oracle: "oracle.com",
  SAP: "sap.com",
  NetSuite: "netsuite.com",
  Reddit: "reddit.com",
  YouTube: "youtube.com",
  G2: "g2.com",
  Capterra: "capterra.com",
};

function looksLikeDomain(value: string) {
  // matches things like example.com, sub.example.co.uk
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(value.trim());
}

function domainFor(name: string, kind: "model" | "brand") {
  // If the caller already passed a domain (e.g. "articsledge.com"), use it directly
  if (looksLikeDomain(name)) return name.trim().toLowerCase();
  const map = kind === "model" ? MODEL_DOMAINS : BRAND_DOMAINS;
  if (map[name]) return map[name];
  // try fuzzy match
  const key = Object.keys(map).find(
    (k) => name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase()),
  );
  if (key) return map[key];
  // fallback: slug + .com
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
}

export function Favicon({
  name,
  kind = "brand",
  size = 16,
  className,
}: {
  name: string;
  kind?: "model" | "brand";
  size?: number;
  className?: string;
}) {
  const domain = domainFor(name, kind);
  const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className={cn("inline-block rounded-sm object-contain", className)}
      style={{ width: size, height: size }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
      }}
    />
  );
}
