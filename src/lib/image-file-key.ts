/** Stable key for matching a `File` to per-file UI state (e.g. blur regions). */
export function imageFileKey(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`;
}
