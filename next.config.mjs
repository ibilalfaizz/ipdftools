import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { dependencies = {} } = JSON.parse(
  readFileSync(join(__dirname, "package.json"), "utf8")
);
const radixReactPackages = Object.keys(dependencies).filter((name) =>
  name.startsWith("@radix-ui/react-")
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Tree-shake Radix entrypoints; reduces one giant vendor chunk and helps avoid stale
    // `./vendor-chunks/@radix-ui.js` references after incremental dev rebuilds.
    optimizePackageImports: ["lucide-react", ...radixReactPackages],
    serverComponentsExternalPackages: ["sharp"],
  },
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    // Do not set `config.cache = false` in dev: it breaks Next’s vendor-chunk layout and
    // leads to missing files like `./vendor-chunks/@radix-ui.js`. Use `npm run dev:clean` if
    // `.next` gets corrupted (common on synced/container paths).
    return config;
  },
};

export default nextConfig;
