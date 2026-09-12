"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Embeds a GoHighLevel form (or any iframe-embeddable form) by URL.
 *
 * The client builds a form in GHL — with whatever fields and, crucially,
 * whatever automations they've attached to its submit trigger — then
 * pastes its embed URL into Sanity. When that URL is set, this replaces
 * the built-in custom form in the Book A Call section, so submissions run
 * through GHL's own form (and its workflows) instead of the site's API.
 *
 * GHL's embed snippet is normally a <script> that hydrates an <iframe>.
 * We render the iframe directly from the form URL (simpler and works the
 * same), plus load GHL's embed.js which handles auto-resizing the iframe
 * to the form's real height so there's never an inner scrollbar or a big
 * empty gap.
 */
export function GhlFormEmbed({
  url,
  title = "Contact form",
  minHeight = 560,
}: {
  url: string;
  title?: string;
  minHeight?: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  // Load GHL's resizing helper once. It listens for postMessage height
  // updates from the form iframe and sets the iframe height to match.
  useEffect(() => {
    const SRC = "https://link.msgsndr.com/js/form_embed.js";
    if (document.querySelector(`script[src="${SRC}"]`)) {
      setScriptReady(true);
      return;
    }
    const el = document.createElement("script");
    el.src = SRC;
    el.async = true;
    el.onload = () => setScriptReady(true);
    document.body.appendChild(el);
  }, []);

  // Pull the form's own ID out of the URL so GHL's script can target it.
  // GHL form URLs look like .../widget/form/<formId>
  const formId = url.split("/").filter(Boolean).pop() ?? "ghl-form";

  return (
    <iframe
      ref={iframeRef}
      src={url}
      title={title}
      // These data attributes are what GHL's form_embed.js reads to know
      // which iframe to resize and how to identify it.
      data-layout='{"id":"INLINE"}'
      data-form-id={formId}
      data-height={minHeight}
      data-layout-iframe-id={`inline-${formId}`}
      data-form-name={title}
      id={`inline-${formId}`}
      className="w-full rounded-xl border border-line bg-white"
      style={{ minHeight, width: "100%", border: "none" }}
      scrolling="no"
      // If the resize script hasn't loaded yet, minHeight keeps the form
      // usable rather than collapsed — no dependency on JS to be functional.
      onLoad={() => {
        if (scriptReady) {
          // nudge the script to re-scan for new iframes
          window.dispatchEvent(new Event("resize"));
        }
      }}
    />
  );
}
