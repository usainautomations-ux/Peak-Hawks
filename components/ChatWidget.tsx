"use client";

import Script from "next/script";

/**
 * Loads the GoHighLevel chat widget.
 *
 * The widget ID comes from Sanity (Footer → "Chat Widget"), so the client
 * can swap in a different widget, change it, or turn it off entirely by
 * clearing the field — all without a code change or redeploy. Pass an
 * empty/undefined id and nothing loads.
 *
 * GHL's snippet is a plain <script> tag; in Next.js a raw script tag in
 * JSX isn't guaranteed to execute, so it's loaded through next/script with
 * `afterInteractive` — it runs once the page is interactive, which is the
 * right timing for a chat widget (never blocks first paint).
 */
export function ChatWidget({ widgetId }: { widgetId?: string }) {
  const id = widgetId?.trim();
  if (!id) return null;

  return (
    <Script
      id="ghl-chat-widget"
      src="https://widgets.leadconnectorhq.com/loader.js"
      data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
      data-widget-id={id}
      strategy="afterInteractive"
    />
  );
}
