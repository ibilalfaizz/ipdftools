import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

/** Google Analytics 4 measurement ID */
const GA_MEASUREMENT_ID = "G-5ME1F1TQP9";

export const metadata: Metadata = {
  title: "iPDFTOOLS - Free Online PDF & Image Tools",
  description:
    "Free PDF and image tools online: merge, split, compress, and rotate PDFs; convert with Word, JPG, and text; bulk image resize, compress, WebP/JPG/GIF, crop, watermark, background removal, and face blur. Fast and private in your browser.",
  metadataBase: new URL("https://www.ipdftools.com/"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body className="antialiased">
        {/* Google tag (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="google-tag-gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
