import { supabase } from "../utils";

export async function fetchDevMessages() {
  const { data, error } = await supabase.from("dev").select("*");

  if (error) throw error;
  return data;
}

export async function insertDevMessages({ role, content, status }) {
  const { data, error } = await supabase
    .from("dev")
    .insert({ role, content, status })
    .select("*")
    .single();

  if (error) {
    console.log("SUPABASE INSERT ERROR:", error);
    throw error;
  }
  return data; // 새로 만들어진 room row
}

export async function fetchMessagesByRoomId(roomId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
  return data;
}

export async function insertMessages({ content, userId = 1004, roomId }) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ content: content, user_id: userId, room_id: roomId })
    .select("*")
    .single();

  if (error) {
    console.log("SUPABASE INSERT ERROR:", error);
    throw error;
  }
  return data; // 새로 만들어진 room row
}
