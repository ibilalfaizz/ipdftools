"use client";

import React, { useState } from "react";
import PDFSigner from "../PDFSigner";
import Header from "../Header";
import Footer from "../Footer";
import { IMAGE_TOOL_SHEET_RESERVE } from "@/lib/image-tool-sheet-layout";
import { cn } from "@/lib/utils";

export default function SignPdfPage() {
  const [sidebarReserve, setSidebarReserve] = useState(false);
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div
          className={cn(
            "max-w-6xl mx-auto transition-[padding]",
            sidebarReserve && IMAGE_TOOL_SHEET_RESERVE
          )}
        >
          <PDFSigner onSidebarReserveChange={setSidebarReserve} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
