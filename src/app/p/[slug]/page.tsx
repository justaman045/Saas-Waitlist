// app/p/[slug]/page.tsx
import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ProjectPageClient from "./ProjectPageClient";

type Props = {
  params: { slug: string };
};

// Build per-project <head> / metadata
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params; // <-- FIX HERE

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("projects")
    .select(
      `
      name,
      hero_title,
      hero_subtitle,
      short_description,
      full_description,
      gallery
    `
    )
    .eq("slug", params.slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) {
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
