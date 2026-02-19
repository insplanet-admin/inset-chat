import { supabase } from "../utils";

export async function fetchRooms() {
  const { data, error } = await supabase.from("Rooms").select("*");

  if (error) throw error;
  return data;
}

export async function createRooms({ name }) {
  const { data, error } = await supabase
    .from("Rooms")
    .insert({ name })
    .select("*")
    .single();

  if (error) throw error;
  return data; // 새로 만들어진 room row
}
