import { useState } from "react";
import { ContentInner, FixedTop, Main } from "../components/layouts";
import Spacer from "../components/Spacer";
import Text from "../components/common/text/Text";
import PromptInput from "../components/prompt/PromptInput";
import styled from "styled-components";
import { useNavigate, useOutletContext } from "react-router-dom";
import { nanoid } from "nanoid";

import { useCreateRoom, useInsertMessage, useChatAI } from "../utils/hooks";
import { getUser } from "../utils/getUser";

const ChatMain = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const createRoom = useCreateRoom();
  const insertMessage = useInsertMessage();
  const chatAI = useChatAI(insertMessage.mutate);

  const user = getUser();

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    if (!message.trim()) return;

    try {
      setMessage("");

      const newRoom = await createRoom.mutateAsync({
        name: message,
        userId: user.id,
      });
      const newRoomId = String(newRoom.id);

      insertMessage.mutate({
        content: message,
        roomId: newRoomId,
      });

      chatAI.mutate({
        message: message,
        id: nanoid(),
        roomId: newRoomId,
      });

      navigate(`/chat/${newRoomId}`);
    } catch (error) {
      console.error("채팅방 생성 또는 메시지 전송 실패:", error);
      // 에러 발생 시 입력창 복구
      setMessage(message);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleKeyDown = (event) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };
  const handleFileDrop = () => {
    console.log("handleFileDrop");
  };

  return (
    <Main>
      <ContentInner size="wide">
        <FixedTop>
          <Text variant="headingSm" weight="bold" as="h2">
            RING CHAT
          </Text>
        </FixedTop>
      </ContentInner>
      <CenterWrapper>
        <TitleContainer>
          <Text variant="headingLg" weight="bold">
            어떤 인재를 찾으시나요?
          </Text>
          <Spacer size={4} />
          <Text variant="bodyMd" weight="medium">
            AI가 수천 명의 전문가 중 당신의 팀에 가장 완벽한 인재를 단 몇 초
            만에 제안해 드립니다.
          </Text>
        </TitleContainer>
        <PromptInput
          value={message}
          setPrompt={(e) => {
            setMessage(e.target.value);
          }}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          onFileDrop={handleFileDrop}
        />
      </CenterWrapper>
    </Main>
  );
};

const CenterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  width: 100%;
  max-width: 800px;
`;

const TitleContainer = styled.div`
  text-align: center;
  margin-bottom: 56px;
`;

export default ChatMain;
