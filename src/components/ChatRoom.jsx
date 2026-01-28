import { useEffect, useRef, useState } from "react";
import ChatMessages from "./ChatMessages";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postChat } from "../api/chat";
import { fetchMessagesByRoomId, insertMessages } from "../api/messages";

export default function ChatRoom({ roomID }) {
  const qc = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const initializedRoomRef = useRef(null);

  const {
    data: roomMessages,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["roomMessages", roomID],
    queryFn: () => fetchMessagesByRoomId(roomID),
    enabled: !!roomID,
  });

  useEffect(() => {
    if (!roomID) return;
    if (isLoading || isError) return;
    if (!roomMessages) return;

    if (initializedRoomRef.current === roomID) return;
    initializedRoomRef.current = roomID;

    setMessages(
      roomMessages.map((m) => ({
        id: m.id,
        role: m.user_id == 1004 ? false : true,
        content: m.content,
        status: m.status ?? "done",
        created_at: m.created_at,
      })),
    );
  }, [roomID, isLoading, isError, roomMessages]);

  const insertMutation = useMutation({
    mutationFn: insertMessages,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roomMessages"] }); // 목록 갱신
    },
  });

  const chatMutation = useMutation({
    mutationFn: postChat,
    onSuccess: (data, variables) => {
      const id = variables.id;
      const text = data?.text ?? "";
      if (!text) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id == id ? { ...m, role: true, content: text, status: "done" } : m,
        ),
      );

      insertMutation.mutate({
        content: text,
        roomId: roomID,
        userId: 9999,
      });
    },
    onError: (err, variables) => {
      const id = variables.id;

      setMessages((prev) =>
        prev.map((m) =>
          m.id == id
            ? {
                ...m,
                role: true,
                content: "다시 시도해주세요. 죄송합니다.",
                status: "error",
              }
            : m,
        ),
      );
    },
  });

  const onSubmitAction = (e) => {
    e.preventDefault();

    setMessages((prev) => [...prev, { role: false, content: message }]);

    insertMutation.mutate({
      content: message,
      roomId: roomID,
    });

    setMessage("");

    if (roomID == 4) {
      const id = crypto.randomUUID();

      console.log(id);

      setMessages((prev) => [
        ...prev,
        {
          id: id,
          role: true,
          content: "",
          status: "pending",
        },
      ]);

      chatMutation.mutate({ message: message, id: id });
    }
  };

  return (
    <>
      <div className="chatPanelHeader">
        <span className="chatRoomName">{roomID}</span>
      </div>

      <ChatMessages messages={messages} />

      <form className="chatInputBar" onSubmit={onSubmitAction}>
        <input
          className="chatInput"
          placeholder="메시지를 입력하세요..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        />
        <button className="sendBtn" type="submit">
          Send
        </button>
      </form>
    </>
  );
}
