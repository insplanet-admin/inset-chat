export async function fetchRooms() {
  const res = await fetch("/api/rooms");

  if (!res.ok) {
    let body = {};
    try {
      body = await res.json();
    } catch {
      body = {};
    }
    throw new Error(body.message || "Failed to fetch rooms");
  }

  const data = await res.json();
  return data.rooms;
}
