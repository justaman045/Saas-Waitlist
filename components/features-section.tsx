import { Rocket, Shield, Zap, Globe, BarChart3, Users } from "lucide-react"

const features = [
    {
        icon: Rocket,
        title: "Early Access",
        description: "Be the first to try revolutionary tools before they hit the mainstream market.",
    },
    {
        icon: Shield,
        title: "Vetted Quality",
        description: "Every project is reviewed to ensure it's legitimate and high-quality.",
    },
    {
        icon: Zap,
        title: "Exclusive Perks",
        description: "Waitlist members often get special discounts and lifetime deals.",
    },
    {
        icon: Globe,
        title: "Global Community",
        description: "Join a network of early adopters and tech enthusiasts from around the world.",
    },
    {
        icon: BarChart3,
        title: "Direct Feedback",
        description: "Shape the product roadmap by providing direct feedback to founders.",
    },
    {
        icon: Users,
        title: "Founder Access",
        description: "Get closer to the makers building the tools you use every day.",
    },
]

export function FeaturesSection() {
    return (
        <section className="container py-24 sm:py-32">
            <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-primary">Why Join?</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                    More than just a waitlist.
                </p>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    We connect ambitious founders with passionate early adopters. Discover products that solve real problems.
                </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                    {features.map((feature) => (
                        <div key={feature.title} className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                                <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                                {feature.title}
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                                <p className="flex-auto">{feature.description}</p>
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    )
}
