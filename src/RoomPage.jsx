import { useQuery } from "@tanstack/react-query";
import { fetchRooms } from "./api/rooms";
import React from "react";

export default function RoomPage() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });

  if (isPending) return <div style={{ padding: 16 }}>로딩중....</div>;

  if (isError) {
    return (
      <div style={{ padding: 16 }}>
        <h3>rooms 불러오기 실패</h3>
        <p>{error.message}</p>
        <button onClick={() => refetch()}>다시 시도</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <ul>
        {data.map((room) => (
          <li key={room.id}>{room.title}</li>
        ))}
      </ul>
      <p style={{ opacity: 0.7 }}>
        (MSW가 20% 확률로 에러를 내게 해놔서 새로고침하면 가끔 실패합니다)
      </p>
    </div>
  );
}
