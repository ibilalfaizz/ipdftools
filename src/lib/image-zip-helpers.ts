export function sanitizeStem(name: string): string {
  const base = name.replace(/\.[^/.]+$/, "");
  const safe = base.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 80);
  return safe || "image";
}

export function uniqueZipName(used: Set<string>, name: string): string {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  const stem = ext ? name.slice(0, -ext.length) : name;
  let i = 1;
  let candidate = `${stem}_${i}${ext}`;
  while (used.has(candidate)) {
    i += 1;
    candidate = `${stem}_${i}${ext}`;
  }
  used.add(candidate);
  return candidate;
}
