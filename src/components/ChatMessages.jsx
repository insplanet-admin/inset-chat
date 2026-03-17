import { SyncLoader } from "react-spinners";
import styled from "styled-components";

const override = {
  display: "block",
  margin: "2",
  borderColor: "white",
};

const CandidateCard = ({ data, isPrimary }) => {
  return (
    <StyledCandidateCard>
      <span style={{ fontSize: "22px", fontWeight: "bold" }}>{data.name}</span>
      <span>{data.email}</span>
      <span>{data.summary}</span>
      <span>{data.phoneNumber}</span>
      <span>{data.reason}</span>
    </StyledCandidateCard>
  );
};

const MessageContent = ({ content }) => {
  let parsedData = null;

  try {
    parsedData = JSON.parse(content);
  } catch {
    // 파싱 실패 시 조용히 넘어감
  }

  // 💡 수정된 부분: LLM이 배열로 줬는지, 객체로 감싸서 줬는지 모두 확인합니다.
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
      <StyledMessage>
        {candidatesArray.map((candidate, idx) => (
          <CandidateCard
            key={candidate.id || idx}
            data={candidate}
            isPrimary={idx === 0}
          />
        ))}
      </StyledMessage>
    );
  }

  // 3. 배열을 못 찾았거나 파싱에 실패했다면 일반 텍스트로 보여줍니다.
  return <span style={{ whiteSpace: "pre-wrap" }}>{content}</span>;
};

export default function ChatMessages({ messages }) {
  return (
    <div className="chatMessages">
      {messages.map((mes, index) => (
        <div
          key={index}
          className={`msg ${mes.role == false && "me"} ${mes.status == "error" && "error"}`}
        >
          {mes.status === "pending" ? (
            <SyncLoader
              color="#ffffff"
              loading
              cssOverride={override}
              size={8}
              aria-label="Loading Spinner"
              data-testid="loader"
              speedMultiplier={0.6}
            />
          ) : (
            <MessageContent content={mes.content} />
          )}
        </div>
      ))}
    </div>
  );
}

const StyledMessage = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 0;
  max-width: 100%;
`;

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
