import { supabase } from "../utils/supabase";

// export async function fetchDevMessages() {
//   const { data, error } = await supabase.from("dev").select("*");

//   if (error) throw error;
//   return data;
// }

// export async function insertDevMessages({ role, content, status }) {
//   const { data, error } = await supabase
//     .from("dev")
//     .insert({ role, content, status })
//     .select("*")
//     .single();

//   if (error) {
//     console.log("SUPABASE INSERT ERROR:", error);
//     throw error;
//   }
//   return data; // 새로 만들어진 room row
// }

// fetchConversations();
// createConversationMessage();
// createConversationResponse();
// startConversationWithResponse

const fetchConversations = async (userId: any) => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("Rooms")
    .select("*")
    .eq("userid", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

const startConversation = async ({ name, userId }: any) => {
  const { data, error } = await supabase
    .from("Rooms")
    .insert({ name: name, userid: userId })
    .select("*")
    .single();

  if (error) throw error;
  return data; // 새로 만들어진 room row
};

async function fetchConversation(roomId: any) {
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

// Message / Response 둘 다 insert?
async function createConversationMessage({
  content,
  userId = 1004,
  roomId,
}: any) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ content: content, user_id: userId, room_id: roomId })
    .select("*")
    .single();

  if (error) {
    console.error("SUPABASE INSERT ERROR:", error);
    throw error;
  }
  return data; // 새로 만들어진 room row
}

export {
  fetchConversations,
  fetchConversation,
  startConversation,
  createConversationMessage,
};
