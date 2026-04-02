"use client";

import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import ImageWorkflow from "../ImageWorkflow";

export default function ImageWorkflowPage() {
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <ImageWorkflow />
        </div>
      </main>
      <Footer />
    </div>
  );
}

