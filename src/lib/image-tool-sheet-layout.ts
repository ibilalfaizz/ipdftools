/**
 * Right padding when the tool `Sheet` is open. Matches `SheetContent` width:
 * `w-3/4` (mobile) and `sm:max-w-md` (28rem), so main content stays left of the panel.
 */
export const IMAGE_TOOL_SHEET_RESERVE =
  "pr-[75vw] sm:pr-[min(28rem,calc(100%-1rem))]" as const;
