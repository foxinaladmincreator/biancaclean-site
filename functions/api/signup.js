export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return Response.json({ error: "Name and email are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email address." }, { status: 400 });
    }

    await env.DB.prepare(
      "INSERT INTO signups (name, email) VALUES (?, ?)"
    ).bind(name, email).run();

    return Response.json({ success: true });
  } catch (err) {
    if (err.message?.includes("UNIQUE constraint failed")) {
      return Response.json({ error: "You're already signed up!" }, { status: 409 });
    }
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
