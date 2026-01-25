import { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebaseAdmin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://projektnotify.com";

    // 1. Static Routes
    const staticRoutes = [
        "",
        "/public",
        "/privacy",
        "/terms",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    // 2. Dynamic Project Routes
    // Fetch active projects from Firestore
    let projectRoutes: MetadataRoute.Sitemap = [];
    try {
        const projectsRef = adminDb.collection("projects");
        const snapshot = await projectsRef
            .where("is_active", "==", true)
            .get();

        projectRoutes = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                url: `${baseUrl}/p/${data.slug}`,
                lastModified: data.updated_at ? data.updated_at.toDate() : new Date(),
                changeFrequency: "daily" as const,
                priority: 0.9,
            };
        });
    } catch (error) {
        console.error("Error generating sitemap:", error);
    }

    return [...staticRoutes, ...projectRoutes];
}
