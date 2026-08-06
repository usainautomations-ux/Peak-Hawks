"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type LegalKey = "terms" | "privacy" | "disclaimer";

const COPY: Record<LegalKey, { title: string; body: React.ReactNode }> = {
  terms: {
    title: "Terms & Conditions",
    body: (
      <>
        <h4>1. Services</h4>
        <p>
          PeakHawks provides Amazon growth services including product
          research, listing optimization, external traffic and PPC
          management. The scope of each engagement is defined in a written
          agreement between PeakHawks and the client.
        </p>
        <h4>2. Client Responsibilities</h4>
        <p>
          Clients retain ownership of and responsibility for their Amazon
          accounts, product compliance, inventory and fulfillment. PeakHawks
          acts in an advisory and execution capacity within access granted by
          the client.
        </p>
        <h4>3. Fees &amp; Payment</h4>
        <p>
          Fees, billing cadence and payment terms are set out in each
          engagement agreement. Work may be paused on accounts with overdue
          balances.
        </p>
        <h4>4. Intellectual Property</h4>
        <p>
          Research, positioning and creative deliverables produced for a
          client transfer to that client upon full payment. PeakHawks retains
          its internal methodologies and tooling.
        </p>
        <h4>5. Limitation of Liability</h4>
        <p>
          Marketplace performance depends on factors outside any agency&apos;s
          control, including Amazon policy changes, competition and market
          demand. PeakHawks&apos; liability is limited to fees paid for the
          engagement.
        </p>
      </>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    body: (
      <>
        <h4>1. Information We Collect</h4>
        <p>
          When you submit our contact or booking forms, we collect the
          details you provide: name, email address and business information
          such as revenue range and launch plans.
        </p>
        <h4>2. How We Use It</h4>
        <p>
          We use this information to respond to inquiries, prepare for
          strategy calls and deliver services. We do not sell personal
          information to third parties.
        </p>
        <h4>3. Cookies &amp; Analytics</h4>
        <p>
          This site may use analytics cookies to understand how visitors use
          it. You can disable cookies in your browser settings.
        </p>
        <h4>4. Data Retention</h4>
        <p>
          Inquiry data is retained only as long as needed for the purpose it
          was collected, or as required by law.
        </p>
        <h4>5. Your Rights</h4>
        <p>
          You may request access to, correction of, or deletion of your
          personal data at any time by emailing hello@peakhawks.com.
        </p>
      </>
    ),
  },
  disclaimer: {
    title: "Disclaimer",
    body: (
      <>
        <h4>Results Vary</h4>
        <p>
          Case studies and figures shown on this site reflect specific past
          engagements. They are not a guarantee of future performance. Amazon
          results depend on product, category, budget, competition and
          marketplace conditions.
        </p>
        <h4>No Affiliation</h4>
        <p>
          Amazon and related marks are trademarks of Amazon.com, Inc.
          PeakHawks is an independent agency and is not endorsed by or
          affiliated with Amazon.
        </p>
      </>
    ),
  },
};

const LegalModalContext = createContext<(key: LegalKey) => void>(() => {});

export function useLegalModal() {
  return useContext(LegalModalContext);
}

export function LegalModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<LegalKey | null>(null);
  const show = useCallback((key: LegalKey) => setOpen(key), []);
  const close = () => setOpen(null);

  return (
    <LegalModalContext.Provider value={show}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-[500] bg-ink/45 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            className="fixed inset-0 z-[501] flex items-center justify-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="max-h-[84svh] w-[660px] max-w-full overflow-y-auto rounded-[18px] border border-line-strong bg-surface p-10 [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:font-display [&_h4]:text-[.95rem] [&_h4]:font-bold [&_h4]:text-silver [&_p]:mb-2.5 [&_p]:text-[.88rem]"
            >
              <div className="mb-1.5 flex items-start justify-between gap-5">
                <h3 id="legal-modal-title" className="text-xl">
                  {COPY[open].title}
                </h3>
                <button
                  onClick={close}
                  aria-label="Close"
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line-strong text-grey transition hover:border-ember hover:text-ember"
                >
                  ✕
                </button>
              </div>
              <span className="mb-5 block font-mono text-[.62rem] uppercase tracking-wider text-grey">
                Last updated — July 2026
              </span>
              {COPY[open].body}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LegalModalContext.Provider>
  );
}

export function LegalTrigger({
  id,
  children,
  className = "text-[.88rem] text-grey transition hover:text-ember",
}: {
  id: LegalKey;
  children: React.ReactNode;
  /** Overridable so the same trigger works on the light legal pages and
   * on the black footer, where the default dark grey would disappear. */
  className?: string;
}) {
  const show = useLegalModal();
  return (
    <button onClick={() => show(id)} className={className}>
      {children}
    </button>
  );
}
