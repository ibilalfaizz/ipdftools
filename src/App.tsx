
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { SEOProvider } from "./contexts/SEOContext";
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
  const { getOriginalPath, getLocalizedPath, language, setLanguage } = useLanguage();
  const location = useLocation();
  
  // Detect language from URL on initial load
  React.useEffect(() => {
    const path = location.pathname;
    
    // Check if the current path is a localized path
    const pathMapping = {
      '/combinar': 'es',
      '/fusionner': 'fr',
      '/dividir': 'es',
      '/diviser': 'fr',
      '/comprimir': 'es',
      '/compresser': 'fr',
      '/rotar': 'es',
      '/rotation': 'fr',
      '/pdf-a-word': 'es',
      '/pdf-vers-word': 'fr',
      '/pdf-a-jpg': 'es',
      '/pdf-vers-jpg': 'fr',
      '/pdf-a-texto': 'es',
      '/pdf-vers-texte': 'fr',
      '/word-a-pdf': 'es',
      '/word-vers-pdf': 'fr',
      '/jpg-a-pdf': 'es',
      '/jpg-vers-pdf': 'fr',
    };
    
    const detectedLanguage = pathMapping[path as keyof typeof pathMapping];
    if (detectedLanguage && detectedLanguage !== language) {
      setLanguage(detectedLanguage as 'en' | 'es' | 'fr');
    }
  }, [location.pathname, language, setLanguage]);
  
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
    <HelmetProvider>
      <LanguageProvider>
        <SEOProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Handle all localized routes */}
                <Route path="/merge" element={<LocalizedRouter />} />
                <Route path="/combinar" element={<LocalizedRouter />} />
                <Route path="/fusionner" element={<LocalizedRouter />} />
                <Route path="/split" element={<LocalizedRouter />} />
                <Route path="/dividir" element={<LocalizedRouter />} />
                <Route path="/diviser" element={<LocalizedRouter />} />
                <Route path="/compress" element={<LocalizedRouter />} />
                <Route path="/comprimir" element={<LocalizedRouter />} />
                <Route path="/compresser" element={<LocalizedRouter />} />
                <Route path="/rotate" element={<LocalizedRouter />} />
                <Route path="/rotar" element={<LocalizedRouter />} />
                <Route path="/rotation" element={<LocalizedRouter />} />
                <Route path="/pdf-to-word" element={<LocalizedRouter />} />
                <Route path="/pdf-a-word" element={<LocalizedRouter />} />
                <Route path="/pdf-vers-word" element={<LocalizedRouter />} />
                <Route path="/pdf-to-jpg" element={<LocalizedRouter />} />
                <Route path="/pdf-a-jpg" element={<LocalizedRouter />} />
                <Route path="/pdf-vers-jpg" element={<LocalizedRouter />} />
                <Route path="/pdf-to-text" element={<LocalizedRouter />} />
                <Route path="/pdf-a-texto" element={<LocalizedRouter />} />
                <Route path="/pdf-vers-texte" element={<LocalizedRouter />} />
                <Route path="/word-to-pdf" element={<LocalizedRouter />} />
                <Route path="/word-a-pdf" element={<LocalizedRouter />} />
                <Route path="/word-vers-pdf" element={<LocalizedRouter />} />
                <Route path="/jpg-to-pdf" element={<LocalizedRouter />} />
                <Route path="/jpg-a-pdf" element={<LocalizedRouter />} />
                <Route path="/jpg-vers-pdf" element={<LocalizedRouter />} />
                <Route path="/" element={<Landing />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SEOProvider>
      </LanguageProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
