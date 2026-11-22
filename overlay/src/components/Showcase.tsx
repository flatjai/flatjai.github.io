"use client";

import { ArrowUpRight, Check, Copy, GithubLogo, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";


/** The showcase: FlatJai's real landing page as a static site. Anything a visitor does (send a
 *  brief, try an example, open a menu) opens this guide to running FlatJai on their own machine. */

const REPO = "https://github.com/flatjai/flatjai";
const SETUP = ["git clone https://github.com/flatjai/flatjai", "cd flatjai", "./setup.sh"].join("\n");
const RUN = "./run.sh app";

// each name links to its profile (GitHub for now)
const TEAM = [
  { name: "Zhang Sihan", url: "https://github.com/rebecca-332" },
  { name: "Nuttapat Naothaworn", url: "https://github.com/patntp" },
  { name: "Bhanu Pratap Rana", url: "https://github.com/BhanuRana" },
];

const OWN = "[data-fj-showcase]";

/** Jai jumping (a 2 s loop on the header's cream); a still Jai when motion is reduced. */
function JaiJump() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once, after hydration
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const size = "fj-showcase-jai size-16 flex-none sm:size-[104px]";
  return still ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/jai-poster.png" alt="" className={size} />
  ) : (
    <video src="/jai-jump.mp4" poster="/jai-poster.png" autoPlay muted loop playsInline aria-hidden className={size} />
  );
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback(async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = Object.assign(document.createElement("textarea"), { value: text });
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(key);
    window.setTimeout(() => setCopied((k) => (k === key ? null : k)), 1600);
  }, []);
  return { copied, copy };
}

type CopyFn = (key: string, text: string) => void;

function CopyButton({ id, text, copied, copy, label, dark = false }: {
  id: string;
  text: string;
  copied: string | null;
  copy: CopyFn;
  label: string;
  dark?: boolean;
}) {
  const done = copied === id;
  return (
    <button
      type="button"
      onClick={() => copy(id, text)}
      aria-label={done ? "Copied" : label}
      title={done ? "Copied" : label}
      className={`grid size-8 flex-none place-items-center rounded-lg transition-colors ${
        dark ? "text-white/45 hover:bg-white/10 hover:text-white" : "text-[var(--ink-3)] hover:bg-black/5 hover:text-[var(--ink)]"
      }`}
    >
      {done ? <Check size={15} weight="bold" className={dark ? "text-ok" : "text-[#16a34a]"} /> : <Copy size={15} />}
    </button>
  );
}

function Code({ id, text, copied, copy }: { id: string; text: string; copied: string | null; copy: CopyFn }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-bg py-2 pr-1.5 pl-3.5 ring-1 ring-[var(--rule)]">
      <pre className="min-w-0 flex-1 py-1 font-mono text-[11.5px] leading-6 whitespace-pre-wrap text-[#ececee] [overflow-wrap:anywhere] sm:text-[13px]">
        {text.split("\n").map((line) => (
          <div key={line}>
            <span className="text-[#ff8f73] select-none">$ </span>
            {line}
          </div>
        ))}
      </pre>
      <CopyButton id={id} text={text} copied={copied} copy={copy} label="Copy commands" dark />
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3.5">
      <span className="fj-sunset mt-px grid size-6 flex-none place-items-center rounded-full text-xs font-bold">{n}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-[15px] font-semibold text-[var(--ink)]">{title}</p>
        {children}
      </div>
    </li>
  );
}

export function Showcase() {
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState("");
  const dialog = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const { copied, copy } = useCopy();

  const show = useCallback((text: string, from: Element | null) => {
    returnTo.current = from instanceof HTMLElement ? from : null;
    setBrief(text.trim());
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    returnTo.current?.focus({ preventScroll: true });
  }, []);

  // catch every action before the app sees it; typing in the brief box stays free
  useEffect(() => {
    const typed = () => document.querySelector<HTMLTextAreaElement>("textarea")?.value ?? "";
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target || target.closest(OWN)) return;
      const action = target.closest("button, a, [role=button]");
      if (!action) return;
      e.preventDefault();
      e.stopPropagation();
      // an example brief carries its full text in its title
      const example = action.closest(".fj-chip-row") ? action.getAttribute("title") : null;
      show(example ?? typed(), action);
    };
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as Element | null;
      if (target?.closest(OWN)) return;
      if (target instanceof HTMLTextAreaElement && e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        e.stopPropagation();
        show(target.value, target);
      }
    };
    const onSubmit = (e: SubmitEvent) => {
      if ((e.target as Element | null)?.closest(OWN)) return;
      e.preventDefault();
      e.stopPropagation();
      show(typed(), document.activeElement);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, [show]);

  // while open: the page underneath does not scroll, Esc closes, Tab stays inside
  useEffect(() => {
    if (!open) return;
    const el = dialog.current;
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    el?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab" && el) {
        const items = [...el.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = before;
    };
  }, [open, close]);

  return (
    <div data-fj-showcase="">
      {/* room at the end of the page so the preview pill never covers content */}
      <div aria-hidden className="h-16 flex-none" />

      <button
        type="button"
        onClick={(e) => show(document.querySelector("textarea")?.value ?? "", e.currentTarget)}
        className="fj-showcase-pill fixed left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-surface/90 py-2 pr-4 pl-3 text-[13px] whitespace-nowrap text-muted ring-1 ring-line backdrop-blur-xl transition hover:text-fg hover:ring-amber/40"
      >
        <span className="size-1.5 rounded-full bg-amber" aria-hidden />
        Preview
        <span className="text-faint" aria-hidden>
          ·
        </span>
        <span className="text-coral-strong">Run FlatJai yourself</span>
      </button>

      {open ? (
        <div
          className="fj-showcase-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#fbfaf8]/[0.94] backdrop-blur-md sm:items-center sm:p-6"
          onClick={close}
        >
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fj-showcase-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="fj-showcase-sheet relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white text-[var(--ink)] outline-none sm:rounded-[28px] lg:max-w-[1000px]"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full bg-white/80 text-[var(--ink-3)] ring-1 ring-black/5 backdrop-blur-md transition-colors hover:bg-white hover:text-[var(--ink)]"
            >
              <X size={17} weight="bold" />
            </button>

            <div className="fj-showcase-scroll flex flex-col overflow-y-auto overscroll-contain">
              <header className="flex items-start gap-3 border-b border-[#f5e4d8] bg-[var(--cream)] py-4 pr-14 pl-4 sm:items-center sm:gap-4 sm:py-5 sm:pl-5">
                <JaiJump />
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h2
                    id="fj-showcase-title"
                    className="text-[21px] leading-tight font-bold tracking-[-0.015em] text-balance sm:text-[26px]"
                  >
                    {brief ? (
                      <>
                        Your brief is ready. <span className="fj-showcase-sunset-text">Run it on your machine.</span>
                      </>
                    ) : (
                      <>
                        Run FlatJai <span className="fj-showcase-sunset-text">on your machine.</span>
                      </>
                    )}
                  </h2>
                  <p className="text-sm text-pretty text-[var(--ink-2)] sm:text-[15px]">
                    This page is a preview. FlatJai reads live listing sites and runs its own model, so it runs on your
                    computer: free, public on GitHub, about 15 minutes to set up.
                  </p>
                </div>
              </header>

              <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="flex flex-col gap-6 px-5 pt-6 pb-6 sm:px-8">
                  {brief ? (
                    <div className="flex items-start gap-2 rounded-2xl bg-[#fff8f2] py-2.5 pr-1.5 pl-4 ring-1 ring-[#ffd8bd]">
                      <p className="min-w-0 flex-1 py-1 text-[15px] text-pretty text-[var(--ink)]">&ldquo;{brief}&rdquo;</p>
                      <CopyButton id="brief" text={brief} copied={copied} copy={copy} label="Copy your brief" />
                    </div>
                  ) : null}

                  <ol className="flex flex-col gap-5">
                    <Step n={1} title="Install the tools">
                      <p className="text-sm text-pretty text-[var(--ink-2)]">
                        Docker Desktop, uv, Node.js 20.9+ and zstd, plus Ollama for the model. macOS or Linux (Windows
                        through WSL2), 16 GB of RAM.
                      </p>
                    </Step>
                    <Step n={2} title="Clone and set up, once">
                      <Code id="setup" text={SETUP} copied={copied} copy={copy} />
                      <p className="text-sm text-pretty text-[var(--ink-2)]">
                        Setup checks every tool and says how to install anything missing. When it asks where the model
                        runs, choose <span className="font-semibold text-[var(--ink)]">2, this machine</span> (Qwen3 8B,
                        a ~5 GB download). Option 1, Qwen 27B on TACC, needs an HKUST course account.
                      </p>
                    </Step>
                    <Step n={3} title="Start it and search">
                      <Code id="run" text={RUN} copied={copied} copy={copy} />
                      <p className="text-sm text-pretty text-[var(--ink-2)]">
                        Then open <span className="font-mono text-[13px] text-[var(--ink)]">localhost:3000</span>
                        {brief ? " and paste your brief." : " and write what you need."} Each answer takes a few
                        minutes on a laptop.
                      </p>
                    </Step>
                  </ol>

                  <a href={REPO} target="_blank" rel="noreferrer" className="fj-showcase-cta group">
                    <span className="grid size-11 flex-none place-items-center rounded-full bg-white/85 text-[#1a0c06] shadow-[0_4px_12px_-4px_rgb(120_30_0/0.45)] sm:size-12">
                      <GithubLogo size={26} weight="fill" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[17px] leading-tight font-bold tracking-[-0.015em] text-[#1a0c06] sm:text-[18px]">
                        Get FlatJai on GitHub
                      </span>
                      <span className="truncate text-[13px] font-medium text-[#1a0c06]/60">github.com/flatjai/flatjai</span>
                    </span>
                    <span className="ml-auto grid size-11 flex-none place-items-center rounded-full bg-[#0c0c10] text-white transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:size-12">
                      <ArrowUpRight size={20} weight="bold" />
                    </span>
                  </a>
                </div>

                <footer className="flex flex-col justify-between gap-8 border-t border-[var(--rule)] bg-[var(--paper-2)] px-5 pt-6 pb-8 sm:px-8 lg:border-t-0 lg:border-l lg:px-7 lg:pb-10">
                  <p className="text-[13.5px] leading-relaxed text-pretty text-[var(--ink-2)]">
                    An AI project for{" "}
                    <span className="font-semibold text-[var(--ink)]">CSIT6000V Advanced AI Computing and Systems</span>,
                    HKUST, Fall 2026-27.
                  </p>

                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--ink-3)] uppercase">Made by</p>
                      <ul className="flex flex-col gap-1">
                        {TEAM.map((m) => (
                          <li key={m.name}>
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[14.5px] font-medium text-[var(--ink)] transition-colors hover:text-[#e0502b]"
                            >
                              {m.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/hkust.svg"
                      alt="HKUST, The Hong Kong University of Science and Technology"
                      className="h-10 w-auto self-start"
                    />
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
