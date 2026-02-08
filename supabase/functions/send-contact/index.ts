import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  try {
    const { name, email, topic, message, to } = await req.json();

    if (!name || !email || !topic || !message) {
      return new Response("Missing fields", { status: 400 });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response("RESEND_API_KEY not set", { status: 500 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: "Primal Lab <onboarding@resend.dev>",
        to: [to || "primallabcontact@gmail.com"],
        subject: `[${topic}] Message from ${name}`,
        reply_to: email,
        text: `From: ${name} (${email})\n\n${message}`
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(err, { status: 500 });
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("error", { status: 500 });
  }
});
