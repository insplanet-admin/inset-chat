import { SyncLoader } from "react-spinners";
import { AIChatBubble, MyChatBubble } from "./domain/ChatBubble";
import { CandidateCard } from "./CandidateCard";
import { useNavigate } from "react-router-dom";

const ChatMessages = ({ messages, isAITyping }) => {
  const navigate = useNavigate();

  const cardClickHandler = (id) => {
    console.log("id", id);
    navigate(`candidate/${id}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {messages.map((mes) => {
        const isMine = mes.role == false;
        let candidatesArray = [];

        if (typeof mes.content === "string") {
          const trimmed = mes.content.trim();
          if (trimmed.startsWith("[") || trimmed.startsWith("```json")) {
            try {
              const cleaned = trimmed.replace(/```json|```/g, "").trim();
              const parsed = JSON.parse(cleaned);
              if (Array.isArray(parsed)) {
                candidatesArray = parsed;
              }
            } catch (e) {
              // 파싱 실패 시 일반 텍스트로 처리
            }
          }
        }

        if (candidatesArray.length > 0) {
          return (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <span>해당 조건에 맞는 인력을 3명 찾았습니다.</span>
              <div style={{ display: "flex", gap: "1rem" }}>
                {candidatesArray.map((candidate, idx) => (
                  <CandidateCard
                    key={candidate.id || idx}
                    data={candidate}
                    onClick={() => cardClickHandler(candidate.id)}
                  />
                ))}
              </div>
            </div>
          );
        }

        return isMine ? (
          <MyChatBubble key={mes.id} message={mes.content} />
        ) : (
          <AIChatBubble key={mes.id} message={mes.content} />
        );
      })}

      {isAITyping && (
        <div
          style={{
            padding: "10px",
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <SyncLoader
            color="#000000" // 잘 보이는 색상
            loading
            size={8}
            speedMultiplier={0.6}
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
