/**
 * Right padding on the **page column** (e.g. `max-w-6xl` wrapping the tool card) when the
 * tool `Sheet` is open. Matches `SheetContent` width: `w-3/4` (mobile) and `sm:max-w-md` (28rem),
 * so the whole card shifts left with the panel — not only inner text.
 */
export const IMAGE_TOOL_SHEET_RESERVE =
  "pr-[75vw] sm:pr-[min(28rem,calc(100%-1rem))]" as const;
