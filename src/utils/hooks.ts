import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { createRooms } from "../apis/rooms";
import { insertMessages } from "../apis/messages";
import { postChat } from "../services/chatService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  user_id: number;
  content: string;
  status?: "done" | "pending" | "error";
  created_at?: string;
}

const useCreateChatRoom = ({ createRoom, insertMessage, chatAI }) => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!message.trim()) return;

    const currentMessage = message;

    try {
      setMessage("");

      const newRoom = await createRoom.mutateAsync({
        name: currentMessage,
      });

      const newRoomId = String(newRoom.id);

      insertMessage.mutate({
        content: currentMessage,
        roomId: newRoomId,
      });

      chatAI.mutate({
        message: currentMessage,
        id: nanoid(),
        roomId: newRoomId,
      });

      navigate(`/${newRoomId}`);
    } catch (error) {
      console.error("채팅방 생성 또는 메시지 전송 실패:", error);

      // 실패 시 복구
      setMessage(currentMessage);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.nativeEvent.isComposing) return;

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return {
    message,
    setMessage,
    handleSubmit,
    handleKeyDown,
  };
};

const useCreateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRooms,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

const useInsertMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: insertMessages,
    onMutate: async (variables) => {
      const { roomId, content } = variables;
      await qc.cancelQueries({ queryKey: ["roomMessages", roomId] });
      const previousMessages = qc.getQueryData(["roomMessages", roomId]);

      // pending을 빼더라도 넣어야하는 이유. -> 말풍선을 먼저 그려줘야하기떄문.
      qc.setQueryData<Message[]>(["roomMessages", roomId], (old) => [
        ...(old || []),
        {
          id: nanoid(),
          content: content,
          user_id: 1004,
          status: "pending",
        },
      ]);

      return { previousMessages, roomId };
    },
    onError: (err, variables, context) => {
      qc.setQueryData(
        ["roomMessages", context.roomId],
        context.previousMessages,
      );
    },
    onSettled: (data, error, variables) => {
      qc.invalidateQueries({ queryKey: ["roomMessages", variables.roomId] });
    },
  });
};

const useChatAI = (insertMessageMutate) => {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["postChatAI"],
    mutationFn: postChat,
    onSuccess: (data, variables) => {
      const text = data?.text ?? "";

      if (!text) {
        qc.setQueryData<Message[]>(["roomMessages", variables.roomId], (old) =>
          old?.filter((m) => m.id !== variables.id),
        );
        return;
      }

      insertMessageMutate({
        content: text,
        roomId: variables.roomId,
        userId: 9999,
      });
    },
  });
};

export { useCreateChatRoom, useCreateRoom, useInsertMessage, useChatAI };
