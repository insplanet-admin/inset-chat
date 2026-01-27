import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchRooms } from "../api/rooms.js";

export function RoomsList({ activeRoomId, onSelectRoom }) {
  const { data: rooms } = useSuspenseQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });

  return (
    <div className="roomsList">
      {rooms.map((room) => (
        <button
          key={room.id}
          className={`roomBtn ${room.id === activeRoomId ? "isActive" : ""}`}
          onClick={() => onSelectRoom(room.id)}
        >
          {room.title}
        </button>
      ))}
    </div>
  );
}
