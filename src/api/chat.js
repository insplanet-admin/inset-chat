export async function postChat({ message }) {
  // http://192.168.68.56:3000/chat
  const res = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: message }] }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error("chat error:", res.status, body);
    throw new Error(body.message || "chat failed");
  }

  return res.json();
}
