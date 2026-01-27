import { useState } from "react";
import ChatMessages from "./ChatMessages";
import { useMutation } from "@tanstack/react-query";
import { postChat } from "../api/chat";

export default function ChatRoom({ roomID }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const chatMutation = useMutation({
    mutationFn: postChat,
    onSuccess: (data, variables) => {
      const id = variables.id;
      const text = data?.text ?? "";
      if (!text) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id == id
            ? { ...m, role: "other", content: text, status: "done" }
            : m,
        ),
      );
    },
    onError: (err, variables) => {
      const id = variables.id;

      setMessages((prev) =>
        prev.map((m) =>
          m.id == id
            ? {
                ...m,
                role: "other",
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

    setMessages((prev) => [...prev, { role: "me", content: message }]);
    setMessage("");

    if (roomID === "ai") {
      const id = crypto.randomUUID();

      console.log(id);

      setMessages((prev) => [
        ...prev,
        {
          id: id,
          role: "other",
          content: "",
          status: "pending",
        },
      ]);

      chatMutation.mutate({ message: message, id });
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
