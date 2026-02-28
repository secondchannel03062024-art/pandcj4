import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider } from "./context/AppContext";
import { ClerkProvider } from "@clerk/clerk-react";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key in .env");
}

export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY || ""}>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ClerkProvider>
  );
}