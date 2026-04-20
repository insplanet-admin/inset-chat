import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchRooms } from "../apis/rooms.js";
import { useNavigate } from "react-router-dom";
import MenuItem from "./menu-item/index.js";
import { getUser } from "../utils/getUser";

function ConversationList() {
  const navigate = useNavigate();

  const user = getUser();

  const { data: rooms } = useSuspenseQuery({
    queryKey: ["rooms", user?.id],
    queryFn: () => fetchRooms(user?.id),
  });

  return (
    <div className="roomsList">
      {rooms.map((room) => (
        <MenuItem key={room.id} onClick={() => navigate(`/chat/${room.id}`)}>
          {room.name}
        </MenuItem>
      ))}
    </div>
  );
}

export default ConversationList;
