export async function onRequestPost(context) {
  const { request, env } = context;

  let name, email, source;
  try {
    ({ name, email, source } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!name || !email) {
    return Response.json({ error: "Name and email are required." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json({ error: "Invalid email address." }, { status: 400 });
  }

  try {
    await env.DB.prepare(
      "INSERT INTO signups (name, email, source) VALUES (?, ?, ?)"
    ).bind(name, email, source || null).run();
    return Response.json({ success: true });
  } catch (err) {
    if (err.message?.includes("UNIQUE constraint failed")) {
      return Response.json({ error: "You're already signed up!" }, { status: 409 });
    }
    // Fallback if source column doesn't exist yet
    if (err.message?.includes("no column named source") || err.message?.includes("table signups has no column")) {
      try {
        await env.DB.prepare(
          "INSERT INTO signups (name, email) VALUES (?, ?)"
        ).bind(name, email).run();
        return Response.json({ success: true });
      } catch (fallbackErr) {
        if (fallbackErr.message?.includes("UNIQUE constraint failed")) {
          return Response.json({ error: "You're already signed up!" }, { status: 409 });
        }
      }
    }
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
