import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen pt-28 pb-20 px-6">
            <div className="max-w-4xl mx-auto animate-fade-in">
                {/* Header */}
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-4">
                        Terms of <span className="text-accent-sky">Service</span>
                    </h1>
                    <p className="text-foreground/60 text-sm font-medium uppercase tracking-widest">
                        Last Updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                <div className="glass p-8 md:p-12 rounded-[3rem] border-card-border bg-foreground/[0.01]">
                    <div className="prose prose-sm md:prose-base prose-invert max-w-none text-foreground/80 leading-relaxed space-y-8">

                        <section>
                            <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
                            <p>
                                By accessing <strong>Projekt Notify</strong> and joining our waitlists, you agree to be bound by these Terms of Service. If you do not agree, you are prohibited from using this platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground">2. Access & Availability</h2>
                            <p>
                                Joining a waitlist does not guarantee access to the final product. We reserve the right to admit users at our discretion, based on available server capacity and beta testing requirements.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground">3. User Conduct</h2>
                            <p>
                                You agree not to:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-accent-sky">
                                <li>Use botnets or scripts to artificially inflate referral counts.</li>
                                <li>Inject malicious code or attempt to destabilize the platform infrastructure.</li>
                                <li>Submit false identification data.</li>
                            </ul>
                            <p className="mt-2 text-red-400/80 italic">
                                Violation will result in immediate termination of your waitlist position and a permanent ban from all future projects.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground">4. Intellectual Property</h2>
                            <p>
                                All code, designs, and content on Projekt Notify are the exclusive property of the developer. Unauthorized reproduction is strictly prohibited.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground">5. Limitation of Liability</h2>
                            <p>
                                Projekt Notify is provided "as is". We are not liable for any data loss, service interruptions, or missed opportunities resulting from your use of the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground">6. Govering Law</h2>
                            <p>
                                These terms are governed by the laws of the operating jurisdiction. Any disputes shall be resolved in the competent courts of that jurisdiction.
                            </p>
                        </section>

                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/" className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-colors">
                        ← Return to Base
                    </Link>
                </div>
            </div>
        </div>
    );
}
