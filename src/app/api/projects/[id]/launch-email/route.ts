import { NextResponse } from "next/server";
import { Resend } from "resend";
import { adminDb } from "@/lib/firebaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ⛔ Must await params in Next.js 14
    const { id } = await context.params;

    const projectDoc = await adminDb.collection("projects").doc(id).get();

    if (!projectDoc.exists) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const project = projectDoc.data()!;

    const entriesSnapshot = await adminDb
      .collection("waitlist_entries")
      .where("project_id", "==", id)
      .get();

    const emails = Array.from(new Set(entriesSnapshot.docs.map((doc: any) => doc.data().email as string)));

    if (emails.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 });
    }

    const { error: emailError } = await resend.emails.send({
      from: process.env.LAUNCH_FROM_EMAIL!,
      to: emails,
      subject: `${project.name} is live!`,
      html: `
        <h1>${project.name} is live 🚀</h1>
        <p>Thank you for joining the waitlist.</p>
        <p>You now have early access. Visit the app to get started.</p>
      `,
    });

    if (emailError) {
      return NextResponse.json(
        { error: emailError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, sent: emails.length });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
