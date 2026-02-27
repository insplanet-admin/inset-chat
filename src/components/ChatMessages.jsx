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

  // 1. try/catch 안에서는 오직 데이터 파싱만 수행합니다.
  try {
    parsedData = JSON.parse(content);
  } catch {
    // console.log("JSON Parse failed / plain text");
  }

  // 2. 파싱된 데이터를 바탕으로 JSX는 try/catch 밖에서 렌더링합니다.
  if (Array.isArray(parsedData) && parsedData.length > 0) {
    return (
      <StyledMessage>
        {parsedData.map((candidate, idx) => (
          // map을 쓸 때는 항상 key 속성을 넣어주는 것이 좋습니다.
          <CandidateCard key={idx} data={candidate} isPrimary={idx === 0} />
        ))}
      </StyledMessage>
    );
  }

  // 3. 배열이 아니거나 파싱에 실패했다면 일반 텍스트로 보여줍니다.
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
