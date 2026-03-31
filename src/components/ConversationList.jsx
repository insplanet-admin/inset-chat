import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchRooms } from "../api/rooms.js";
import { useNavigate } from "react-router-dom";
import MenuItem from "./menu-item/index.js";

function ConversationList() {
  const navigate = useNavigate();

  const { data: rooms } = useSuspenseQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
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
