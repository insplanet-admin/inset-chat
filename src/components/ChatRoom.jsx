import { useEffect, useRef, useState } from "react";
import ChatMessages from "./ChatMessages";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postChat } from "../api/chat";
import { fetchMessagesByRoomId, insertMessages } from "../api/messages";
import PromptInput from "./prompt/PromptInput";
import { FilePen } from "lucide-react";
import { useParams } from "react-router-dom";

export default function ChatRoom() {
  const { id: roomID } = useParams();
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

    // eslint-disable-next-line
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

  const handleSubmit = (e) => {
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

  // textarea에서 Enter키만 눌렀을 때 전송되도록 처리
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <>
      <div className="chatPanelHeader">
        <span style={{ flex: 1, textAlign: "center" }}>Chat name</span>
        <button className="iconButton" style={{ marginLeft: "auto" }}>
          <FilePen size={20} />
        </button>
      </div>
      {/* <div className="chatPanelHeader">{roomID}</div> */}
      <ChatMessages messages={messages} />
      <PromptInput
        value={message}
        setMessage={(e) => {
          setMessage(e.target.value);
        }}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
      />
    </>
  );
}
