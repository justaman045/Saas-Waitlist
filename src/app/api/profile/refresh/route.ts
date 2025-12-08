import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        // ========= 1. FETCH GITHUB =========
        const githubUser = "justaman045"; // your GitHub username

        const ghRes = await fetch(`https://api.github.com/users/${githubUser}`);
        const ghData = await ghRes.json();

        const githubProfile = {
            name: ghData.name,
            bio: ghData.bio,
            avatar: ghData.avatar_url,
            repos: ghData.public_repos,
            followers: ghData.followers,
            url: ghData.html_url,
        };

        // ======= 2. FETCH LINKEDIN (OpenGraph only) =======
        const linkedinUrl = "https://www.linkedin.com/in/justaman045/";

        let linkedinProfile: {
            title: string | null;
            description: string | null;
            avatar: string | null;
            url: string;
        } = {
            title: null,
            description: null,
            avatar: null,
            url: linkedinUrl,
        };

        try {
            const ogReq = await fetch(
                `https://api.allorigins.win/raw?url=${encodeURIComponent(linkedinUrl)}`
            );

            const html = await ogReq.text();

            linkedinProfile.title =
                html.match(/<meta property="og:title" content="(.*?)"/)?.[1] || null;

            linkedinProfile.description =
                html.match(/<meta property="og:description" content="(.*?)"/)?.[1] || null;

            linkedinProfile.avatar =
                html.match(/<meta property="og:image" content="(.*?)"/)?.[1] || null;

        } catch (err) {
            // LinkedIn frequently blocks OG requests — we ignore the failure
            console.log("LinkedIn OG fetch failed:", err);
        }



        // ========= 3. SAVE BOTH TO SUPABASE =========
        await supabase
            .from("profile_cache")
            .upsert({
                id: 1,
                github: githubProfile,
                linkedin: linkedinProfile,
                updated_at: new Date().toISOString()
            });

        return NextResponse.json({ ok: true });

    } catch (err: any) {
        return NextResponse.json({ error: err.message });
    }
}
