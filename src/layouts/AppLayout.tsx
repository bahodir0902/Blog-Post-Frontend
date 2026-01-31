import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    // Scroll to top on route change - fixes the bug where pages start at bottom
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)]">
            <Navbar />
            <main className="flex-1 py-8 md:py-12">
                {children}
            </main>
            <Footer />
        </div>
    );
}