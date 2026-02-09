import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function ExtensionAuthComplete() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    // No-op: Clerk handles session. This page serves as a valid https redirect target.
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center border">
        <h1 className="text-xl font-semibold mb-2">Sign-in Complete</h1>
        <p className="text-sm text-gray-600 mb-4">
          {isSignedIn
            ? "You are signed in. You can close this tab and return to the extension."
            : "If you are not signed in, please try again from the extension."}
        </p>
        <a
          className="inline-block px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition"
          href="/"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}
