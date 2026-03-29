import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "iPDFTOOLS - Free Online PDF Tools",
  description:
    "Free online PDF tools to merge, split, compress, convert and rotate PDF files. Fast, secure, and easy to use.",
  metadataBase: new URL("https://www.ipdftools.com/"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
