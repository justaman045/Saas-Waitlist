import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabaseServer = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ⛔ Must await params in Next.js 14
    const { id } = await context.params;

    const supabase = supabaseServer();

    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("name")
      .eq("id", id)
      .single();

    if (projErr || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const { data: entries, error } = await supabase
      .from("waitlist_entries")
      .select("email")
      .eq("project_id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const emails = Array.from(new Set(entries.map((e) => e.email)));

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
