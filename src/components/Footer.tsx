import { Link } from "react-router-dom";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        {
            title: "Product",
            links: [
                { label: "Features", href: "#" },
                { label: "Pricing", href: "#" },
                { label: "Blog", href: "/" },
            ],
        },
        {
            title: "Company",
            links: [
                { label: "About", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Contact", href: "#" },
            ],
        },
        {
            title: "Legal",
            links: [
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
                { label: "Security", href: "#" },
            ],
        },
    ];

    const socialLinks = [
        {
            name: "Twitter",
            href: "#",
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
            ),
        },
        {
            name: "GitHub",
            href: "#",
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
            ),
        },
        {
            name: "LinkedIn",
            href: "#",
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
            ),
        },
    ];

    return (
        <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            {/* Main Footer Content */}
            <div className="container-responsive py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link to="/" className="inline-flex items-center gap-3 group">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">B</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)] bg-clip-text text-transparent">
                ModernBlog
              </span>
                        </Link>
                        <p className="text-[var(--color-text-secondary)] max-w-xs leading-relaxed">
                            Beautiful, modern blog platform with JWT authentication, OTP verification, and a stunning user experience.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    className="p-2.5 rounded-lg bg-[var(--color-surface-elevated)] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-500)] hover:bg-[var(--color-brand-100)] dark:hover:bg-[var(--color-brand-900)] transition-all duration-300 hover:scale-110"
                                    aria-label={social.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-500)] transition-colors duration-200 inline-flex items-center gap-2 group"
                                        >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[var(--color-border)] bg-[var(--color-background)]">
                <div className="container-responsive py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-[var(--color-text-tertiary)]">
                            © {currentYear} ModernBlog. All rights reserved.
                        </p>

                        <div className="flex items-center gap-6">
                            <Link
                                to="#"
                                className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-500)] transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="#"
                                className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-500)] transition-colors"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                to="#"
                                className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-500)] transition-colors"
                            >
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}