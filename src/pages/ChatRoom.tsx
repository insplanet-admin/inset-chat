import {
  ContentInner,
  FixedBottom,
  FixedTop,
  Main,
  ScrollBody,
} from "../components/layouts";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { nanoid } from "nanoid";
import ConversationArea from "../components/ConversationArea";
import PromptInput from "../components/prompt/PromptInput";
import { fetchMessages } from "../apis/messages";
import { parseAndSaveResume } from "../services/resumeService";
import { useInsertMessage, useChatAI } from "../utils/hooks";
import { useIsMutating } from "@tanstack/react-query";

const ChatRoom = () => {
  const { id: roomID } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const isAITyping = useIsMutating({ mutationKey: ["postChatAI"] }) > 0;

  const { candidateId } = useParams();
  const isCandidatePanelOpen = !!candidateId;

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["roomMessages", roomID],
    queryFn: () => fetchMessages(roomID),
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

  const insertMessage = useInsertMessage();
  const chatAI = useChatAI(insertMessage.mutate);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    insertMessage.mutate({
      content: prompt,
      roomId: roomID,
    });

    // AI에게 답변 요청 (로딩 말풍선)
    chatAI.mutate({
      message: prompt,
      id: nanoid(),
      roomId: roomID,
    });

    setPrompt("");

    //
  };

  // textarea에서 Enter키만 눌렀을 때 전송되도록 처리
  const handleKeyDown = (event) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handleFileDrop = async (file) => {
    console.log("파일 분석 시작:", file.name);
    try {
      const savedData = await parseAndSaveResume(file);
      console.log("saveData", savedData);
      qc.invalidateQueries({ queryKey: ["roomMessages", roomID] });
    } catch (error) {
      console.error(error);
    }
  };

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      // 방법 A: 즉시 이동
      // scrollRef.current.scrollTop = scrollRef.current.scrollHeight;

      // 방법 B: 부드럽게 이동 (선호됨)
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        gap: "1rem",
        overflow: "hidden",
      }}
    >
      <Main>
        <ScrollBody ref={scrollRef}>
          <ContentInner size="wide">
            <FixedTop>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "64px",
                }}
              >
                room id
              </div>
            </FixedTop>
            <ConversationArea messages={messages} isAITyping={isAITyping} />
          </ContentInner>
        </ScrollBody>
        <FixedBottom>
          <PromptInput
            value={prompt}
            setPrompt={(e) => {
              setPrompt(e.target.value);
            }}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            onFileDrop={handleFileDrop}
          />
          {/* <Suggestions>
            {[
              "신한은행 파견 근무를 위한 퍼블리셔는 어떤 역량이 필요해?",
              "오늘 서울 날씨 어때?",
              "센트럴에쓰 근처의 점심 식당 추천해줘.",
            ].map((suggestion) => (
              <Suggestion key={suggestion}>{suggestion}</Suggestion>
            ))}
          </Suggestions> */}
        </FixedBottom>
      </Main>
      <Outlet />
    </div>
  );
};

const Suggestions = ({ children }: { children: React.ReactNode }) => {
  return <div className="suggestions">{children}</div>;
};

const Suggestion = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <button className="suggestion" onClick={onClick}>
      {children}
    </button>
  );
};

export default ChatRoom;
