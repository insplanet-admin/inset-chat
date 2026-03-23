import { SyncLoader } from "react-spinners";
import styled from "styled-components";
import { generateWordResume } from "./WordDownload";
import { AIChatBubble, MyChatBubble } from "./domain/ChatBubble";

export default function ChatMessages({ messages }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {messages.map((mes, index) => {
        const isMine = mes.role == false;
        const isError = mes.status == "error";
        const isPending = mes.status === "pending";

        let parsedData = null;

        try {
          parsedData = JSON.parse(mes.content);
        } catch {}

        // 수정된 부분: LLM이 배열로 줬는지, 객체로 감싸서 줬는지 모두 확인합니다.
        let candidatesArray = [];

        if (Array.isArray(parsedData)) {
          // 1. 순수 배열 형태인 경우 [ {..}, {..} ]
          candidatesArray = parsedData;
        } else if (parsedData && Array.isArray(parsedData.candidates)) {
          // 2. 객체 안에 candidates 배열이 있는 경우 { candidates: [ {..}, {..} ] }
          candidatesArray = parsedData.candidates;
        }

        // 배열에 데이터가 있다면 카드로 렌더링
        if (candidatesArray.length > 0) {
          return (
            <div style={{ display: "flex", gap: "1rem" }}>
              {candidatesArray.map((candidate, idx) => (
                <CandidateCard key={candidate.id || idx} data={candidate} />
              ))}
            </div>
          );
        }

        // if (isPending) {
        //   return (
        //     <SyncLoader
        //       color="#ffffff"
        //       loading
        //       size={8}
        //       aria-label="Loading Spinner"
        //       data-testid="loader"
        //       speedMultiplier={0.6}
        //     />
        //   );
        // }

        if (isMine) {
          return <MyChatBubble key={index} message={mes.content} />;
        }

        return <AIChatBubble key={index} message={mes.content} />;
      })}
    </div>
  );
}

const StyledCandidateCard = styled.div`
  min-width: 300px;
  max-width: 350px;
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const CandidateCard = ({ data }) => {
  return (
    <StyledCandidateCard>
      <span style={{ fontSize: "22px", fontWeight: "bold" }}>{data.name}</span>
      <span>{data.email}</span>
      <span>{data.summary}</span>
      <span>{data.phoneNumber}</span>
      <span>{data.reason}</span>
      <button onClick={() => generateWordResume(data.id)}>
        이력서 다운로드
      </button>
    </StyledCandidateCard>
  );
};
