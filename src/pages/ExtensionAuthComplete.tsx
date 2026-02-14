import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function ExtensionAuthComplete() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      // Small delay to ensure Clerk has fully sync'd session if needed
      const timer = setTimeout(() => {
        if (window.opener) {
          window.close();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSignedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center border">
        <h1 className="text-xl font-semibold mb-2">Sign-in Complete</h1>
        <p className="text-sm text-gray-600 mb-6">
          {isSignedIn
            ? "You are signed in! This window should close automatically."
            : "If you are not signed in, please try again from the extension."}
        </p>

        {isSignedIn && (
          <button
            onClick={() => window.close()}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-200"
          >
            Close Window
          </button>
        )}

        {!isSignedIn && (
          <a
            className="inline-block px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition"
            href="/"
          >
            Go to Home
          </a>
        )}
      </div>
    </div>
  );
}
