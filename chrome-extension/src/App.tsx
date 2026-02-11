import { useState, useEffect } from 'react'
import { ClerkProvider, useAuth, SignOutButton } from "@clerk/clerk-react";
import { Clerk } from "@clerk/clerk-js";
import { ConvexReactClient, useMutation, useQuery } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Loader2, Save, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
// @ts-ignore - Ignoring type check for alias import for now
import { api } from "@convex/_generated/api";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CONVEX_URL || !CLERK_PUBLISHABLE_KEY) {
  console.error("Missing env vars. Ensure .env.local is loaded.");
}

const convex = new ConvexReactClient(CONVEX_URL || "");
const clerk = new Clerk(CLERK_PUBLISHABLE_KEY || "");
const REDIRECT_URL =
  (import.meta as any).env?.VITE_EXTENSION_REDIRECT_URL || "http://localhost:8080/extension-auth-complete";

function InnerApp() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"prompt" | "code">("prompt");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | "personal">("personal");

  const createItem = useMutation(api.items.createItem);
  
  // Use cached teams if available, otherwise fetch
  const [cachedTeams, setCachedTeams] = useState<any[]>([]);
  const liveTeams = useQuery(api.teams.getTeamsForUser, userId ? { userId } : "skip") as any[] | undefined;

  // Load cached teams on mount
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['cachedTeams'], (result: { cachedTeams?: any[] }) => {
        if (result.cachedTeams) {
          setCachedTeams(result.cachedTeams);
        }
      });
    }
  }, []);

  // Update cache when live data comes in
  useEffect(() => {
    if (liveTeams) {
      setCachedTeams(liveTeams);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ cachedTeams: liveTeams });
      }
    }
  }, [liveTeams]);

  const teams = liveTeams || cachedTeams;

  useEffect(() => {
    // Check for pending selection
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['pendingSelection'], (result: { pendingSelection?: string }) => {
        if (result.pendingSelection) {
          setContent(result.pendingSelection);
          // Determine type roughly
          if (result.pendingSelection.includes("function") || result.pendingSelection.includes("const ") || result.pendingSelection.includes("import ")) {
             setType("code");
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    // Load persisted workspace selection
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['selectedTeamId'], (result: { selectedTeamId?: string }) => {
        if (result.selectedTeamId) {
          setSelectedTeamId(result.selectedTeamId as any);
        }
      });
    }
  }, []);

  useEffect(() => {
    // Persist selection
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ selectedTeamId });
    }
  }, [selectedTeamId]);

  const handleSave = async () => {
    if (!content.trim() || !userId) return;
    setSaving(true);
    try {
      await createItem({
        userId: userId,
        teamId: selectedTeamId !== "personal" ? (selectedTeamId as any) : undefined,
        title: title || (type === "code" ? "New Snippet" : "New Prompt"),
        content: content,
        type: type,
        language: "javascript", // default
        isFavorite: false,
        metadata: { source: "extension" }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      // Clear storage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.remove(['pendingSelection']);
        chrome.action.setBadgeText({ text: "" });
      }
      
      setContent("");
      setTitle("");

    } catch (err) {
      console.error(err);
      alert("Failed to save: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setContent("");
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove(['pendingSelection']);
      chrome.action.setBadgeText({ text: "" });
    }
  };

  if (!isLoaded) return <div className="p-8 flex justify-center h-screen items-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (!isSignedIn) {
    return (
      <div className="w-[360px] min-h-[400px] bg-background p-4 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
            <img src="/vibe-logo-black.png" alt="Vault Vibe" className="w-12 h-12" />
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight">Vault Vibe</h1>
            <p className="text-sm text-muted-foreground">Sign in to sync with your library</p>
          </div>
        </div>

        <button
          onClick={async () => {
            const url = typeof clerk.buildSignInUrl === 'function'
              ? clerk.buildSignInUrl({ signInForceRedirectUrl: REDIRECT_URL })
              : undefined;
            if (url) {
              window.open(url, '_blank');
            } else {
              try {
                await clerk.redirectToSignIn({ signInForceRedirectUrl: REDIRECT_URL });
              } catch {
                window.open('https://accounts.dev', '_blank');
              }
            }
          }}
          className="mt-8 px-8 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 transition-colors w-full"
        >
          Sign In
        </button>
        <p className="mt-4 text-[11px] text-muted-foreground text-center max-w-[250px]">
           Return to this popup after signing in. Relaunch if needed.
        </p>
      </div>
    );
  }

  return (
    <div className="w-[360px] bg-background text-foreground h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-card">
        <div className="flex items-center gap-2.5">
            <img src="/vibe-logo-black.png" alt="Vault Vibe" className="w-8 h-8" />
          <h1 className="font-bold text-base">Vault Vibe</h1>
        </div>
        <SignOutButton>
          <button className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10">
            Sign Out
          </button>
        </SignOutButton>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace</label>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value as any)}
            className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          >
            {/* Show Personal Workspace only if teams list actually contains a personal team or if list is loading */}
            {(!teams || teams.some(t => t.isPersonal)) && <option value="personal">Personal Workspace</option>}
            {(teams || []).map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} {t.isPersonal ? "(Personal)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setType("prompt")}
              className={cn(
                "h-9 text-sm font-medium rounded-md border transition-all",
                type === "prompt" 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
              )}
            >
              Prompt
            </button>
            <button
              onClick={() => setType("code")}
              className={cn(
                "h-9 text-sm font-medium rounded-md border transition-all",
                type === "code" 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
              )}
            >
              Code
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === "code" ? "e.g., Auth Helper Function" : "e.g., Blog Post Generator"}
            className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</label>
            {content.length > 0 && (
              <button 
                onClick={handleClear}
                className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full p-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono resize-none transition-shadow placeholder:text-muted-foreground/60 leading-relaxed"
            placeholder="Paste your content here..."
          />
        </div>
      </div>

      {/* Footer - Fixed */}
      <div className="p-5 border-t bg-card">
        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          className={cn(
            "w-full h-10 rounded-md flex items-center justify-center gap-2 transition-all font-medium shadow-sm",
            saving || !content.trim()
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {success ? "Saved to Library" : "Save Item"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  // Load Clerk without remote script to satisfy MV3 CSP
  // We kick off load once at module mount
  try {
    clerk.load();
  } catch (e) {
    console.warn("Clerk load warning:", e);
  }
  const routerPush = (to: string) => { window.location.assign(to); };
  const routerReplace = (to: string) => { window.location.replace(to); };
  return (
    <ClerkProvider Clerk={clerk} publishableKey={CLERK_PUBLISHABLE_KEY!} routerPush={routerPush} routerReplace={routerReplace}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
         <InnerApp />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
