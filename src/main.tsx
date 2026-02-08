
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root");
console.log("[Vault Vibe] Starting initialization...");

if (!rootElement) {
  console.error("[Vault Vibe] Fatal: Root element (#root) not found in DOM");
} else {
  console.log("[Vault Vibe] Root element found, attempting to render...");
  try {
    const root = createRoot(rootElement);
    console.log("[Vault Vibe] React root created, calling render...");
    root.render(<App />);
    console.log("[Vault Vibe] Render called successfully");
  } catch (error) {
    console.error("[Vault Vibe] Fatal: Failed to render React app:", error);

    // Low-level fallback for when React fails to mount at all
    rootElement.innerHTML = `
      <div style="min-height: 100vh; background: #f9fafb; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: sans-serif;">
        <div style="max-width: 400px; width: 100%; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; border: 1px solid #fee2e2;">
          <div style="width: 60px; height: 60px; background: #fef2f2; color: #ef4444; border-radius: 15px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 style="font-size: 20px; font-weight: bold; color: #111827; margin-bottom: 15px;">Application Load Failure</h1>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Vault Vibe failed to initialize. This usually happens due to missing configuration or a script error.
          </p>
          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 15px; text-align: left; font-size: 13px; color: #92400e;">
            <p style="font-weight: bold; margin-top: 0; margin-bottom: 8px;">Checklist:</p>
            <ul style="margin: 0; padding-left: 18px;">
              <li>Check browser console for errors</li>
              <li>Verify environment variables in Vercel</li>
              <li>Ensure VITE_CONVEX_URL is set</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }
}
