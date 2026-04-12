import { useQuery } from "@tanstack/react-query";
import { fetchConversation } from "../apis/conversation";

interface Message {
  id: string | number;
  user_id: number;
  content: string;
  status?: string;
  created_at: string;
}

interface TransformedMessage {
  id: string | number;
  role: boolean;
  content: string;
  status: string;
  created_at: string;
}

export const useConversation = (roomID: string | number | undefined) => {
  const queryResult = useQuery<Message[], Error, TransformedMessage[]>({
    queryKey: ["conversation", roomID],
    queryFn: () => fetchConversation(roomID!),
    enabled: !!roomID,
    select: (data) =>
      data.map((m) => ({
        id: m.id,
        role: m.user_id === 1004 ? false : true,
        content: m.content,
        status: m.status ?? "done",
        created_at: m.created_at,
      })),
  });

  return {
    // data가 undefined일 경우 빈 배열([])을 기본값으로 할당하여 'conversation'로 반환
    conversation: queryResult.data ?? [],
  };
};
