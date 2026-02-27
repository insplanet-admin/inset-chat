import { ArrowBigUp, Plus } from "lucide-react";
import Row from "../Row";
import DragDropWrapper from "../../DragDropWrapper";

interface Props {
  value: string;
  setMessage: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLFormElement>) => void;
  onFileDrop: (file: File) => void;
}

const PromptInput = ({
  value,
  setMessage,
  onSubmit,
  onKeyDown,
  onFileDrop,
}: Props) => {
  return (
    <DragDropWrapper onFileDrop={onFileDrop}>
      <div className="promptInputContainer">
        <Suggestions>
          {[
            "신한은행 파견 근무를 위한 퍼블리셔는 어떤 역량이 필요해?",
            "오늘 서울 날씨 어때?",
            "센트럴에쓰 근처의 점심 식당 추천해줘.",
          ].map((suggestion) => (
            <Suggestion key={suggestion}>{suggestion}</Suggestion>
          ))}
        </Suggestions>
        <form className="promptInput" onSubmit={onSubmit} onKeyDown={onKeyDown}>
          <PromptInputTextarea value={value} setMessage={setMessage} />
          <Row justify="space-between">
            <PromptInputTools />
            <PromptSubmitButton />
          </Row>
        </form>
      </div>
    </DragDropWrapper>
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

const PromptInputTextarea = ({
  value,
  setMessage,
}: {
  value: string;
  setMessage: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => {
  return (
    <textarea
      className="promptInputTextarea"
      placeholder="메시지를 입력하세요..."
      value={value}
      onChange={setMessage}
    />
  );
};

const PromptInputTools = () => {
  return (
    <Row>
      <button className="iconButton">
        <Plus size={20} />
      </button>
    </Row>
  );
};

const PromptSubmitButton = () => {
  return (
    <button type="submit" className="sendBtn">
      <ArrowBigUp size={20} />
    </button>
  );
};

export default PromptInput;
