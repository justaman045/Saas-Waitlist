import { Project } from "@/types"

export const projects: Project[] = [
    {
        id: "dummy-1",
        title: "ThinkSpace AI",
        description: "An AI-powered workspace that organizes your messy thoughts into structured notes, tasks, and project plans automatically.",
        slug: "thinkspace-ai",
        status: "active",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        waitlistCount: 240,
    },
    {
        id: "dummy-2",
        title: "DevFlow",
        description: "The all-in-one developer productivity suite. Integrate Linear, GitHub, and Slack into a single command center.",
        slug: "devflow",
        status: "coming_soon",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        waitlistCount: 850,
    },
    {
        id: "dummy-3",
        title: "mail_zero",
        description: "Email marketing for developers. Write emails in Markdown, send via API, and track analytics without the bloat.",
        slug: "mail-zero",
        status: "active",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        waitlistCount: 120,
    },
    {
        id: "dummy-4",
        title: "Supabase UI Kit",
        description: "A beautiful, accessible, and customizable UI kit built specifically for Supabase functionality. Drop-in auth pages and more.",
        slug: "supabase-ui-kit",
        status: "coming_soon",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        waitlistCount: 2100,
    },
    {
        id: "dummy-5",
        title: "PodCastr",
        description: "Turn your blog posts into high-quality podcasts using ultra-realistic AI voice synthesis.",
        slug: "podcastr",
        status: "active",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
        waitlistCount: 430,
    },
    {
        id: "dummy-6",
        title: "Analytx",
        description: "Privacy-first web analytics that doesn't suck. Simple, lightweight, and GDPR compliant out of the box.",
        slug: "analytx",
        status: "coming_soon",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
        waitlistCount: 56,
    },
]
