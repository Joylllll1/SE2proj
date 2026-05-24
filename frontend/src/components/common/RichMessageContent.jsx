import React from 'react';

function isOrderedListLine(line) {
  return /^\d+\.\s+/.test(line);
}

function isUnorderedListLine(line) {
  return /^[-*]\s+/.test(line);
}

function isTableLine(line) {
  return /^\|(.+\|)+$/.test(line.trim());
}

function renderInline(text, keyPrefix) {
  const parts = [];
  const pattern = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|`[^`]+`|\*\*[^*]+\*\*|\$[^$\n]+\$)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={`${keyPrefix}-bold-${match.index}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      parts.push(
        <code
          key={`${keyPrefix}-code-${match.index}`}
          className="rounded bg-black/5 px-1 py-0.5 font-mono text-[0.92em]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('[')) {
      parts.push(
        <a
          key={`${keyPrefix}-link-${match.index}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="text-blue underline underline-offset-2 break-all"
        >
          {match[2]}
        </a>,
      );
    } else if (token.startsWith('$')) {
      parts.push(
        <code
          key={`${keyPrefix}-math-${match.index}`}
          className="rounded bg-[#f5efe6] px-1.5 py-0.5 font-mono text-[0.92em] text-[#7a4b16]"
        >
          {token}
        </code>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function renderParagraph(text, key) {
  return (
    <p key={key} className="my-0 whitespace-pre-wrap break-words">
      {renderInline(text, key)}
    </p>
  );
}

function renderTable(lines, key) {
  const rows = lines.map((line) => line.trim().slice(1, -1).split('|').map((cell) => cell.trim()));
  const isDivider = (cells) => cells.every((cell) => /^:?-{3,}:?$/.test(cell));
  const header = rows[0] || [];
  const bodyRows = rows[1] && isDivider(rows[1]) ? rows.slice(2) : rows.slice(1);

  return (
    <div key={key} className="my-3 overflow-x-auto rounded-xl border border-line-soft">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-[#f8fafc]">
          <tr>
            {header.map((cell, index) => (
              <th key={`${key}-head-${index}`} className="border-b border-line-soft px-3 py-2 font-semibold text-text">
                {renderInline(cell, `${key}-head-${index}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr key={`${key}-row-${rowIndex}`} className="border-b border-line-soft last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td key={`${key}-cell-${rowIndex}-${cellIndex}`} className="px-3 py-2 align-top text-text-2">
                  {renderInline(cell, `${key}-cell-${rowIndex}-${cellIndex}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderList(lines, ordered, key) {
  const ListTag = ordered ? 'ol' : 'ul';

  return (
    <ListTag
      key={key}
      className={`my-0 pl-5 ${ordered ? 'list-decimal' : 'list-disc'} space-y-1`}
    >
      {lines.map((line, index) => {
        const content = ordered
          ? line.replace(/^\d+\.\s+/, '')
          : line.replace(/^[-*]\s+/, '');
        return <li key={`${key}-${index}`}>{renderInline(content, `${key}-${index}`)}</li>;
      })}
    </ListTag>
  );
}

function renderBlocks(content) {
  const blocks = [];
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const codeLines = [];
      i += 1;

      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }

      blocks.push(
        <div key={`code-${i}`} className="my-3 overflow-hidden rounded-xl border border-[#1e293b] bg-[#0f172a]">
          {language && (
            <div className="border-b border-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/55">
              {language}
            </div>
          )}
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-[#e5e7eb]">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>,
      );
      i += 1;
      continue;
    }

    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      blocks.push(
        <div
          key={`math-block-${i}`}
          className="my-3 overflow-x-auto rounded-xl border border-[#eadfcb] bg-[#fcf8f1] px-4 py-3 font-mono text-sm text-[#7a4b16]"
        >
          {trimmed.slice(2, -2).trim()}
        </div>,
      );
      i += 1;
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 border-l-4 border-blue/35 bg-blue-soft/35 px-4 py-2 text-text-2"
        >
          {quoteLines.map((quote, index) => renderParagraph(quote, `quote-${i}-${index}`))}
        </blockquote>,
      );
      continue;
    }

    if (/^#{1,3}\s+/.test(trimmed)) {
      const level = trimmed.match(/^#{1,3}/)[0].length;
      const title = trimmed.replace(/^#{1,3}\s+/, '');
      const className = level === 1
        ? 'text-lg font-bold'
        : level === 2
          ? 'text-base font-bold'
          : 'text-sm font-semibold';
      blocks.push(
        <div key={`heading-${i}`} className={className}>
          {renderInline(title, `heading-${i}`)}
        </div>,
      );
      i += 1;
      continue;
    }

    if (isTableLine(trimmed)) {
      const tableLines = [];
      while (i < lines.length && isTableLine(lines[i])) {
        tableLines.push(lines[i]);
        i += 1;
      }
      blocks.push(renderTable(tableLines, `table-${i}`));
      continue;
    }

    if (isOrderedListLine(trimmed) || isUnorderedListLine(trimmed)) {
      const ordered = isOrderedListLine(trimmed);
      const listLines = [];
      while (
        i < lines.length &&
        (ordered ? isOrderedListLine(lines[i].trim()) : isUnorderedListLine(lines[i].trim()))
      ) {
        listLines.push(lines[i].trim());
        i += 1;
      }
      blocks.push(renderList(listLines, ordered, `list-${i}`));
      continue;
    }

    const paragraphLines = [];
    while (i < lines.length && lines[i].trim()) {
      const current = lines[i].trim();
      if (
        current.startsWith('```') ||
        current.startsWith('>') ||
        /^#{1,3}\s+/.test(current) ||
        isTableLine(current) ||
        isOrderedListLine(current) ||
        isUnorderedListLine(current)
      ) {
        break;
      }
      paragraphLines.push(current);
      i += 1;
    }

    blocks.push(renderParagraph(paragraphLines.join('\n'), `paragraph-${i}`));
  }

  if (blocks.length === 0) {
    return renderParagraph(content, 'fallback');
  }

  return blocks;
}

export default function RichMessageContent({ content, isUser = false }) {
  if (isUser) {
    return <p className="my-0 whitespace-pre-wrap break-words">{content}</p>;
  }

  return <div className="space-y-3">{renderBlocks(content)}</div>;
}
