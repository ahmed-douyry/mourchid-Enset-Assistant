/** Pré-traitement Markdown juridique → sections lisibles (sans tableaux bruts). */

export function stripMarkdownInline(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .trim();
}

function cellToMarkdownList(cell: string): string {
  let c = stripMarkdownInline(cell);
  if (!c) return "_Non précisé dans les extraits fournis._";

  const lines = c
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const bullets = lines.flatMap((line) => {
    if (/^[-*•]\s/.test(line)) return [line.replace(/^[-*•]\s*/, "")];
    if (/^\d+[\).]\s/.test(line)) return [line];
    const parts = line.split(/\s+-\s+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) return parts;
    return [line];
  });

  if (bullets.length > 1 && bullets.every((b) => !/^\d+[\).]/.test(b))) {
    return bullets.map((b) => `- ${stripMarkdownInline(b)}`).join("\n");
  }
  if (bullets.some((b) => /^\d+[\).]/.test(b))) {
    return bullets.join("\n");
  }
  return c;
}

function parseTableRow(line: string): string[] {
  return line
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

/** Convertit les tableaux Markdown en sections ### Titre + contenu structuré. */
export function convertTablesToSections(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim().startsWith("|")) {
      out.push(line);
      i++;
      continue;
    }

    const tableLines: string[] = [];
    while (i < lines.length && lines[i].trim().startsWith("|")) {
      tableLines.push(lines[i]);
      i++;
    }

    const rows = tableLines.filter((l) => !isTableSeparator(l)).map(parseTableRow);
    const isKeyValue = rows.length >= 2 && rows.every((r) => r.length === 2);

    if (isKeyValue) {
      const start = rows[0][0].toLowerCase().includes("élément") ? 1 : 0;
      for (let r = start; r < rows.length; r++) {
        const [label, content] = rows[r];
        const title = stripMarkdownInline(label);
        if (!title) continue;
        out.push(`### ${title}`);
        out.push("");
        out.push(cellToMarkdownList(content));
        out.push("");
      }
    } else {
      out.push(...tableLines);
    }
  }

  return out.join("\n");
}

/** Pipeline complet avant rendu UI. */
export function prepareLegalMarkdown(raw: string): string {
  let md = raw.replace(/<br\s*\/?>/gi, "\n");
  md = convertTablesToSections(md);
  return md.trim();
}
