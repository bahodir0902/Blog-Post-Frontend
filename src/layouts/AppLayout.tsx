import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)]">
            <Navbar />
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10">
                {children}
            </main>
            <Footer />
        </div>
    );
}