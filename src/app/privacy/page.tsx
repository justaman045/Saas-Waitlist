import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen pt-28 pb-20 px-6">
            <div className="max-w-4xl mx-auto animate-fade-in">
                {/* Header */}
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-4">
                        Privacy <span className="text-accent-emerald">Protocol</span>
                    </h1>
                    <p className="text-foreground/60 text-sm font-medium uppercase tracking-widest">
                        Last Updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                <div className="glass p-8 md:p-12 rounded-[3rem] border-card-border bg-foreground/[0.01]">
                    <div className="prose prose-sm md:prose-base prose-invert max-w-none text-foreground/80 leading-relaxed space-y-8">

                        <section>
                            <h2 className="text-xl font-bold text-foreground">1. Data Collection Initialization</h2>
                            <p>
                                When you engage with <strong>Projekt Notify</strong> nodes (our waitlists), we collect minimal data required to maintain the integrity of the queue. This primarily includes your <strong>Email Address</strong> and <strong>Full Name</strong>. We may also capture source intelligence (e.g., Referrer URLs) to optimize our deployment strategies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground">2. Usage of Intelligence</h2>
                            <p>
                                Your data is utilized primarily for:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-accent-emerald">
                                <li><strong>Notification:</strong> Alerting you when a project node goes live.</li>
                                <li><strong>Verification:</strong> Ensuring you are a unique human entity (preventing bot fraud).</li>
                                <li><strong>Rank Logic:</strong> Calculating your position in the priority queue based on referral performance.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground">3. Storage & Security Protocols</h2>
                            <p>
                                Data is persisted in <strong>Google Firebase</strong> (Firestore), secured by Google Cloud's enterprise-grade infrastructure. While we employ standard encryption and access controls, no transmission over the quantum-web is guaranteed 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground">4. Third-Party Links</h2>
                            <p>
                                Our platform may contain links to external nodes. We are not responsible for the privacy practices or content of these external systems.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground">5. User Rights (GDPR/CCPA)</h2>
                            <p>
                                You retain full sovereignty over your data. At any time, you may request:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-accent-emerald">
                                <li><strong>Access:</strong> A copy of all data held about your entity.</li>
                                <li><strong>Deletion:</strong> Complete removal from our databases ("The Right to be Forgotten").</li>
                            </ul>
                            <p className="mt-4">
                                To execute these rights, contact the System Administrator at <a href="mailto:work.amanojha30@gmail.com" className="text-accent-sky hover:underline">work.amanojha30@gmail.com</a>.
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
