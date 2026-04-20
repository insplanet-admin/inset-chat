import { CSSProperties } from "react";
import styled from "styled-components";
import { Avatar } from "../common/avatar";
import Text from "../common/text/Text";

const MyBaseBubble = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
`;

const OtherBaseBubble = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
`;

// -----------------------------------------
// 1. 내가 보낸 메시지 타입 및 컴포넌트
// -----------------------------------------
interface MyChatBubbleProps {
  message: any;
  // timestamp?: string;
}

export const MyChatBubble: React.FC<MyChatBubbleProps> = ({
  message,
  // timestamp,
}) => {
  return (
    <MyBaseBubble>
      <MyBubble>{message}</MyBubble>
      {/* {timestamp && <div style={timeStyle}>{timestamp}</div>} */}
    </MyBaseBubble>
  );
};

// -----------------------------------------
// 2. 상대방이 보낸 메시지 타입 및 컴포넌트
// -----------------------------------------
interface OtherChatBubbleProps {
  sender?: string;
  avatar?: string;
  message: string;
  timestamp?: string;
}

export const OtherChatBubble: React.FC<OtherChatBubbleProps> = ({
  sender,
  avatar,
  message,
  timestamp,
}) => {
  const contentStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    maxWidth: "calc(100% - 46px)",
  };

  const senderStyle: CSSProperties = {
    color: "#666",
    marginBottom: "4px",
    marginLeft: "4px",
  };

  const bubbleStyle: CSSProperties = {
    maxWidth: "100%",
    padding: "10px 15px",
    borderRadius: "18px 18px 18px 4px",
    backgroundColor: "#E5E5EA",
    color: "#000000",
    wordWrap: "break-word",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  };

  const timeStyle: CSSProperties = {
    color: "#999",
    marginTop: "4px",
    marginLeft: "4px",
  };

  return (
    <OtherBaseBubble>
      <Avatar
        style="icon"
        size={48}
        // src={
        //   avatar || "https://via.placeholder.com/150/cccccc/ffffff?text=User"
        // }
        // alt={`${sender || "User"} avatar`}
      />
      <div style={contentStyle}>
        {sender && <div style={senderStyle}>{sender}</div>}
        <div style={bubbleStyle}>
          <Text>{message}</Text>
        </div>
        {timestamp && <div style={timeStyle}>{timestamp}</div>}
      </div>
    </OtherBaseBubble>
  );
};

// AI는 별도로
export const AIChatBubble: React.FC<OtherChatBubbleProps> = ({
  avatar,
  message,
}) => {
  const contentStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    maxWidth: "calc(100% - 46px)",
  };
  return (
    <OtherBaseBubble>
      {/* <Avatar
        style="icon"
        size={48}
        // src={
        //   avatar || "https://via.placeholder.com/150/cccccc/ffffff?text=User"
        // }
        // alt={`${sender || "User"} avatar`}
      /> */}

      <div style={contentStyle}>
        <AIBubble>
          <Text
            variant="bodyMd"
            weight="semibold"
            color="var(--color-text-default-secondary)"
          >
            {message}
          </Text>
        </AIBubble>
      </div>
    </OtherBaseBubble>
  );
};

const BaseBubble = styled.div`
  display: flex;
  align-items: center;
  max-width: 508px;
  min-height: 48px;
  padding: var(--spacing-12, 14px) var(--spacing-24, 28px);
  box-sizing: border-box;
  gap: var(--spacing-4, 6px);
  border-radius: var(--radius-20, 24px) var(--radius-2, 4px)
    var(--radius-20, 24px) var(--radius-20, 24px);
`;

const StyledMyBubble = styled(BaseBubble)`
  border: 1px solid
    var(--color-background-surface-opacity-white_surface_border, #fff);
  background: var(
    --color-background-surface-opacity-brand,
    rgba(82, 27, 150, 0.04)
  );
`;

const StyledAIBubble = styled(BaseBubble)`
  border: 1px solid
    var(--color-background-surface-opacity-white_surface_border, #fff);
  background: var(
    --color-background-surface-opacity-white_surface,
    rgba(255, 255, 255, 0.5)
  );
  box-shadow: 0 4px 12px 0 rgba(43, 48, 51, 0.05);
  backdrop-filter: blur(8px);
`;

const MyBubble = ({ children }: { children: React.ReactNode }) => {
  return (
    <StyledMyBubble>
      <Text
        variant="bodyMd"
        weight="semibold"
        color="var(--color-text-default-secondary)"
      >
        {children}
      </Text>
    </StyledMyBubble>
  );
};

const AIBubble = ({ children }: { children: React.ReactNode }) => {
  return (
    <StyledAIBubble>
      <Text
        variant="bodyMd"
        weight="semibold"
        color="var(--color-text-default-secondary)"
      >
        {children}
      </Text>
    </StyledAIBubble>
  );
};
