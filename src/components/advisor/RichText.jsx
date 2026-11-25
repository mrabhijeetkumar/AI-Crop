// src/components/advisor/RichText.jsx
// Tiny markdown renderer (###, **bold**, *italic*, lists, ---) so chat replies
// don't show raw asterisks / hashes.
import React from "react";

const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;

function renderInline(text, k) {
  return String(text)
    .split(INLINE)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={`${k}-${i}`} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <em key={`${k}-${i}`}>{part.slice(1, -1)}</em>;
      }
      return <React.Fragment key={`${k}-${i}`}>{part}</React.Fragment>;
    });
}

export function RichText({ text = "", className = "" }) {
  const out = [];
  let list = null;

  const flush = () => {
    if (list) {
      out.push(
        <ul key={`ul-${out.length}`} className="list-disc pl-4 space-y-1 my-1">
          {list.map((it) => (
            <li key={it.i}>{renderInline(it.text, it.i)}</li>
          ))}
        </ul>,
      );
      list = null;
    }
  };

  String(text)
    .split("\n")
    .forEach((raw, i) => {
      const t = raw.trim();
      if (!t) return flush();
      if (/^-{3,}$/.test(t)) {
        flush();
        out.push(
          <hr
            key={`hr-${i}`}
            className="my-2 border-slate-200 dark:border-slate-700"
          />,
        );
        return;
      }
      const h = t.match(/^#{1,4}\s+(.*)$/);
      if (h) {
        flush();
        out.push(
          <div key={`h-${i}`} className="font-bold text-[13px] mt-2 mb-1">
            {renderInline(h[1], i)}
          </div>,
        );
        return;
      }
      const b = t.match(/^([-*•]|\d+[.)])\s+(.*)$/);
      if (b) {
        if (!list) list = [];
        list.push({ text: b[2], i });
        return;
      }
      flush();
      out.push(
        <p key={`p-${i}`} className="my-1">
          {renderInline(t, i)}
        </p>,
      );
    });
  flush();

  return <div className={className}>{out}</div>;
}

export default RichText;
