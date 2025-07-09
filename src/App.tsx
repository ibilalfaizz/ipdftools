
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
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

// Component to handle localized routing
const LocalizedRouter = () => {
  const { getOriginalPath, getLocalizedPath } = useLanguage();
  const location = useLocation();
  
  // Get the original path for the current location
  const originalPath = getOriginalPath(location.pathname);
  
  // Route mapping
  const routes = [
    { original: '/merge', component: <MergePage /> },
    { original: '/split', component: <SplitPage /> },
    { original: '/compress', component: <CompressPage /> },
    { original: '/to-pdf', component: <ToPDFPage /> },
    { original: '/from-pdf', component: <FromPDFPage /> },
    { original: '/rotate', component: <RotatePage /> },
    { original: '/pdf-to-word', component: <PDFToWordPage /> },
    { original: '/pdf-to-jpg', component: <PDFToJPGPage /> },
    { original: '/pdf-to-text', component: <PDFToTextPage /> },
    { original: '/word-to-pdf', component: <WordToPDFPage /> },
    { original: '/jpg-to-pdf', component: <JPGToPDFPage /> },
  ];

  // Find matching route
  const matchedRoute = routes.find(route => route.original === originalPath);
  
  if (matchedRoute) {
    return matchedRoute.component;
  }

  // Handle root path
  if (location.pathname === '/') {
    return <Landing />;
  }

  return <NotFound />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<LocalizedRouter />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
