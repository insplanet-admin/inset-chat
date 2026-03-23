import Text from "./components/Text";
import { Menu, Search } from "lucide-react";
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

export default function ChatMain() {
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

      // 이걸로 화면 구성하면 될 듯 합니다.
      console.log(text);

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
    setMessages((prev) => [...prev, { role: false, content: message }]);

    console.log("handleSubmit");
    insertMutation.mutate({
      content: message,
      roomId: roomID,
    });

    setMessage("");

    if (roomID == "4") {
      // UUID를 사용할때 기본 함수 -> crypto.randomUUID()를 사용하는데 type에러가 있어서
      // nanoid라는 라이브러리를 사용.
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

      chatMutation.mutate({ message: message, id: id });
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
        <div>
          <Row justify="space-between" align="center" style={{ width: "100%" }}>
            <button className="iconButton">
              <Menu size={20} />
            </button>
            <button className="iconButton">
              <Search size={20} />
            </button>
          </Row>
        </div>
        <Spacer size={4} />
        <Spacer size={4} />
        <Spacer size={4} />
        <div style={{ padding: "0 .75rem" }}>
          <Text variant="label" color="#999">
            내 채팅
          </Text>
        </div>
        <Spacer size={1} />
        <ConversationArea />
      </Sidebar>
      <Main>
        {/* <ScrollBody>
          <div style={{ padding: "20px" }}>
            <h2 style={{ height: "100vh" }}>컨텐츠 제목</h2>
            <p>매우 긴 내용들...</p>
          </div>
        </ScrollBody> */}
        <ScrollBody>
          <ContentInner size="wide">
            <FixedTop>room id</FixedTop>
            <ChatMessages messages={messages} />
          </ContentInner>
        </ScrollBody>
        <FixedBottom>
          <PromptInput
            value={message}
            setMessage={(e) => {
              setMessage(e.target.value);
            }}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            onFileDrop={handleFileDrop}
          />
        </FixedBottom>
      </Main>
    </Page>
  );
}
