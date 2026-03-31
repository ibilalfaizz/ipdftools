/**
 * Lazy-loads @imgly/background-removal (ONNX + WASM) so it is not in the main bundle.
 * Must run in the browser only.
 */
export async function removeBackgroundWithImgly(file: File): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(file, {
    output: { format: "image/png" },
  });
}
