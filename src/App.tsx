
import { Toaster as Sonner } from "./components/ui/Toaster";
import { TooltipProvider } from "./components/ui/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PublicSharePage from "./pages/PublicShare";
import PublicBoardPage from "./pages/PublicBoard";

import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || "");

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <ThemeProvider defaultTheme="light">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/share/:token" element={<PublicSharePage />} />
                <Route path="/share/board/:token" element={<PublicBoardPage />} />
                <Route path="*" element={<OverrideNotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ConvexProviderWithClerk>
    </ThemeProvider>
  </ClerkProvider>
);

const OverrideNotFound = () => {
  // Simple check for Convex URL
  if (!import.meta.env.VITE_CONVEX_URL) {
    console.warn("VITE_CONVEX_URL is not set. Please run `npx convex dev` or set it in .env.local");
  }
  return null;
};

export default App;
