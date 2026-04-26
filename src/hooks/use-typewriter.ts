import { useEffect, useRef, useState } from "react";

/**
 * Splits markdown into top-level "sections" (blocks): paragraphs, headings,
 * lists, tables, blockquotes, fenced code blocks, etc. Tables and code blocks
 * are kept whole so they don't render as raw pipe-character noise mid-stream.
 */
function splitMarkdownSections(text: string): string[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines between blocks
    if (!line.trim()) {
      i++;
      continue;
    }

    // Fenced code block — keep entire fence as one block
    const fence = line.match(/^(\s*)(```|~~~)/);
    if (fence) {
      const marker = fence[2];
      const buf: string[] = [line];
      i++;
      while (i < lines.length) {
        buf.push(lines[i]);
        if (lines[i].trim().startsWith(marker)) {
          i++;
          break;
        }
        i++;
      }
      blocks.push(buf.join("\n"));
      continue;
    }

    // Heading — single line
    if (/^#{1,6}\s/.test(line)) {
      blocks.push(line);
      i++;
      continue;
    }

    // Table — first line contains pipes and the next line is a delimiter row
    const looksTable =
      line.includes("|") &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:|-]+\|[\s:|-]+\|?\s*$/.test(lines[i + 1]);
    if (looksTable) {
      const buf: string[] = [line];
      i++;
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
        buf.push(lines[i]);
        i++;
      }
      blocks.push(buf.join("\n"));
      continue;
    }

    // List (unordered or ordered) — collect contiguous list items
    const isListItem = (l: string) =>
      /^\s*([-*+]|\d+[.)])\s+/.test(l) || /^\s{2,}\S/.test(l);
    if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
      const buf: string[] = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        isListItem(lines[i])
      ) {
        buf.push(lines[i]);
        i++;
      }
      blocks.push(buf.join("\n"));
      continue;
    }

    // Blockquote — collect contiguous '>' lines
    if (/^\s*>/.test(line)) {
      const buf: string[] = [line];
      i++;
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      blocks.push(buf.join("\n"));
      continue;
    }

    // Horizontal rule
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      blocks.push(line);
      i++;
      continue;
    }

    // Default: paragraph — collect until blank line or block-starting line
    const buf: string[] = [line];
    i++;
    while (i < lines.length) {
      const next = lines[i];
      if (!next.trim()) break;
      if (/^#{1,6}\s/.test(next)) break;
      if (/^\s*([-*+]|\d+[.)])\s+/.test(next)) break;
      if (/^\s*>/.test(next)) break;
      if (/^(\s*)(```|~~~)/.test(next)) break;
      // Table start ahead?
      if (
        next.includes("|") &&
        i + 1 < lines.length &&
        /^\s*\|?[\s:|-]+\|[\s:|-]+\|?\s*$/.test(lines[i + 1])
      ) {
        break;
      }
      buf.push(next);
      i++;
    }
    blocks.push(buf.join("\n"));
  }
  return blocks;
}

/**
 * Streams `text` one markdown block at a time so headings, paragraphs, lists
 * and tables render as cohesive sections instead of per-character noise.
 *
 * Returns the markdown for all blocks revealed so far and whether the full
 * text has finished revealing.
 *
 * Backwards compatible signature: callers may still pass `cps` (characters
 * per second) and we derive a per-block delay from it so longer blocks pause
 * a touch longer than short ones.
 */
export function useTypewriter(
  text: string,
  options: {
    cps?: number;
    enabled?: boolean;
    /** Override the per-block reveal delay in ms. */
    blockMs?: number;
    /** Min/max bounds for the auto-derived per-block delay. */
    minBlockMs?: number;
    maxBlockMs?: number;
  } = {},
) {
  const enabled = options.enabled ?? true;
  const cps = options.cps ?? 220;
  const minBlockMs = options.minBlockMs ?? 280;
  const maxBlockMs = options.maxBlockMs ?? 900;
  const [revealed, setRevealed] = useState(0);
  const [done, setDone] = useState(false);
  const blocksRef = useRef<string[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const blocks = splitMarkdownSections(text ?? "");
    blocksRef.current = blocks;

    if (!enabled || blocks.length === 0) {
      setRevealed(blocks.length);
      setDone(true);
      return;
    }

    setRevealed(0);
    setDone(false);

    let i = 0;
    const tick = () => {
      i++;
      setRevealed(i);
      if (i >= blocks.length) {
        setDone(true);
        return;
      }
      const nextBlock = blocks[i];
      const charDelay = (nextBlock.length / cps) * 1000;
      const delay = Math.min(maxBlockMs, Math.max(minBlockMs, charDelay));
      timerRef.current = window.setTimeout(tick, delay);
    };
    // Reveal first block almost immediately so the reader has something to anchor on.
    timerRef.current = window.setTimeout(tick, 120);

    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [text, enabled, cps, minBlockMs, maxBlockMs]);

  const visibleBlocks = blocksRef.current.slice(0, revealed);
  const visibleText = visibleBlocks.join("\n\n");

  return { text: visibleText, done };
}
