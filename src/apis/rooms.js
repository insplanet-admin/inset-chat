import { supabase } from "../utils/supabase";

const fetchRooms = async (userId) => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("Rooms")
    .select("*")
    .eq("userid", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

const createRooms = async ({ name, userId }) => {
  const { data, error } = await supabase
    .from("Rooms")
    .insert({ name: name, userid: userId })
    .select("*")
    .single();

  if (error) throw error;
  return data; // 새로 만들어진 room row
};

export { fetchRooms, createRooms };
