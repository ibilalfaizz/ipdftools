import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import MergePage from "./pages/MergePage";
import SplitPage from "./pages/SplitPage";
import CompressPage from "./pages/CompressPage";
import ToPDFPage from "./pages/ToPDFPage";
import FromPDFPage from "./pages/FromPDFPage";
import RotatePage from "./pages/RotatePage";
import PDFToWordPage from "./pages/PDFToWordPage";
import PDFToJPGPage from "./pages/PDFToJPGPage";
import PDFToTextPage from "./pages/PDFToTextPage";
import WordToPDFPage from "./pages/WordToPDFPage";
import JPGToPDFPage from "./pages/JPGToPDFPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            {/* <Route path="/landing" element={<Landing />} /> */}
            <Route path="/merge" element={<MergePage />} />
            <Route path="/split" element={<SplitPage />} />
            <Route path="/compress" element={<CompressPage />} />
            <Route path="/to-pdf" element={<ToPDFPage />} />
            <Route path="/from-pdf" element={<FromPDFPage />} />
            <Route path="/rotate" element={<RotatePage />} />
            <Route path="/pdf-to-word" element={<PDFToWordPage />} />
            <Route path="/pdf-to-jpg" element={<PDFToJPGPage />} />
            <Route path="/pdf-to-text" element={<PDFToTextPage />} />
            <Route path="/word-to-pdf" element={<WordToPDFPage />} />
            <Route path="/jpg-to-pdf" element={<JPGToPDFPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
