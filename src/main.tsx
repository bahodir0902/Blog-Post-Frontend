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

const qc = new QueryClient();
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
                <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
            </QueryClientProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>
);