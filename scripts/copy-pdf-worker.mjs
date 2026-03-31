import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nm = join(root, "node_modules/pdfjs-dist/legacy/build");

const pairs = [
  ["pdf.worker.min.mjs", "public/pdf.worker.min.mjs"],
  ["pdf.min.mjs", "public/pdf.min.mjs"],
];

if (!existsSync(join(nm, "pdf.min.mjs"))) {
  console.warn("copy-pdfjs-public: pdfjs-dist not installed yet, skip");
  process.exit(0);
}

for (const [name, relDest] of pairs) {
  copyFileSync(join(nm, name), join(root, relDest));
  console.log(`copy-pdfjs-public: ${relDest}`);
}
