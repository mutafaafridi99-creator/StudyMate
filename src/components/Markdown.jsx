// A tiny, safe Markdown renderer (headings, lists, bold, inline code, code blocks).
// It builds React elements, so it never injects raw HTML.
import { Fragment } from "react";

function inline(text, keyPrefix) {
  // Split on **bold** and `code`
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={keyPrefix + i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={keyPrefix + i}>{part.slice(1, -1)}</code>;
    }
    return <Fragment key={keyPrefix + i}>{part}</Fragment>;
  });
}

export function parseBlocks(text) {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let para = [];
  let list = null; // { ordered, items }
  let code = null; // { lines }

  const flushPara = () => {
    if (para.length) blocks.push({ type: "p", text: para.join(" ") });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push({ type: list.ordered ? "ol" : "ul", items: list.items });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");

    if (code) {
      if (line.trim().startsWith("```")) {
        blocks.push({ type: "code", text: code.lines.join("\n") });
        code = null;
      } else {
        code.lines.push(raw);
      }
      continue;
    }
    if (line.trim().startsWith("```")) {
      flushPara();
      flushList();
      code = { lines: [] };
      continue;
    }
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    const heading = line.match(/^\s{0,3}(#{1,4})\s+(.*)$/);
    if (heading) {
      flushPara();
      flushList();
      blocks.push({ type: "h", level: heading[1].length, text: heading[2] });
      continue;
    }
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const number = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet || number) {
      flushPara();
      const ordered = Boolean(number);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((bullet || number)[1]);
      continue;
    }
    flushList();
    para.push(line.trim());
  }
  if (code) blocks.push({ type: "code", text: code.lines.join("\n") });
  flushPara();
  flushList();
  return blocks;
}

export default function Markdown({ text }) {
  const blocks = parseBlocks(text);
  return (
    <div className="markdown">
      {blocks.map((b, i) => {
        const k = "b" + i + "-";
        if (b.type === "h") {
          return b.level <= 2 ? (
            <h3 key={k}>{inline(b.text, k)}</h3>
          ) : (
            <h4 key={k}>{inline(b.text, k)}</h4>
          );
        }
        if (b.type === "ul") {
          return <ul key={k}>{b.items.map((t, j) => <li key={k + j}>{inline(t, k + j)}</li>)}</ul>;
        }
        if (b.type === "ol") {
          return <ol key={k}>{b.items.map((t, j) => <li key={k + j}>{inline(t, k + j)}</li>)}</ol>;
        }
        if (b.type === "code") {
          return <pre key={k}><code>{b.text}</code></pre>;
        }
        return <p key={k}>{inline(b.text, k)}</p>;
      })}
    </div>
  );
}
