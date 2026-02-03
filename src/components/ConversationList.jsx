import React, { useEffect, useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createRooms, fetchRooms } from "../api/rooms.js";

function ConversationList({
  activeRoomId,
  onSelectRoom,
  isCreating,
  closeCreating,
}) {
  const qc = useQueryClient();

  const { data: rooms } = useSuspenseQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });
  const [name, setName] = useState("");

  const createMutation = useMutation({
    mutationFn: createRooms,
    onSuccess: (newRoom) => {
      qc.invalidateQueries({ queryKey: ["rooms"] });

      closeCreating();
      setName("");

      onSelectRoom?.(newRoom.id);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = name.trim();
    if (!v) return;

    createMutation.mutate({ name: v });
  };

  return (
    <div className="roomsList">
      {rooms.map((room) => (
        <button
          key={room.id}
          className={`roomBtn ${room.id === activeRoomId ? "isActive" : ""}`}
          onClick={() => onSelectRoom(room.id)}
        >
          {room.name}
        </button>
      ))}
      {isCreating && (
        <form onSubmit={handleSubmit}>
          <input
            className="roomListInput"
            placeholder="채팅방이름..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            autoFocus
            disabled={createMutation.isPending}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                closeCreating();
                setName("");
              }
            }}
          />
        </form>
      )}
    </div>
  );
}

export default ConversationList;
