"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Msg = { role: "bot" | "user"; text: string };

const QUICK = ["What do you do?", "Show me results", "Pricing", "Book a call"];

/** Deterministic keyword routing — no LLM cost, instant replies. */
function reply(q: string): { text: string; chips?: string[]; askEmail?: boolean } {
  const s = q.toLowerCase();
  if (/what do you do|service|help/.test(s))
    return {
      text: "We're a product-first Amazon growth agency — product research, differentiation, listing optimization, external traffic and PPC management, end to end.",
      chips: ["Show me results", "Pricing", "Book a call"],
    };
  if (/result|case|proof/.test(s))
    return {
      text: "Our launches have generated $28M+ across 40+ brands with a 92% launch success rate, including multiple products past $1M annual run rate in year one.",
      chips: ["How does it work?", "Book a call"],
    };
  if (/pric|cost|fee|retainer/.test(s))
    return {
      text: "Structure depends on your launch budget and how many products you're planning — which is exactly what the strategy call covers.",
      chips: ["Book a call", "What do you do?"],
    };
  if (/book|call|talk|speak|demo/.test(s))
    return {
      text: "Great — drop your email and I'll get the launch team to reach out, or scroll up to pick a time directly.",
      askEmail: true,
    };
  if (/how.*(work|process)/.test(s))
    return {
      text: "Four stages: Scout (research & validation), Differentiate (positioning), Strike (launch with traffic + PPC), Soar (rank defense & scaling).",
      chips: ["Show me results", "Book a call"],
    };
  return {
    text: "Good question — that's one for the launch team. Want me to connect you?",
    chips: ["Book a call", "What do you do?", "Pricing"],
  };
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [chips, setChips] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [awaitingEmail, setAwaitingEmail] = useState(false);
  const [captured, setCaptured] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (open && !started.current) {
      started.current = true;
      pushBot(
        "Hey! I'm Hawkeye, the PeakHawks assistant. I can tell you how we help Amazon brands find and launch bestsellers. What would you like to know?",
        QUICK,
      );
    }
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [msgs, typing, chips]);

  function pushBot(text: string, nextChips: string[] = [], delay = 900) {
    setTyping(true);
    setChips([]);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { role: "bot", text }]);
      setChips(nextChips);
    }, delay);
  }

  async function captureEmail(email: string, transcript: Msg[]) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, transcript }),
      });
      const data = await res.json();
      if (data.ok) {
        setCaptured(true);
        pushBot(
          "Perfect — you're in the system. The team will reach out shortly. 🦅",
          [],
          700,
        );
      } else {
        pushBot("Hmm, that didn't save. Mind using the form on this page instead?");
      }
    } catch {
      pushBot("Connection hiccup — please use the form on this page instead.");
    }
  }

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    const next: Msg[] = [...msgs, { role: "user", text: clean }];
    setMsgs(next);
    setChips([]);
    setInput("");

    if (awaitingEmail && !captured) {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
      if (valid) {
        setAwaitingEmail(false);
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          captureEmail(clean, next);
        }, 600);
        return;
      }
      pushBot("That doesn't look like a valid email — mind trying again?");
      return;
    }

    const r = reply(clean);
    if (r.askEmail) setAwaitingEmail(true);
    pushBot(r.text, r.chips ?? []);
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-[300] flex h-15 w-15 items-center justify-center rounded-full bg-ember text-bg shadow-[0_3px_0_#A64500,0_10px_26px_rgba(21,23,26,.22)] transition hover:scale-105 hover:bg-orange"
        style={{ height: 60, width: 60 }}
      >
        {open ? "✕" : "💬"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="PeakHawks assistant"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-[104px] right-6 z-[300] flex h-[540px] max-h-[calc(100dvh-140px)] w-[378px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[20px] border border-line-strong bg-surface shadow-[0_30px_80px_rgba(21,23,26,.22)]"
          >
            <div className="flex items-center gap-3 border-b border-line bg-gradient-to-br from-ember/10 to-transparent p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ember text-bg">
                🦅
              </div>
              <div>
                <div className="font-display text-[.95rem] font-bold">Hawkeye</div>
                <div className="font-mono text-[.62rem] uppercase tracking-wider text-grey">
                  ● Online · PeakHawks Assistant
                </div>
              </div>
            </div>

            <div ref={bodyRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32 }}
                  className={[
                    "max-w-[82%] rounded-[14px] px-4 py-3 text-[.87rem] leading-relaxed",
                    m.role === "bot"
                      ? "self-start rounded-bl-[5px] border border-line bg-surface-2 text-silver"
                      : "self-end rounded-br-[5px] bg-ember font-medium text-bg",
                  ].join(" ")}
                >
                  {m.text}
                </motion.div>
              ))}
              {typing && (
                <div className="self-start rounded-[14px] rounded-bl-[5px] border border-line bg-surface-2 px-4 py-3.5">
                  <span className="inline-flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <i
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-grey"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              )}
              {chips.length > 0 && (
                <div className="flex flex-wrap gap-2 self-start">
                  {chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => send(c)}
                      className="rounded-full border border-ember/40 px-3.5 py-2 text-[.78rem] font-medium text-ember transition hover:bg-ember/10"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2.5 border-t border-line p-3.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder={awaitingEmail ? "your@email.com" : "Ask about launches, pricing…"}
                aria-label="Message"
                className="flex-1 rounded-full border border-line-strong bg-ink/[.03] px-4 py-3 text-[.87rem] focus:border-ember focus:outline-none"
              />
              <button
                onClick={() => send(input)}
                aria-label="Send"
                className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-ember text-bg transition hover:scale-105"
              >
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
