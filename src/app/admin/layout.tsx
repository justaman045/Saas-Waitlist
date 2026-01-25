import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
        redirect("/login");
    }

    try {
        // Verify session cookie
        const decodedClaims = await adminAuth.verifySessionCookie(session.value, true);

        // Optional: Check specific email if needed
        // if (decodedClaims.email !== "work.amanojha30@gmail.com") redirect("/login");

    } catch (error) {
        console.error("Session verification failed:", error);
        redirect("/login");
    }

    return <>{children}</>;
}
