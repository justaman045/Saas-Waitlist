// app/p/[slug]/page.tsx
import { Metadata } from "next";
import { adminDb } from "@/lib/firebaseAdmin";
import ProjectPageClient from "./ProjectPageClient";

type Props = {
  params: { slug: string };
};

// Build per-project <head> / metadata
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  const projectsRef = adminDb.collection("projects");
  const query = projectsRef
    .where("slug", "==", params.slug)
    .where("is_active", "==", true)
    .limit(1);
  const snapshot = await query.get();

  if (snapshot.empty) {
    const title = "Waitlist not found | Projekt Notify";
    const description = "This waitlist is not available.";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/p/${params.slug}`
      },
      twitter: {
        card: "summary_large_image",
        title,
        description
      }
    };
  }

  const data = snapshot.docs[0].data();
  const title = `${data.name} | Projekt Notify` || `Join the waitlist for ${data.name}`;
  const description =
    data.short_description ||
    data.hero_subtitle ||
    data.full_description ||
    `Join the waitlist for ${data.name}`;

  const image = data.gallery?.[0] || "/default-og.png";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = `${baseUrl}/p/${params.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: [{ url: image }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}


export default async function ProjectPage(props: Props) {
  const params = await props.params;  // <-- FIX

  return <ProjectPageClient slug={params.slug} />;
}
