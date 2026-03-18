const ADMIN_PASSWORD = "bclean2026";

export async function onRequestGet(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const password = url.searchParams.get("password");

  if (password !== ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, email, created_at FROM signups ORDER BY created_at DESC"
    ).all();

    return Response.json({ signups: results, total: results.length });
  } catch (err) {
    return Response.json({ error: "Failed to fetch signups." }, { status: 500 });
  }
}
