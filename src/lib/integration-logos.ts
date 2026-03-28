// Maps integration display names to Simple Icons slugs and brand hex colors.
// Only includes integrations for which we have downloaded SVGs in public/logos/integrations/.

interface LogoEntry {
  slug: string;
  hex: string;
}

const LOGO_MAP: Record<string, LogoEntry> = {
  Slack: { slug: "slack", hex: "4A154B" },
  Salesforce: { slug: "salesforce", hex: "00A1E0" },
  WhatsApp: { slug: "whatsapp", hex: "25D366" },
  Zendesk: { slug: "zendesk", hex: "03363D" },
  Jira: { slug: "jira", hex: "0052CC" },
  "MS Teams": { slug: "microsoftteams", hex: "6264A7" },
  Instagram: { slug: "instagram", hex: "E4405F" },
  Shopify: { slug: "shopify", hex: "7AB55C" },
  SAP: { slug: "sap", hex: "0FAAFF" },
  Oracle: { slug: "oracle", hex: "F80000" },
  Snowflake: { slug: "snowflake", hex: "29B5E8" },
  Databricks: { slug: "databricks", hex: "FF3621" },
  NVIDIA: { slug: "nvidia", hex: "76B900" },
  "Amazon Bedrock": { slug: "amazonaws", hex: "232F3E" },
  "Azure OpenAI": { slug: "microsoftazure", hex: "0078D4" },
  "Google Vertex AI": { slug: "googlecloud", hex: "4285F4" },
  "GPT-4": { slug: "openai", hex: "412991" },
  Claude: { slug: "anthropic", hex: "191919" },
  LangChain: { slug: "langchain", hex: "1C3C3C" },
  OpenTelemetry: { slug: "opentelemetry", hex: "000000" },
  WooCommerce: { slug: "woocommerce", hex: "96588A" },
  Magento: { slug: "magento", hex: "EE672F" },
};

export function getIntegrationLogo(name: string): LogoEntry | undefined {
  return LOGO_MAP[name];
}
