
import { Toaster as Sonner } from "./components/ui/Toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PublicSharePage from "./pages/PublicShare";
import PublicBoardPage from "./pages/PublicBoard";
import ExtensionAuthComplete from "./pages/ExtensionAuthComplete";
import Privacy from "./pages/Privacy";
import AboutUs from "./pages/AboutUs";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";

import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const MissingEnvError = ({ name }: { name: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-red-100 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Missing</h1>
      <p className="text-gray-600 mb-6 leading-relaxed">
        The environment variable <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600 font-mono text-sm">{name}</code> is not set.
        Please configure it in your Vercel project settings or <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono text-sm">.env.local</code>.
      </p>
      <div className="bg-amber-50 rounded-xl p-4 text-left text-sm text-yellow-800 border border-yellow-100">
        <p className="font-bold mb-1">How to fix this:</p>
        <ol className="list-decimal ml-4 space-y-1">
          <li>Go to your Vercel Project Settings</li>
          <li>Select "Environment Variables"</li>
          <li>Add <span className="font-mono">{name}</span> with its corresponding value</li>
          <li>Redeploy your application</li>
        </ol>
      </div>
    </div>
  </div>
);


import { UserSync } from "./components/auth/UserSync";

const App = () => {
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
  const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!CONVEX_URL) return <MissingEnvError name="VITE_CONVEX_URL" />;
  if (!CLERK_PUBLISHABLE_KEY) return <MissingEnvError name="VITE_CLERK_PUBLISHABLE_KEY" />;

  const convex = new ConvexReactClient(CONVEX_URL);

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ThemeProvider defaultTheme="light">
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <UserSync />
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/share/:token" element={<PublicSharePage />} />
                  <Route path="/share/board/:token" element={<PublicBoardPage />} />
                  <Route path="/extension-auth-complete" element={<ExtensionAuthComplete />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </ConvexProviderWithClerk>
      </ThemeProvider>
    </ClerkProvider>
  );
};

const OverrideNotFound = () => {
  // Simple check for Convex URL
  if (!import.meta.env.VITE_CONVEX_URL) {
    console.warn("VITE_CONVEX_URL is not set. Please run `npx convex dev` or set it in .env.local");
  }
  return null;
};

export default App;
