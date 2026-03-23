import Spacer from "./components/Spacer";
import Row from "./components/Row";
import ConversationArea from "./components/ConversationArea";
import {
  ContentInner,
  FixedBottom,
  FixedTop,
  Main,
  Page,
  ScrollBody,
  Sidebar,
} from "./components/layouts";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { nanoid } from "nanoid";
import ChatMessages from "./components/ChatMessages";
import PromptInput from "./components/prompt/PromptInput";
import { fetchMessagesByRoomId, insertMessages } from "./api/messages";
import { parseAndSaveResume, postChat } from "./aiService";
import Text from "./components/common/text/Text";

export default function ChatMain() {
  // TODO messages 서버 상태를 클라이언트에서 다시 사용하고 있음
  const { id: roomID } = useParams();
  const qc = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");

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
      console.log(err);
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
    setMessages((prev) => [...prev, { role: false, content: prompt }]);

    insertMutation.mutate({
      content: prompt,
      roomId: roomID,
    });

    setPrompt("");

    if (roomID == "4") {
      // UUID를 사용할때 기본 함수 -> crypto.randomUUID()를 사용하는데 type에러가 있어서
      const id = nanoid();

      setMessages((prev) => [
        ...prev,
        {
          id: id,
          role: true,
          content: "",
          status: "pending",
        },
      ]);

      chatMutation.mutate({ message: prompt, id: id });
    }
  };

  // textarea에서 Enter키만 눌렀을 때 전송되도록 처리
  const handleKeyDown = (event) => {
    // 한글 조합시 enter 두번 눌림 방지
    if (event.nativeEvent.isComposing) return;

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      handleSubmit(event);
    }
  };

  const handleFileDrop = async (file) => {
    console.log("파일이 드롭되었습니다:", file.name);
    const userMessageId = nanoid();

    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: true,
        content: "",
        status: "pending",
      },
    ]);

    try {
      // 3. [Logic] 실제 AI 분석 및 DB 저장 요청 (비동기)
      // api.ts에서 만든 parseAndSaveResume 함수 호출
      const savedData = await parseAndSaveResume(file);

      // 저장된 데이터에서 이름 꺼내기 (배열로 반환되므로 첫 번째 요소)
      const candidateName =
        savedData && savedData[0] ? savedData[0].name : "지원자";

      // 4. [UI] 성공 시 봇 메시지 업데이트 (Pending -> Done)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id == userMessageId
            ? {
                ...msg,
                content: ` 분석 완료! '${candidateName}'님의 정보를 DB에 저장했습니다.`,
                status: "done",
              }
            : msg,
        ),
      );

      // (선택사항) 만약 채팅 로그도 DB에 저장해야 한다면 여기서 insertMutation 실행
      // insertMutation.mutate({ content: "파일 분석 완료...", ... })
    } catch (error) {
      console.error(error);

      // 5. [UI] 실패 시 봇 메시지 업데이트 (Pending -> Error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id == userMessageId
            ? {
                ...msg,
                content:
                  " 이력서 분석에 실패했습니다. 파일 형식을 확인해주세요.",
                status: "error",
              }
            : msg,
        ),
      );
    }
  };

  return (
    <Page hasSidebar>
      <Sidebar>
        <Row justify="space-between" align="center">
          ㅇ
        </Row>
        <Spacer size={4} />
        <Spacer size={4} />
        <Spacer size={4} />
        <div style={{ padding: "0 .75rem" }}>
          <Text>내 채팅</Text>
        </div>
        <Spacer size={1} />
        <ConversationArea />
      </Sidebar>
      <Main>
        <ScrollBody>
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
            <ChatMessages messages={messages} />
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
          <Suggestions>
            {[
              "신한은행 파견 근무를 위한 퍼블리셔는 어떤 역량이 필요해?",
              "오늘 서울 날씨 어때?",
              "센트럴에쓰 근처의 점심 식당 추천해줘.",
            ].map((suggestion) => (
              <Suggestion key={suggestion}>{suggestion}</Suggestion>
            ))}
          </Suggestions>
        </FixedBottom>
      </Main>
    </Page>
  );
}

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
