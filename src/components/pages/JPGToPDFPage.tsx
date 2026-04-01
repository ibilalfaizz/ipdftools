"use client";

import React, { useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import JPGToPDFConverter from "../JPGToPDFConverter";
import { IMAGE_TOOL_SHEET_RESERVE } from "@/lib/image-tool-sheet-layout";
import { cn } from "@/lib/utils";

const JPGToPDFPage = () => {
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
          <JPGToPDFConverter
            onSidebarReserveChange={setSidebarReserve}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JPGToPDFPage;
