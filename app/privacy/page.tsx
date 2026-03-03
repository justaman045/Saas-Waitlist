export default function PrivacyPage() {
    return (
        <div className="container max-w-3xl py-12 md:py-24">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Privacy Policy</h1>
            <div className="prose prose-invert max-w-none">
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <h2>1. Introduction</h2>
                <p>
                    Welcome to SaaS Waitlist. We respect your privacy and are committed to protecting your personal data.
                    This privacy policy will inform you as to how we look after your personal data when you visit our website
                    and tell you about your privacy rights and how the law protects you.
                </p>

                <h2>2. Data We Collect</h2>
                <p>
                    We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                </p>
                <ul>
                    <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                    <li><strong>Contact Data:</strong> includes email address.</li>
                    <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                </ul>

                <h2>3. How We Use Your Data</h2>
                <p>
                    We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                </p>
                <ul>
                    <li>To register you as a new user.</li>
                    <li>To manage our relationship with you.</li>
                    <li>To improve our website, products/services, marketing or customer relationships.</li>
                </ul>
            </div>
        </div>
    )
}
