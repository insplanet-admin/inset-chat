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
        if (
          typeof mes.content === "string" &&
          (mes.content.startsWith("[") || mes.content.startsWith("{"))
        ) {
          try {
            const parsedData = JSON.parse(mes.content);
            if (Array.isArray(parsedData)) {
              candidatesArray = parsedData;
              console.log(candidatesArray);
            } else {
              console.log("candidatesArray error");
            }
          } catch {
            // 파싱 실패 시 조용히 넘어감 (일반 메시지인 경우)
            console.log("candidatesArray 일반 메세지");
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
