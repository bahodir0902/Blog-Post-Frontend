// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./auth/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { NotificationProvider } from "./contexts/NotificationContext";
import App from "./App";
import "./index.css";

// Configure QueryClient with optimized defaults to prevent unnecessary refetches
const qc = new QueryClient({
    defaultOptions: {
        queries: {
            // Prevent refetching when user alt+tabs or switches windows
            refetchOnWindowFocus: false,
            // Keep data fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Retry failed requests only once
            retry: 1,
        },
    },
});
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
            <QueryClientProvider client={qc}>
                <BrowserRouter>
                    <AuthProvider>
                        <ThemeProvider>
                            <NotificationProvider>
                                <App />
                            </NotificationProvider>
                        </ThemeProvider>
                    </AuthProvider>
                </BrowserRouter>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>
);