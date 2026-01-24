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

    const fromEmail = process.env.LAUNCH_FROM_EMAIL || "onboarding@resend.dev";

    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: fromEmail, // Send to self so BCC works correctly for mass broadcast
      bcc: emails,
      subject: `🚀 ${project.name} is Now Live!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
          <h1 style="color: #0f172a; margin-bottom: 24px; font-size: 24px; font-weight: 700;">${project.name} is officially live</h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Thank you for your patience and for being part of our exclusive waitlist. We're excited to announce that you now have priority access.</p>
          <div style="margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/p/${project.slug}" 
               style="background-color: #0284c7; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
               Visit Project Showcase
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #0284c7; font-size: 14px;">${process.env.NEXT_PUBLIC_SITE_URL}/p/${project.slug}</p>
          <hr style="margin: 40px 0; border: 0; border-top: 1px solid #e2e8f0;" />
          <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">© 2024 Modern SaaS Architecture</p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend Error:", emailError);
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
